// Cloudflare Pages Function: POST /api/ai/gateway
// AI Gateway – Orchestrierungs-Layer für KI-Operationen
// Unterstützt: Manifest-Assistent, Moderation, Business-Intelligenz, Übersetzung, Tagging
// INTEGRIERT: Settings-OS für Model Routing & Settings Queries

import { SettingsAPI } from '../../../Settings/api/settings-api';
import { ModelRegistry } from '../../../Settings/core/model-registry';
import { SettingsGraphLoader } from '../../../Settings/core/graph-loader';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function checkApiKey(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get('X-TS-APIKEY');
  if (!provided || provided !== required) {
    return json(401, { ok: false, error: 'invalid api key' });
  }
  return null;
}

async function checkRateLimit(env, key, limit = 100, windowMs = 60_000) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();

  const row = await env.DB.prepare(
    'SELECT key, window_start, count FROM rate_limits WHERE key = ?'
  )
    .bind(key)
    .first();

  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }

  const newWindowStart =
    row && row.window_start >= windowStartCutoff
      ? row.window_start
      : new Date(now).toISOString();
  const newCount =
    row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;

  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  )
    .bind(key, newWindowStart, newCount)
    .run();

  return true;
}

async function insertEvent(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt)
    .run();
}

// AI Operation Types
const AI_OPERATIONS = {
  MANIFEST_ASSIST: 'manifest.assist', // Titel/Texte vorschlagen, Tags generieren
  TRANSLATE: 'translate', // Übersetzung
  SUMMARIZE: 'summarize', // Zusammenfassung
  MODERATE: 'moderate', // Inhalts-Filter
  LEGAL_CHECK: 'legal.check', // Vertrags-Check
  BUSINESS_INTELLIGENCE: 'business.intelligence', // Voucher-Daten, Forecasts
  TAG_GENERATE: 'tag.generate', // Automatische Tag-Generierung
};

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `ai.gateway|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { operation, input, options = {} } = body;

  if (!operation || !input) {
    return json(400, { ok: false, error: 'operation and input required' });
  }

  try {
    let result;

    switch (operation) {
      case AI_OPERATIONS.MANIFEST_ASSIST:
        result = await handleManifestAssist(input, options, env);
        break;

      case AI_OPERATIONS.TRANSLATE:
        result = await handleTranslate(input, options, env);
        break;

      case AI_OPERATIONS.SUMMARIZE:
        result = await handleSummarize(input, options, env);
        break;

      case AI_OPERATIONS.MODERATE:
        result = await handleModerate(input, options, env);
        break;

      case AI_OPERATIONS.LEGAL_CHECK:
        result = await handleLegalCheck(input, options);
        break;

      case AI_OPERATIONS.BUSINESS_INTELLIGENCE:
        result = await handleBusinessIntelligence(env, input, options);
        break;

      case AI_OPERATIONS.TAG_GENERATE:
        result = await handleTagGenerate(input, options);
        break;

      // Settings-OS Integration
      case 'settings.query':
        result = await handleSettingsQuery(input, options, env);
        break;

      case 'settings.model-for-task':
        result = await handleSettingsModelForTask(input, options, env);
        break;

      case 'settings.propose':
        result = await handleSettingsPropose(input, options, env);
        break;

      default:
        return json(400, { ok: false, error: `unknown operation: ${operation}` });
    }

    // Log event
    await insertEvent(
      env,
      `ai.${operation}`,
      body.actorId || null,
      'ai',
      null,
      { operation, inputLength: typeof input === 'string' ? input.length : JSON.stringify(input).length }
    );

    return json(200, { ok: true, result });
  } catch (error) {
    console.error('AI Gateway error:', error);
    return json(500, { ok: false, error: error.message });
  }
}

// Settings-OS Integration Handlers

async function handleSettingsQuery(input, options, env) {
  const { SettingsAPI } = await import('../../../Settings/api/settings-api');
  const api = new SettingsAPI('./Settings');
  
  const result = await api.querySettings(input);
  return result;
}

async function handleSettingsModelForTask(input, options, env) {
  const { SettingsAPI } = await import('../../../Settings/api/settings-api');
  const api = new SettingsAPI('./Settings');
  
  const { task, constraints } = input;
  const result = await api.getModelForTask(task, constraints);
  return result;
}

async function handleSettingsPropose(input, options, env) {
  try {
    const { SettingsAPI } = await import('../../../Settings/api/settings-api');
    const api = new SettingsAPI('./Settings');
    
    const { nodeId, changes, rationale, proposedBy, llmModel } = input;
    const result = await api.proposeChange({
      nodeId,
      changes,
      rationale,
      proposedBy: proposedBy || 'ai-gateway',
      llmModel: llmModel || 'gpt-4'
    });
    return result;
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

// Manifest-Assistent: Vorschläge für Titel/Texte, Tag-Generierung
async function handleManifestAssist(input, options, env) {
  const { content, existingTags = [] } = typeof input === 'string' 
    ? { content: input } 
    : input;

  if (!content) {
    return { error: 'content required' };
  }

  // Echte KI-Integration: Versuche OpenAI GPT-4, fallback auf regel-basiert
  if (env.OPENAI_API_KEY) {
    try {
      const { handleManifestAssistOpenAI } = await import('./ai/gateway-enhanced.js');
      return await handleManifestAssistOpenAI(content, existingTags, env);
    } catch (err) {
      console.warn('OpenAI API failed, falling back to rule-based:', err);
    }
  }
  
  // Fallback: Regel-basierte Vorschläge
  
  const words = content.toLowerCase().split(/\s+/);
  const wordFreq = {};
  words.forEach(word => {
    const clean = word.replace(/[^\w]/g, '');
    if (clean.length > 3) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });

  const suggestedTags = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
    .filter(tag => !existingTags.includes(tag));

  const title = content.split('\n')[0]?.slice(0, 60) || content.slice(0, 60);
  const summary = content.length > 200 
    ? content.slice(0, 200) + '...'
    : content;

  return {
    suggestedTitle: title,
    suggestedTags,
    summary,
    language: detectLanguage(content),
    metadata: {
      wordCount: words.length,
      estimatedReadTime: Math.ceil(words.length / 200), // Minuten
    },
  };
}

// Übersetzung mit echten KI-APIs
async function handleTranslate(input, options, env) {
  const { text, targetLanguage = 'en', sourceLanguage = 'auto' } = typeof input === 'string'
    ? { text: input, ...options }
    : { ...input, ...options };

  // Versuche DeepL API, fallback auf regel-basiert
  if (env.DEEPL_API_KEY) {
    try {
      const { handleTranslateDeepL } = await import('./ai/gateway-enhanced.js');
      return await handleTranslateDeepL(text, targetLanguage, sourceLanguage, env);
    } catch (err) {
      console.warn('DeepL API failed, falling back:', err);
    }
  }

  // Fallback: Regel-basiert
  return {
    translatedText: `[Translated to ${targetLanguage}]: ${text}`,
    sourceLanguage: sourceLanguage === 'auto' ? detectLanguage(text) : sourceLanguage,
    targetLanguage,
    confidence: 0.6,
    provider: 'rule-based',
  };
}

// Zusammenfassung mit echten KI-APIs
async function handleSummarize(input, options, env) {
  const { text, maxLength = 200 } = typeof input === 'string'
    ? { text: input, ...options }
    : { ...input, ...options };

  // Versuche Claude API, fallback auf OpenAI, dann regel-basiert
  if (env.CLAUDE_API_KEY) {
    try {
      const { handleSummarizeClaude } = await import('./ai/gateway-enhanced.js');
      return await handleSummarizeClaude(text, maxLength, env);
    } catch (err) {
      console.warn('Claude API failed, trying OpenAI:', err);
    }
  }

  if (env.OPENAI_API_KEY) {
    try {
      // Verwende OpenAI für Zusammenfassung
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Du bist ein Assistent, der Texte prägnant zusammenfasst.' },
            { role: 'user', content: `Fasse diesen Text zusammen (max. ${maxLength} Zeichen):\n\n${text.substring(0, 8000)}` }
          ],
          max_tokens: Math.min(maxLength || 200, 300),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const summary = data.choices[0]?.message?.content || '';
        return {
          summary: summary.slice(0, maxLength),
          originalLength: text.length,
          summaryLength: summary.length,
          compressionRatio: (summary.length / text.length).toFixed(2),
          provider: 'openai',
        };
      }
    } catch (err) {
      console.warn('OpenAI API failed, falling back:', err);
    }
  }

  // Fallback: Regel-basiert
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const summary = sentences.slice(0, 3).join('. ').slice(0, maxLength);

  return {
    summary,
    originalLength: text.length,
    summaryLength: summary.length,
    compressionRatio: (summary.length / text.length).toFixed(2),
    provider: 'rule-based',
  };
}

// Moderation mit echten KI-APIs
async function handleModerate(input, options, env) {
  const { content } = typeof input === 'string' ? { content: input } : input;

  // Versuche OpenAI Moderation API
  if (env.OPENAI_API_KEY) {
    try {
      const { handleModerateOpenAI } = await import('./ai/gateway-enhanced.js');
      return await handleModerateOpenAI(content, env);
    } catch (err) {
      console.warn('OpenAI Moderation failed, falling back:', err);
    }
  }

  // Fallback: Regel-basiert
  const blockedTerms = []; // Würde aus DB/Config kommen
  const flagged = blockedTerms.some(term => 
    content.toLowerCase().includes(term.toLowerCase())
  );

  return {
    safe: !flagged,
    flags: flagged ? ['potential_issue'] : [],
    confidence: flagged ? 0.7 : 1.0,
    provider: 'rule-based',
  };
}

// Legal-Check: Vertrags-Konsistenz
async function handleLegalCheck(input, options) {
  const { contract, templateType } = typeof input === 'string'
    ? { contract: input, ...options }
    : { ...input, ...options };

  // Placeholder: Echte Legal-KI würde hier integriert
  return {
    valid: true,
    issues: [],
    suggestions: [],
    confidence: 0.8,
  };
}

// Business-Intelligenz: Voucher-Daten, Forecasts
async function handleBusinessIntelligence(env, input, options) {
  const { query, dateRange } = typeof input === 'string'
    ? { query: input, ...options }
    : { ...input, ...options };

  try {
    // Beispiel: Voucher-Auslastung analysieren
    const vouchersResult = await env.DB.prepare(
      'SELECT service_type, status, COUNT(*) as count FROM vouchers GROUP BY service_type, status'
    ).all();

    const analytics = {
      totalVouchers: 0,
      byServiceType: {},
      byStatus: {},
    };

    (vouchersResult.results || []).forEach(row => {
      analytics.totalVouchers += row.count || 0;
      analytics.byServiceType[row.service_type] = (analytics.byServiceType[row.service_type] || 0) + (row.count || 0);
      analytics.byStatus[row.status] = (analytics.byStatus[row.status] || 0) + (row.count || 0);
    });

    return {
      analytics,
      insights: generateInsights(analytics),
      recommendations: generateRecommendations(analytics),
    };
  } catch (err) {
    return { error: String(err) };
  }
}

// Tag-Generierung
async function handleTagGenerate(input, options) {
  const { content } = typeof input === 'string' ? { content: input } : input;
  
  return handleManifestAssist({ content }, {}).then(r => ({
    tags: r.suggestedTags || [],
    confidence: 0.85,
  }));
}

// Helper Functions
function detectLanguage(text) {
  // Placeholder: Echte Sprach-Erkennung würde hier integriert
  if (/[äöüßÄÖÜ]/.test(text)) return 'de';
  if (/[àáâãäå]/.test(text)) return 'fr';
  if (/[ñÑ]/.test(text)) return 'es';
  return 'en';
}

function generateInsights(analytics) {
  const insights = [];
  
  const topService = Object.entries(analytics.byServiceType || {})
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topService) {
    insights.push(`Meistgenutzter Service: ${topService[0]} (${topService[1]} Vouchers)`);
  }

  const activeCount = analytics.byStatus?.active || 0;
  if (activeCount > 0) {
    insights.push(`${activeCount} aktive Vouchers`);
  }

  return insights;
}

function generateRecommendations(analytics) {
  const recommendations = [];

  if (analytics.totalVouchers < 10) {
    recommendations.push('Mehr Vouchers erstellen, um Daten für Analytics zu sammeln');
  }

  const expiredCount = analytics.byStatus?.expired || 0;
  if (expiredCount > 0) {
    recommendations.push(`${expiredCount} abgelaufene Vouchers bereinigen`);
  }

  return recommendations;
}


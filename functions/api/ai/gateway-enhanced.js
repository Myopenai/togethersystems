// Erweiterte KI-API-Integration für AI Gateway
// Fügt echte KI-APIs hinzu: OpenAI, Claude, DeepL
// Diese Funktionen können in gateway.js importiert werden

// OpenAI GPT-4 Integration
async function handleManifestAssistOpenAI(content, existingTags, env) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein Assistent für das Manifest of Thinkers. Analysiere Texte und gib präzise, hilfreiche Vorschläge für Titel, Tags und Zusammenfassungen. Antworte im JSON-Format: {"suggestedTitle": "...", "suggestedTags": ["tag1", "tag2"], "summary": "..."}'
        },
        {
          role: 'user',
          content: `Analysiere diesen Text und gib Vorschläge:\n\n${content.substring(0, 3000)}\n\nBereits vorhandene Tags: ${existingTags.join(', ')}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0]?.message?.content || '';
  
  // Parse JSON aus AI Response
  try {
    const parsed = JSON.parse(aiResponse);
    return {
      suggestedTitle: parsed.suggestedTitle || content.split('\n')[0]?.slice(0, 60),
      suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags.slice(0, 5) : [],
      summary: parsed.summary || content.slice(0, 200),
      language: detectLanguage(content),
      metadata: {
        wordCount: content.split(/\s+/).length,
        estimatedReadTime: Math.ceil(content.split(/\s+/).length / 200),
        aiProvider: 'openai',
      },
    };
  } catch {
    // Fallback wenn JSON-Parsing fehlschlägt
    return {
      suggestedTitle: content.split('\n')[0]?.slice(0, 60),
      suggestedTags: [],
      summary: aiResponse.slice(0, 200),
      language: detectLanguage(content),
      metadata: { wordCount: content.split(/\s+/).length, aiProvider: 'openai' },
    };
  }
}

// DeepL Translation Integration
async function handleTranslateDeepL(text, targetLanguage, sourceLanguage, env) {
  const sourceLang = sourceLanguage === 'auto' ? '' : sourceLanguage.toUpperCase();
  const targetLang = targetLanguage.toUpperCase();
  
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${env.DEEPL_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      text: text.substring(0, 5000), // DeepL Free limit
      target_lang: targetLang,
      ...(sourceLang ? { source_lang: sourceLang } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepL API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    translatedText: data.translations[0]?.text || text,
    sourceLanguage: data.translations[0]?.detected_source_language?.toLowerCase() || sourceLanguage,
    targetLanguage: targetLanguage,
    confidence: 0.95,
    provider: 'deepl',
  };
}

// Claude (Anthropic) Integration
async function handleSummarizeClaude(text, maxLength, env) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: Math.min(maxLength || 200, 1024),
      messages: [
        {
          role: 'user',
          content: `Bitte fasse diesen Text prägnant zusammen (max. ${maxLength || 200} Zeichen):\n\n${text.substring(0, 8000)}`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const summary = data.content[0]?.text || text.slice(0, maxLength);
  
  return {
    summary: summary.slice(0, maxLength),
    originalLength: text.length,
    summaryLength: summary.length,
    compressionRatio: (summary.length / text.length).toFixed(2),
    provider: 'claude',
  };
}

// OpenAI Moderation
async function handleModerateOpenAI(content, env) {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: content,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI Moderation API error: ${response.status}`);
  }

  const data = await response.json();
  const result = data.results[0];
  
  return {
    safe: !result.flagged,
    flags: result.categories ? Object.keys(result.categories).filter(k => result.categories[k]) : [],
    confidence: result.categories ? Math.max(...Object.values(result.category_scores || {})) : 0,
    provider: 'openai',
  };
}

// Helper
function detectLanguage(text) {
  if (/[äöüßÄÖÜ]/.test(text)) return 'de';
  if (/[àáâãäå]/.test(text)) return 'fr';
  if (/[ñÑ]/.test(text)) return 'es';
  return 'en';
}

// Export für Verwendung in gateway.js
export {
  handleManifestAssistOpenAI,
  handleTranslateDeepL,
  handleSummarizeClaude,
  handleModerateOpenAI,
};










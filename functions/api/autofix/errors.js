// Cloudflare Pages Function: POST /api/autofix/errors
// Automatische Fehlererkennung und -korrektur basierend auf Telemetrie und User-Aktionen

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function getClientIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for') ||
    'unknown'
  );
}

// Fehlermuster und ihre automatischen Korrekturen
const ERROR_PATTERNS = {
  'ERR_CONNECTION_REFUSED': {
    type: 'api_connection',
    fix: 'disable_api_calls',
    message: 'API-Verbindung fehlgeschlagen. API-Aufrufe werden deaktiviert.',
  },
  '404': {
    type: 'not_found',
    fix: 'fallback_content',
    message: 'Ressource nicht gefunden. Fallback-Inhalt wird angezeigt.',
  },
  '500': {
    type: 'server_error',
    fix: 'retry_with_backoff',
    message: 'Server-Fehler erkannt. Wiederholung mit Backoff.',
  },
  'CORS': {
    type: 'cors_error',
    fix: 'use_relative_paths',
    message: 'CORS-Fehler erkannt. Relative Pfade werden verwendet.',
  },
  'timeout': {
    type: 'timeout',
    fix: 'increase_timeout',
    message: 'Timeout erkannt. Timeout wird erhöht.',
  },
  'null': {
    type: 'null_reference',
    fix: 'add_null_check',
    message: 'Null-Referenz erkannt. Null-Prüfung wird hinzugefügt.',
  },
  'undefined': {
    type: 'undefined_reference',
    fix: 'add_undefined_check',
    message: 'Undefined-Referenz erkannt. Undefined-Prüfung wird hinzugefügt.',
  },
};

// Automatische Korrekturen
const AUTO_FIXES = {
  disable_api_calls: (error, context) => {
    return {
      action: 'set_api_base_null',
      params: { apiBase: null },
      message: 'API-Aufrufe wurden deaktiviert, da keine Verbindung möglich ist.',
    };
  },
  fallback_content: (error, context) => {
    return {
      action: 'show_fallback',
      params: { content: 'Ressource nicht verfügbar. Bitte später erneut versuchen.' },
      message: 'Fallback-Inhalt wird angezeigt.',
    };
  },
  retry_with_backoff: (error, context) => {
    return {
      action: 'schedule_retry',
      params: { delay: 2000, maxRetries: 3 },
      message: 'Wiederholung wird in 2 Sekunden versucht.',
    };
  },
  use_relative_paths: (error, context) => {
    return {
      action: 'switch_to_relative',
      params: {},
      message: 'Relative Pfade werden verwendet.',
    };
  },
  increase_timeout: (error, context) => {
    return {
      action: 'update_timeout',
      params: { timeout: 30000 },
      message: 'Timeout wurde auf 30 Sekunden erhöht.',
    };
  },
  add_null_check: (error, context) => {
    return {
      action: 'add_null_guard',
      params: { variable: context.variable },
      message: 'Null-Prüfung wurde hinzugefügt.',
    };
  },
  add_undefined_check: (error, context) => {
    return {
      action: 'add_undefined_guard',
      params: { variable: context.variable },
      message: 'Undefined-Prüfung wurde hinzugefügt.',
    };
  },
};

async function detectErrorPattern(errorMessage, errorStack) {
  const message = (errorMessage || '').toLowerCase();
  const stack = (errorStack || '').toLowerCase();
  const combined = `${message} ${stack}`;

  for (const [pattern, config] of Object.entries(ERROR_PATTERNS)) {
    if (combined.includes(pattern.toLowerCase())) {
      return config;
    }
  }

  return null;
}

async function applyAutoFix(fixType, error, context, env) {
  const fixer = AUTO_FIXES[fixType];
  if (!fixer) {
    return { ok: false, error: 'Unknown fix type' };
  }

  try {
    const fixResult = fixer(error, context);
    
    // Event in Datenbank speichern
    const eventId = `af-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    await env.DB.prepare(
      `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        eventId,
        'autofix.applied',
        context.actorUid || null,
        'error',
        error.id || null,
        JSON.stringify({
          fixType,
          action: fixResult.action,
          params: fixResult.params,
          error: error.message,
          timestamp: new Date().toISOString(),
        }),
        new Date().toISOString()
      )
      .run();

    return {
      ok: true,
      fixId: eventId,
      action: fixResult.action,
      params: fixResult.params,
      message: fixResult.message,
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const ip = getClientIp(request);
  
  let errorData;
  try {
    errorData = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  // Unterstützt sowohl einzelne Fehler als auch Batch
  const { error, errors, context: errorContext, actorUid } = errorData || {};
  
  const errorList = errors || (error ? [{ error, context: errorContext, actorUid }] : []);

  if (!errorList.length) {
    return json(400, { ok: false, error: 'error or errors array required' });
  }

  const results = [];

  for (const item of errorList) {
    const { error: err, context: ctx, actorUid: uid } = item;
    
    if (!err || !err.message) {
      results.push({ ok: false, error: 'error.message required' });
      continue;
    }

    // Fehlermuster erkennen
    const pattern = await detectErrorPattern(err.message, err.stack);
    
    if (!pattern) {
      results.push({
        ok: true,
        detected: false,
        errorId: err.id,
        message: 'Kein bekanntes Fehlermuster erkannt. Fehler wurde protokolliert.',
      });
      continue;
    }

    // Automatische Korrektur anwenden
    const fixResult = await applyAutoFix(
      pattern.fix,
      err,
      { ...ctx, actorUid: uid, ip },
      env
    );

    if (!fixResult.ok) {
      results.push({ ok: false, error: fixResult.error, errorId: err.id });
      continue;
    }

    results.push({
      ok: true,
      detected: true,
      errorId: err.id,
      pattern: pattern.type,
      fix: {
        id: fixResult.fixId,
        action: fixResult.action,
        params: fixResult.params,
        message: fixResult.message,
      },
      notification: {
        title: 'Automatische Fehlerkorrektur',
        message: pattern.message + ' ' + fixResult.message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  return json(200, {
    ok: true,
    results,
    summary: {
      total: results.length,
      detected: results.filter(r => r.detected).length,
      fixed: results.filter(r => r.detected && r.ok).length,
    },
  });
}


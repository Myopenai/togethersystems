// Cloudflare Pages Function: GET /api/autofix/status
// Status der automatischen Fehlerkorrekturen abrufen

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    // Letzte 24 Stunden
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Autofix-Events abrufen
    const events = await env.DB.prepare(
      `SELECT id, type, actor_id, subject_type, subject_id, meta, created_at
       FROM events
       WHERE type = 'autofix.applied' AND created_at > ?
       ORDER BY created_at DESC
       LIMIT 50`
    )
      .bind(since)
      .all();

    // Statistiken
    const stats = {
      total: events.results?.length || 0,
      byType: {},
      recent: [],
    };

    for (const event of events.results || []) {
      const meta = JSON.parse(event.meta || '{}');
      const fixType = meta.fixType || 'unknown';
      stats.byType[fixType] = (stats.byType[fixType] || 0) + 1;
      
      if (stats.recent.length < 10) {
        stats.recent.push({
          id: event.id,
          timestamp: event.created_at,
          fixType,
          action: meta.action,
          message: meta.message,
        });
      }
    }

    return json(200, {
      ok: true,
      stats,
      events: events.results || [],
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}


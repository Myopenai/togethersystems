// Cloudflare Pages Function: GET /api/admin/events
// Returns the latest N events from the events table for monitoring.

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

export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const url = new URL(request.url);
  const limit = Math.max(
    1,
    Math.min(200, Number(url.searchParams.get('limit') || '50'))
  );

  try {
    const rows = await env.DB.prepare(
      'SELECT id, type, actor_id, subject_type, subject_id, meta, created_at FROM events ORDER BY created_at DESC LIMIT ?'
    )
      .bind(limit)
      .all();
    const items = (rows.results || []).map((r) => ({
      id: r.id,
      type: r.type,
      actorId: r.actor_id,
      subjectType: r.subject_type,
      subjectId: r.subject_id,
      meta: r.meta ? JSON.parse(r.meta) : {},
      createdAt: r.created_at,
    }));
    return json(200, { ok: true, items });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}




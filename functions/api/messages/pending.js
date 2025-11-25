// Cloudflare Pages Function: GET /api/messages/pending
// Holt ungelesene Nachrichten für einen User

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
  const userId = url.searchParams.get('user_id');
  const since = url.searchParams.get('since');

  if (!userId) {
    return json(400, {
      ok: false,
      error: 'missing_user_id',
      message: 'user_id query parameter is required',
    });
  }

  try {
    let query = `SELECT * FROM messages 
                 WHERE recipient_id = ? AND delivered_at IS NULL`;
    const params = [userId];

    if (since) {
      query += ' AND created_at >= ?';
      params.push(since);
    }

    query += ' ORDER BY created_at ASC LIMIT 100';

    const result = await env.DB.prepare(query).bind(...params).all();
    const messages = (result.results || []).map((r) => ({
      id: r.id,
      sender_id: r.sender_id,
      recipient_id: r.recipient_id,
      subject: r.subject,
      body: r.body,
      content_preview: r.content_preview,
      created_at: r.created_at,
      delivered_at: r.delivered_at,
      read_at: r.read_at,
      meta: r.meta ? JSON.parse(r.meta) : {},
    }));

    return json(200, { ok: true, data: { messages } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}



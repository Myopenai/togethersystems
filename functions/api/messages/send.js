// Cloudflare Pages Function: POST /api/messages/send
// Sendet eine Nachricht von User A an User B

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'msg') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
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

async function checkRateLimit(env, key, limit = 60, windowMs = 60_000) {
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

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `messages.send|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { from_user_id, to_user_id, subject, body: messageBody, meta = {} } = body;

  if (!from_user_id || !to_user_id || !messageBody) {
    return json(400, {
      ok: false,
      error: 'missing_required_fields',
      message: 'from_user_id, to_user_id, and body are required',
    });
  }

  // Prüfe ob Empfänger existiert (optional: in users-Tabelle, sonst akzeptieren)
  // Für jetzt: akzeptieren wir jede user_id

  const messageId = makeId('msg');
  const createdAt = new Date().toISOString();
  
  // Preview generieren (erste 100 Zeichen)
  const preview = messageBody.length > 100 
    ? messageBody.substring(0, 100) + '...' 
    : messageBody;

  try {
    await env.DB.prepare(
      `INSERT INTO messages (id, sender_id, recipient_id, subject, body, content_preview, created_at, delivered_at, read_at, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        messageId,
        from_user_id,
        to_user_id,
        subject || null,
        messageBody,
        preview,
        createdAt,
        null, // delivered_at wird später gesetzt
        null, // read_at wird später gesetzt
        JSON.stringify(meta || {})
      )
      .run();

    const message = {
      id: messageId,
      sender_id: from_user_id,
      recipient_id: to_user_id,
      subject: subject || null,
      body: messageBody,
      content_preview: preview,
      created_at: createdAt,
      delivered_at: null,
      read_at: null,
      meta: meta || {},
    };

    await insertEvent(env, 'message.sent', from_user_id, 'message', messageId, {
      recipient: to_user_id,
    });

    // Optional: Prüfe ob Empfänger online ist und push via WebSocket
    // (wird in ws.js oder einem Notification-Service gehandhabt)

    return json(200, { ok: true, data: { message } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}



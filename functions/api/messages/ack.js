// Cloudflare Pages Function: POST /api/messages/ack
// Bestätigt, dass Nachrichten lokal angekommen sind

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

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `messages.ack|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { user_id, message_ids } = body;

  if (!user_id || !message_ids || !Array.isArray(message_ids) || message_ids.length === 0) {
    return json(400, {
      ok: false,
      error: 'missing_required_fields',
      message: 'user_id and message_ids (array) are required',
    });
  }

  const deliveredAt = new Date().toISOString();
  const acked = [];

  try {
    for (const messageId of message_ids) {
      // Prüfe ob Nachricht existiert und zum User gehört
      const message = await env.DB.prepare(
        'SELECT id, recipient_id FROM messages WHERE id = ? AND recipient_id = ?'
      )
        .bind(messageId, user_id)
        .first();

      if (message) {
        // Setze delivered_at
        await env.DB.prepare(
          'UPDATE messages SET delivered_at = ? WHERE id = ?'
        )
          .bind(deliveredAt, messageId)
          .run();

        // Optional: message_delivery-Status aktualisieren
        const delivery = await env.DB.prepare(
          'SELECT id FROM message_delivery WHERE message_id = ? AND user_id = ?'
        )
          .bind(messageId, user_id)
          .first();

        if (delivery) {
          await env.DB.prepare(
            'UPDATE message_delivery SET status = ?, updated_at = ? WHERE id = ?'
          )
            .bind('delivered', deliveredAt, delivery.id)
            .run();
        }

        acked.push(messageId);
      }
    }

    return json(200, { ok: true, data: { acked } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}



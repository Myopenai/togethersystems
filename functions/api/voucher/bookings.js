// Cloudflare Pages Function: GET /api/voucher/bookings
// Lists voucher bookings from D1 with optional filters:
//   ?holderUid=...  – Buchungen eines Kunden
//   ?issuerUid=...  – Buchungen für Vouchers eines Anbieters
//   ?voucherId=...  – Buchungen zu einem bestimmten Voucher
//
// Dies wird genutzt für:
// - "Meine Buchungen" im Portal
// - Business-Admin-Ansicht (für Anbieter)

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

async function checkApiKey(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get('X-TS-APIKEY');
  if (!provided || provided !== required) {
    return json(401, { ok: false, error: 'invalid api key' });
  }
  return null;
}

async function checkRateLimit(env, key, limit = 120, windowMs = 60_000) {
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

export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(env, `voucher.bookings|get|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  const url = new URL(request.url);
  const holderUid = url.searchParams.get('holderUid');
  const issuerUid = url.searchParams.get('issuerUid');
  const voucherId = url.searchParams.get('voucherId');

  let query =
    'SELECT id, voucher_id, issuer_uid, holder_uid, slot_id, slot_start, slot_end, status, cancel_reason, created_at, cancelled_at FROM voucher_bookings';
  const where = [];
  const params = [];

  if (holderUid) {
    where.push('holder_uid = ?');
    params.push(holderUid);
  }
  if (issuerUid) {
    where.push('issuer_uid = ?');
    params.push(issuerUid);
  }
  if (voucherId) {
    where.push('voucher_id = ?');
    params.push(voucherId);
  }
  if (where.length) {
    query += ' WHERE ' + where.join(' AND ');
  }
  query += ' ORDER BY created_at DESC';

  try {
    const rows = await env.DB.prepare(query).bind(...params).all();
    const items = (rows.results || []).map((r) => ({
      bookingId: r.id,
      voucherId: r.voucher_id,
      issuerUid: r.issuer_uid,
      holderUid: r.holder_uid,
      slotId: r.slot_id,
      slotStart: r.slot_start,
      slotEnd: r.slot_end,
      status: r.status,
      cancelReason: r.cancel_reason,
      createdAt: r.created_at,
      cancelledAt: r.cancelled_at,
    }));
    return json(200, { ok: true, items });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}




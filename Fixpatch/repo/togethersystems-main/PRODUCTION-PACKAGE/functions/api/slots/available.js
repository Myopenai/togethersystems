// Cloudflare Pages Function: GET /api/slots/available
// Returns available hourly slots for a voucher, derived from vouchers + voucher_bookings.

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

function isoToDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(env, `slots.available|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  const url = new URL(request.url);
  const voucherId = url.searchParams.get('voucherId');
  if (!voucherId) {
    return json(400, { ok: false, error: 'voucherId is required' });
  }

  try {
    const voucherRow = await env.DB.prepare(
      'SELECT id, duration_minutes, valid_from, valid_until FROM vouchers WHERE id = ?'
    )
      .bind(voucherId)
      .first();

    if (!voucherRow) {
      return json(404, { ok: false, error: 'voucher not found' });
    }

    const from = isoToDate(voucherRow.valid_from);
    const until = isoToDate(voucherRow.valid_until);
    if (!from || !until || from >= until) {
      return json(200, { ok: true, items: [] });
    }

    const durationMs =
      (Number(voucherRow.duration_minutes) || 60) * 60 * 1000;

    const bookedRows = await env.DB.prepare(
      'SELECT slot_start, slot_end FROM voucher_bookings WHERE voucher_id = ? AND status = ?'
    )
      .bind(voucherId, 'booked')
      .all();

    const booked = new Set(
      (bookedRows.results || []).map((b) => b.slot_start)
    );

    const items = [];
    let cursor = new Date(from.getTime());
    while (cursor.getTime() + durationMs <= until.getTime()) {
      const startIso = cursor.toISOString();
      const endIso = new Date(cursor.getTime() + durationMs).toISOString();
      if (!booked.has(startIso)) {
        items.push({
          slotId: `slot-${startIso}`,
          voucherId,
          start: startIso,
          end: endIso,
        });
      }
      cursor = new Date(cursor.getTime() + 60 * 60 * 1000);
    }

    return json(200, { ok: true, items });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}




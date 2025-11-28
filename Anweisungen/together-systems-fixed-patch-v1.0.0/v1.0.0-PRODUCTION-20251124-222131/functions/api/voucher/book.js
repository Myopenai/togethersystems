// Cloudflare Pages Function: POST /api/voucher/book
// Books a voucher slot and creates an entry in voucher_bookings.

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'b') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
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

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(env, `voucher.book|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const voucherId = body.voucherId;
  const slotId = body.slotId;
  const holderUid = body.holderUid;
  if (!voucherId || !slotId || !holderUid) {
    return json(400, {
      ok: false,
      error: 'voucherId, slotId and holderUid are required',
    });
  }

  try {
    const voucherRow = await env.DB.prepare(
      'SELECT id, issuer_uid, holder_uid, service_type, title, description, duration_minutes, valid_from, valid_until, price_amount, price_currency, status, transferable, terms, created_at FROM vouchers WHERE id = ?'
    )
      .bind(voucherId)
      .first();

    if (!voucherRow) {
      return json(404, { ok: false, error: 'voucher not found' });
    }

    if (
      ['consumed', 'cancelled', 'expired'].includes(
        String(voucherRow.status || '').toLowerCase()
      )
    ) {
      return json(400, {
        ok: false,
        error: `voucher has status ${voucherRow.status} and cannot be booked`,
      });
    }

    const startIso = slotId.startsWith('slot-') ? slotId.slice(5) : null;
    const start = startIso ? new Date(startIso) : null;
    if (!start || Number.isNaN(start.getTime())) {
      return json(400, { ok: false, error: 'invalid slotId format' });
    }

    const durationMs =
      (Number(voucherRow.duration_minutes) || 60) * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);
    const endIso = end.toISOString();

    const existingBooking = await env.DB.prepare(
      'SELECT id FROM voucher_bookings WHERE voucher_id = ? AND slot_start = ? AND status = ?'
    )
      .bind(voucherId, startIso, 'booked')
      .first();
    if (existingBooking) {
      return json(400, { ok: false, error: 'slot already booked' });
    }

    const bookingId = makeId('b');
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO voucher_bookings
       (id, voucher_id, issuer_uid, holder_uid, slot_id, slot_start, slot_end, status, cancel_reason, created_at, cancelled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        bookingId,
        voucherId,
        voucherRow.issuer_uid,
        holderUid,
        slotId,
        startIso,
        endIso,
        'booked',
        null,
        createdAt,
        null
      )
      .run();

    await env.DB.prepare(
      'UPDATE vouchers SET status = ?, holder_uid = ? WHERE id = ?'
    )
      .bind('booked', holderUid, voucherId)
      .run();

    const voucher = {
      voucherId,
      issuerUid: voucherRow.issuer_uid,
      holderUid,
      serviceType: voucherRow.service_type,
      title: voucherRow.title,
      description: voucherRow.description,
      durationMinutes: voucherRow.duration_minutes,
      validFrom: voucherRow.valid_from,
      validUntil: voucherRow.valid_until,
      price:
        voucherRow.price_amount != null
          ? {
              amount: voucherRow.price_amount,
              currency: voucherRow.price_currency || 'EUR',
            }
          : null,
      status: 'booked',
      transferable: !!voucherRow.transferable,
      terms: voucherRow.terms ? JSON.parse(voucherRow.terms) : {},
      createdAt: voucherRow.created_at,
    };

    const booking = {
      bookingId,
      voucherId,
      issuerUid: voucherRow.issuer_uid,
      holderUid,
      slotId,
      slotStart: startIso,
      slotEnd: endIso,
      status: 'booked',
      createdAt,
    };

    await insertEvent(env, 'voucher.book', holderUid, 'voucher_booking', bookingId, {
      voucherId,
      slotStart: startIso,
    });

    return json(200, { ok: true, booking, voucher });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}




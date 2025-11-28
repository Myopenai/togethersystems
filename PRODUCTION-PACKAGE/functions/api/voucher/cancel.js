// Cloudflare Pages Function: POST /api/voucher/cancel
// Cancels a booking (and reopens the voucher if applicable).

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
  const allowed = await checkRateLimit(env, `voucher.cancel|${ip}`);
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
  const bookingId = body.bookingId;
  const reason = body.reason || null;

  if (!voucherId && !bookingId) {
    return json(400, {
      ok: false,
      error: 'voucherId or bookingId is required',
    });
  }

  try {
    let bookingRow;
    if (bookingId) {
      bookingRow = await env.DB.prepare(
        'SELECT * FROM voucher_bookings WHERE id = ?'
      )
        .bind(bookingId)
        .first();
    } else if (voucherId) {
      bookingRow = await env.DB.prepare(
        'SELECT * FROM voucher_bookings WHERE voucher_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1'
      )
        .bind(voucherId, 'booked')
        .first();
    }

    if (!bookingRow) {
      return json(404, { ok: false, error: 'booking not found' });
    }

    const nowIso = new Date().toISOString();

    await env.DB.prepare(
      'UPDATE voucher_bookings SET status = ?, cancel_reason = ?, cancelled_at = ? WHERE id = ?'
    )
      .bind('cancelled', reason, nowIso, bookingRow.id)
      .run();

    await env.DB.prepare(
      'UPDATE vouchers SET status = ?, holder_uid = NULL WHERE id = ?'
    )
      .bind('issued', bookingRow.voucher_id)
      .run();

    const voucherRow = await env.DB.prepare(
      'SELECT id, issuer_uid, holder_uid, service_type, title, description, duration_minutes, valid_from, valid_until, price_amount, price_currency, status, transferable, terms, created_at FROM vouchers WHERE id = ?'
    )
      .bind(bookingRow.voucher_id)
      .first();

    const voucher = voucherRow
      ? {
          voucherId: voucherRow.id,
          issuerUid: voucherRow.issuer_uid,
          holderUid: voucherRow.holder_uid,
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
          status: voucherRow.status,
          transferable: !!voucherRow.transferable,
          terms: voucherRow.terms ? JSON.parse(voucherRow.terms) : {},
          createdAt: voucherRow.created_at,
        }
      : null;

    const booking = {
      bookingId: bookingRow.id,
      voucherId: bookingRow.voucher_id,
      issuerUid: bookingRow.issuer_uid,
      holderUid: bookingRow.holder_uid,
      slotId: bookingRow.slot_id,
      slotStart: bookingRow.slot_start,
      slotEnd: bookingRow.slot_end,
      status: 'cancelled',
      cancelReason: reason,
      createdAt: bookingRow.created_at,
      cancelledAt: nowIso,
    };

    await insertEvent(
      env,
      'voucher.cancel',
      bookingRow.holder_uid,
      'voucher_booking',
      bookingRow.id,
      { voucherId: bookingRow.voucher_id, reason }
    );

    return json(200, { ok: true, booking, voucher });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}




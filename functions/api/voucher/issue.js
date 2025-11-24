// Cloudflare Pages Function: POST /api/voucher/issue
// Creates a voucher in the D1-backed vouchers table.

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'v') {
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
  const allowed = await checkRateLimit(env, `voucher.issue|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const issuerUid = body.issuerUid;
  if (!issuerUid) {
    return json(400, { ok: false, error: 'issuerUid is required' });
  }

  const nowIso = new Date().toISOString();
  const id = body.voucherId || makeId('v');

  const serviceType = body.serviceType || 'generic.service';
  const title = body.title || 'Unbenannter Service';
  const description = body.description || '';
  const durationMinutes = Number(body.durationMinutes || 60);
  const validFrom = body.validFrom || nowIso;
  const validUntil = body.validUntil || nowIso;

  let priceAmount = null;
  let priceCurrency = null;
  if (body.price && typeof body.price === 'object') {
    if (typeof body.price.amount === 'number') {
      priceAmount = body.price.amount;
    }
    if (typeof body.price.currency === 'string') {
      priceCurrency = body.price.currency;
    }
  }

  const transferable = !!body.transferable;
  const status = body.status || 'issued';
  const terms = body.terms || {};
  const holderUid = body.holderUid || null;

  try {
    await env.DB.prepare(
      `INSERT INTO vouchers
       (id, issuer_uid, holder_uid, service_type, title, description, duration_minutes,
        valid_from, valid_until, price_amount, price_currency, status, transferable, terms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        issuerUid,
        holderUid,
        serviceType,
        title,
        description,
        durationMinutes,
        validFrom,
        validUntil,
        priceAmount,
        priceCurrency,
        status,
        transferable ? 1 : 0,
        JSON.stringify(terms),
        nowIso
      )
      .run();

    const voucher = {
      voucherId: id,
      issuerUid,
      holderUid,
      serviceType,
      title,
      description,
      durationMinutes,
      validFrom,
      validUntil,
      price: priceAmount != null ? { amount: priceAmount, currency: priceCurrency || 'EUR' } : null,
      status,
      transferable,
      terms,
      createdAt: nowIso,
    };

    await insertEvent(env, 'voucher.issue', issuerUid, 'voucher', id, {
      serviceType,
    });

    return json(200, { ok: true, voucher });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}




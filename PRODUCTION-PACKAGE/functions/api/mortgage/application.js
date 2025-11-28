// Cloudflare Pages Function: POST /api/mortgage/application
// Creates a mortgage application backed by D1.

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'app') {
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
  const allowed = await checkRateLimit(env, `mortgage.application|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const borrowerUid = request.headers.get('X-MOT-User');
  if (!borrowerUid) {
    return json(400, { ok: false, error: 'X-MOT-User header (borrowerUid) is required' });
  }

  const id = body.applicationId || makeId('app');
  const createdAt = new Date().toISOString();

  const propertyId = body.propertyId || 'house-unknown';
  const desiredLoan =
    body.desiredLoan && typeof body.desiredLoan.amount === 'number'
      ? body.desiredLoan.amount
      : null;
  const currency =
    body.desiredLoan && typeof body.desiredLoan.currency === 'string'
      ? body.desiredLoan.currency
      : 'EUR';
  const durationYears = Number(body.desiredDurationYears || 0);
  const rateType = body.desiredRateType || 'fixed';
  const maxInterest =
    typeof body.maxInterestRate === 'number' ? body.maxInterestRate : null;

  const meta = body.meta || {};

  try {
    await env.DB.prepare(
      'INSERT OR IGNORE INTO properties (id, address, meta) VALUES (?, ?, COALESCE(meta, ?))'
    )
      .bind(propertyId, null, JSON.stringify({}))
      .run();

    await env.DB.prepare(
      `INSERT INTO mortgage_applications
       (id, property_id, borrower_uid, desired_loan, currency, duration_years, rate_type, max_interest, status, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        propertyId,
        borrowerUid,
        desiredLoan,
        currency,
        durationYears,
        rateType,
        maxInterest,
        'open',
        JSON.stringify(meta),
        createdAt
      )
      .run();

    const application = {
      applicationId: id,
      borrowerUid,
      propertyId,
      desiredLoan: desiredLoan != null ? { amount: desiredLoan, currency } : null,
      desiredDurationYears: durationYears,
      desiredRateType: rateType,
      maxInterestRate: maxInterest,
      status: 'open',
      meta,
      createdAt,
    };

    await insertEvent(env, 'mortgage.application', borrowerUid, 'mortgage_application', id, {
      propertyId,
      desiredLoan,
    });

    return json(200, { ok: true, applicationId: id, application });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}




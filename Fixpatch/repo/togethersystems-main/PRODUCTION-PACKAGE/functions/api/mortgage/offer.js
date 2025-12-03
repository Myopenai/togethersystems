// Cloudflare Pages Function: POST /api/mortgage/offer
// Creates a mortgage offer for an application.

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'mort-offer') {
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
  const allowed = await checkRateLimit(env, `mortgage.offer|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const issuerId = request.headers.get('X-MOT-User');
  if (!issuerId) {
    return json(400, {
      ok: false,
      error: 'X-MOT-User header (issuerId) is required',
    });
  }

  if (!body.applicationId) {
    return json(400, { ok: false, error: 'applicationId is required' });
  }

  try {
    const appRow = await env.DB.prepare(
      'SELECT id, borrower_uid FROM mortgage_applications WHERE id = ?'
    )
      .bind(body.applicationId)
      .first();
    if (!appRow) {
      return json(404, { ok: false, error: 'application not found' });
    }

    const id = body.voucherId || makeId();
    const createdAt = new Date().toISOString();

    const interestRate =
      typeof body.interestRate === 'number' ? body.interestRate : null;
    const monthlyPayment =
      typeof body.monthlyPayment === 'number' ? body.monthlyPayment : null;

    await env.DB.prepare(
      `INSERT INTO mortgage_offers
       (id, application_id, lender_uid, interest_rate, monthly_payment, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        appRow.id,
        issuerId,
        interestRate,
        monthlyPayment,
        'open',
        createdAt
      )
      .run();

    const offer = {
      offerId: id,
      applicationId: appRow.id,
      lenderUid: issuerId,
      borrowerUid: appRow.borrower_uid,
      interestRate,
      monthlyPayment,
      status: 'open',
      createdAt,
    };

    await insertEvent(env, 'mortgage.offer', issuerId, 'mortgage_offer', id, {
      applicationId: appRow.id,
    });

    return json(200, { ok: true, offerId: id, offer });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}




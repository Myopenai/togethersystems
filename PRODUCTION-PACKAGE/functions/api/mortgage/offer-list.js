// Cloudflare Pages Function: GET /api/mortgage/offer-list
// Lists mortgage offers, optionally filtered by applicationId and role (borrower/lender).

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
  const allowed = await checkRateLimit(env, `mortgage.offer-list|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  const url = new URL(request.url);
  const applicationId = url.searchParams.get('applicationId');
  const role = (url.searchParams.get('role') || 'borrower').toString();
  const uid = request.headers.get('X-MOT-User');
  if (!uid) {
    return json(400, { ok: false, error: 'X-MOT-User header is required' });
  }

  let query =
    'SELECT id, application_id, lender_uid, interest_rate, monthly_payment, status, created_at FROM mortgage_offers';
  const where = [];
  const params = [];

  if (applicationId) {
    where.push('application_id = ?');
    params.push(applicationId);
  }

  if (role === 'borrower') {
    // For borrower we need to join applications to know borrower_uid.
    query =
      'SELECT o.id, o.application_id, o.lender_uid, o.interest_rate, o.monthly_payment, o.status, o.created_at, a.borrower_uid ' +
      'FROM mortgage_offers o JOIN mortgage_applications a ON o.application_id = a.id';
    if (applicationId) {
      where.push('o.application_id = ?');
    }
    where.push('a.borrower_uid = ?');
    params.push(uid);
  } else if (role === 'lender') {
    where.push('lender_uid = ?');
    params.push(uid);
  } else {
    return json(400, {
      ok: false,
      error: 'role must be borrower or lender',
    });
  }

  if (where.length) {
    query += ' WHERE ' + where.join(' AND ');
  }
  // created_at exists in mehreren Tabellen; immer die Spalte aus mortgage_offers verwenden
  query += ' ORDER BY o.created_at DESC';

  try {
    const rows = await env.DB.prepare(query).bind(...params).all();
    const offers = (rows.results || []).map((r) => ({
      offerId: r.id,
      applicationId: r.application_id,
      lenderUid: r.lender_uid,
      borrowerUid: r.borrower_uid || null,
      interestRate: r.interest_rate,
      monthlyPayment: r.monthly_payment,
      status: r.status,
      createdAt: r.created_at,
    }));
    return json(200, { ok: true, offers });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}



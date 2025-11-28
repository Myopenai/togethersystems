// Cloudflare Pages Function for TPGA Telbank transfer ledger backed by D1
// Route: /api/telbank/transfers
//
// Requires a D1 binding named `DB` with a `transfers` table, e.g.:
//  id TEXT PRIMARY KEY, direction TEXT, label TEXT, wallet_address TEXT,
//  network TEXT, crypto_amount REAL, crypto_symbol TEXT,
//  fiat_amount REAL, fiat_currency TEXT, external_account TEXT,
//  meta TEXT, status TEXT, created_at TEXT, updated_at TEXT

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'tx') {
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
    return jsonResponse(401, { ok: false, error: 'invalid api key' });
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

export async function onRequestGet(context) {
  const { env, request } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(env, `telbank.get|${ip}`);
  if (!allowed) {
    return jsonResponse(429, { ok: false, error: 'rate limit exceeded' });
  }

  const url = new URL(request.url);
  const walletAddress = url.searchParams.get('walletAddress');
  const direction = url.searchParams.get('direction');

  let query =
    'SELECT id, direction, label, wallet_address as walletAddress, network, crypto_amount as cryptoAmount, crypto_symbol as cryptoSymbol, fiat_amount as fiatAmount, fiat_currency as fiatCurrency, external_account as externalAccount, meta, status, created_at as createdAt, updated_at as updatedAt FROM transfers';
  const params = [];
  const where = [];

  if (walletAddress) {
    where.push('wallet_address = ?');
    params.push(walletAddress);
  }
  if (direction) {
    where.push('direction = ?');
    params.push(direction);
  }
  if (where.length) {
    query += ' WHERE ' + where.join(' AND ');
  }
  query += ' ORDER BY created_at DESC';

  try {
    const stmt = env.DB.prepare(query);
    const rows = await stmt.bind(...params).all();
    const items = (rows.results || []).map((r) => ({
      ...r,
      meta: r.meta ? JSON.parse(r.meta) : {},
    }));
    return jsonResponse(200, { ok: true, items });
  } catch (err) {
    return jsonResponse(500, { ok: false, error: String(err) });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(env, `telbank.post|${ip}`);
  if (!allowed) {
    return jsonResponse(429, { ok: false, error: 'rate limit exceeded' });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON body' });
  }

  const {
    direction,
    label,
    walletAddress,
    network,
    cryptoAmount,
    cryptoSymbol,
    fiatAmount,
    fiatCurrency,
    externalAccount,
    meta,
  } = payload || {};

  if (!direction || (direction !== 'in' && direction !== 'out')) {
    return jsonResponse(400, { ok: false, error: 'Invalid direction' });
  }

  if (
    typeof cryptoAmount !== 'number' ||
    !cryptoSymbol ||
    typeof fiatAmount !== 'number' ||
    !fiatCurrency
  ) {
    return jsonResponse(400, {
      ok: false,
      error:
        'cryptoAmount, cryptoSymbol, fiatAmount and fiatCurrency are required as numbers/strings',
    });
  }

  const id = makeId(direction === 'in' ? 'in' : 'out');
  const now = new Date().toISOString();

  const entry = {
    id,
    direction,
    label: label || (direction === 'in' ? 'Fiat→Crypto inflow' : 'Crypto→Fiat outflow'),
    walletAddress: walletAddress || null,
    network: network || null,
    cryptoAmount,
    cryptoSymbol,
    fiatAmount,
    fiatCurrency,
    externalAccount: externalAccount || null,
    meta: meta || {},
    status: 'logged',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const stmt = env.DB.prepare(
      `INSERT INTO transfers
       (id, direction, label, wallet_address, network, crypto_amount, crypto_symbol,
        fiat_amount, fiat_currency, external_account, meta, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    await stmt
      .bind(
        entry.id,
        entry.direction,
        entry.label,
        entry.walletAddress,
        entry.network,
        entry.cryptoAmount,
        entry.cryptoSymbol,
        entry.fiatAmount,
        entry.fiatCurrency,
        entry.externalAccount,
        JSON.stringify(entry.meta),
        entry.status,
        entry.createdAt,
        entry.updatedAt,
      )
      .run();

    await insertEvent(env, 'transfer.logged', null, 'transfer', id, {
      walletAddress,
      direction,
    });

    return jsonResponse(200, { ok: true, transfer: entry });
  } catch (err) {
    return jsonResponse(500, { ok: false, error: String(err) });
  }
}


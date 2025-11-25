// Cloudflare Pages Function: GET/POST /api/instruments
// Verwaltet Gleichgewichts-Instrumente

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'inst') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
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

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `instruments.create|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { entity_id, balance_id, symbol, name, description, units_issued, creation_reason } = body;

  if (!entity_id || !balance_id || !symbol || !name || !units_issued) {
    return json(400, {
      ok: false,
      error: 'missing_required_fields',
      message: 'entity_id, balance_id, symbol, name, and units_issued are required',
    });
  }

  // Prüfe ob Balance existiert und positiven Netto-Wert hat
  const balance = await env.DB.prepare(
    'SELECT id, net_value, entity_id FROM real_balances WHERE id = ?'
  )
    .bind(balance_id)
    .first();

  if (!balance) {
    return json(404, {
      ok: false,
      error: 'balance_not_found',
      message: `Balance with id ${balance_id} does not exist`,
    });
  }

  if (balance.entity_id !== entity_id) {
    return json(400, {
      ok: false,
      error: 'entity_mismatch',
      message: 'Balance does not belong to the specified entity',
    });
  }

  if (balance.net_value <= 0) {
    return json(422, {
      ok: false,
      error: 'negative_net_value',
      message: 'Instrument kann nur auf positiver Real-Bilanz erstellt werden',
    });
  }

  // Prüfe ob Symbol bereits existiert
  const existingSymbol = await env.DB.prepare('SELECT id FROM instruments WHERE symbol = ?')
    .bind(symbol)
    .first();

  if (existingSymbol) {
    return json(400, {
      ok: false,
      error: 'symbol_exists',
      message: `Symbol ${symbol} is already in use`,
    });
  }

  const instrumentId = body.id || makeId('inst');
  const createdAt = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO instruments 
       (id, entity_id, balance_id, symbol, name, description, status, net_value, currency, units_issued, creation_reason, created_at, activated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        instrumentId,
        entity_id,
        balance_id,
        symbol,
        name,
        description || null,
        'draft',
        balance.net_value,
        'EUR',
        units_issued,
        creation_reason || null,
        createdAt,
        null
      )
      .run();

    const instrument = {
      id: instrumentId,
      entity_id,
      balance_id,
      symbol,
      name,
      description: description || null,
      status: 'draft',
      net_value: balance.net_value,
      currency: 'EUR',
      units_issued,
      creation_reason: creation_reason || null,
      created_at: createdAt,
      activated_at: null,
    };

    await insertEvent(env, 'instrument.created', null, 'instrument', instrumentId, {
      symbol,
      net_value: balance.net_value,
    });

    return json(200, { ok: true, data: { instrument } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const entityId = url.searchParams.get('entity_id');

  let query = 'SELECT * FROM instruments';
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (entityId) {
    conditions.push('entity_id = ?');
    params.push(entityId);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC LIMIT 1000';

  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    const instruments = (result.results || []).map((r) => ({
      id: r.id,
      entity_id: r.entity_id,
      balance_id: r.balance_id,
      symbol: r.symbol,
      name: r.name,
      description: r.description,
      status: r.status,
      net_value: r.net_value,
      currency: r.currency,
      units_issued: r.units_issued,
      creation_reason: r.creation_reason,
      created_at: r.created_at,
      activated_at: r.activated_at,
    }));

    return json(200, { ok: true, data: { instruments } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}



// Cloudflare Pages Function: POST /api/real/transactions
// Erfasst eine Real-Transaktion für die Gleichgewichts-Börse

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'rtx') {
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

async function checkRateLimit(env, key, limit = 100, windowMs = 60_000) {
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

const VALID_CATEGORIES = ['income', 'expense', 'damage', 'benefit', 'risk'];
const VALID_DIRECTIONS = ['positive', 'negative'];

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `real.transactions|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const {
    entity_id,
    category,
    label,
    amount,
    unit,
    direction,
    weight,
    occurred_at,
    meta = {},
  } = body;

  // Validierung
  if (!entity_id || !category || typeof amount !== 'number' || !unit || !direction || typeof weight !== 'number' || !occurred_at) {
    return json(400, {
      ok: false,
      error: 'missing_required_fields',
      message: 'entity_id, category, amount, unit, direction, weight, and occurred_at are required',
    });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return json(400, {
      ok: false,
      error: 'invalid_category',
      message: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  if (!VALID_DIRECTIONS.includes(direction)) {
    return json(400, {
      ok: false,
      error: 'invalid_direction',
      message: `direction must be one of: ${VALID_DIRECTIONS.join(', ')}`,
    });
  }

  // Prüfe ob Entity existiert
  const entity = await env.DB.prepare('SELECT id FROM entities WHERE id = ?')
    .bind(entity_id)
    .first();

  if (!entity) {
    return json(404, {
      ok: false,
      error: 'entity_not_found',
      message: `Entity with id ${entity_id} does not exist`,
    });
  }

  const transactionId = makeId('rtx');
  const createdAt = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO real_transactions 
       (id, entity_id, category, label, amount, unit, direction, weight, occurred_at, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        transactionId,
        entity_id,
        category,
        label || null,
        amount,
        unit,
        direction,
        weight,
        occurred_at,
        JSON.stringify(meta),
        createdAt
      )
      .run();

    const transaction = {
      id: transactionId,
      entity_id,
      category,
      label: label || null,
      amount,
      unit,
      direction,
      weight,
      occurred_at,
      meta: meta || {},
      created_at: createdAt,
    };

    await insertEvent(env, 'real.transaction.created', null, 'real_transaction', transactionId, {
      entity_id,
      category,
      amount,
      unit,
    });

    return json(200, { ok: true, data: { transaction } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

// GET /api/real/transactions
export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const url = new URL(request.url);
  const entityId = url.searchParams.get('entity_id');
  const category = url.searchParams.get('category');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  if (!entityId) {
    return json(400, {
      ok: false,
      error: 'missing_entity_id',
      message: 'entity_id query parameter is required',
    });
  }

  let query = 'SELECT * FROM real_transactions WHERE entity_id = ?';
  const params = [entityId];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (from) {
    query += ' AND occurred_at >= ?';
    params.push(from);
  }

  if (to) {
    query += ' AND occurred_at <= ?';
    params.push(to);
  }

  query += ' ORDER BY occurred_at DESC LIMIT 1000';

  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    const transactions = (result.results || []).map((r) => ({
      id: r.id,
      entity_id: r.entity_id,
      category: r.category,
      label: r.label,
      amount: r.amount,
      unit: r.unit,
      direction: r.direction,
      weight: r.weight,
      occurred_at: r.occurred_at,
      meta: r.meta ? JSON.parse(r.meta) : {},
      created_at: r.created_at,
    }));

    return json(200, { ok: true, data: { transactions } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}










// Cloudflare Pages Function: GET/POST /api/real/entities
// Verwaltet Entities (reale Einheiten: Unternehmen, Projekte, Genossenschaften)

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'ent') {
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

const VALID_KINDS = ['company', 'project', 'cooperative'];

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `real.entities|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { kind, name, description } = body;

  if (!kind || !name) {
    return json(400, {
      ok: false,
      error: 'missing_required_fields',
      message: 'kind and name are required',
    });
  }

  if (!VALID_KINDS.includes(kind)) {
    return json(400, {
      ok: false,
      error: 'invalid_kind',
      message: `kind must be one of: ${VALID_KINDS.join(', ')}`,
    });
  }

  const entityId = body.id || makeId('ent');
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO entities (id, kind, name, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(entityId, kind, name, description || null, now, now)
      .run();

    const entity = {
      id: entityId,
      kind,
      name,
      description: description || null,
      created_at: now,
      updated_at: now,
    };

    await insertEvent(env, 'entity.created', null, 'entity', entityId, { kind, name });

    return json(200, { ok: true, data: { entity } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const url = new URL(request.url);
  const kind = url.searchParams.get('kind');

  let query = 'SELECT * FROM entities';
  const params = [];

  if (kind) {
    query += ' WHERE kind = ?';
    params.push(kind);
  }

  query += ' ORDER BY created_at DESC LIMIT 1000';

  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    const entities = (result.results || []).map((r) => ({
      id: r.id,
      kind: r.kind,
      name: r.name,
      description: r.description,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    return json(200, { ok: true, data: { entities } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}










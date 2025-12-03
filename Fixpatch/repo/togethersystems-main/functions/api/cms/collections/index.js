// Cloudflare Pages Function: Collections API
// GET /api/cms/collections - Liste aller Collections
// POST /api/cms/collections - Neue Collection erstellen

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
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

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// GET /api/cms/collections
export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const url = new URL(request.url);
  const siteId = url.searchParams.get('site_id');

  if (!siteId) {
    return json(400, { ok: false, error: 'site_id query parameter required' });
  }

  try {
    const collections = await env.DB.prepare(
      `SELECT * FROM cms_collections WHERE site_id = ? ORDER BY created_at DESC`
    )
      .bind(siteId)
      .all();

    return json(200, {
      ok: true,
      data: {
        collections: collections.results || [],
      },
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

// POST /api/cms/collections
export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { site_id, name, slug, schema, settings } = body;

  if (!site_id || !name || !slug || !schema) {
    return json(400, { ok: false, error: 'site_id, name, slug, and schema required' });
  }

  try {
    const collectionId = makeId('coll');
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO cms_collections (id, site_id, name, slug, schema_json, settings_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        collectionId,
        site_id,
        name,
        slug,
        JSON.stringify(schema),
        JSON.stringify(settings || {}),
        createdAt
      )
      .run();

    return json(200, {
      ok: true,
      data: {
        collection: {
          id: collectionId,
          site_id,
          name,
          slug,
          schema,
          settings: settings || {},
          created_at: createdAt,
        },
      },
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}










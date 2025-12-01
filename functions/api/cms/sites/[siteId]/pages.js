// Cloudflare Pages Function: Pages einer Site
// GET /api/cms/sites/[siteId]/pages - Liste aller Seiten einer Site
// POST /api/cms/sites/[siteId]/pages - Neue Seite erstellen

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

// GET /api/cms/sites/[siteId]/pages
export async function onRequestGet(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const siteId = params.siteId;

  try {
    const pages = await env.DB.prepare(
      `SELECT * FROM cms_pages WHERE site_id = ? ORDER BY path ASC`
    )
      .bind(siteId)
      .all();

    return json(200, {
      ok: true,
      data: {
        pages: pages.results || [],
        count: pages.results?.length || 0,
      },
    });
  } catch (err) {
    console.error('Error loading pages:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

// POST /api/cms/sites/[siteId]/pages
export async function onRequestPost(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const siteId = params.siteId;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { path, type = 'standard', layout = 'default', parent_page_id, is_home = false } = body;

  if (!path) {
    return json(400, { ok: false, error: 'path required' });
  }

  try {
    const pageId = makeId('page');
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO cms_pages (
         id, site_id, parent_page_id, path, type, is_home, layout, status, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        pageId,
        siteId,
        parent_page_id || null,
        path,
        type,
        is_home ? 1 : 0,
        layout,
        'draft',
        createdAt,
        createdAt
      )
      .run();

    return json(200, {
      ok: true,
      data: {
        page: {
          id: pageId,
          site_id: siteId,
          path,
          type,
          layout,
          status: 'draft',
          created_at: createdAt,
        },
      },
    });
  } catch (err) {
    console.error('Error creating page:', err);
    return json(500, { ok: false, error: String(err) });
  }
}










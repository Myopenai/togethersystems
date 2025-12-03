// Cloudflare Pages Function: CMS Sites API
// GET /api/cms/sites - Liste aller Sites für den aktuellen Tenant
// POST /api/cms/sites - Neue Site erstellen

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

// GET /api/cms/sites
export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  // TODO: Auth-Kontext aus Request extrahieren (tenant_id)
  // Für jetzt: Demo-Tenant
  const tenantId = request.headers.get('X-Tenant-ID') || 'tenant-demo';

  try {
    const sites = await env.DB.prepare(
      `SELECT * FROM cms_sites WHERE tenant_id = ? ORDER BY created_at DESC`
    )
      .bind(tenantId)
      .all();

    return json(200, {
      ok: true,
      data: {
        sites: sites.results || [],
      },
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

// POST /api/cms/sites
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

  const { name, slug, default_locale = 'de', settings } = body;

  if (!name || !slug) {
    return json(400, { ok: false, error: 'name and slug required' });
  }

  // TODO: Auth-Kontext
  const tenantId = request.headers.get('X-Tenant-ID') || 'tenant-demo';

  try {
    const siteId = makeId('site');
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO cms_sites (id, tenant_id, name, slug, default_locale, status, settings, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        siteId,
        tenantId,
        name,
        slug,
        default_locale,
        'draft',
        JSON.stringify(settings || {}),
        createdAt
      )
      .run();

    return json(200, {
      ok: true,
      data: {
        site: {
          id: siteId,
          tenant_id: tenantId,
          name,
          slug,
          default_locale,
          status: 'draft',
          settings: settings || {},
          created_at: createdAt,
        },
      },
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}










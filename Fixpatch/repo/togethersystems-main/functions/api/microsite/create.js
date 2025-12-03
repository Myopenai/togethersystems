// Cloudflare Pages Function: Mikro-Site erstellen
// POST /api/microsite/create - Erstellt automatisch eine Mikro-Site für verifizierten User

import { generateMicrositeUrl } from '../../utils/url-generator.js';

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

// POST /api/microsite/create
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

  const { userId, name, builder_mode = 'simple' } = body;

  if (!userId) {
    return json(400, { ok: false, error: 'userId required (user must be verified)' });
  }

  try {
    // Prüfe ob User bereits eine Site hat
    const existingSite = await env.DB.prepare(
      `SELECT * FROM cms_sites WHERE user_id = ? LIMIT 1`
    )
      .bind(userId)
      .first();

    if (existingSite) {
      return json(200, {
        ok: true,
        data: {
          site: {
            id: existingSite.id,
            user_id: existingSite.user_id,
            name: existingSite.name,
            slug: existingSite.slug,
            microsite_url: existingSite.microsite_url,
            builder_mode: existingSite.builder_mode || 'simple',
          },
          message: 'Site already exists',
        },
      });
    }

    // Erstelle Tenant für User (falls noch nicht vorhanden)
    let tenantId = `tenant-${userId}`;
    const existingTenant = await env.DB.prepare(
      `SELECT id FROM cms_tenants WHERE id = ?`
    )
      .bind(tenantId)
      .first();

    if (!existingTenant) {
      await env.DB.prepare(
        `INSERT INTO cms_tenants (id, name, plan, settings, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          tenantId,
          name || `User ${userId}`,
          'free',
          JSON.stringify({}),
          new Date().toISOString(),
          new Date().toISOString()
        )
        .run();
    }

    // Erstelle Site mit maschinengenerierter URL
    const siteId = makeId('site');
    const slug = `site-${userId}`;
    const micrositeUrl = generateMicrositeUrl(userId, []); // Startseite: T,userId.

    await env.DB.prepare(
      `INSERT INTO cms_sites (
         id, tenant_id, user_id, name, slug, default_locale, status, 
         microsite_url, builder_mode, settings, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        siteId,
        tenantId,
        userId,
        name || 'Meine Website',
        slug,
        'de',
        'draft',
        micrositeUrl,
        builder_mode,
        JSON.stringify({}),
        new Date().toISOString()
      )
      .run();

    // Erstelle automatisch Startseite
    const homePageId = makeId('page');
    await env.DB.prepare(
      `INSERT INTO cms_pages (
         id, site_id, parent_page_id, path, type, is_home, layout, status, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        homePageId,
        siteId,
        null,
        '/',
        'standard',
        1,
        'default',
        'draft',
        new Date().toISOString(),
        new Date().toISOString()
      )
      .run();

    return json(200, {
      ok: true,
      data: {
        site: {
          id: siteId,
          tenant_id: tenantId,
          user_id: userId,
          name: name || 'Meine Website',
          slug,
          microsite_url: micrositeUrl,
          builder_mode,
          status: 'draft',
        },
        message: 'Mikro-Site created successfully',
      },
    });
  } catch (err) {
    console.error('Error creating microsite:', err);
    return json(500, { ok: false, error: String(err) });
  }
}










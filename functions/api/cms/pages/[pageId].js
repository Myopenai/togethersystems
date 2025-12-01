// Cloudflare Pages Function: CMS Pages API
// GET /api/cms/pages/[pageId] - Einzelne Seite laden
// PUT /api/cms/pages/[pageId] - Seite aktualisieren
// DELETE /api/cms/pages/[pageId] - Seite löschen

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

// GET /api/cms/pages/[pageId]
export async function onRequestGet(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const pageId = params.pageId;

  try {
    const page = await env.DB.prepare(
      `SELECT * FROM cms_pages WHERE id = ?`
    )
      .bind(pageId)
      .first();

    if (!page) {
      return json(404, { ok: false, error: 'page not found' });
    }

    // Lade Locales
    const locales = await env.DB.prepare(
      `SELECT * FROM cms_page_locales WHERE page_id = ?`
    )
      .bind(pageId)
      .all();

    // Lade Blocks
    const blocks = await env.DB.prepare(
      `SELECT 
         b.*, 
         bt.name as block_type_name,
         bt.category as block_type_category,
         bt.component_ref
       FROM cms_blocks b
       JOIN cms_block_types bt ON b.block_type_id = bt.id
       WHERE b.page_id = ?
       ORDER BY b.position ASC`
    )
      .bind(pageId)
      .all();

    return json(200, {
      ok: true,
      data: {
        page,
        locales: locales.results || [],
        blocks: (blocks.results || []).map(b => ({
          id: b.id,
          block_type_id: b.block_type_id,
          block_type_name: b.block_type_name,
          block_type_category: b.block_type_category,
          component_ref: b.component_ref,
          position: b.position,
          zone: b.zone,
          data: JSON.parse(b.data_json || '{}'),
          visibility: b.visibility_json ? JSON.parse(b.visibility_json) : null,
        })),
      },
    });
  } catch (err) {
    console.error('Error loading page:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

// PUT /api/cms/pages/[pageId]
export async function onRequestPut(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const pageId = params.pageId;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { page, blocks } = body;

  if (!page) {
    return json(400, { ok: false, error: 'page data required' });
  }

  try {
    await env.DB.exec('BEGIN');

    // Update Page
    await env.DB.prepare(
      `UPDATE cms_pages 
       SET path = ?, status = ?, layout = ?, seo_index = ?, updated_at = ?
       WHERE id = ?`
    )
      .bind(
        page.path || '/',
        page.status || 'draft',
        page.layout || 'default',
        page.seo_index !== undefined ? (page.seo_index ? 1 : 0) : 1,
        new Date().toISOString(),
        pageId
      )
      .run();

    // Update Blocks (Löschen und Neu-Erstellen für Einfachheit)
    await env.DB.prepare(`DELETE FROM cms_blocks WHERE page_id = ?`)
      .bind(pageId)
      .run();

    if (Array.isArray(blocks)) {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockId = block.id || `block-${Date.now()}-${i}`;
        
        await env.DB.prepare(
          `INSERT INTO cms_blocks (
             id, page_id, locale, block_type_id, position, zone, data_json, visibility_json, created_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            blockId,
            pageId,
            block.locale || null,
            block.block_type_id,
            i,
            block.zone || 'main',
            JSON.stringify(block.data || {}),
            block.visibility ? JSON.stringify(block.visibility) : null,
            new Date().toISOString()
          )
          .run();
      }
    }

    await env.DB.exec('COMMIT');

    return json(200, {
      ok: true,
      data: {
        message: 'Page updated successfully',
        page_id: pageId,
      },
    });
  } catch (err) {
    await env.DB.exec('ROLLBACK');
    console.error('Error updating page:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

// DELETE /api/cms/pages/[pageId]
export async function onRequestDelete(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const pageId = params.pageId;

  try {
    await env.DB.exec('BEGIN');

    // Lösche Blocks
    await env.DB.prepare(`DELETE FROM cms_blocks WHERE page_id = ?`)
      .bind(pageId)
      .run();

    // Lösche Locales
    await env.DB.prepare(`DELETE FROM cms_page_locales WHERE page_id = ?`)
      .bind(pageId)
      .run();

    // Lösche Page
    await env.DB.prepare(`DELETE FROM cms_pages WHERE id = ?`)
      .bind(pageId)
      .run();

    await env.DB.exec('COMMIT');

    return json(200, {
      ok: true,
      data: {
        message: 'Page deleted successfully',
      },
    });
  } catch (err) {
    await env.DB.exec('ROLLBACK');
    console.error('Error deleting page:', err);
    return json(500, { ok: false, error: String(err) });
  }
}










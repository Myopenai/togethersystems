// Cloudflare Pages Function: Block-Typen API
// GET /api/cms/blocks/types - Liste aller verfügbaren Block-Typen

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// GET /api/cms/blocks/types
export async function onRequestGet(context) {
  const { env } = context;

  try {
    const blockTypes = await env.DB.prepare(
      `SELECT * FROM cms_block_types ORDER BY category, name ASC`
    )
      .all();

    const types = (blockTypes.results || []).map(bt => ({
      id: bt.id,
      name: bt.name,
      category: bt.category,
      schema: JSON.parse(bt.schema_json || '{}'),
      component_ref: bt.component_ref,
    }));

    // Gruppiere nach Kategorie
    const grouped = {};
    types.forEach(type => {
      if (!grouped[type.category]) {
        grouped[type.category] = [];
      }
      grouped[type.category].push(type);
    });

    return json(200, {
      ok: true,
      data: {
        block_types: types,
        grouped,
      },
    });
  } catch (err) {
    console.error('Error loading block types:', err);
    return json(500, { ok: false, error: String(err) });
  }
}



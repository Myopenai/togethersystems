// TELBANK Transformation Actions API
// IBM-Standard: Zero-Defect, Industrial Fabrication Software
// Version: 1.0.0-XXXL

export async function onRequest(context) {
  const { request, env } = context;
  const { DB } = env;

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const negAssetId = url.searchParams.get('neg_asset_id');
      const resultState = url.searchParams.get('result_state');

      let query = `
        SELECT 
          t.transform_id,
          t.neg_asset_id,
          t.action_type,
          t.description,
          t.scheduled_at,
          t.executed_at,
          t.result_state,
          t.effect_amount,
          t.notes,
          t.approved_by,
          t.created_at,
          n.currency_code,
          n.nominal_amount
        FROM transformation_action t
        LEFT JOIN negative_asset n ON n.neg_asset_id = t.neg_asset_id
        WHERE 1=1
      `;
      const params = [];

      if (negAssetId) {
        query += ' AND t.neg_asset_id = ?';
        params.push(negAssetId);
      }
      if (resultState) {
        query += ' AND t.result_state = ?';
        params.push(resultState);
      }

      query += ' ORDER BY t.created_at DESC';

      const result = await DB.prepare(query).bind(...params).all();

      return new Response(JSON.stringify({
        success: true,
        data: result.results || []
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const {
        neg_asset_id,
        action_type,
        description,
        scheduled_at,
        effect_amount,
        notes,
        approved_by
      } = body;

      if (!neg_asset_id || !action_type) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required fields: neg_asset_id, action_type'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const transformId = crypto.randomUUID();
      const now = new Date().toISOString();

      await DB.prepare(`
        INSERT INTO transformation_action (
          transform_id, neg_asset_id, action_type, description,
          scheduled_at, result_state, effect_amount, notes, approved_by, created_at
        ) VALUES (?, ?, ?, ?, ?, 'planned', ?, ?, ?, ?)
      `).bind(
        transformId, neg_asset_id, action_type, description || null,
        scheduled_at || null, effect_amount || null, notes || null,
        approved_by || null, now
      ).run();

      return new Response(JSON.stringify({
        success: true,
        data: { transform_id: transformId }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[TELBANK Transformations API Error]', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


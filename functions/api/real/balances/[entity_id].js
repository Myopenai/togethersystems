// Cloudflare Pages Function: GET /api/real/balances/:entity_id
// Liefert Real-Bilanzen für eine Entity

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

export async function onRequestGet(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const entityId = params.entity_id;
  const url = new URL(request.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  let query = 'SELECT * FROM real_balances WHERE entity_id = ?';
  const queryParams = [entityId];

  if (from) {
    query += ' AND period_end >= ?';
    queryParams.push(from);
  }

  if (to) {
    query += ' AND period_start <= ?';
    queryParams.push(to);
  }

  query += ' ORDER BY period_start DESC LIMIT 100';

  try {
    const result = await env.DB.prepare(query).bind(...queryParams).all();
    const balances = (result.results || []).map((r) => ({
      id: r.id,
      entity_id: r.entity_id,
      period_start: r.period_start,
      period_end: r.period_end,
      total_income: r.total_income,
      total_expense: r.total_expense,
      total_damage: r.total_damage,
      total_benefit: r.total_benefit,
      total_risk: r.total_risk,
      net_value: r.net_value,
      currency: r.currency,
      meta: r.meta ? JSON.parse(r.meta) : {},
      created_at: r.created_at,
    }));

    return json(200, { ok: true, data: { balances } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}



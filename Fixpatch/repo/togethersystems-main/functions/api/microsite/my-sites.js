// Cloudflare Pages Function: Alle Mikro-Sites eines Users
// GET /api/microsite/my-sites?userId=...

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

// GET /api/microsite/my-sites
export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return json(400, { ok: false, error: 'userId query parameter required' });
  }

  try {
    const sites = await env.DB.prepare(
      `SELECT 
         id, user_id, name, slug, microsite_url, builder_mode, status,
         created_at, published_at
       FROM cms_sites 
       WHERE user_id = ? 
       ORDER BY created_at DESC`
    )
      .bind(userId)
      .all();

    return json(200, {
      ok: true,
      data: {
        sites: sites.results || [],
        count: sites.results?.length || 0,
      },
    });
  } catch (err) {
    console.error('Error fetching user sites:', err);
    return json(500, { ok: false, error: String(err) });
  }
}










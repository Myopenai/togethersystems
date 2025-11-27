/**
 * GET /api/sponsors/list
 * 
 * Liste aller Sponsoren & Investoren
 */

export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    let sponsors = [];

    // D1 Query (falls verfügbar)
    if (env.DB) {
      try {
        const result = await env.DB.prepare(
          `SELECT id, name, logo_data, registered, type, verified, timestamp
           FROM sponsors
           ORDER BY registered DESC
           LIMIT 100`
        ).all();

        sponsors = result.results.map(row => ({
          id: row.id,
          name: row.name,
          logoData: row.logo_data,
          registered: row.registered,
          type: row.type,
          verified: row.verified === 1,
          timestamp: row.timestamp
        }));
      } catch (e) {
        console.log('D1 query optional:', e);
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      sponsors,
      count: sponsors.length,
      message: 'Sponsoren & Investoren Liste'
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || 'Server-Fehler'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


// THYNK ORDNER - Health Check Endpoint
// GET /api/health - System health check

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Check database connection
    let dbStatus = 'unknown';
    try {
      if (env?.DB) {
        await env.DB.prepare('SELECT 1').first();
        dbStatus = 'connected';
      } else {
        dbStatus = 'not_configured';
      }
    } catch (err) {
      dbStatus = 'error: ' + err.message;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        service: 'thynk-order',
        status: 'running',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        version: '1.0.0',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: String(err),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}


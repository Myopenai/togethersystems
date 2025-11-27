/**
 * GET /api/settings/model-for-task
 * 
 * Findet optimales NN-Model für Task mit Constraints
 * 
 * NOTE: Settings-OS ist für lokale Entwicklung, nicht für Workers
 * Diese Function gibt vereinfachte Worker-kompatible Antworten zurück
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const task = url.searchParams.get('task');
  if (!task) {
    return new Response(JSON.stringify({
      error: 'task parameter is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  const constraints = {
    maxLatency: url.searchParams.get('maxLatency') ? parseFloat(url.searchParams.get('maxLatency')) : undefined,
    costCeiling: url.searchParams.get('costCeiling') ? parseFloat(url.searchParams.get('costCeiling')) : undefined,
    energyCeiling: url.searchParams.get('energyCeiling') ? parseFloat(url.searchParams.get('energyCeiling')) : undefined
  };

  // Worker-kompatible vereinfachte Version
  return new Response(JSON.stringify({
    ok: true,
    message: 'Settings-OS ist für lokale Entwicklung verfügbar. Diese Function ist in Workers vereinfacht.',
    model: null,
    task,
    constraints
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * GET /api/settings/query
 * 
 * Query Settings Graph
 * Filterbar nach project, environment, type, scope, id
 * 
 * NOTE: Settings-OS ist für lokale Entwicklung, nicht für Workers
 * Diese Function gibt vereinfachte Worker-kompatible Antworten zurück
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const params = {
    projectId: url.searchParams.get('projectId') || undefined,
    environment: url.searchParams.get('environment') || undefined,
    type: url.searchParams.get('type') || undefined,
    scope: url.searchParams.get('scope') || undefined,
    id: url.searchParams.get('id') || undefined
  };

  // Worker-kompatible vereinfachte Version
  return new Response(JSON.stringify({
    ok: true,
    message: 'Settings-OS ist für lokale Entwicklung verfügbar. Diese Function ist in Workers vereinfacht.',
    data: {
      nodes: [],
      filters: params
    }
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

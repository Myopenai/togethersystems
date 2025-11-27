/**
 * GET /api/settings/graph
 * 
 * Gibt vollständigen Settings Graph zurück
 * 
 * NOTE: Settings-OS ist für lokale Entwicklung, nicht für Workers
 * Diese Function gibt vereinfachte Worker-kompatible Antworten zurück
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const projectId = url.searchParams.get('projectId') || undefined;
  const environment = url.searchParams.get('environment') || undefined;

  // Worker-kompatible vereinfachte Version
  return new Response(JSON.stringify({
    ok: true,
    message: 'Settings-OS ist für lokale Entwicklung verfügbar. Diese Function ist in Workers vereinfacht.',
    graph: {
      nodes: [],
      edges: [],
      manifest: {
        settingsManifestVersion: '0.9.0',
        indexes: {
          types: [],
          scopes: []
        }
      }
    },
    filters: { projectId, environment }
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

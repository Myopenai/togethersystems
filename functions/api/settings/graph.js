/**
 * GET /api/settings/graph
 * 
 * Gibt vollständigen Settings Graph zurück
 */

import { SettingsAPI } from '../../../Settings/api/settings-api';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const projectId = url.searchParams.get('projectId') || undefined;
  const environment = url.searchParams.get('environment') || undefined;

  try {
    const settingsPath = './Settings';
    const api = new SettingsAPI(settingsPath);
    
    const graph = await api.getGraph(projectId, environment);
    
    // Konvertiere Map zu Array für JSON
    const graphData = {
      nodes: Array.from(graph.nodes.values()),
      edges: Array.from(graph.edges.entries()).map(([source, targets]) => ({
        source,
        targets: targets.map(t => ({
          target: t.target,
          edge: t.edge,
          constraints: t.constraints
        }))
      })),
      manifest: graph.manifest
    };
    
    return new Response(JSON.stringify(graphData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
}


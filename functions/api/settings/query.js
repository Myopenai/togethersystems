/**
 * GET /api/settings/query
 * 
 * Query Settings Graph
 * Filterbar nach project, environment, type, scope, id
 */

import { SettingsAPI } from '../../../Settings/api/settings-api';

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

  try {
    const settingsPath = './Settings';
    const api = new SettingsAPI(settingsPath);
    
    const result = await api.querySettings(params);
    
    return new Response(JSON.stringify(result, null, 2), {
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


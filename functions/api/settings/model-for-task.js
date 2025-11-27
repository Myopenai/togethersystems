/**
 * GET /api/settings/model-for-task
 * 
 * Findet optimales NN-Model für Task mit Constraints
 */

import { SettingsAPI } from '../../../Settings/api/settings-api';

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

  try {
    const settingsPath = './Settings';
    const api = new SettingsAPI(settingsPath);
    
    const result = await api.getModelForTask(task, constraints);
    
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


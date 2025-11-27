/**
 * POST /api/settings/simulate-change
 * 
 * Simuliert Settings-Änderung ohne sie anzuwenden
 * Gibt Validation & Impact zurück
 */

import { SettingsAPI } from '../../../Settings/api/settings-api';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    if (!body.nodeId || !body.changes) {
      return new Response(JSON.stringify({
        error: 'nodeId and changes are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const settingsPath = './Settings';
    const api = new SettingsAPI(settingsPath);
    
    const result = await api.simulateChange({
      nodeId: body.nodeId,
      changes: body.changes
    });
    
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


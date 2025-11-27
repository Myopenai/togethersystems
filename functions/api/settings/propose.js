/**
 * POST /api/settings/propose
 * 
 * LLM Proposal für Settings-Änderung
 * Erstellt Proposal Node mit Validation
 */

import { SettingsAPI } from '../../../Settings/api/settings-api';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    if (!body.nodeId || !body.changes || !body.rationale || !body.proposedBy) {
      return new Response(JSON.stringify({
        error: 'nodeId, changes, rationale, and proposedBy are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const settingsPath = './Settings';
    const api = new SettingsAPI(settingsPath);
    
    const result = await api.proposeChange({
      nodeId: body.nodeId,
      changes: body.changes,
      rationale: body.rationale,
      proposedBy: body.proposedBy,
      llmModel: body.llmModel
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


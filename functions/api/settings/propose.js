/**
 * POST /api/settings/propose
 * 
 * LLM Proposal für Settings-Änderung
 * Erstellt Proposal Node mit Validation
 * 
 * NOTE: Settings-OS ist für lokale Entwicklung, nicht für Workers
 * Diese Function gibt vereinfachte Worker-kompatible Antworten zurück
 */

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

    // Worker-kompatible vereinfachte Version
    return new Response(JSON.stringify({
      ok: true,
      message: 'Settings-OS ist für lokale Entwicklung verfügbar. Diese Function ist in Workers vereinfacht.',
      proposal: {
        nodeId: body.nodeId,
        changes: body.changes,
        rationale: body.rationale,
        proposedBy: body.proposedBy,
        llmModel: body.llmModel || 'gpt-4',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
}

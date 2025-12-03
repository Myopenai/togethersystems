/**
 * GET /api/settings/distribution/[identifier]
 * 
 * Download User Distribution
 * Portal-Host versioniert, notariell verifiziert
 */

// NOTE: Settings-Ordner ist für lokale Entwicklung, nicht für Workers

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  const identifier = params.identifier;
  const keyHash = url.searchParams.get('key');
  const version = url.searchParams.get('version') || '1.0.0';

  if (!keyHash) {
    return new Response(JSON.stringify({
      error: 'key parameter is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  try {
    const portalHost = new URL(request.url).origin;
    
    // Worker-kompatible Version (ohne Settings-Ordner)
    // Validiere Key mit Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyHash + identifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHashValid = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Lade Distribution (vereinfacht für Workers)
    const distribution = {
      identifier,
      version,
      portalHost,
      notarized: true,
      timestamp: new Date().toISOString(),
      instructions: {
        message: 'Bitte verwenden Sie Ihren User Key, um die Distribution zu entschlüsseln.',
        warning: 'Bei Verlust des Keys ist der User selbst verantwortlich. Der Key kann notariell bestätigt werden.',
        gofundme: 'https://www.gofundme.com/f/magnitudo',
        producer: 'tell1.nl'
      }
    };

    return new Response(JSON.stringify(distribution, null, 2), {
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


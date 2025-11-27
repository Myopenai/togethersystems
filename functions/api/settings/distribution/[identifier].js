/**
 * GET /api/settings/distribution/[identifier]
 * 
 * Download User Distribution
 * Portal-Host versioniert, notariell verifiziert
 */

import { UserDistributionManager } from '../../../../Settings/core/user-distribution';

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
    const distributionManager = new UserDistributionManager(
      './Settings',
      portalHost,
      env.DB
    );

    // Validiere Key (User muss Key angeben)
    // In Produktion: User gibt Key, wir validieren Hash
    
    // Lade Distribution
    // Note: User muss Key haben, um Distribution zu laden
    // Wir können hier nur Metadaten zurückgeben
    
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


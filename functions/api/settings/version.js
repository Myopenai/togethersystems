/**
 * GET /api/settings/version
 * 
 * Gibt aktuelle Version zurück (Portal-Host versioniert)
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  
  // Globales Zeitzonensystem (UTC)
  const timestamp = new Date().toISOString();
  const timezone = 'UTC';
  
  // Version basierend auf Timestamp (Portal-Host versioniert)
  const version = `1.0.${Date.now()}`;

  return new Response(JSON.stringify({
    version,
    timestamp,
    timezone,
    producer: 'TEL1.NL',
    whatsapp: '0031613803782',
    branding: '.{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.',
    portalHost: new URL(request.url).origin
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}


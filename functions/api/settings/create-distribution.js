/**
 * POST /api/settings/create-distribution
 * 
 * Erstellt User Distribution mit Unique Identifier
 * Notarielle Verifizierung, Portal-Host Versionierung
 * 
 * NOTE: Settings-Ordner ist für lokale Entwicklung, nicht für Workers
 * Diese Function verwendet Web Crypto API statt Node.js crypto
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    // User Key wird vom User generiert (nicht vom Server)
    // Server validiert nur
    const userKey = body.userKey;
    
    if (!userKey) {
      return new Response(JSON.stringify({
        error: 'userKey is required. User must generate and provide their own key.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const portalHost = new URL(request.url).origin;
    
    // Web Crypto API für Worker-Kompatibilität
    const encoder = new TextEncoder();
    const data = encoder.encode(userKey + portalHost + Date.now().toString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const identifier = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
    
    // Erstelle Distribution (vereinfacht für Workers)
    const distribution = {
      identifier,
      userKey: userKey.substring(0, 8) + '...', // Nur Teil anzeigen
      portalHost,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      status: 'active'
    };

    return new Response(JSON.stringify({
      success: true,
      distribution,
      important: {
        message: 'BEWAHREN SIE IHREN USER KEY SICHER AUF!',
        warning: 'Bei Verlust des Keys ist der User selbst verantwortlich. Der Key kann notariell bestätigt werden.',
        capabilities: [
          'Eigene Netzwerke aufbauen',
          'Portale erstellen',
          'Kopien versionieren',
          'Settings-Ordner aufbauen',
          '1:1 produktionsfähig',
          'Vollständige Funktionalität (ohne Source-Code-Zugriff)'
        ],
        restrictions: {
          sourceCodeAccess: false,
          functionality: 'full',
          modifications: true,
          extensions: true,
          design: true
        },
        gofundme: 'https://www.gofundme.com/f/magnitudo',
        producer: 'TEL1.NL',
        whatsapp: '0031613803782',
        branding: '.{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.'
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

// Cloudflare Pages Function: 404 Handler
// Fängt 404-Fehler ab und leitet zu korrekten Pfaden weiter

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Spezielle 404-Behandlung für bekannte Pfade
  const redirects = {
    '/togethersystems/TsysytemsT/TsysytemsT.html': '/TsysytemsT/TsysytemsT.html',
    '/TsysytemsT/TsysytemsT.html': '/TsysytemsT/TsysytemsT.html',
    '/tsysytemst/tsysytemst.html': '/TsysytemsT/TsysytemsT.html', // Case-insensitive Fallback
  };

  // Prüfe auf bekannte Pfade (case-insensitive)
  const lowerPath = pathname.toLowerCase();
  for (const [pattern, target] of Object.entries(redirects)) {
    if (lowerPath.includes(pattern.toLowerCase().replace(/^\//, ''))) {
      return Response.redirect(new URL(target, url.origin).toString(), 301);
    }
  }

  // Standard 404-Seite
  return new Response(
    `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 - Seite nicht gefunden</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(180deg, #0b0f14, #0f1419);
      color: #e5e7eb;
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 600px;
    }
    h1 { font-size: 3rem; margin: 0; color: #10b981; }
    p { font-size: 1.1rem; color: #9ca3af; margin: 20px 0; }
    .links {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 30px;
    }
    .links a {
      color: #10b981;
      text-decoration: none;
      padding: 10px 20px;
      border: 1px solid #10b981;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .links a:hover {
      background: #10b981;
      color: #00110b;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>Die angeforderte Seite wurde nicht gefunden.</p>
    <p style="font-size: 0.9rem; color: #6b7280;">
      Gesuchte URL: <code>${pathname}</code>
    </p>
    <div class="links">
      <a href="/">Portal</a>
      <a href="/manifest-portal.html">Online-Portal</a>
      <a href="/TsysytemsT/TsysytemsT.html">One Network</a>
      <a href="/index.html">Startseite</a>
    </div>
  </div>
</body>
</html>`,
    {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}


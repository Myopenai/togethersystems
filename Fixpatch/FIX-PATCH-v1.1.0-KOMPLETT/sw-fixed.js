/**
 * TOGETHERSYSTEMS - Enhanced Service Worker
 * With 404 handling and offline fallback
 * 
 * Replace your existing sw.js with this file
 */

const CACHE_NAME = 'togethersystems-v2.0.0';
const OFFLINE_PAGE = '/offline.html';

// Files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest-forum.html',
  '/manifest-portal.html',
  '/honeycomb.html',
  '/legal-hub.html',
  '/offline.html',
  '/assets/css/navigation.css',
  '/assets/js/navigation.js',
  '/assets/branding/logo.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v2.0.0...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        // Cache what we can, don't fail if some assets are missing
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`[SW] Could not cache: ${url}`, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with fallbacks
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
      return await networkFirstStrategy(request);
    }
    
    // Cache first for static assets
    return await cacheFirstStrategy(request);
    
  } catch (error) {
    console.error('[SW] Request failed:', error);
    return handle404(request);
  }
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Handle 404 errors
    if (networkResponse.status === 404) {
      console.log('[SW] 404 detected:', request.url);
      return handle404(request);
    }
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Return a proper 404 response for missing assets
    return new Response('Asset not found', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

function handle404(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Try to fix common URL mistakes
  const fixes = {
    '/manifst-portal.html': '/manifest-portal.html',
    '/manifest_portal.html': '/manifest-portal.html',
    '/adminn.html': '/admin.html',
    '/admin-panel.html': '/admin.html',
    '/home.html': '/index.html',
    '/main.html': '/index.html',
    '/forum.html': '/manifest-forum.html',
    '/legal.html': '/legal-hub.html',
    '/honeycomb-room.html': '/honeycomb.html'
  };

  const fixedPath = fixes[pathname];
  if (fixedPath) {
    console.log(`[SW] Redirecting ${pathname} -> ${fixedPath}`);
    return Response.redirect(url.origin + fixedPath, 301);
  }

  // Return custom 404 page
  return new Response(create404Page(pathname), {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

function create404Page(pathname) {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Seite nicht gefunden | TOGETHERSYSTEMS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
    }
    h1 {
      font-size: 8rem;
      color: #e94560;
      text-shadow: 0 0 30px rgba(233, 69, 96, 0.5);
      margin-bottom: 1rem;
    }
    h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #a0a0a0;
    }
    p {
      margin-bottom: 2rem;
      color: #888;
    }
    .path {
      background: rgba(255,255,255,0.1);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-family: monospace;
      margin-bottom: 2rem;
      display: inline-block;
    }
    .links {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .links a {
      background: #e94560;
      color: white;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 30px;
      transition: all 0.3s ease;
    }
    .links a:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(233, 69, 96, 0.4);
    }
    .suggestions {
      margin-top: 2rem;
      text-align: left;
      background: rgba(255,255,255,0.05);
      padding: 1.5rem;
      border-radius: 12px;
    }
    .suggestions h3 {
      color: #e94560;
      margin-bottom: 1rem;
    }
    .suggestions ul {
      list-style: none;
    }
    .suggestions li {
      padding: 0.5rem 0;
    }
    .suggestions a {
      color: #4fc3f7;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>Seite nicht gefunden</h2>
    <p class="path">${pathname}</p>
    <p>Die angeforderte Seite existiert nicht oder wurde verschoben.</p>
    
    <div class="links">
      <a href="/">🏠 Startseite</a>
      <a href="javascript:history.back()">← Zurück</a>
    </div>
    
    <div class="suggestions">
      <h3>📍 Verfügbare Seiten:</h3>
      <ul>
        <li><a href="/index.html">🏠 Home / Portal</a></li>
        <li><a href="/manifest-portal.html">🌐 Manifest Portal</a></li>
        <li><a href="/manifest-forum.html">💬 Forum</a></li>
        <li><a href="/honeycomb.html">🐝 Honeycomb Räume</a></li>
        <li><a href="/admin.html">⚙️ Admin</a></li>
        <li><a href="/legal-hub.html">⚖️ Legal Hub</a></li>
      </ul>
    </div>
  </div>
</body>
</html>
`;
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker loaded');


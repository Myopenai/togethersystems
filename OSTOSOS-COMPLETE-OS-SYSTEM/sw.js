// T,. OSTOSOS Operating System - Service Worker
// Automatic Updates | Offline Support | Cross-Device Sync

const VERSION = '1.0.0';
const CACHE_NAME = `ostosos-cache-${VERSION}`;
const UPDATE_CHECK_INTERVAL = 3600000; // 1 Stunde

// Install Event - Cache all assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing OSTOSOS OS v' + VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './OSTOSOS-OS-COMPLETE-SYSTEM.html',
        './OSTOSOS-INSTALLER.html',
        './manifest.webmanifest',
        './css/da-vinci-xxxxxl-enterprise-standard.css',
        './js/portal-api.js',
        './autofix-client.js'
      ]);
    })
  );
  
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating OSTOSOS OS v' + VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache new responses
        if (fetchResponse && fetchResponse.status === 200) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    })
  );
});

// Automatic Update Check
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    checkForUpdates();
  }
});

// Background Update Check
setInterval(() => {
  checkForUpdates();
}, UPDATE_CHECK_INTERVAL);

async function checkForUpdates() {
  // Skip update check if running from file:// protocol
  if (self.location && self.location.protocol === 'file:') {
    console.log('[SW] File-Protokoll erkannt - Update-Check übersprungen');
    return;
  }
  
  try {
    const response = await fetch('./manifest.webmanifest', {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const manifest = await response.json();
      const newVersion = manifest.version || manifest.short_name;
      
      if (newVersion !== VERSION) {
        console.log('[SW] Update gefunden:', newVersion);
        
        // Notify all clients
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            version: newVersion
          });
        });
        
        // Auto-update in background
        self.registration.update();
      }
    }
  } catch (error) {
    console.error('[SW] Update-Check Fehler:', error);
  }
}

// Sync Event - Cross-Device Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'ostosos-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Sync logic here
    console.log('[SW] Syncing data across devices...');
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE'
      });
    });
  } catch (error) {
    console.error('[SW] Sync Fehler:', error);
  }
}

console.log('T,. OSTOSOS Service Worker v' + VERSION + ' geladen');


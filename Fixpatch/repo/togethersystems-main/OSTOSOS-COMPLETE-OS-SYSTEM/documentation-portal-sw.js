// T,. OSTOSOS - Dokumentationsportal Service Worker
// Offline-Funktionalität für Luxus-Dokumentationsportal

const CACHE_NAME = 'ostosos-documentation-portal-v1';
const urlsToCache = [
  './documentation-portal.html',
  './css/da-vinci-xxxxxl-enterprise-standard.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.warn('⚠️ Cache-Fehler (optional):', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Alten Cache löschen:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        ).catch(() => {
          // Offline fallback
          if (event.request.destination === 'document') {
            return caches.match('./documentation-portal.html');
          }
        });
      })
  );
});


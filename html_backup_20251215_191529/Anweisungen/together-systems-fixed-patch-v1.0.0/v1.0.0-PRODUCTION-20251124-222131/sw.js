const CACHE_NAME = 'businessconnecthub-cache-v2';

const ASSETS = [
  './index.html',
  './icon.png',
  './manifest-forum.html',
  './manifest-portal.html',
  './admin.html',
  './honeycomb.html',
  './legal-hub.html',
  './business-admin.html',
  './admin-monitoring.html',
  './TELBANK/index.html',
  './mot-core.js',
  './autofix-client.js',
  './room-image-carousel.js',
  './ambient-media.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Einzelne Assets hinzufügen mit Fehlerbehandlung
      return Promise.allSettled(
        ASSETS.map(asset => 
          cache.add(asset).catch(err => {
            console.warn(`Service Worker: Konnte ${asset} nicht cachen:`, err);
            return null;
          })
        )
      );
    })
  );
  self.skipWaiting(); // Sofort aktivieren
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req).catch(() =>
      caches.match(req).then(cached => cached || caches.match('./index.html'))
    )
  );
});

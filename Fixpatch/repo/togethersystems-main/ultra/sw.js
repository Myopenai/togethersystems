// Service Worker für PWA-Support
// Offline-Funktionalität und Caching

const CACHE_NAME = 'ultra-v1';
const urlsToCache = [
  '/ultra/',
  '/ultra/index.html',
  '/ultra/ui/styles.css',
  '/ultra/core/event-bus.js',
  '/ultra/core/storage.js',
  '/ultra/core/identity.js',
  '/ultra/core/network.js',
  '/ultra/core/posts.js',
  '/ultra/core/chat.js',
  '/ultra/core/rooms.js',
  '/ultra/core/stories.js',
  '/ultra/core/manifest-bridge.js',
  '/ultra/app.js',
  '/ultra/extensions/registry.js',
  '/icon.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event
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
        );
      })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});









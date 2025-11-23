const CACHE_NAME = 'businessconnecthub-cache-v1';

const ASSETS = [
  './index.html',
  './Portal – Start.html',
  './icon.png',
  './manifest-forum.html',
  './manifest-portal.html',
  './online/online/manifest-portal.html',
  './admin.html',
  './honeycomb.html',
  './legal-hub.html',
  './assets/branding/de_rechtspraak_128.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
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

// sw.js - Service Worker für OSOS
const CACHE = 'osos-cache-v1';
const ASSETS = ['./osos-full.html','./sw.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

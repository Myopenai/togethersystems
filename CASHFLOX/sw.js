// [.SYSTEMS.T.SYSTEMS.] Service Worker für Offline-Funktionalität
// TogetherSystems Hub - Cross-Platform PWA

const CACHE_NAME = 'togethersystems-hub-v1';
const RUNTIME_CACHE = 'togethersystems-runtime-v1';

// Dateien die offline verfügbar sein sollen
const STATIC_CACHE_FILES = [
	'./TOGETHERSYSTEMS-HUB.html',
	'./budget.html',
	'./contract.html',
	'./FLOCASHX.HTML',
	'./chflox.html',
	'./indexortal.html',
	'./Kassenbuch/kassenbuch.html',
	'./KASSENBUCH-COMMUNICATION-LAYER.js',
	'./manifest.json',
	'./icons/icon-192.png',
	'./icons/icon-512.png'
];

// Install Event - Cache statische Dateien
self.addEventListener('install', (event) => {
	console.log('[FABRIKAGE] Service Worker: Install');
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('[FABRIKAGE] Service Worker: Caching static files');
			return cache.addAll(STATIC_CACHE_FILES).catch((err) => {
				console.error('[FABRIKAGE] Service Worker: Cache error', err);
			});
		})
	);
	self.skipWaiting();
});

// Activate Event - Alte Caches löschen
self.addEventListener('activate', (event) => {
	console.log('[FABRIKAGE] Service Worker: Activate');
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
					.map((name) => {
						console.log('[FABRIKAGE] Service Worker: Deleting old cache', name);
						return caches.delete(name);
					})
			);
		})
	);
	self.clients.claim();
});

// Fetch Event - Cache First Strategy
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	
	// Nur GET-Requests cachen
	if (request.method !== 'GET') {
		return;
	}
	
	// Externe Ressourcen nicht cachen
	if (url.origin !== location.origin && !url.href.includes('myopenai.github.io')) {
		return;
	}
	
	event.respondWith(
		caches.match(request).then((cachedResponse) => {
			// Cache Hit
			if (cachedResponse) {
				return cachedResponse;
			}
			
			// Cache Miss - Network Request
			return fetch(request)
				.then((response) => {
					// Nur erfolgreiche Responses cachen
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response;
					}
					
					// Response klonen (kann nur einmal gelesen werden)
					const responseToCache = response.clone();
					
					// In Runtime Cache speichern
					caches.open(RUNTIME_CACHE).then((cache) => {
						cache.put(request, responseToCache);
					});
					
					return response;
				})
				.catch(() => {
					// Offline Fallback
					if (request.destination === 'document') {
						return caches.match('./TOGETHERSYSTEMS-HUB.html');
					}
					return new Response('Offline', { status: 503 });
				});
		})
	);
});

// Message Event - Für Kommunikation mit App
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

console.log('[FABRIKAGE] Service Worker geladen');

// [.SYSTEMS.T.SYSTEMS.] CASHFLOX HUB - Service Worker für PWA

const CACHE_NAME = 'cashflox-hub-v1.0.0';
const urlsToCache = [
	'./index.html',
	'../KASSENBUCH-COMMUNICATION-LAYER.js',
	'../Kassenbuch/kassenbuch.html',
	'../budget.html',
	'../contract.html',
	'../FLOCASHX.HTML',
	'../chflox.html'
];

// Install
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('[FABRIKAGE] Service Worker: Cache geöffnet');
				return cache.addAll(urlsToCache);
			})
			.catch((error) => {
				console.error('[FABRIKAGE] Service Worker: Cache-Fehler:', error);
			})
	);
});

// Fetch
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				// Cache hit - return response
				if (response) {
					return response;
				}
				
				// Clone the request
				const fetchRequest = event.request.clone();
				
				return fetch(fetchRequest).then((response) => {
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
				});
			})
	);
});

// Activate
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						console.log('[FABRIKAGE] Service Worker: Alten Cache löschen:', cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

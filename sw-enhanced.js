// Service Worker - Erweitert für Offline-First & Background-Sync

const CACHE_NAME = 'businessconnecthub-cache-v3'; // Version erhöht

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
  './production-dashboard.html',
  './neural-network-console.html',
  './TELBANK/index.html',
  './mot-core.js',
  './autofix-client.js',
  './room-image-carousel.js',
  './ambient-media.js',
  './rich-media-posts.js',
  './data-export-enhanced.js',
  './balanced-exchange-portal.js',
  './messages-portal.js',
];

// Background-Sync: Queue für Offline-Aktionen
const SYNC_QUEUE_KEY = 'sw_sync_queue';

// Install Event - Cache aktualisieren
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
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

// Activate Event - Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch Event - Offline-First Strategie
self.addEventListener('fetch', event => {
  const req = event.request;
  
  // Nur GET-Requests cachen
  if (req.method !== 'GET') return;
  
  // API-Calls nicht cachen
  if (req.url.includes('/api/')) {
    // Für API-Calls: Network-First mit Offline-Fallback
    event.respondWith(
      fetch(req)
        .catch(() => {
          // Offline: Versuche aus Cache
          return caches.match(req).then(cached => {
            if (cached) return cached;
            // Keine Cache: Return Error-Response
            return new Response(
              JSON.stringify({ ok: false, error: 'offline', message: 'Keine Verbindung. Bitte später erneut versuchen.' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }
  
  // Für statische Assets: Cache-First
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      
      // Nicht im Cache: Fetch und cachen
      return fetch(req).then(response => {
        // Nur erfolgreiche Responses cachen
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Offline-Fallback
        if (req.url.endsWith('.html')) {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Background Sync - Queue für Offline-Aktionen
self.addEventListener('sync', event => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPostsQueue());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessagesQueue());
  }
});

// Post-Sync Queue
async function syncPostsQueue() {
  try {
    // Hole Queue aus IndexedDB (oder LocalStorage)
    // Für jetzt: Einfache Implementierung
    const queue = await getSyncQueue();
    
    for (const item of queue) {
      if (item.type === 'post' && item.action === 'publish') {
        try {
          const response = await fetch(item.url, {
            method: 'POST',
            headers: item.headers || {},
            body: item.body,
          });
          
          if (response.ok) {
            // Erfolg: Aus Queue entfernen
            await removeFromQueue(item.id);
          }
        } catch (err) {
          console.error('Sync-Fehler:', err);
          // Fehler: Behalte in Queue für nächsten Sync
        }
      }
    }
  } catch (err) {
    console.error('Sync-Queue Fehler:', err);
  }
}

// Message-Sync Queue
async function syncMessagesQueue() {
  // Ähnlich wie Post-Sync
  // Wird in messages-portal.js integriert
}

// Helper-Funktionen für Sync-Queue
async function getSyncQueue() {
  // Für jetzt: LocalStorage (später: IndexedDB)
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function addToSyncQueue(item) {
  try {
    const queue = await getSyncQueue();
    queue.push({
      id: Date.now() + '-' + Math.random().toString(36).slice(2),
      ...item,
      timestamp: Date.now(),
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    
    // Background-Sync registrieren
    if ('serviceWorker' in navigator && 'sync' in self.registration) {
      await self.registration.sync.register('sync-posts');
    }
  } catch (err) {
    console.error('Queue-Add Fehler:', err);
  }
}

async function removeFromQueue(itemId) {
  try {
    const queue = await getSyncQueue();
    const filtered = queue.filter(item => item.id !== itemId);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Queue-Remove Fehler:', err);
  }
}

// Push-Notification Handler (für später)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'TogetherSystems';
  const options = {
    body: data.body || 'Neue Benachrichtigung',
    icon: './icon.png',
    badge: './icon.png',
    tag: data.tag || 'default',
    data: data.url || null,
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification-Click Handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});



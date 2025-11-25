const CACHE_NAME = 'businessconnecthub-cache-v3'; // Version erhöht für neue Features

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

// Offline-Queue für synchronisierbare Aktionen
const OFFLINE_QUEUE_KEY = 'sw_offline_queue';

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

// Erweiterte Fetch-Strategie: Offline-First für Assets, Network-First für APIs
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  
  // API-Calls: Network-First mit Offline-Fallback
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(req)
        .then(response => {
          // Erfolg: Cachen (optional)
          if (response.ok && req.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Offline: Aus Cache oder Error-Response
          return caches.match(req).then(cached => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({ ok: false, error: 'offline', message: 'Keine Verbindung verfügbar' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }
  
  // Statische Assets: Cache-First
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        
        return fetch(req).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, responseToCache);
          });
          
          return response;
        }).catch(() => {
          // Fallback
          if (req.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});

// Background Sync - Für Offline-Aktionen
self.addEventListener('sync', event => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncOfflineQueue('posts'));
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncOfflineQueue('messages'));
  }
});

// Offline-Queue synchronisieren
async function syncOfflineQueue(type) {
  try {
    // Queue aus IndexedDB/LocalStorage holen
    // Für jetzt: Vereinfachte Implementierung
    const queueKey = `${OFFLINE_QUEUE_KEY}_${type}`;
    const queue = await getQueue(queueKey);
    
    const syncedItems = [];
    
    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method || 'POST',
          headers: item.headers || {},
          body: item.body,
        });
        
        if (response.ok) {
          syncedItems.push(item.id);
          // Benachrichtige alle Clients
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'sync-success',
              itemType: type,
              itemId: item.id,
            });
          });
        }
      } catch (err) {
        console.error(`Sync-Fehler für ${item.id}:`, err);
      }
    }
    
    // Entferne synchronisierte Items
    if (syncedItems.length > 0) {
      const remainingQueue = queue.filter(item => !syncedItems.includes(item.id));
      await setQueue(queueKey, remainingQueue);
    }
    
  } catch (err) {
    console.error('Queue-Sync Fehler:', err);
  }
}

// Helper für Queue-Management
async function getQueue(key) {
  // LocalStorage als Fallback (später: IndexedDB)
  try {
    if (typeof self.localStorage !== 'undefined') {
      const raw = self.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    }
  } catch (e) {
    // LocalStorage nicht verfügbar in Service Worker
  }
  return [];
}

async function setQueue(key, queue) {
  try {
    if (typeof self.localStorage !== 'undefined') {
      self.localStorage.setItem(key, JSON.stringify(queue));
    }
  } catch (e) {
    console.error('Queue-Set Fehler:', e);
  }
}

// Push-Notification Handler
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'TogetherSystems', body: event.data ? event.data.text() : 'Neue Benachrichtigung' };
  }
  
  const title = data.title || 'TogetherSystems';
  const options = {
    body: data.body || 'Neue Benachrichtigung',
    icon: './icon.png',
    badge: './icon.png',
    tag: data.tag || 'notification',
    data: data.url || data.link || null,
    requireInteraction: data.important || false,
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
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        const url = event.notification.data;
        
        // Prüfe ob bereits ein Fenster offen ist
        for (const client of clients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Öffne neues Fenster
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  }
});

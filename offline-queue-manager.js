// Offline-Queue Manager - Verwaltet Offline-Aktionen für Background-Sync

const OFFLINE_QUEUE_KEY_PREFIX = 'sw_offline_queue_';

class OfflineQueueManager {
  constructor() {
    this.queues = {};
  }

  // Item zur Queue hinzufügen
  async addToQueue(type, item) {
    const queueKey = `${OFFLINE_QUEUE_KEY_PREFIX}${type}`;
    const queue = this.getQueue(type);
    
    const queueItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      ...item,
      timestamp: Date.now(),
      retries: 0,
    };
    
    queue.push(queueItem);
    this.setQueue(type, queue);
    
    // Background-Sync registrieren (falls verfügbar)
    if ('serviceWorker' in navigator && 'sync' in self.registration) {
      try {
        await navigator.serviceWorker.ready;
        await self.registration.sync.register(`sync-${type}`);
      } catch (err) {
        console.warn('Background-Sync nicht verfügbar:', err);
      }
    }
    
    return queueItem.id;
  }

  // Item aus Queue entfernen
  removeFromQueue(type, itemId) {
    const queue = this.getQueue(type);
    const filtered = queue.filter(item => item.id !== itemId);
    this.setQueue(type, filtered);
  }

  // Queue abrufen
  getQueue(type) {
    const queueKey = `${OFFLINE_QUEUE_KEY_PREFIX}${type}`;
    try {
      const raw = localStorage.getItem(queueKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Queue-Get Fehler:', e);
      return [];
    }
  }

  // Queue speichern
  setQueue(type, queue) {
    const queueKey = `${OFFLINE_QUEUE_KEY_PREFIX}${type}`;
    try {
      localStorage.setItem(queueKey, JSON.stringify(queue));
    } catch (e) {
      console.error('Queue-Set Fehler:', e);
    }
  }

  // Alle Queues abrufen
  getAllQueues() {
    const queues = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(OFFLINE_QUEUE_KEY_PREFIX)) {
          const type = key.replace(OFFLINE_QUEUE_KEY_PREFIX, '');
          queues[type] = this.getQueue(type);
        }
      }
    } catch (e) {
      console.error('Get-All-Queues Fehler:', e);
    }
    return queues;
  }

  // Queue löschen
  clearQueue(type) {
    const queueKey = `${OFFLINE_QUEUE_KEY_PREFIX}${type}`;
    try {
      localStorage.removeItem(queueKey);
    } catch (e) {
      console.error('Queue-Clear Fehler:', e);
    }
  }

  // Queue-Größe
  getQueueSize(type) {
    return this.getQueue(type).length;
  }
}

// Globale Instanz
const offlineQueue = new OfflineQueueManager();

// Export
if (typeof window !== 'undefined') {
  window.OfflineQueue = offlineQueue;
}

// Helper: Post zur Queue hinzufügen (wenn Offline)
async function queuePostIfOffline(postData, apiUrl) {
  if (!navigator.onLine) {
    await offlineQueue.addToQueue('posts', {
      url: apiUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    return { queued: true, message: 'Post wurde in Offline-Queue gespeichert' };
  }
  return { queued: false };
}

// Helper: Message zur Queue hinzufügen (wenn Offline)
async function queueMessageIfOffline(messageData, apiUrl) {
  if (!navigator.onLine) {
    await offlineQueue.addToQueue('messages', {
      url: apiUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    return { queued: true, message: 'Nachricht wurde in Offline-Queue gespeichert' };
  }
  return { queued: false };
}

if (typeof window !== 'undefined') {
  window.queuePostIfOffline = queuePostIfOffline;
  window.queueMessageIfOffline = queueMessageIfOffline;
}



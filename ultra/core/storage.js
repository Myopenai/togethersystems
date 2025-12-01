// Local-First Storage & Sync Manager
// Abstraktion über localStorage/IndexedDB mit Sync-Queue

class StorageManager {
  constructor() {
    this.storagePrefix = 'ultra_';
    this.syncQueue = [];
    this.syncInProgress = false;
    this.init();
  }

  async init() {
    // Prüfe IndexedDB Verfügbarkeit
    this.useIndexedDB = 'indexedDB' in window;
    
    if (this.useIndexedDB) {
      try {
        await this.initIndexedDB();
      } catch (error) {
        console.warn('IndexedDB initialization failed, falling back to localStorage:', error);
        this.useIndexedDB = false;
      }
    }
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('UltraStorage', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Object Stores erstellen
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('networks')) {
          db.createObjectStore('networks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('identity')) {
          db.createObjectStore('identity', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Daten speichern
   * @param {string} key - Storage-Key
   * @param {any} value - Zu speichernder Wert
   */
  async set(key, value) {
    const fullKey = this.storagePrefix + key;
    
    try {
      if (this.useIndexedDB && this.db) {
        // IndexedDB für größere Daten
        const store = this.db.transaction(['posts', 'networks', 'chats', 'identity'], 'readwrite');
        // Vereinfacht: für jetzt localStorage
        localStorage.setItem(fullKey, JSON.stringify(value));
      } else {
        localStorage.setItem(fullKey, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }

  /**
   * Daten abrufen
   * @param {string} key - Storage-Key
   * @returns {any} Gespeicherter Wert oder null
   */
  async get(key) {
    const fullKey = this.storagePrefix + key;
    
    try {
      const value = localStorage.getItem(fullKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  /**
   * Daten löschen
   * @param {string} key - Storage-Key
   */
  async remove(key) {
    const fullKey = this.storagePrefix + key;
    localStorage.removeItem(fullKey);
  }

  /**
   * Alle Keys mit Prefix abrufen
   * @param {string} prefix - Optionaler Prefix
   * @returns {Array} Array von Keys
   */
  async getAllKeys(prefix = '') {
    const keys = [];
    const searchPrefix = this.storagePrefix + prefix;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(searchPrefix)) {
        keys.push(key.replace(this.storagePrefix, ''));
      }
    }
    
    return keys;
  }

  /**
   * Sync-Item zur Queue hinzufügen
   * @param {string} type - Typ der Operation (create, update, delete)
   * @param {string} collection - Collection-Name (posts, networks, etc.)
   * @param {object} data - Daten
   */
  async addToSyncQueue(type, collection, data) {
    const syncItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      type,
      collection,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    };
    
    this.syncQueue.push(syncItem);
    await this.set('syncQueue', this.syncQueue);
    
    // Auto-Sync starten (wenn Backend verfügbar)
    if (!this.syncInProgress) {
      this.sync();
    }
  }

  /**
   * Sync-Queue verarbeiten
   */
  async sync() {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }
    
    this.syncInProgress = true;
    
    // TODO: Backend-Sync implementieren
    // Für jetzt: Queue bleibt lokal
    
    this.syncInProgress = false;
  }

  /**
   * Sync-Queue abrufen
   * @returns {Array} Sync-Queue
   */
  async getSyncQueue() {
    return this.syncQueue;
  }

  /**
   * Sync-Queue löschen
   */
  async clearSyncQueue() {
    this.syncQueue = [];
    await this.remove('syncQueue');
  }
}

// Globale Storage-Instanz
const storage = new StorageManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager, storage };
}









// [.SYSTEMS.T.SYSTEMS.] FABRIKAGE ERROR BUS
// Zentrales Ereignis/Telemetrie-System für alle CASHFLOX-Apps
// Console-Bypass Integration für maximalen Durchsatz

(function() {
  'use strict';
  
  const ERROR_BUS_VERSION = '1.0.0';
  const STORAGE_KEY = 'fabrikage-error-bus';
  const MAX_EVENTS = 500; // Reduziert von 10000 auf 500 für Quota-Management
  const MAX_STORAGE_SIZE = 2 * 1024 * 1024; // 2MB max (localStorage hat typisch 5-10MB)
  
  class ErrorBus {
    constructor() {
      this.subscribers = [];
      this.events = [];
      this.storageDisabled = false; // Flag: Deaktiviere Storage bei wiederholten Quota-Errors
      this.quotaErrorCount = 0;
      this.loadFromStorage();
      this.setupAutoFlush();
    }
    
    loadFromStorage() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.events = JSON.parse(stored).slice(-MAX_EVENTS);
        }
      } catch(e) {
        console.error('[FABRIKAGE] ErrorBus: loadFromStorage error', e);
      }
    }
    
    saveToStorage() {
      // Wenn Storage deaktiviert, überspringe Speichern
      if (this.storageDisabled) {
        return;
      }
      
      try {
        // Prune events vor dem Speichern
        this.pruneEvents();
        
        const eventsToSave = this.events.slice(-MAX_EVENTS);
        const jsonString = JSON.stringify(eventsToSave);
        const sizeInBytes = new Blob([jsonString]).size;
        
        // Wenn zu groß, weitere Events entfernen
        if (sizeInBytes > MAX_STORAGE_SIZE) {
          // Reduziere auf 50% der aktuellen Größe
          const targetSize = Math.floor(eventsToSave.length * 0.5);
          this.events = this.events.slice(-targetSize);
          const reducedJson = JSON.stringify(this.events);
          localStorage.setItem(STORAGE_KEY, reducedJson);
          this.quotaErrorCount = 0; // Reset bei Erfolg
        } else {
          localStorage.setItem(STORAGE_KEY, jsonString);
          this.quotaErrorCount = 0; // Reset bei Erfolg
        }
      } catch(e) {
        // QuotaExceededError - versuche aggressive Bereinigung
        if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
          this.quotaErrorCount++;
          
          // Nach 3 Quota-Errors: Deaktiviere Storage komplett
          if (this.quotaErrorCount >= 3) {
            console.warn('[FABRIKAGE] ErrorBus: Storage deaktiviert nach mehrfachen Quota-Errors. Events nur im Speicher.');
            this.storageDisabled = true;
            // Lösche alte Daten aus Storage
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch(e4) {
              // Ignoriere
            }
            return;
          }
          
          console.warn('[FABRIKAGE] ErrorBus: Quota überschritten, bereinige alte Events...');
          try {
            // Behalte nur die neuesten 50 Events (noch aggressiver)
            this.events = this.events.slice(-50);
            const minimalJson = JSON.stringify(this.events);
            localStorage.setItem(STORAGE_KEY, minimalJson);
            this.quotaErrorCount = 0; // Reset bei Erfolg
          } catch(e2) {
            // Auch das schlägt fehl - lösche komplett
            console.warn('[FABRIKAGE] ErrorBus: Kann nicht speichern, lösche Events aus Storage');
            try {
              localStorage.removeItem(STORAGE_KEY);
              this.events = this.events.slice(-20); // Behalte nur 20 im Speicher
            } catch(e3) {
              // Letzter Fallback: Events nur im Speicher behalten, Storage deaktivieren
              console.warn('[FABRIKAGE] ErrorBus: Storage komplett voll, Events nur im Speicher');
              this.storageDisabled = true;
            }
          }
        } else {
          // Andere Fehler: Loggen, aber nicht abbrechen
          if (window.FABRIKAGE_DEBUG) {
            console.error('[FABRIKAGE] ErrorBus: saveToStorage error', e);
          }
        }
      }
    }
    
    pruneEvents() {
      // Entferne Events älter als 7 Tage
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      this.events = this.events.filter(event => {
        if (!event.timestamp) return true;
        const eventTime = new Date(event.timestamp).getTime();
        return eventTime > sevenDaysAgo;
      });
      
      // Behalte nur die neuesten MAX_EVENTS
      if (this.events.length > MAX_EVENTS) {
        // Priorisiere Errors und Warnings
        const errors = this.events.filter(e => e.level === 'error');
        const warnings = this.events.filter(e => e.level === 'warning');
        const others = this.events.filter(e => e.level !== 'error' && e.level !== 'warning');
        
        // Behalte alle Errors, max 200 Warnings, rest Info
        const keepErrors = errors.slice(-200);
        const keepWarnings = warnings.slice(-200);
        const keepOthers = others.slice(-(MAX_EVENTS - keepErrors.length - keepWarnings.length));
        
        this.events = [...keepErrors, ...keepWarnings, ...keepOthers].sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeA - timeB;
        });
      }
    }
    
    setupAutoFlush() {
      // Prune alle 5 Minuten (statt 60)
      setInterval(() => {
        this.pruneEvents();
        if (this.events.length > MAX_EVENTS) {
          this.events = this.events.slice(-MAX_EVENTS);
        }
        this.saveToStorage();
      }, 5 * 60 * 1000); // 5 Minuten
    }
    
    publish(event) {
      const enrichedEvent = {
        eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
        timestamp: new Date().toISOString(),
        version: ERROR_BUS_VERSION,
        ...event
      };
      
      // Komprimiere context für Speicher-Ersparnis
      if (enrichedEvent.context && typeof enrichedEvent.context === 'object') {
        // Entferne große Stack-Traces (behalte nur erste 500 Zeichen)
        if (enrichedEvent.context.stack && enrichedEvent.context.stack.length > 500) {
          enrichedEvent.context.stack = enrichedEvent.context.stack.substring(0, 500) + '... (truncated)';
        }
        // Entferne große error-Strings
        if (enrichedEvent.context.error && typeof enrichedEvent.context.error === 'string' && enrichedEvent.context.error.length > 500) {
          enrichedEvent.context.error = enrichedEvent.context.error.substring(0, 500) + '... (truncated)';
        }
      }
      
      this.events.push(enrichedEvent);
      
      // Begrenze Events im Speicher (auch wenn Storage deaktiviert)
      if (this.events.length > MAX_EVENTS * 2) {
        // Behalte nur die neuesten Events
        this.events = this.events.slice(-MAX_EVENTS);
      }
      
      // Nur bei wichtigen Events sofort speichern, sonst batched (nur wenn Storage aktiv)
      if (!this.storageDisabled && (enrichedEvent.level === 'error' || this.events.length % 10 === 0)) {
        this.saveToStorage();
      }
      
      // Notify subscribers
      this.subscribers.forEach(sub => {
        try {
          sub(enrichedEvent);
        } catch(e) {
          console.error('[FABRIKAGE] ErrorBus: subscriber error', e);
        }
      });
      
      // Console output (bypass for telemetry)
      if (window.FABRIKAGE_CONSOLE_BYPASS !== false) {
        const level = enrichedEvent.level || 'info';
        const prefix = `[FABRIKAGE] [${level.toUpperCase()}]`;
        const message = `${prefix} ${enrichedEvent.module || 'system'}: ${enrichedEvent.message || 'event'}`;
        
        switch(level) {
          case 'error':
            console.error(message, enrichedEvent);
            break;
          case 'warning':
            console.warn(message, enrichedEvent);
            break;
          case 'info':
            console.info(message, enrichedEvent);
            break;
          default:
            console.log(message, enrichedEvent);
        }
      }
      
      return enrichedEvent.eventId;
    }
    
    subscribe(callback) {
      this.subscribers.push(callback);
      return () => {
        const idx = this.subscribers.indexOf(callback);
        if (idx >= 0) this.subscribers.splice(idx, 1);
      };
    }
    
    getEvents(filter) {
      if (!filter) return this.events.slice();
      return this.events.filter(e => {
        if (filter.module && e.module !== filter.module) return false;
        if (filter.level && e.level !== filter.level) return false;
        if (filter.stage && e.stage !== filter.stage) return false;
        if (filter.class && e.class !== filter.class) return false;
        return true;
      });
    }
    
    getLatestEvents(count = 100) {
      return this.events.slice(-count);
    }
    
    clear() {
      this.events = [];
      this.saveToStorage();
    }
  }
  
  // Global Error Bus Instance
  window.fabrikageErrorBus = new ErrorBus();
  
  // Auto-publish unhandled errors
  window.addEventListener('error', (e) => {
    window.fabrikageErrorBus.publish({
      module: 'system',
      stage: 'runtime',
      level: 'error',
      class: 'unhandled.error',
      message: e.message || 'Unhandled error',
      context: {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack
      }
    });
  });
  
  // Auto-publish unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    window.fabrikageErrorBus.publish({
      module: 'system',
      stage: 'runtime',
      level: 'error',
      class: 'unhandled.rejection',
      message: e.reason?.message || 'Unhandled promise rejection',
      context: {
        reason: String(e.reason)
      }
    });
  });
  
  console.log('[FABRIKAGE] Error Bus initialisiert');
})();

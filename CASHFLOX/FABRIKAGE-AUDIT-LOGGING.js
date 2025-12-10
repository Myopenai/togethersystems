// [.SYSTEMS.T.SYSTEMS.] FABRIKAGE AUDIT LOGGING
// Unveränderliche Kette: manifest→plan→events→fixes→artefakte→deploy

(function() {
  'use strict';
  
  const AUDIT_VERSION = '1.0.0';
  const STORAGE_KEY = 'fabrikage-audit-chain';
  const MAX_CHAIN_LENGTH = 500; // Reduziert von 5000 auf 500 für Quota-Management
  const MAX_STORAGE_SIZE = 2 * 1024 * 1024; // 2MB max
  
  class AuditLogger {
    constructor(errorBus) {
      this.errorBus = errorBus;
      this.chain = [];
      this.storageDisabled = false; // Flag: Deaktiviere Storage bei wiederholten Quota-Errors
      this.quotaErrorCount = 0;
      this.loadChain();
      this.setupSubscriptions();
    }
    
    loadChain() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.chain = JSON.parse(stored).slice(-MAX_CHAIN_LENGTH);
        }
      } catch(e) {
        console.error('[FABRIKAGE] AuditLogger: loadChain error', e);
      }
    }
    
    saveChain() {
      // Wenn Storage deaktiviert, überspringe Speichern
      if (this.storageDisabled) {
        return;
      }
      
      try {
        // Prune chain vor dem Speichern
        this.pruneChain();
        
        const chainToSave = this.chain.slice(-MAX_CHAIN_LENGTH);
        const jsonString = JSON.stringify(chainToSave);
        const sizeInBytes = new Blob([jsonString]).size;
        
        // Wenn zu groß, weitere Einträge entfernen
        if (sizeInBytes > MAX_STORAGE_SIZE) {
          const targetSize = Math.floor(chainToSave.length * 0.5);
          this.chain = this.chain.slice(-targetSize);
          const reducedJson = JSON.stringify(this.chain);
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
            console.warn('[FABRIKAGE] AuditLogger: Storage deaktiviert nach mehrfachen Quota-Errors. Chain nur im Speicher.');
            this.storageDisabled = true;
            // Lösche alte Daten aus Storage
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch(e4) {
              // Ignoriere
            }
            return;
          }
          
          console.warn('[FABRIKAGE] AuditLogger: Quota überschritten, bereinige alte Chain-Einträge...');
          try {
            // Behalte nur die neuesten 50 Einträge (noch aggressiver)
            this.chain = this.chain.slice(-50);
            const minimalJson = JSON.stringify(this.chain);
            localStorage.setItem(STORAGE_KEY, minimalJson);
            this.quotaErrorCount = 0; // Reset bei Erfolg
          } catch(e2) {
            // Auch das schlägt fehl - lösche komplett
            console.warn('[FABRIKAGE] AuditLogger: Kann nicht speichern, lösche Chain aus Storage');
            try {
              localStorage.removeItem(STORAGE_KEY);
              this.chain = this.chain.slice(-20); // Behalte nur 20 im Speicher
            } catch(e3) {
              // Letzter Fallback: Chain nur im Speicher behalten, Storage deaktivieren
              console.warn('[FABRIKAGE] AuditLogger: Storage komplett voll, Chain nur im Speicher');
              this.storageDisabled = true;
            }
          }
        } else {
          // Andere Fehler: Loggen, aber nicht abbrechen
          if (window.FABRIKAGE_DEBUG) {
            console.error('[FABRIKAGE] AuditLogger: saveChain error', e);
          }
        }
      }
    }
    
    pruneChain() {
      // Entferne Einträge älter als 7 Tage
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      this.chain = this.chain.filter(entry => {
        if (!entry.timestamp) return true;
        const entryTime = new Date(entry.timestamp).getTime();
        return entryTime > sevenDaysAgo;
      });
      
      // Behalte nur die neuesten MAX_CHAIN_LENGTH
      if (this.chain.length > MAX_CHAIN_LENGTH) {
        // Priorisiere Fixes und Errors
        const fixes = this.chain.filter(e => e.type === 'fix');
        const errors = this.chain.filter(e => e.type === 'event' && e.level === 'error');
        const others = this.chain.filter(e => e.type !== 'fix' && !(e.type === 'event' && e.level === 'error'));
        
        // Behalte alle Fixes, max 200 Errors, rest andere
        const keepFixes = fixes.slice(-200);
        const keepErrors = errors.slice(-200);
        const keepOthers = others.slice(-(MAX_CHAIN_LENGTH - keepFixes.length - keepErrors.length));
        
        this.chain = [...keepFixes, ...keepErrors, ...keepOthers].sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeA - timeB;
        });
      }
    }
    
    setupSubscriptions() {
      if (!this.errorBus) return;
      
      // Subscribe to all events
      this.errorBus.subscribe((event) => {
        this.logEvent(event);
      });
      
      // Subscribe to fix events
      if (window.fabrikageAutoFixer) {
        // Monitor fix history
        const originalPush = window.fabrikageAutoFixer.fixHistory.push.bind(window.fabrikageAutoFixer.fixHistory);
        window.fabrikageAutoFixer.fixHistory.push = (...args) => {
          const result = originalPush(...args);
          if (args[0]) {
            this.logFix(args[0]);
          }
          return result;
        };
      }
    }
    
    logEvent(event) {
      const auditEntry = {
        type: 'event',
        eventId: event.eventId,
        timestamp: event.timestamp || new Date().toISOString(),
        module: event.module,
        stage: event.stage,
        level: event.level,
        class: event.class,
        message: event.message,
        context: event.context,
        version: AUDIT_VERSION
      };
      
      this.addToChain(auditEntry);
    }
    
    logFix(fix) {
      const auditEntry = {
        type: 'fix',
        fixId: fix.fixId,
        eventId: fix.eventId,
        timestamp: fix.timestamp || new Date().toISOString(),
        recipe: fix.recipe,
        result: fix.result,
        version: AUDIT_VERSION
      };
      
      this.addToChain(auditEntry);
    }
    
    logManifest(manifest) {
      const auditEntry = {
        type: 'manifest',
        timestamp: new Date().toISOString(),
        manifest: manifest,
        version: AUDIT_VERSION
      };
      
      this.addToChain(auditEntry);
    }
    
    logArtifact(artifact) {
      const auditEntry = {
        type: 'artifact',
        timestamp: new Date().toISOString(),
        artifact: {
          name: artifact.name,
          path: artifact.path,
          checksum: artifact.checksum,
          size: artifact.size
        },
        version: AUDIT_VERSION
      };
      
      this.addToChain(auditEntry);
    }
    
    logDeploy(deploy) {
      const auditEntry = {
        type: 'deploy',
        timestamp: new Date().toISOString(),
        deploy: {
          module: deploy.module,
          version: deploy.version,
          target: deploy.target,
          status: deploy.status
        },
        version: AUDIT_VERSION
      };
      
      this.addToChain(auditEntry);
    }
    
    addToChain(entry) {
      // Komprimiere entry für Speicher-Ersparnis
      if (entry.context && typeof entry.context === 'object') {
        // Entferne große Stack-Traces
        if (entry.context.stack && entry.context.stack.length > 500) {
          entry.context.stack = entry.context.stack.substring(0, 500) + '... (truncated)';
        }
        // Entferne große error-Strings
        if (entry.context.error && typeof entry.context.error === 'string' && entry.context.error.length > 500) {
          entry.context.error = entry.context.error.substring(0, 500) + '... (truncated)';
        }
      }
      
      // Calculate hash for chain integrity
      const previousHash = this.chain.length > 0 
        ? this.chain[this.chain.length - 1].hash 
        : '0'.repeat(64);
      
      entry.previousHash = previousHash;
      entry.index = this.chain.length;
      
      // Calculate hash (simplified SHA-256 simulation)
      entry.hash = this.calculateHash(entry, previousHash);
      
      this.chain.push(entry);
      
      // Begrenze Chain im Speicher (auch wenn Storage deaktiviert)
      if (this.chain.length > MAX_CHAIN_LENGTH * 2) {
        // Behalte nur die neuesten Einträge
        this.chain = this.chain.slice(-MAX_CHAIN_LENGTH);
      }
      
      // Nur bei wichtigen Einträgen sofort speichern (nur wenn Storage aktiv)
      if (!this.storageDisabled && (entry.type === 'fix' || (entry.type === 'event' && entry.level === 'error') || this.chain.length % 10 === 0)) {
        this.saveChain();
      }
    }
    
    calculateHash(entry, previousHash) {
      // Simplified hash calculation (in production, use crypto.subtle.digest)
      const data = JSON.stringify(entry) + previousHash;
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16).padStart(16, '0').repeat(4);
    }
    
    verifyChain() {
      for (let i = 1; i < this.chain.length; i++) {
        const entry = this.chain[i];
        const previous = this.chain[i - 1];
        
        if (entry.previousHash !== previous.hash) {
          return {
            valid: false,
            error: `Chain broken at index ${i}`,
            index: i
          };
        }
      }
      
      return { valid: true };
    }
    
    exportChain() {
      return {
        version: AUDIT_VERSION,
        timestamp: new Date().toISOString(),
        chain: this.chain,
        verification: this.verifyChain()
      };
    }
    
    getChainForModule(module) {
      return this.chain.filter(entry => entry.module === module);
    }
    
    getChainForType(type) {
      return this.chain.filter(entry => entry.type === type);
    }
  }
  
  // Initialize when Error Bus is available
  function initAuditLogger() {
    if (window.fabrikageErrorBus) {
      window.fabrikageAuditLogger = new AuditLogger(window.fabrikageErrorBus);
      console.log('[FABRIKAGE] Audit Logger initialisiert');
    } else {
      setTimeout(initAuditLogger, 100);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuditLogger);
  } else {
    initAuditLogger();
  }
})();

// T,. SELF-HEALING SYSTEM
// Automatische Validierung, Retry, Fallbacks, Audit-Logs

class SelfHealingSystem {
  constructor() {
    this.auditLog = [];
    this.offlineQueue = [];
    this.isOnline = navigator.onLine;
    this.init();
  }

  init() {
    // Online/Offline Detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushOfflineQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Auto-Validation
    this.setupAutoValidation();

    // Auto-Retry
    this.setupAutoRetry();

    // UI Self-Healing
    this.setupUISelfHealing();

    console.log('✅ Self-Healing System aktiviert');
  }

  setupAutoValidation() {
    // Validiere Pflichtfelder
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.tagName === 'FORM') {
        const required = form.querySelectorAll('[required]');
        let valid = true;
        required.forEach(field => {
          if (!field.value || field.value.trim() === '') {
            valid = false;
            field.style.borderColor = '#f85149';
          } else {
            field.style.borderColor = '';
          }
        });
        if (!valid) {
          e.preventDefault();
          this.auditLog.push({ type: 'validation_error', timestamp: Date.now(), form: form.id });
        }
      }
    });
  }

  setupAutoRetry() {
    // Wrap fetch mit Auto-Retry
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let lastError;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await originalFetch(...args);
          if (response.ok) return response;
          throw new Error(`HTTP ${response.status}`);
        } catch (error) {
          lastError = error;
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
          }
        }
      }
      this.auditLog.push({ type: 'fetch_failed', timestamp: Date.now(), url: args[0], error: lastError.message });
      throw lastError;
    };
  }

  setupUISelfHealing() {
    // Ordner-Voll → Auto-Neuer Ordner
    const originalEnsureFolder = window.ensureFolder;
    if (originalEnsureFolder) {
      window.ensureFolder = (reg) => {
        const folders = Object.keys(reg);
        if (!folders.length) reg["Apps-1"] = [];
        const last = folders.at(-1);
        if (reg[last].length >= 8) {
          reg[`Apps-${folders.length + 1}`] = [];
          this.auditLog.push({ type: 'auto_folder_created', timestamp: Date.now() });
        }
        return reg;
      };
    }

    // Fenster-Kaskadierung
    const originalSpawnWindow = window.spawnWindow;
    if (originalSpawnWindow) {
      window.spawnWindow = (app) => {
        const windows = Array.from(document.querySelectorAll('.window'));
        const positions = windows.map(w => ({ x: parseInt(w.style.left) || 0, y: parseInt(w.style.top) || 0 }));
        
        // Finde freie Position
        let x = 40, y = 40;
        let found = false;
        while (!found && y < 500) {
          const overlap = positions.some(p => Math.abs(p.x - x) < 50 && Math.abs(p.y - y) < 50);
          if (!overlap) found = true;
          else { x += 50; if (x > 800) { x = 40; y += 50; } }
        }
        
        return originalSpawnWindow.call(this, app);
      };
    }

    // Taskbar Toggle Robust
    document.addEventListener('click', (e) => {
      const taskItem = e.target.closest('.task-item');
      if (taskItem) {
        const id = taskItem.dataset.id;
        const window = document.querySelector(`[data-window-id="${id}"]`);
        if (window) {
          const visible = window.style.display !== 'none';
          window.style.display = visible ? 'none' : '';
          taskItem.classList.toggle('active', !visible);
        }
      }
    });
  }

  async flushOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;
    
    console.log(`🔄 Flushe ${this.offlineQueue.length} Offline-Queue-Einträge...`);
    
    for (const item of this.offlineQueue) {
      try {
        await fetch(item.url, item.options);
        this.auditLog.push({ type: 'offline_queue_flushed', timestamp: Date.now(), url: item.url });
      } catch (error) {
        console.error('Offline-Queue-Flush fehlgeschlagen:', error);
      }
    }
    
    this.offlineQueue = [];
  }

  queueOfflineRequest(url, options) {
    this.offlineQueue.push({ url, options, timestamp: Date.now() });
    this.auditLog.push({ type: 'offline_queued', timestamp: Date.now(), url });
  }

  getAuditLog() {
    return this.auditLog;
  }

  exportAuditLog() {
    const blob = new Blob([JSON.stringify(this.auditLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Global verfügbar
window.SelfHealingSystem = SelfHealingSystem;

// Auto-Init
if (typeof window !== 'undefined') {
  window.selfHealing = new SelfHealingSystem();
}


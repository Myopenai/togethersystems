// T,. OSTOSOS - Automatic Update System
// Zero-Touch Updates | Silent Background Updates | No User Interaction

class OSTOSOSAutoUpdateSystem {
  constructor() {
    this.version = '1.0.0';
    this.updateCheckInterval = 3600000; // 1 Stunde
    this.updateEnabled = true;
    this.silentMode = true;
    this.updateInProgress = false;
  }

  async init() {
    console.log('[OSTOSOS Update] System initialisiert');
    
    // Prüfe ob Updates aktiviert sind
    const updatesEnabled = localStorage.getItem('ostosos.updates.enabled');
    if (updatesEnabled === 'false') {
      this.updateEnabled = false;
      return;
    }

    // Starte automatische Update-Checks
    this.startAutoUpdateCheck();
    
    // Registriere Service Worker Update-Listener
    this.registerServiceWorkerUpdates();
    
    // Starte Background Update-Check
    this.checkForUpdates();
  }

  startAutoUpdateCheck() {
    setInterval(() => {
      if (this.updateEnabled && !this.updateInProgress) {
        this.checkForUpdates();
      }
    }, this.updateCheckInterval);
  }

  async checkForUpdates() {
    if (this.updateInProgress) return;
    
    // Skip update check if running from file:// protocol
    if (window.location.protocol === 'file:') {
      console.log('[OSTOSOS Update] File-Protokoll erkannt - Update-Check übersprungen');
      return;
    }
    
    this.updateInProgress = true;
    
    try {
      // Prüfe Manifest auf neue Version
      const response = await fetch('./manifest.webmanifest', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const manifest = await response.json();
        const newVersion = manifest.version || this.version;
        
        if (newVersion !== this.version) {
          console.log('[OSTOSOS Update] Neue Version gefunden:', newVersion);
          
          if (this.silentMode) {
            // Silent Update - keine User-Benachrichtigung
            await this.installUpdate(newVersion);
          } else {
            // Optional: Benachrichtigung (wenn silentMode = false)
            this.notifyUpdateAvailable(newVersion);
          }
        }
      }
    } catch (error) {
      console.error('[OSTOSOS Update] Update-Check Fehler:', error);
    } finally {
      this.updateInProgress = false;
    }
  }

  async installUpdate(newVersion) {
    console.log('[OSTOSOS Update] Installiere Update:', newVersion);
    
    try {
      // Service Worker Update
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.waiting) {
          // Update wartet auf Aktivierung
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Prüfe auf Updates
        await registration.update();
      }
      
      // Cache neue Assets
      await this.updateCache();
      
      // Speichere neue Version
      localStorage.setItem('ostosos.version', newVersion);
      this.version = newVersion;
      
      console.log('[OSTOSOS Update] Update erfolgreich installiert:', newVersion);
      
      // Optional: Reload (nur wenn nötig)
      // window.location.reload();
      
    } catch (error) {
      console.error('[OSTOSOS Update] Update-Installation Fehler:', error);
    }
  }

  async updateCache() {
    try {
      const cache = await caches.open('ostosos-cache-' + this.version);
      
      // Lade neue Assets
      const assets = [
        './',
        './OSTOSOS-OS-COMPLETE-SYSTEM.html',
        './OSTOSOS-INSTALLER.html',
        './manifest.webmanifest',
        './css/da-vinci-xxxxxl-enterprise-standard.css',
        './js/portal-api.js'
      ];
      
      await cache.addAll(assets);
      
      console.log('[OSTOSOS Update] Cache aktualisiert');
    } catch (error) {
      console.error('[OSTOSOS Update] Cache-Update Fehler:', error);
    }
  }

  registerServiceWorkerUpdates() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[OSTOSOS Update] Service Worker aktualisiert');
        
        // Optional: Reload (nur wenn nötig)
        // window.location.reload();
      });
    }
  }

  notifyUpdateAvailable(newVersion) {
    // Nur wenn silentMode = false
    if (!this.silentMode) {
      console.log('[OSTOSOS Update] Update verfügbar:', newVersion);
      // Optional: UI-Benachrichtigung
    }
  }
}

// Auto-Initialize
if (typeof window !== 'undefined') {
  const updateSystem = new OSTOSOSAutoUpdateSystem();
  updateSystem.init();
  
  // Global verfügbar
  window.OSTOSOSUpdateSystem = updateSystem;
}


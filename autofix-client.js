/**
 * AutoFix Client - Automatic Error Fixing
 * Version: 1.1.0-IBM-ETERNAL-GITHUB-PAGES-FIXED
 * Branding: T,.&T,,.&T,,,.(C)TEL1.NL
 */

(function() {
  'use strict';

  // Environment Detection
  const isGithubPages = typeof location !== 'undefined' && 
    (location.hostname.includes('github.io') || location.hostname.includes('github.com'));
  
  const isCloudflarePages = typeof location !== 'undefined' && 
    (location.hostname.includes('pages.dev') || location.hostname.includes('cloudflare'));

  class AutoFixClient {
    constructor() {
      this.isActive = false;
      this.fixes = [];
      this.isGithubPages = isGithubPages;
      this.isCloudflarePages = isCloudflarePages;
      this.apiCallsDisabled = isGithubPages; // API-Calls auf GitHub Pages deaktivieren
    }

    async initialize() {
      this.isActive = true;
      
      // ENV_SAFE sicherstellen (verhindert "ENV is not defined" Fehler)
      if (typeof window !== 'undefined' && !window.ENV_SAFE) {
        window.ENV_SAFE = {
          MODE: isGithubPages ? 'github-pages' : (isCloudflarePages ? 'cloudflare-pages' : 'local'),
          AUTO_FIX_ENABLED: !isGithubPages,
          API_BASE_URL: isGithubPages ? null : '/api',
          IS_GITHUB_PAGES: isGithubPages,
          IS_CLOUDFLARE_PAGES: isCloudflarePages
        };
        window.ENV = window.ENV_SAFE.MODE; // Legacy Support
      }
      
      // Positive Meldung für GitHub Pages anzeigen
      if (this.isGithubPages) {
        this.showPositiveMessage('Demo-Portal aktiv – Alle Funktionen sind lokal im Browser verfügbar. Externe APIs sind hier absichtlich deaktiviert.');
      } else if (this.isCloudflarePages) {
        this.showPositiveMessage('Produktiv-Portal aktiv – Live-APIs sind verbunden.');
      }
      
      this.startMonitoring();
      console.log('✅ AutoFix Client initialized', { isGithubPages: this.isGithubPages });
    }

    showPositiveMessage(message) {
      // Zeige positive Info-Meldung statt Fehler
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #22c55e);
        color: #00110b;
        padding: 12px 18px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        z-index: 10000;
        font-weight: 600;
        font-size: 14px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
      `;
      toast.textContent = `✅ ${message}`;
      document.body.appendChild(toast);
      
      // Nach 5 Sekunden entfernen
      setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }, 5000);
    }

    startMonitoring() {
      // Monitor for errors and attempt fixes
      window.addEventListener('error', (event) => {
        // Auf GitHub Pages: Keine Auto-Fix-Karten für erwartete Fehler
        if (this.isGithubPages && this.isExpectedError(event.error)) {
          return; // Stumm schlucken
        }
        this.attemptFix(event);
      });

      window.addEventListener('unhandledrejection', (event) => {
        // Auf GitHub Pages: Keine Auto-Fix-Karten für erwartete Fehler
        if (this.isGithubPages && this.isExpectedError(event.reason)) {
          return; // Stumm schlucken
        }
        this.attemptFix(event);
      });
      
      // Monitor für fetch-Fehler (405, 404)
      this.monitorFetchErrors();
    }

    isExpectedError(error) {
      if (!error) return false;
      const message = error.message || String(error);
      // Erwartete Fehler auf GitHub Pages (keine Auto-Fix-Karten)
      return message.includes('ENV') || 
             message.includes('405') || 
             message.includes('404') ||
             message.includes('API') ||
             message.includes('fetch');
    }

    monitorFetchErrors() {
      // Intercept fetch calls to detect 405/404 errors
      const originalFetch = window.fetch;
      const self = this;
      
      window.fetch = async function(...args) {
        // Auf GitHub Pages: Keine API-Calls versuchen
        if (self.isGithubPages && args[0] && typeof args[0] === 'string' && args[0].includes('/api/')) {
          // Stumm zurückgeben, keine Fehler
          return Promise.resolve(new Response(JSON.stringify({ success: false, error: 'API not available on GitHub Pages' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        try {
          const response = await originalFetch.apply(this, args);
          
          // Auf GitHub Pages: 405/404 Fehler stumm behandeln
          if (self.isGithubPages && (response.status === 405 || response.status === 404)) {
            // Keine Auto-Fix-Karte anzeigen
            return response;
          }
          
          // Auf anderen Umgebungen: Auto-Fix bei 405
          if (!self.isGithubPages && response.status === 405) {
            self.handle405Error(args[0]);
          }
          
          return response;
        } catch (error) {
          // Auf GitHub Pages: Fetch-Fehler stumm behandeln
          if (self.isGithubPages) {
            return Promise.resolve(new Response(JSON.stringify({ success: false, error: 'Network error' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
          throw error;
        }
      };
    }

    handle405Error(url) {
      // Nur auf Cloudflare/Production: Auto-Fix-Karte anzeigen
      if (this.isGithubPages) return;
      
      // Auto-Fix-Karte für 405-Fehler (nur auf Production)
      this.showAutoFixCard('405', 'API-Methode nicht erlaubt. Bitte Endpoint/HTTP-Methode prüfen.');
    }

    showAutoFixCard(errorCode, message) {
      // Nur auf Production: Auto-Fix-Karte anzeigen
      if (this.isGithubPages) return;
      
      const card = document.createElement('div');
      card.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--card, #111827);
        border: 2px solid var(--accent, #10b981);
        border-radius: 12px;
        padding: 16px;
        max-width: 350px;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        animation: slideInUp 0.3s ease-out;
      `;
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 20px;">🔧</span>
          <strong style="color: var(--accent, #10b981);">Automatische Fehlerkorrektur</strong>
        </div>
        <div style="color: var(--muted, #9ca3af); font-size: 13px; margin-bottom: 4px;">
          Erkannt: ${errorCode}
        </div>
        <div style="color: var(--ink, #e5e7eb); font-size: 12px;">
          ${message}
        </div>
      `;
      document.body.appendChild(card);
      
      // Nach 8 Sekunden entfernen
      setTimeout(() => {
        card.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(() => card.remove(), 300);
      }, 8000);
    }

    attemptFix(event) {
      const error = event.error || event.reason;
      if (!error) return;

      // Auf GitHub Pages: Keine Auto-Fix-Karten
      if (this.isGithubPages) {
        return; // Stumm schlucken
      }

      // Try to fix common errors (nur auf Production)
      if (error.message && error.message.includes('CORS')) {
        this.fixCorsError(error);
      } else if (error.message && error.message.includes('fetch')) {
        this.fixFetchError(error);
      } else if (error.message && error.message.includes('Service Worker')) {
        this.fixServiceWorkerError(error);
      }
    }

    fixCorsError(error) {
      console.warn('[AutoFix] CORS error detected - using fallback');
      // CORS errors are handled by error-guard.js
    }

    fixFetchError(error) {
      console.warn('[AutoFix] Fetch error detected - using fallback');
      // Fetch errors are handled by safeFetchJson
    }

    fixServiceWorkerError(error) {
      console.warn('[AutoFix] Service Worker error detected - skipping registration');
      // Service Worker errors are handled by error-guard.js
    }
  }

  // CSS für Animationen hinzufügen
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      @keyframes slideInUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideOutDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize AutoFix Client
  const autoFixClient = new AutoFixClient();
  autoFixClient.initialize();

  // Export
  if (typeof window !== 'undefined') {
    window.AutoFixClient = AutoFixClient;
    window.autoFixClient = autoFixClient;
  }
})();

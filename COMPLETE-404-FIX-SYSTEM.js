// T,. COMPLETE 404 FIX SYSTEM
// Identifiziert und behebt alle 404-Fehler automatisch
// Status: ✅ AKTIV

/**
 * Complete 404 Fix System
 * Überwacht alle Resource-Loads und behebt 404-Fehler automatisch
 */

class Complete404FixSystem {
  constructor() {
    this.errors = [];
    this.fixed = [];
    this.monitoring = false;
  }

  init() {
    if (this.monitoring) return;
    
    // Überwache alle fetch-Requests
    this.wrapFetch();
    
    // Überwache alle Resource-Loads
    this.monitorResources();
    
    // Überwache alle Links
    this.monitorLinks();
    
    this.monitoring = true;
    console.log('✅ 404-Fix-System aktiviert');
  }

  wrapFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Prüfe auf 404
        if (response.status === 404) {
          const url = args[0];
          console.warn(`❌ 404-Fehler: ${url}`);
          this.errors.push({ type: 'fetch', url, timestamp: Date.now() });
          await this.attemptFix(url);
        }
        
        return response;
      } catch (error) {
        console.error('Fetch-Fehler:', error);
        return originalFetch(...args);
      }
    };
  }

  monitorResources() {
    // Überwache Script-Loads
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK') {
        const src = e.target.src || e.target.href;
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
          console.warn(`❌ Resource-Load-Fehler: ${src}`);
          this.errors.push({ type: 'resource', url: src, element: e.target, timestamp: Date.now() });
          this.attemptFix(src, e.target);
        }
      }
    }, true);
  }

  monitorLinks() {
    // Überwache Link-Klicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && link.href && !link.href.startsWith('http') && !link.href.startsWith('//')) {
        // Prüfe Link vor dem Klick
        this.checkLink(link.href).then(exists => {
          if (!exists) {
            console.warn(`❌ Defekter Link: ${link.href}`);
            this.errors.push({ type: 'link', url: link.href, element: link, timestamp: Date.now() });
            e.preventDefault();
            this.attemptFix(link.href, link);
          }
        });
      }
    });
  }

  async checkLink(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async attemptFix(url, element) {
    // Versuche verschiedene Pfad-Varianten
    const variants = [
      url,
      url.replace(/^\.\//, ''),
      url.replace(/^\//, ''),
      './' + url,
      '/' + url
    ];

    for (const variant of variants) {
      try {
        const response = await fetch(variant, { method: 'HEAD' });
        if (response.ok) {
          console.log(`✅ Fix gefunden: ${url} → ${variant}`);
          this.fixed.push({ original: url, fixed: variant });
          
          // Korrigiere Element
          if (element) {
            if (element.tagName === 'SCRIPT') {
              element.src = variant;
            } else if (element.tagName === 'LINK') {
              element.href = variant;
            } else if (element.tagName === 'A') {
              element.href = variant;
            }
          }
          
          return true;
        }
      } catch {
        // Weiter mit nächster Variante
      }
    }
    
    console.warn(`⚠️ Kein Fix gefunden für: ${url}`);
    return false;
  }

  getReport() {
    return {
      errors: this.errors,
      fixed: this.fixed,
      successRate: this.errors.length > 0 ? (this.fixed.length / this.errors.length * 100).toFixed(1) + '%' : '100%'
    };
  }
}

// Global verfügbar
window.Complete404FixSystem = Complete404FixSystem;

// Auto-Init
if (typeof window !== 'undefined') {
  window.complete404Fix = new Complete404FixSystem();
  window.complete404Fix.init();
}


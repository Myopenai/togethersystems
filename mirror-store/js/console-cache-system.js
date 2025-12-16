// Console Cache System - Erkennt alle Webseiten-Fehler
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class ConsoleCacheSystem {
  constructor() {
    this.cache = new Map();
    this.pageErrors = [];
    this.emptyPages = [];
    this.whitePages = [];
    this.loadingIssues = [];
    this.init();
  }

  init() {
    // Überwache Seiten-Laden
    this.monitorPageLoad();
    
    // Überwache Console-Fehler
    this.monitorConsoleErrors();
    
    // Überwache leere Seiten
    this.monitorEmptyPages();
    
    // Überwache weiße Seiten
    this.monitorWhitePages();
    
    // Cache beim Seitenwechsel speichern
    window.addEventListener('beforeunload', () => {
      this.saveCache();
    });
  }

  monitorPageLoad() {
    // Prüfe ob Seite vollständig geladen ist
    if (document.readyState === 'complete') {
      this.checkPageStatus();
    } else {
      window.addEventListener('load', () => {
        this.checkPageStatus();
      });
    }

    // Prüfe nach 3 Sekunden nochmal (für langsam ladende Seiten)
    setTimeout(() => {
      this.checkPageStatus();
    }, 3000);
  }

  checkPageStatus() {
    const url = window.location.href;
    const status = {
      url,
      timestamp: new Date().toISOString(),
      hasContent: this.hasContent(),
      hasErrors: this.hasErrors(),
      isWhite: this.isWhite(),
      isEmpty: this.isEmpty(),
      consoleErrors: this.getConsoleErrors(),
      domElements: document.querySelectorAll('*').length,
      bodyContent: document.body ? document.body.innerText.trim().length : 0
    };

    this.cache.set(url, status);

    // Erkenne Probleme
    if (status.isWhite) {
      this.whitePages.push(status);
      this.reportIssue('white-page', status);
    } else if (status.isEmpty) {
      this.emptyPages.push(status);
      this.reportIssue('empty-page', status);
    } else if (status.hasErrors) {
      this.pageErrors.push(status);
      this.reportIssue('page-errors', status);
    }

    // Speichere Cache
    this.saveCache();
  }

  hasContent() {
    // Prüfe ob Seite Inhalt hat
    const body = document.body;
    if (!body) return false;

    const text = body.innerText.trim();
    const images = body.querySelectorAll('img').length;
    const videos = body.querySelectorAll('video').length;
    const iframes = body.querySelectorAll('iframe').length;
    const scripts = body.querySelectorAll('script').length;

    return text.length > 100 || images > 0 || videos > 0 || iframes > 0 || scripts > 5;
  }

  hasErrors() {
    // Prüfe auf Console-Fehler
    return window.consoleErrorController && window.consoleErrorController.errors.length > 0;
  }

  isWhite() {
    // Prüfe ob Seite weiß ist
    const body = document.body;
    if (!body) return true;

    const computedStyle = window.getComputedStyle(body);
    const bgColor = computedStyle.backgroundColor;
    const isWhiteBg = bgColor === 'rgb(255, 255, 255)' || bgColor === 'white' || bgColor === '#ffffff';
    
    const hasNoContent = body.innerText.trim().length === 0;
    const hasNoVisibleElements = body.querySelectorAll('*:not(script):not(style)').length === 0;

    return isWhiteBg && (hasNoContent || hasNoVisibleElements);
  }

  isEmpty() {
    // Prüfe ob Seite leer ist (öffnet aber keinen Inhalt hat)
    const body = document.body;
    if (!body) return true;

    const text = body.innerText.trim();
    const visibleElements = Array.from(body.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0;
    });

    return text.length < 50 && visibleElements.length < 3;
  }

  getConsoleErrors() {
    if (window.consoleErrorController) {
      return window.consoleErrorController.errors;
    }
    return [];
  }

  monitorConsoleErrors() {
    // Überwache Console-Fehler über Console Error Controller
    if (window.consoleErrorController) {
      const originalHandleError = window.consoleErrorController.handleError.bind(window.consoleErrorController);
      window.consoleErrorController.handleError = (type, args) => {
        originalHandleError(type, args);
        this.onConsoleError(type, args);
      };
    }
  }

  onConsoleError(type, args) {
    const error = {
      type,
      message: args.join(' '),
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    this.pageErrors.push(error);
    this.saveCache();
  }

  monitorEmptyPages() {
    // Prüfe regelmäßig auf leere Seiten
    setInterval(() => {
      if (this.isEmpty() && !this.emptyPages.find(p => p.url === window.location.href)) {
        const status = {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          isEmpty: true,
          reason: 'Kein sichtbarer Inhalt nach 3 Sekunden'
        };
        this.emptyPages.push(status);
        this.reportIssue('empty-page', status);
      }
    }, 3000);
  }

  monitorWhitePages() {
    // Prüfe regelmäßig auf weiße Seiten
    setInterval(() => {
      if (this.isWhite() && !this.whitePages.find(p => p.url === window.location.href)) {
        const status = {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          isWhite: true,
          reason: 'Weißer Hintergrund ohne Inhalt'
        };
        this.whitePages.push(status);
        this.reportIssue('white-page', status);
      }
    }, 3000);
  }

  reportIssue(type, status) {
    // Reporte Problem
    const report = {
      type,
      status,
      timestamp: new Date().toISOString()
    };

    // Speichere in localStorage
    try {
      const reports = JSON.parse(localStorage.getItem('console-cache-reports') || '[]');
      reports.push(report);
      localStorage.setItem('console-cache-reports', JSON.stringify(reports));
    } catch (e) {
      console.warn('Fehler beim Speichern des Reports:', e);
    }

    // Logge Problem
    console.warn(`[CONSOLE-CACHE] Problem erkannt: ${type}`, status);
  }

  saveCache() {
    // Speichere Cache in localStorage
    try {
      const cacheData = {
        pages: Array.from(this.cache.entries()).map(([url, status]) => ({ url, status })),
        errors: this.pageErrors,
        emptyPages: this.emptyPages,
        whitePages: this.whitePages,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('console-cache-data', JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Fehler beim Speichern des Caches:', e);
    }
  }

  loadCache() {
    // Lade Cache aus localStorage
    try {
      const cacheData = JSON.parse(localStorage.getItem('console-cache-data') || '{}');
      
      if (cacheData.pages) {
        cacheData.pages.forEach(({ url, status }) => {
          this.cache.set(url, status);
        });
      }

      if (cacheData.errors) {
        this.pageErrors = cacheData.errors;
      }

      if (cacheData.emptyPages) {
        this.emptyPages = cacheData.emptyPages;
      }

      if (cacheData.whitePages) {
        this.whitePages = cacheData.whitePages;
      }
    } catch (e) {
      console.warn('Fehler beim Laden des Caches:', e);
    }
  }

  getReport() {
    // Generiere Report
    return {
      totalPages: this.cache.size,
      pagesWithErrors: this.pageErrors.length,
      emptyPages: this.emptyPages.length,
      whitePages: this.whitePages.length,
      allPages: Array.from(this.cache.values()),
      errors: this.pageErrors,
      emptyPages: this.emptyPages,
      whitePages: this.whitePages,
      timestamp: new Date().toISOString()
    };
  }

  testAllPages(pages) {
    // Teste alle Seiten automatisch
    const results = [];

    pages.forEach((url, index) => {
      setTimeout(() => {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        iframe.onload = () => {
          setTimeout(() => {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              const status = {
                url,
                hasContent: iframeDoc.body ? iframeDoc.body.innerText.trim().length > 100 : false,
                isWhite: this.isWhite(),
                isEmpty: this.isEmpty(),
                timestamp: new Date().toISOString()
              };

              results.push(status);
              document.body.removeChild(iframe);

              if (index === pages.length - 1) {
                // Alle Seiten getestet
                this.saveTestResults(results);
              }
            } catch (e) {
              // CORS-Fehler - normale Seite
              results.push({
                url,
                hasContent: true,
                corsError: true,
                timestamp: new Date().toISOString()
              });
              document.body.removeChild(iframe);
            }
          }, 2000);
        };
      }, index * 3000);
    });

    return results;
  }

  saveTestResults(results) {
    // Speichere Testergebnisse
    try {
      localStorage.setItem('console-cache-test-results', JSON.stringify(results));
    } catch (e) {
      console.warn('Fehler beim Speichern der Testergebnisse:', e);
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.consoleCacheSystem = new ConsoleCacheSystem();
  window.consoleCacheSystem.loadCache();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConsoleCacheSystem;
}

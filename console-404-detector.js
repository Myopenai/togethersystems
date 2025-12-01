/**
 * CONSOLE 404 DETECTOR
 * 
 * System zur Erkennung aller 404-Fehler
 * ALLE FEHLER VORKOMMEN MÜSSEN ERKANNT WERDEN
 * 
 * STATUS: ACTIVE - HARD CODED
 * VERSION: 1.0.0
 */

(function() {
  'use strict';

  const DETECTION_CONFIG = {
    enabled: true,
    fileTypes: ['.md', '.json', '.html', '.js', '.ts', '.css', '.svg', '.png', '.jpg', '.jpeg'],
    directories: ['Settings/', 'settings/', 'functions/', 'assets/', 'TELBANK/', 'ultra/', 'YORDY/'],
    checkOnLoad: true,
    checkOnNavigation: true,
    checkOnRequest: true,
    reportTo: 'Settings/404-errors.json'
  };

  const errorStore = {
    errors: [],
    metadata: {
      lastUpdated: new Date().toISOString(),
      totalErrors: 0,
      highPriorityErrors: 0,
      fixedErrors: 0
    }
  };

  function log404Error(url, path, fileType, context) {
    const error = {
      id: `404-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: url,
      path: path,
      fileType: fileType,
      errorType: '404',
      priority: 'high',
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      occurrenceCount: 1,
      context: context || {},
      fix: {
        status: 'pending',
        suggestedPath: null,
        suggestedAction: null
      },
      tags: []
    };

    // Prüfe, ob dieser Fehler bereits existiert
    const existingError = errorStore.errors.find(e => e.path === path);
    if (existingError) {
      existingError.lastSeen = new Date().toISOString();
      existingError.occurrenceCount++;
      console.warn(`[404-DETECTOR] Wiederholter 404-Fehler: ${path} (${existingError.occurrenceCount}x)`);
    } else {
      errorStore.errors.push(error);
      errorStore.metadata.totalErrors++;
      if (error.priority === 'high' || error.priority === 'critical') {
        errorStore.metadata.highPriorityErrors++;
      }
      console.error(`[404-DETECTOR] NEUER 404-FEHLER ERKANNT: ${path}`);
    }

    // Speichere in localStorage als Backup
    try {
      localStorage.setItem('404-errors-backup', JSON.stringify(errorStore));
    } catch (e) {
      console.warn('[404-DETECTOR] Konnte nicht in localStorage speichern:', e);
    }

    // Versuche, in Settings/404-errors.json zu speichern (wenn verfügbar)
    if (typeof fetch !== 'undefined') {
      fetch('/Settings/404-errors.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorStore, null, 2)
      }).catch(() => {
        // Ignoriere Fehler beim Speichern
      });
    }
  }

  // Intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    return originalFetch.apply(this, args)
      .then(response => {
        if (response.status === 404) {
          const urlObj = new URL(url, window.location.origin);
          const path = urlObj.pathname;
          const fileType = path.match(/\.([^.]+)$/)?.[1] || 'unknown';
          
          log404Error(url, path, fileType, {
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        }
        return response;
      })
      .catch(error => {
        if (error.message && error.message.includes('404')) {
          const urlObj = new URL(url, window.location.origin);
          const path = urlObj.pathname;
          log404Error(url, path, 'unknown', {
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            errorMessage: error.message
          });
        }
        throw error;
      });
  };

  // Intercept resource loading errors
  window.addEventListener('error', function(event) {
    if (event.target && event.target.tagName) {
      const tagName = event.target.tagName.toLowerCase();
      if (['img', 'script', 'link', 'iframe'].includes(tagName)) {
        const src = event.target.src || event.target.href;
        if (src) {
          const urlObj = new URL(src, window.location.origin);
          const path = urlObj.pathname;
          const fileType = path.match(/\.([^.]+)$/)?.[1] || 'unknown';
          
          log404Error(src, path, fileType, {
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            tagName: tagName
          });
        }
      }
    }
  }, true);

  // Prüfe alle Links auf der Seite beim Laden
  if (DETECTION_CONFIG.checkOnLoad) {
    document.addEventListener('DOMContentLoaded', function() {
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
          // Prüfe, ob es ein relativer Pfad zu einer Datei ist
          const urlObj = new URL(href, window.location.origin);
          const path = urlObj.pathname;
          
          // Prüfe, ob es eine der überwachten Dateitypen ist
          const isMonitoredType = DETECTION_CONFIG.fileTypes.some(ext => path.endsWith(ext));
          const isMonitoredDir = DETECTION_CONFIG.directories.some(dir => path.includes(dir));
          
          if (isMonitoredType || isMonitoredDir) {
            // Versuche, die Datei zu laden (Head-Request)
            fetch(href, { method: 'HEAD' })
              .then(response => {
                if (response.status === 404) {
                  const fileType = path.match(/\.([^.]+)$/)?.[1] || 'unknown';
                  log404Error(href, path, fileType, {
                    referrer: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    linkText: link.textContent?.trim()
                  });
                }
              })
              .catch(() => {
                // Ignoriere Netzwerk-Fehler
              });
          }
        }
      });
    });
  }

  // Exponiere Error-Store für externe Zugriffe
  window._404ErrorStore = errorStore;
  window._404Detector = {
    getErrors: () => errorStore.errors,
    getMetadata: () => errorStore.metadata,
    clearErrors: () => {
      errorStore.errors = [];
      errorStore.metadata.totalErrors = 0;
      errorStore.metadata.highPriorityErrors = 0;
    }
  };

  console.log('[404-DETECTOR] System aktiviert - Alle 404-Fehler werden erkannt');
})();









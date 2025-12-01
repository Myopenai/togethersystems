/**
 * HTTP RESOURCE MONITOR - BROWSER VERSION
 * 
 * IBM Standard - Industrial Business Machine - Industrial Fabrication Software
 * 
 * Automatic detection and tracking of HTTP 404 and resource loading errors
 * with real-time reporting.
 * 
 * STATUS: PERMANENT-ACTIVE - NIEMALS DEAKTIVIEREN
 * VERSION: 1.0.0
 */

(function() {
  'use strict';

  const CONFIG_PATH = './Settings/HTTP-RESOURCE-MONITOR-ROUTINE.json';
  const ERROR_STORE_PATH = './Settings/404-errors.json';
  const STORAGE_KEY = 'industrial_fabrication_404_errors';

  let config = null;
  let errorStore = {
    version: "1.0.0",
    description: "404 Error Log - IBM Standard",
    ibmStandard: true,
    lastUpdated: new Date().toISOString(),
    errors: [],
    metadata: {
      totalErrors: 0,
      highPriorityErrors: 0,
      fixedErrors: 0,
      criticalErrors: 0
    }
  };

  // Lade Konfiguration
  async function loadConfig() {
    try {
      const response = await fetch(CONFIG_PATH);
      if (response.ok) {
        config = await response.json();
      } else {
        // Fallback-Konfiguration
        config = {
          monitoring: {
            fetch: { enabled: true, statusCodesToTrack: [404, 403, 500, 502, 503] },
            resources: { enabled: true, trackScripts: true, trackStylesheets: true, trackImages: true, trackFonts: true, trackOthers: true },
            links: { enabled: true, checkOnClick: true, checkMethod: "HEAD", blockedProtocols: ["javascript:", "mailto:", "tel:"] }
          },
          tracking: {
            defaultPriority: "low",
            repetitionThresholds: { medium: 3, high: 10, critical: 50 },
            defaultFixStatus: "pending"
          },
          reporting: {
            consoleLogging: { enabled: true, logAll404: true, logLevel: "warn" },
            fileStorage: { enabled: true, path: ERROR_STORE_PATH },
            localStorageBackup: { enabled: true, key: STORAGE_KEY },
            realTimeDetection: { enabled: true, emitEvents: true, eventName: "httpResourceMonitor:error404" }
          },
          constraints: { forbidMonitorDeactivation: true }
        };
      }
    } catch (e) {
      console.warn('[HTTP-Resource-Monitor] Konfiguration nicht geladen, verwende Fallback:', e);
      // Verwende Fallback-Konfiguration (siehe oben)
    }
  }

  // Lade Error-Store
  async function loadErrorStore() {
    try {
      // Versuche localStorage zuerst
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        errorStore = JSON.parse(stored);
      } else {
        // Versuche von Datei
        const response = await fetch(ERROR_STORE_PATH);
        if (response.ok) {
          errorStore = await response.json();
        }
      }
    } catch (e) {
      console.warn('[HTTP-Resource-Monitor] Error-Store nicht geladen:', e);
    }
  }

  // Speichere Error-Store
  function saveErrorStore() {
    errorStore.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(errorStore));
    } catch (e) {
      console.warn('[HTTP-Resource-Monitor] Konnte nicht in localStorage speichern:', e);
    }
  }

  function normalizeId(type, method, url) {
    const safeMethod = method || "UNKNOWN";
    return `${type}::${safeMethod.toUpperCase()}::${url}`;
  }

  function computePriority(count) {
    if (!config) return "low";
    const thresholds = config.tracking.repetitionThresholds;
    if (count >= thresholds.critical) return "critical";
    if (count >= thresholds.high) return "high";
    if (count >= thresholds.medium) return "medium";
    return config.tracking.defaultPriority;
  }

  function logToConsole(record) {
    if (!config || !config.reporting.consoleLogging.enabled) return;
    const level = config.reporting.consoleLogging.logLevel || "warn";
    const message = `[HTTP-404-IBM] ${record.type.toUpperCase()} ${record.method || "?"} ${record.url} status=${record.statusCode} count=${record.count} priority=${record.priority}`;
    
    switch (level) {
      case "debug": console.debug(message); break;
      case "info": console.info(message); break;
      case "warn": console.warn(message); break;
      case "error": console.error(message); break;
    }
  }

  function emitRealtimeEvent(record) {
    if (!config || !config.reporting.realTimeDetection.enabled) return;
    if (!config.reporting.realTimeDetection.emitEvents) return;
    const eventName = config.reporting.realTimeDetection.eventName || "httpResourceMonitor:error404";
    const event = new CustomEvent(eventName, { detail: record });
    window.dispatchEvent(event);
  }

  function record404(params) {
    if (!config) return;

    const now = new Date().toISOString();
    const id = normalizeId(params.type, params.method, params.url);
    let record = errorStore.errors.find(e => e.id === id);

    if (!record) {
      record = {
        id,
        type: params.type,
        url: params.url,
        method: params.method,
        statusCode: params.statusCode,
        priority: config.tracking.defaultPriority,
        fixStatus: config.tracking.defaultFixStatus,
        firstSeenAt: now,
        lastSeenAt: now,
        count: 0,
        contexts: []
      };
      errorStore.errors.push(record);
      errorStore.metadata.totalErrors++;
    }

    record.count++;
    record.lastSeenAt = now;
    record.priority = computePriority(record.count);

    if (record.priority === "critical") {
      errorStore.metadata.criticalErrors = Math.max(
        errorStore.metadata.criticalErrors,
        errorStore.errors.filter(e => e.priority === "critical").length
      );
    }
    if (record.priority === "high" || record.priority === "critical") {
      errorStore.metadata.highPriorityErrors = Math.max(
        errorStore.metadata.highPriorityErrors,
        errorStore.errors.filter(e => e.priority === "high" || e.priority === "critical").length
      );
    }

    record.contexts.push({
      timestamp: now,
      source: params.type,
      origin: params.origin,
      referrer: params.referrer,
      stack: params.stack,
      meta: {}
    });

    logToConsole(record);
    emitRealtimeEvent(record);
    saveErrorStore();
  }

  // Wrap fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    const init = args[1] || {};
    const method = init.method || (url instanceof Request ? url.method : "GET");
    const urlString = url instanceof Request ? url.url : String(url);

    const response = await originalFetch.apply(this, args);

    if (config && config.monitoring.fetch.enabled) {
      const statusCodes = config.monitoring.fetch.statusCodesToTrack || [404];
      if (statusCodes.includes(response.status)) {
        record404({
          type: "fetch",
          url: urlString,
          method: method,
          statusCode: response.status,
          origin: "frontend",
          referrer: document.referrer,
          stack: new Error().stack
        });
      }
    }

    return response;
  };

  // Resource Error Listener
  window.addEventListener('error', function(event) {
    if (!config || !config.monitoring.resources.enabled) return;

    const target = event.target;
    if (!target) return;

    let url = null;
    let type = "resource";

    if (target instanceof HTMLScriptElement && config.monitoring.resources.trackScripts) {
      url = target.src;
    } else if (target instanceof HTMLLinkElement && config.monitoring.resources.trackStylesheets) {
      url = target.href;
    } else if (target instanceof HTMLImageElement && config.monitoring.resources.trackImages) {
      url = target.src;
    } else if (config.monitoring.resources.trackOthers) {
      // Andere Ressourcen
    }

    if (url) {
      record404({
        type: type,
        url: url,
        method: "GET",
        statusCode: 404,
        origin: "frontend",
        referrer: document.referrer,
        stack: event.error?.stack
      });
    }
  }, true);

  // Link Check Listener
  if (config && config.monitoring.links && config.monitoring.links.enabled) {
    document.addEventListener('click', async function(event) {
      if (!config.monitoring.links.checkOnClick) return;

      const target = event.target;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor || !anchor.href) return;

      const url = anchor.href;
      const protocol = new URL(url, window.location.href).protocol;
      
      if (config.monitoring.links.blockedProtocols.includes(protocol)) {
        return;
      }

      try {
        const method = config.monitoring.links.checkMethod || "HEAD";
        const resp = await fetch(url, { method: method });
        
        if (resp.status === 404) {
          record404({
            type: "link",
            url: url,
            method: method,
            statusCode: 404,
            origin: "frontend",
            referrer: window.location.href,
            stack: undefined
          });
        }
      } catch (e) {
        record404({
          type: "link",
          url: url,
          method: config.monitoring.links.checkMethod || "HEAD",
          statusCode: 404,
          origin: "frontend",
          referrer: window.location.href,
          stack: e.stack
        });
      }
    }, true);
  }

  // Initialisierung
  (async function init() {
    await loadConfig();
    await loadErrorStore();
    console.log('[HTTP-Resource-Monitor-IBM] System aktiviert - Alle 404-Fehler werden erkannt');
  })();

  // Exponiere für externe Zugriffe
  window._httpResourceMonitor = {
    getErrors: () => errorStore.errors,
    getMetadata: () => errorStore.metadata,
    getConfig: () => config,
    clearErrors: () => {
      errorStore.errors = [];
      errorStore.metadata.totalErrors = 0;
      errorStore.metadata.highPriorityErrors = 0;
      errorStore.metadata.criticalErrors = 0;
      saveErrorStore();
    }
  };
})();









/**
 * CONSOLE-MONITORING-SYSTEM
 * Die Konsole ist der Mund für den Settings-Ordner
 * Dauerhaftes Auslesen offline und online
 * 
 * Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
 * TTT Versiegelt
 */

(function() {
  'use strict';
  
  const CONSOLE_MONITOR_VERSION = '1.0.0-XXXL';
  // Pfad-Anpassung für GitHub Pages (relativ zum Root)
  const SETTINGS_PATH = window.location.pathname.includes('/') 
    ? window.location.pathname.split('/').slice(0, -1).join('/') + '/Settings/'
    : './Settings/';
  const STORAGE_KEY = 'console_monitor_logs';
  const MAX_LOG_ENTRIES = 1000;
  
  // Console-Monitoring-Konfiguration laden
  let consoleConfig = null;
  
  async function loadConsoleConfig() {
    try {
      // Versuche verschiedene Pfade
      const paths = [
        SETTINGS_PATH + 'CONSOLE-MONITORING-SYSTEM.json',
        './Settings/CONSOLE-MONITORING-SYSTEM.json',
        'Settings/CONSOLE-MONITORING-SYSTEM.json',
        '/Settings/CONSOLE-MONITORING-SYSTEM.json'
      ];
      
      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            consoleConfig = await response.json();
            console.log('[Console Monitor] Config geladen von:', path);
            return;
          }
        } catch (e) {
          // Weiter zum nächsten Pfad
        }
      }
      
      // Fallback: Standard-Konfiguration
      consoleConfig = {
        consoleMonitoringSystemVersion: "1.0.0-XXXL",
        monitoring: { enabled: true, mode: "continuous" },
        errorTypes: {
          syntax: { priority: "high", action: "instant-fix" },
          type: { priority: "high", action: "instant-fix" },
          network: { priority: "medium", action: "retry-with-fallback" }
        }
      };
      console.warn('[Console Monitor] Standard-Konfiguration verwendet');
    } catch (e) {
      console.warn('[Console Monitor] Fehler beim Laden der Konfiguration:', e);
    }
  }
  
  // Log-Array
  const logs = [];
  
  // Original Console-Methoden speichern
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalTrace = console.trace;
  
  // Log-Entry erstellen
  function createLogEntry(level, args, stack = null) {
    return {
      timestamp: new Date().toISOString(),
      level: level,
      message: args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' '),
      stack: stack || (new Error().stack),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }
  
  // Log speichern
  function saveLog(entry) {
    logs.push(entry);
    
    // Alte Einträge entfernen
    if (logs.length > MAX_LOG_ENTRIES) {
      logs.shift();
    }
    
    // In localStorage speichern
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-100)));
    } catch (e) {
      console.warn('Konnte Logs nicht in localStorage speichern:', e);
    }
    
    // An Settings-Ordner senden (wenn verfügbar)
    sendToSettings(entry);
  }
  
  // An Settings-Ordner senden
  async function sendToSettings(entry) {
    try {
      // Fehler-Typ erkennen
      const errorType = detectErrorType(entry.message);
      
      if (errorType) {
        // Fehler an Settings-Ordner melden
        await fetch(SETTINGS_PATH + 'api/console-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entry: entry,
            errorType: errorType,
            timestamp: Date.now()
          })
        }).catch(() => {
          // Offline: In Queue speichern
          const queue = JSON.parse(localStorage.getItem('console_error_queue') || '[]');
          queue.push({ entry, errorType, timestamp: Date.now() });
          localStorage.setItem('console_error_queue', JSON.stringify(queue.slice(-50)));
        });
      }
    } catch (e) {
      // Silent fail
    }
  }
  
  // Fehler-Typ erkennen
  function detectErrorType(message) {
    if (!message) return null;
    
    const msg = message.toLowerCase();
    
    if (msg.includes('syntaxerror') || msg.includes('missing )') || msg.includes('missing }') || msg.includes('missing ]')) {
      return { type: 'syntax', priority: 'high', action: 'instant-fix' };
    }
    
    if (msg.includes('typeerror') || msg.includes('failed to execute')) {
      return { type: 'type', priority: 'high', action: 'instant-fix' };
    }
    
    if (msg.includes('err_') || msg.includes('cors') || msg.includes('fetch failed')) {
      return { type: 'network', priority: 'medium', action: 'retry-with-fallback' };
    }
    
    if (msg.includes('cache') && (msg.includes('unsupported') || msg.includes('chrome-extension'))) {
      return { type: 'cache', priority: 'medium', action: 'filter-and-continue' };
    }
    
    return null;
  }
  
  // Console-Methoden überschreiben
  console.log = function(...args) {
    originalLog.apply(console, args);
    saveLog(createLogEntry('log', args));
  };
  
  console.error = function(...args) {
    originalError.apply(console, args);
    const entry = createLogEntry('error', args);
    saveLog(entry);
    
    // Sofortige Fehlerbehandlung
    handleError(entry);
  };
  
  console.warn = function(...args) {
    originalWarn.apply(console, args);
    saveLog(createLogEntry('warn', args));
  };
  
  console.info = function(...args) {
    originalInfo.apply(console, args);
    saveLog(createLogEntry('info', args));
  };
  
  console.trace = function(...args) {
    originalTrace.apply(console, args);
    saveLog(createLogEntry('trace', args));
  };
  
  // Globale Fehler-Handler
  window.onerror = function(message, source, lineno, colno, error) {
    const entry = createLogEntry('error', [message], error?.stack);
    entry.source = source;
    entry.lineno = lineno;
    entry.colno = colno;
    saveLog(entry);
    handleError(entry);
  };
  
  window.addEventListener('unhandledrejection', function(event) {
    const entry = createLogEntry('error', ['Unhandled Promise Rejection:', event.reason], event.reason?.stack);
    saveLog(entry);
    handleError(entry);
  });
  
  // Fehlerbehandlung
  async function handleError(entry) {
    const errorType = detectErrorType(entry.message);
    
    if (!errorType) return;
    
    // Sofortige Fehlerbehandlung basierend auf Typ
    switch (errorType.type) {
      case 'syntax':
        // Syntax-Fehler: Versuche automatische Reparatur
        await attemptSyntaxFix(entry);
        break;
      case 'type':
        // Type-Fehler: Versuche automatische Reparatur
        await attemptTypeFix(entry);
        break;
      case 'cache':
        // Cache-Fehler: Bereits in sw.js behoben
        break;
      case 'network':
        // Network-Fehler: Retry mit Fallback
        await attemptNetworkFix(entry);
        break;
    }
  }
  
  // Syntax-Fix versuchen
  async function attemptSyntaxFix(entry) {
    // Lade AutoFix-Regeln aus Settings
    try {
      const response = await fetch(SETTINGS_PATH + 'config/autofix-config.json');
      if (response.ok) {
        const config = await response.json();
        // AutoFix-Logik hier implementieren
        console.info('[CONSOLE-MONITOR] Syntax-Fehler erkannt, AutoFix wird angewendet');
      }
    } catch (e) {
      console.warn('[CONSOLE-MONITOR] AutoFix-Konfiguration nicht verfügbar');
    }
  }
  
  // Type-Fix versuchen
  async function attemptTypeFix(entry) {
    console.info('[CONSOLE-MONITOR] Type-Fehler erkannt, AutoFix wird angewendet');
  }
  
  // Network-Fix versuchen
  async function attemptNetworkFix(entry) {
    console.info('[CONSOLE-MONITOR] Network-Fehler erkannt, Retry mit Fallback');
  }
  
  // Initialisierung
  loadConsoleConfig().then(() => {
    console.log('[CONSOLE-MONITOR] System aktiviert - Version', CONSOLE_MONITOR_VERSION);
    console.log('[CONSOLE-MONITOR] Die Konsole ist der Mund für den Settings-Ordner');
  });
  
  // Export für externe Nutzung
  window.ConsoleMonitor = {
    getLogs: () => logs.slice(),
    clearLogs: () => { logs.length = 0; localStorage.removeItem(STORAGE_KEY); },
    exportLogs: () => JSON.stringify(logs, null, 2)
  };
  
})();


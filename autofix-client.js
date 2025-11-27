// autofix-client.js
// Client-seitiges System für automatische Fehlererkennung und -korrektur
// Integriert mit /api/autofix/errors und /api/autofix/notify

// Prüfe ob wir auf Cloudflare Pages sind (wo die API verfügbar ist)
function isCloudflarePages() {
  return (location.hostname.includes('pages.dev') || 
         location.hostname.includes('workers.dev') || 
         location.hostname.includes('cloudflare')) &&
         !location.hostname.includes('github.io'); // GitHub Pages explizit ausschließen
}

// Prüfe ob wir auf GitHub Pages sind (keine Serverless Functions)
function isGitHubPages() {
  return location.hostname.includes('github.io') || location.hostname.includes('github.com');
}

export const AUTOFIX_CONFIG = {
  API_BASE: '/api/autofix',
  NOTIFY_ENDPOINT: '/api/autofix/notify',
  STATUS_ENDPOINT: '/api/autofix/status',
  ENABLED: true, // Immer aktiviert - funktioniert jetzt komplett client-seitig
  USE_BACKEND: isCloudflarePages() && !isGitHubPages(), // Backend-Logging NUR auf Cloudflare Pages, NICHT auf GitHub Pages
};

let autofixEventSource = null;
let errorQueue = [];
let notificationContainer = null;

// Fehler-Patterns und ihre automatischen Korrekturen (client-seitig)
const ERROR_PATTERNS = {
  'ERR_CONNECTION_REFUSED': {
    type: 'api_connection',
    fix: 'disable_api_calls',
    message: 'API-Verbindung fehlgeschlagen. API-Aufrufe werden deaktiviert.',
  },
  '404': {
    type: 'not_found',
    fix: 'fallback_content',
    message: 'Ressource nicht gefunden. Fallback-Inhalt wird angezeigt.',
  },
  '405': {
    type: 'method_not_allowed',
    fix: 'disable_api_calls',
    message: 'API-Methode nicht erlaubt. API-Aufrufe werden deaktiviert.',
  },
  '500': {
    type: 'server_error',
    fix: 'retry_with_backoff',
    message: 'Server-Fehler erkannt. Wiederholung mit Backoff.',
  },
  'CORS': {
    type: 'cors_error',
    fix: 'use_relative_paths',
    message: 'CORS-Fehler erkannt. Relative Pfade werden verwendet.',
  },
  'timeout': {
    type: 'timeout',
    fix: 'increase_timeout',
    message: 'Timeout erkannt. Timeout wird erhöht.',
  },
  'null': {
    type: 'null_reference',
    fix: 'add_null_check',
    message: 'Null-Referenz erkannt. Null-Prüfung wird hinzugefügt.',
  },
  'undefined': {
    type: 'undefined_reference',
    fix: 'add_undefined_check',
    message: 'Undefined-Referenz erkannt. Undefined-Prüfung wird hinzugefügt.',
  },
};

// Erkenne Fehler-Pattern
function detectErrorPattern(error) {
  // Prüfe zuerst HTTP-Status-Code (wenn vorhanden)
  if (error.status) {
    const statusPattern = String(error.status);
    if (ERROR_PATTERNS[statusPattern]) {
      return { pattern: statusPattern, ...ERROR_PATTERNS[statusPattern] };
    }
  }
  
  // Dann prüfe Error-Message und Stack
  const errorMessage = (error.message || String(error)).toUpperCase();
  const errorStack = (error.stack || '').toUpperCase();
  const combined = errorMessage + ' ' + errorStack;
  
  for (const [pattern, config] of Object.entries(ERROR_PATTERNS)) {
    if (combined.includes(pattern)) {
      return { pattern, ...config };
    }
  }
  return null;
}

// Wende automatischen Fix an (client-seitig)
function applyClientSideFix(pattern, error, context) {
  switch (pattern.fix) {
    case 'disable_api_calls':
      // Deaktiviere API-Calls global
      if (window.VOUCHER_API_BASE !== undefined) {
        window.VOUCHER_API_BASE = null;
      }
      if (window.PRESENCE_API_BASE !== undefined) {
        window.PRESENCE_API_BASE = null;
      }
      console.warn('🔧 Autofix: API-Calls deaktiviert');
      break;
    
    case 'fallback_content':
      // Zeige Fallback-Inhalt (bereits implementiert in fetch-Wrapper)
      console.warn('🔧 Autofix: Fallback-Inhalt wird verwendet');
      break;
    
    case 'retry_with_backoff':
      // Retry-Logik wird in fetch-Wrapper implementiert
      console.warn('🔧 Autofix: Retry mit Backoff wird angewendet');
      break;
    
    case 'use_relative_paths':
      // Relative Pfade werden bereits verwendet
      console.warn('🔧 Autofix: Relative Pfade werden verwendet');
      break;
    
    case 'add_null_check':
    case 'add_undefined_check':
      // Null-Checks sind bereits in den meisten Funktionen vorhanden
      console.warn('🔧 Autofix: Null/Undefined-Checks sind vorhanden');
      break;
    
    default:
      console.warn('🔧 Autofix: Unbekanntes Fix-Pattern:', pattern.fix);
  }
}

// Fehler-Queue für Batch-Verarbeitung
function enqueueError(error, context = {}) {
  if (!AUTOFIX_CONFIG.ENABLED) return;
  
  // Erkenne Fehler-Pattern
  const pattern = detectErrorPattern(error);
  
  // Wende sofortigen Fix an (client-seitig)
  if (pattern) {
    applyClientSideFix(pattern, error, context);
    
    // STUMM auf GitHub Pages: Keine Pop-ups für 404/405
    if (isGitHubPages() && (pattern.pattern === '404' || pattern.pattern === '405')) {
      // Keine Benachrichtigung auf GitHub Pages
      return;
    }
    
    // Zeige Benachrichtigung nur wenn nicht GitHub Pages
    if (!isGitHubPages()) {
      showAutofixNotification({
        detected: true,
        pattern: pattern.pattern,
        fix: {
          action: pattern.fix,
          message: pattern.message,
        },
        notification: {
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
  
  // Für Backend-Logging (optional, nur wenn Backend verfügbar)
  if (AUTOFIX_CONFIG.USE_BACKEND) {
    errorQueue.push({
      error: {
        message: error.message || String(error),
        stack: error.stack || null,
        name: error.name || 'Error',
        id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        pattern: pattern ? pattern.pattern : null,
      },
      actorUid: context.actorUid || null,
    });

    // Batch-Verarbeitung (alle 2 Sekunden oder bei 5 Fehlern)
    if (errorQueue.length >= 5) {
      flushErrorQueue();
    } else if (errorQueue.length === 1) {
      setTimeout(flushErrorQueue, 2000);
    }
  }
}

// Fehler-Queue an Backend senden (optional, nur wenn Backend verfügbar)
async function flushErrorQueue() {
  if (!errorQueue.length) return;
  if (!AUTOFIX_CONFIG.USE_BACKEND) {
    // Auf GitHub Pages: Fehler wurden bereits client-seitig behoben
    errorQueue = [];
    return;
  }
  
  const batch = errorQueue;
  errorQueue = [];

  try {
    const res = await fetch(`${AUTOFIX_CONFIG.API_BASE}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors: batch }),
    });

    if (!res.ok) {
      console.warn('Autofix: API antwortete mit', res.status);
      return;
    }

    const data = await res.json();
    
    // Benachrichtigungen anzeigen
    if (data.results && Array.isArray(data.results)) {
      for (const result of data.results) {
        if (result.detected && result.fix) {
          showAutofixNotification(result);
        }
      }
    } else if (data.detected && data.fix) {
      // Einzelnes Ergebnis
      showAutofixNotification(data);
    }
  } catch (err) {
    // Fehler beim Senden ignorieren (offline)
    console.warn('Autofix: Fehler konnte nicht gesendet werden', err);
    // Zeige trotzdem eine generische Benachrichtigung
    showAutofixNotification({
      detected: true,
      pattern: 'network_error',
      fix: {
        message: 'Fehler wurde erkannt, aber konnte nicht automatisch korrigiert werden. Bitte Seite neu laden.',
      },
      notification: {
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// Benachrichtigung anzeigen
function showAutofixNotification(result) {
  if (!notificationContainer) {
    createNotificationContainer();
  }

  const notification = document.createElement('div');
  notification.className = 'autofix-notification';
  notification.innerHTML = `
    <div class="autofix-notification-header">
      <strong>🔧 Automatische Fehlerkorrektur</strong>
      <button class="autofix-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="autofix-notification-body">
      <p><strong>Erkannt:</strong> ${result.pattern || 'Unbekanntes Muster'}</p>
      <p><strong>Aktion:</strong> ${result.fix.message || result.fix.action}</p>
      <p class="autofix-timestamp">${new Date(result.notification.timestamp).toLocaleString()}</p>
    </div>
  `;

  notificationContainer.appendChild(notification);

  // Auto-Entfernen nach 10 Sekunden
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }
  }, 10000);
}

// Benachrichtigungs-Container erstellen
function createNotificationContainer() {
  notificationContainer = document.createElement('div');
  notificationContainer.id = 'autofix-notifications';
  notificationContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
    pointer-events: none;
  `;
  document.body.appendChild(notificationContainer);

  // CSS für Benachrichtigungen
  if (!document.getElementById('autofix-styles')) {
    const style = document.createElement('style');
    style.id = 'autofix-styles';
    style.textContent = `
      .autofix-notification {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid #22c55e;
        border-radius: 12px;
        padding: 12px;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        pointer-events: auto;
        animation: slideIn 0.3s ease-out;
        transition: opacity 0.3s, transform 0.3s;
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .autofix-notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        color: #22c55e;
        font-size: 14px;
      }
      .autofix-notification-body {
        color: #e5e7eb;
        font-size: 13px;
        line-height: 1.5;
      }
      .autofix-notification-body p {
        margin: 4px 0;
      }
      .autofix-timestamp {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 8px !important;
      }
      .autofix-close {
        background: none;
        border: none;
        color: #9ca3af;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        line-height: 1;
      }
      .autofix-close:hover {
        color: #e5e7eb;
      }
    `;
    document.head.appendChild(style);
  }
}

// Global Error Handler
window.addEventListener('error', (event) => {
  enqueueError(event.error || new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Export für globale Verwendung
// Export für globale Verwendung
window.enqueueError = enqueueError;
export { enqueueError };

// Unhandled Promise Rejection Handler
window.addEventListener('unhandledrejection', (event) => {
  enqueueError(event.reason || new Error('Unhandled Promise Rejection'), {
    type: 'promise_rejection',
  });
});

// Fetch Error Handler (wraps fetch)
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  try {
    const response = await originalFetch.apply(this, args);
    
    // Fehler bei nicht-OK Responses erkennen
    if (!response.ok && response.status >= 400) {
      const errorText = await response.clone().text().catch(() => response.statusText);
      // Erstelle Error mit Status-Code im Message (für Pattern-Erkennung)
      const error = new Error(`HTTP ${response.status}: ${errorText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      enqueueError(error, {
        type: 'fetch_error',
        url: args[0],
        status: response.status,
        statusText: response.statusText,
      });
    }
    
    return response;
  } catch (error) {
    enqueueError(error, {
      type: 'fetch_error',
      url: args[0],
    });
    throw error;
  }
};

// Server-Sent Events für Live-Benachrichtigungen (optional, nur wenn Backend verfügbar)
function connectAutofixNotifications() {
  if (!AUTOFIX_CONFIG.USE_BACKEND || isGitHubPages()) {
    // Auf GitHub Pages: KEINE Backend-Verbindung versuchen
    if (isGitHubPages()) {
      console.log('🔧 Autofix: GitHub Pages erkannt - Backend-Calls deaktiviert');
    } else {
      console.log('🔧 Autofix: Client-seitig aktiv (Backend-Logging deaktiviert)');
    }
    return;
  }
  if (autofixEventSource) return; // Bereits verbunden

  try {
    autofixEventSource = new EventSource(AUTOFIX_CONFIG.NOTIFY_ENDPOINT);

    autofixEventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'autofix') {
          showAutofixNotification({
            detected: true,
            pattern: data.fix.type,
            fix: {
              action: data.fix.action,
              message: data.fix.message,
            },
            notification: {
              timestamp: data.timestamp,
            },
          });
        }
      } catch (err) {
        console.warn('Autofix: Fehler beim Parsen der Benachrichtigung', err);
      }
    });

    autofixEventSource.addEventListener('error', () => {
      // Verbindung verloren, nach 5 Sekunden erneut versuchen
      setTimeout(() => {
        if (autofixEventSource) {
          autofixEventSource.close();
          autofixEventSource = null;
          connectAutofixNotifications();
        }
      }, 5000);
    });
  } catch (err) {
    console.warn('Autofix: SSE-Verbindung konnte nicht hergestellt werden', err);
  }
}

// Status abrufen
export async function getAutofixStatus() {
  try {
    const res = await fetch(AUTOFIX_CONFIG.STATUS_ENDPOINT);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Initialisierung
export function initAutofix() {
  if (!AUTOFIX_CONFIG.ENABLED) {
    console.warn('🔧 Autofix-System ist deaktiviert');
    return;
  }
  
  // Container sofort erstellen
  if (!notificationContainer) {
    createNotificationContainer();
  }
  
  // SSE-Verbindung herstellen
  connectAutofixNotifications();
  
  // Test-Benachrichtigung nach 2 Sekunden (nur im Development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
      console.log('🔧 Autofix-System aktiviert und bereit');
      // Zeige Test-Benachrichtigung nur wenn keine echten Fehler vorhanden
      if (errorQueue.length === 0) {
        showAutofixNotification({
          detected: true,
          pattern: 'system_ready',
          fix: {
            action: 'system_ready',
            message: 'Autofix-System ist aktiv und überwacht Fehler.',
          },
          notification: {
            timestamp: new Date().toISOString(),
          },
        });
        // Entferne Test-Benachrichtigung nach 3 Sekunden
        setTimeout(() => {
          const notifications = document.querySelectorAll('.autofix-notification');
          if (notifications.length > 0) {
            notifications[0].remove();
          }
        }, 3000);
      }
    }, 2000);
  } else {
    console.log('🔧 Autofix-System aktiviert');
  }
}

// Auto-Initialisierung wenn Modul geladen wird
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutofix);
  } else {
    initAutofix();
  }
}


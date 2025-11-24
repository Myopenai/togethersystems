// autofix-client.js
// Client-seitiges System für automatische Fehlererkennung und -korrektur
// Integriert mit /api/autofix/errors und /api/autofix/notify

export const AUTOFIX_CONFIG = {
  API_BASE: '/api/autofix',
  NOTIFY_ENDPOINT: '/api/autofix/notify',
  STATUS_ENDPOINT: '/api/autofix/status',
  ENABLED: true,
};

let autofixEventSource = null;
let errorQueue = [];
let notificationContainer = null;

// Fehler-Queue für Batch-Verarbeitung
function enqueueError(error, context = {}) {
  if (!AUTOFIX_CONFIG.ENABLED) return;
  
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

// Fehler-Queue an Backend senden
async function flushErrorQueue() {
  if (!errorQueue.length) return;
  
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
window.enqueueError = enqueueError;

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
      enqueueError(new Error(`HTTP ${response.status}: ${errorText}`), {
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

// Server-Sent Events für Live-Benachrichtigungen
function connectAutofixNotifications() {
  if (!AUTOFIX_CONFIG.ENABLED) return;
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


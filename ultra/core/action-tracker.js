// Action Tracker - Grenzenlose Nutzung mit automatischer Dokumentation
// Erfasst alle User-Aktionen die nicht implementiert sind

class ActionTracker {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
    this.unimplementedActions = [];
    this.actionCounter = 0;
  }

  /**
   * Nicht-implementierte Aktion erfassen
   * @param {string} actionName - Name der Aktion
   * @param {object} context - Kontext der Aktion
   * @param {string} userId - User-ID
   */
  async trackUnimplementedAction(actionName, context = {}, userId = null) {
    const action = {
      id: `action-${Date.now()}-${++this.actionCounter}`,
      actionName,
      context,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      status: 'unimplemented',
      priority: this.calculatePriority(actionName, context)
    };

    // Lokal speichern
    this.unimplementedActions.push(action);
    await this.saveUnimplementedActions();

    // Event emittieren
    this.eventBus.emit('UNIMPLEMENTED_ACTION_DETECTED', { action });

    // User-Benachrichtigung
    this.notifyUser(action);

    // Admin-Bericht (wird asynchron gesendet)
    this.reportToAdmin(action);

    return action;
  }

  /**
   * Nicht-implementierte Aktionen speichern
   */
  async saveUnimplementedActions() {
    await this.storage.set('unimplemented_actions', this.unimplementedActions);
  }

  /**
   * Nicht-implementierte Aktionen laden
   */
  async loadUnimplementedActions() {
    const actions = await this.storage.get('unimplemented_actions');
    this.unimplementedActions = Array.isArray(actions) ? actions : [];
    return this.unimplementedActions;
  }

  /**
   * User-Benachrichtigung anzeigen
   * @param {object} action - Action-Objekt
   */
  notifyUser(action) {
    // Freundliche Benachrichtigung ohne Blockierung
    const notification = document.createElement('div');
    notification.className = 'unimplemented-action-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">🚀</div>
        <div class="notification-text">
          <strong>Neue Funktion entdeckt!</strong>
          <p>Du hast eine Aktion ausgeführt, die noch nicht implementiert ist: <strong>${escapeHtml(action.actionName)}</strong></p>
          <p>Unser Team arbeitet bereits daran, diese Funktion umzusetzen. Danke für dein Feedback!</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-Entfernen nach 10 Sekunden
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
  }

  /**
   * Admin-Bericht erstellen und senden
   * @param {object} action - Action-Objekt
   */
  async reportToAdmin(action) {
    try {
      // Bericht-Objekt erstellen
      const report = {
        id: action.id,
        actionName: action.actionName,
        context: action.context,
        userId: action.userId,
        timestamp: action.timestamp,
        priority: action.priority,
        userAgent: action.userAgent,
        url: action.url,
        status: 'pending_implementation',
        reportedAt: new Date().toISOString()
      };

      // In Server-Log speichern (lokal für jetzt, später API-Call)
      await this.saveToServerLog(report);

      // Event für Admin-Dashboard
      this.eventBus.emit('ADMIN_REPORT_CREATED', { report });

      // Optional: API-Call zum Backend (wenn verfügbar)
      if (window.API_ENDPOINT) {
        try {
          await fetch(`${window.API_ENDPOINT}/admin/unimplemented-actions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
          });
        } catch (error) {
          console.warn('Could not send report to server, saved locally:', error);
        }
      }
    } catch (error) {
      console.error('Error reporting to admin:', error);
    }
  }

  /**
   * Server-Log speichern (Datenbank-ähnlich)
   * @param {object} report - Report-Objekt
   */
  async saveToServerLog(report) {
    const logKey = `server_log_unimplemented_actions_${new Date().toISOString().split('T')[0]}`;
    const todayLog = await this.storage.get(logKey) || [];
    todayLog.push(report);
    await this.storage.set(logKey, todayLog);

    // Auch in Haupt-Log
    const mainLog = await this.storage.get('server_log_unimplemented_actions') || [];
    mainLog.push(report);
    await this.storage.set('server_log_unimplemented_actions', mainLog);
  }

  /**
   * Priorität berechnen
   * @param {string} actionName - Name der Aktion
   * @param {object} context - Kontext
   */
  calculatePriority(actionName, context) {
    // Häufigkeit prüfen
    const similarActions = this.unimplementedActions.filter(a => 
      a.actionName === actionName
    );
    
    if (similarActions.length > 10) return 'high';
    if (similarActions.length > 5) return 'medium';
    return 'low';
  }

  /**
   * Alle nicht-implementierten Aktionen abrufen
   */
  async getAllUnimplementedActions() {
    return await this.loadUnimplementedActions();
  }

  /**
   * Aktion als implementiert markieren
   * @param {string} actionId - Action-ID
   */
  async markAsImplemented(actionId) {
    const action = this.unimplementedActions.find(a => a.id === actionId);
    if (action) {
      action.status = 'implemented';
      action.implementedAt = new Date().toISOString();
      await this.saveUnimplementedActions();
    }
  }

  /**
   * Statistiken abrufen
   */
  async getStatistics() {
    const actions = await this.loadUnimplementedActions();
    return {
      total: actions.length,
      unimplemented: actions.filter(a => a.status === 'unimplemented').length,
      implemented: actions.filter(a => a.status === 'implemented').length,
      highPriority: actions.filter(a => a.priority === 'high').length,
      byAction: this.groupByAction(actions)
    };
  }

  /**
   * Nach Aktion gruppieren
   */
  groupByAction(actions) {
    const grouped = {};
    actions.forEach(action => {
      if (!grouped[action.actionName]) {
        grouped[action.actionName] = [];
      }
      grouped[action.actionName].push(action);
    });
    return grouped;
  }
}

// Helper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ActionTracker };
}









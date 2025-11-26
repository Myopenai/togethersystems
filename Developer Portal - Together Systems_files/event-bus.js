// Event-Bus System für Ultra-Social-Media Portal
// Zentrale Event-Verwaltung für alle Module

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventHistory = []; // Optional: für Debugging
    this.maxHistorySize = 100;
  }

  /**
   * Event emittieren
   * @param {string} eventName - Name des Events
   * @param {object} payload - Event-Daten
   */
  emit(eventName, payload = {}) {
    const event = {
      name: eventName,
      payload,
      timestamp: new Date().toISOString()
    };

    // History speichern (begrenzt)
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Alle Listener benachrichtigen
    const listeners = this.listeners.get(eventName) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });

    // Debug-Logging (nur in Development)
    if (window.DEBUG_EVENTS) {
      console.log(`[EventBus] ${eventName}`, payload);
    }
  }

  /**
   * Event-Listener registrieren
   * @param {string} eventName - Name des Events
   * @param {function} handler - Callback-Funktion
   * @returns {function} - Unsubscribe-Funktion
   */
  on(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(handler);

    // Unsubscribe-Funktion zurückgeben
    return () => {
      const listeners = this.listeners.get(eventName);
      if (listeners) {
        const index = listeners.indexOf(handler);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Event-Listener einmalig registrieren
   * @param {string} eventName - Name des Events
   * @param {function} handler - Callback-Funktion
   */
  once(eventName, handler) {
    const unsubscribe = this.on(eventName, (event) => {
      handler(event);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Event-Listener entfernen
   * @param {string} eventName - Name des Events
   * @param {function} handler - Callback-Funktion
   */
  off(eventName, handler) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(handler);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Alle Listener für ein Event entfernen
   * @param {string} eventName - Name des Events
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Event-History abrufen (für Debugging)
   * @returns {Array} Event-History
   */
  getHistory() {
    return [...this.eventHistory];
  }

  /**
   * Event-History löschen
   */
  clearHistory() {
    this.eventHistory = [];
  }
}

// Globale Event-Bus-Instanz
const eventBus = new EventBus();

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventBus, eventBus };
}


// Error Handler - Grenzenlose Nutzung
// Ersetzt alle throw-Statements durch Action-Tracking

class ErrorHandler {
  constructor(actionTracker) {
    this.actionTracker = actionTracker;
  }

  /**
   * Fehler behandeln ohne User zu blockieren
   * @param {Error} error - Fehler-Objekt
   * @param {string} actionName - Name der Aktion
   * @param {object} context - Kontext
   * @param {string} userId - User-ID
   */
  async handleError(error, actionName, context = {}, userId = null) {
    // Nicht-implementierte Aktion tracken
    await this.actionTracker.trackUnimplementedAction(
      actionName || error.message,
      {
        ...context,
        error: error.message,
        stack: error.stack
      },
      userId
    );

    // User-freundliche Nachricht zurückgeben (kein throw)
    return {
      success: false,
      message: `Die Aktion "${actionName || error.message}" ist noch nicht vollständig implementiert. Unser Team wurde benachrichtigt und arbeitet daran.`,
      tracked: true
    };
  }

  /**
   * Try-Catch Wrapper für grenzenlose Nutzung
   * @param {Function} fn - Funktion die ausgeführt werden soll
   * @param {string} actionName - Name der Aktion
   * @param {object} context - Kontext
   */
  async executeSafely(fn, actionName, context = {}) {
    try {
      return await fn();
    } catch (error) {
      return await this.handleError(error, actionName, context);
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorHandler };
}









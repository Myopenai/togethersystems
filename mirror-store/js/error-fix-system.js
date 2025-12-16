// Error Fix System - Fabrikage Standard
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class ErrorFixSystem {
  constructor() {
    this.fixes = new Map();
    this.loadErrorPatterns();
  }

  async loadErrorPatterns() {
    try {
      const response = await fetch('/settings/error-patterns.json');
      if (response.ok) {
        const data = await response.json();
        data.patterns?.forEach(pattern => {
          this.fixes.set(pattern.id, pattern);
        });
      }
    } catch (error) {
      console.warn('Error patterns not found, using defaults');
    }
  }

  detectError(errorMessage) {
    for (const [id, pattern] of this.fixes) {
      try {
        const regex = new RegExp(pattern.pattern, 'i');
        if (regex.test(errorMessage)) {
          return pattern;
        }
      } catch (e) {
        // Skip invalid regex patterns
      }
    }
    return null;
  }

  applyFix(errorMessage) {
    const pattern = this.detectError(errorMessage);
    if (pattern && pattern.fix) {
      console.log(`Applying fix for: ${pattern.description}`);
      return pattern.fix.template;
    }
    return null;
  }

  reportError(error, context = {}) {
    const errorReport = {
      message: error.message || error,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      pattern: this.detectError(error.message || error)
    };
    
    // Send to error tracking (if available)
    if (window.apiErrorHandler) {
      window.apiErrorHandler.errorLog.push(errorReport);
    }
    
    return errorReport;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.errorFixSystem = new ErrorFixSystem();
  
  // Global error handler
  window.addEventListener('error', (event) => {
    window.errorFixSystem.reportError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    window.errorFixSystem.reportError(event.reason, {
      type: 'unhandledrejection'
    });
  });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorFixSystem;
}




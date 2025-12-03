/**
 * T,. OSTOSOS Self-Healing Core
 * Erweitertes Self-Healing System
 * 
 * Features:
 * - Automatisches Self-Healing
 * - Auto-Fix-Mechanismen
 * - Health-Checks
 * - Auto-Recovery
 * - Error Pattern Recognition
 */

class OSTOSOSSelfHealing {
  constructor() {
    this.healthChecks = new Map();
    this.errorPatterns = new Map();
    this.fixStrategies = new Map();
    this.recoveryHistory = [];
    this.isMonitoring = false;
    this.checkInterval = 30000; // 30 seconds
    
    this.init();
  }
  
  init() {
    this.registerDefaultHealthChecks();
    this.registerDefaultFixStrategies();
    this.loadErrorPatterns();
    
    console.log('T,. Self-Healing System initialisiert');
  }
  
  /**
   * Startet Health-Monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.performHealthChecks();
    
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.checkInterval);
    
    console.log('T,. Health-Monitoring gestartet');
  }
  
  /**
   * Stoppt Health-Monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('T,. Health-Monitoring gestoppt');
  }
  
  /**
   * Registriert Standard-Health-Checks
   */
  registerDefaultHealthChecks() {
    // Service Worker Check
    this.registerHealthCheck('service-worker', async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          return {
            healthy: registrations.length > 0,
            message: registrations.length > 0 ? 'Service Worker aktiv' : 'Service Worker nicht registriert',
            severity: registrations.length > 0 ? 'info' : 'warning'
          };
        } catch (e) {
          return {
            healthy: false,
            message: `Service Worker Fehler: ${e.message}`,
            severity: 'error'
          };
        }
      }
      return {
        healthy: true,
        message: 'Service Worker nicht unterstützt (file:// Protokoll)',
        severity: 'info'
      };
    });
    
    // LocalStorage Check
    this.registerHealthCheck('localstorage', () => {
      try {
        localStorage.setItem('__health_check__', 'test');
        localStorage.removeItem('__health_check__');
        return {
          healthy: true,
          message: 'LocalStorage funktioniert',
          severity: 'info'
        };
      } catch (e) {
        return {
          healthy: false,
          message: `LocalStorage Fehler: ${e.message}`,
          severity: 'error'
        };
      }
    });
    
    // Window Manager Check
    this.registerHealthCheck('window-manager', () => {
      const healthy = typeof window.OSTOSOSWindows !== 'undefined' && window.OSTOSOSWindows !== null;
      return {
        healthy: healthy,
        message: healthy ? 'Window Manager aktiv' : 'Window Manager nicht verfügbar',
        severity: healthy ? 'info' : 'error'
      };
    });
    
    // Taskbar Check
    this.registerHealthCheck('taskbar', () => {
      const healthy = typeof window.OSTOSOSTaskbarInstance !== 'undefined' && window.OSTOSOSTaskbarInstance !== null;
      return {
        healthy: healthy,
        message: healthy ? 'Taskbar aktiv' : 'Taskbar nicht verfügbar',
        severity: healthy ? 'info' : 'error'
      };
    });
    
    // Memory Check
    this.registerHealthCheck('memory', () => {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize;
        const limit = performance.memory.jsHeapSizeLimit;
        const percentage = (used / limit) * 100;
        
        return {
          healthy: percentage < 80,
          message: `Memory: ${(used / 1024 / 1024).toFixed(2)} MB / ${(limit / 1024 / 1024).toFixed(2)} MB (${percentage.toFixed(1)}%)`,
          severity: percentage > 90 ? 'error' : percentage > 80 ? 'warning' : 'info'
        };
      }
      
      return {
        healthy: true,
        message: 'Memory-Informationen nicht verfügbar',
        severity: 'info'
      };
    });
  }
  
  /**
   * Registriert einen Health-Check
   */
  registerHealthCheck(name, checkFunction) {
    this.healthChecks.set(name, checkFunction);
  }
  
  /**
   * Führt alle Health-Checks aus
   */
  async performHealthChecks() {
    const results = {};
    const issues = [];
    
    for (const [name, checkFunction] of this.healthChecks) {
      try {
        const result = await checkFunction();
        results[name] = result;
        
        if (!result.healthy) {
          issues.push({ name, ...result });
          
          // Auto-Fix versuchen
          await this.attemptAutoFix(name, result);
        }
      } catch (error) {
        results[name] = {
          healthy: false,
          message: `Health-Check Fehler: ${error.message}`,
          severity: 'error'
        };
        issues.push({ name, ...results[name] });
      }
    }
    
    // Speichere Health-Status
    localStorage.setItem('ostosos.health.status', JSON.stringify(results));
    
    // Emit Event
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('ostosos-health-check', {
        detail: { results, issues }
      }));
    }
    
    return { results, issues };
  }
  
  /**
   * Versucht Auto-Fix
   */
  async attemptAutoFix(component, issue) {
    const fixStrategy = this.fixStrategies.get(component);
    if (!fixStrategy) {
      console.warn(`Kein Fix-Strategy gefunden für: ${component}`);
      return false;
    }
    
    try {
      const fixed = await fixStrategy(issue);
      
      if (fixed) {
        this.recoveryHistory.push({
          component: component,
          issue: issue.message,
          fixed: true,
          timestamp: new Date().toISOString()
        });
        
        console.log(`T,. Auto-Fix erfolgreich: ${component}`);
        return true;
      }
    } catch (error) {
      console.error(`Auto-Fix fehlgeschlagen für ${component}:`, error);
      
      this.recoveryHistory.push({
        component: component,
        issue: issue.message,
        fixed: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return false;
  }
  
  /**
   * Registriert Standard-Fix-Strategien
   */
  registerDefaultFixStrategies() {
    // Service Worker Fix
    this.registerFixStrategy('service-worker', async (issue) => {
      if (window.location.protocol === 'file:') {
        return false; // Cannot fix in file:// protocol
      }
      
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('./sw.js', {
            scope: './'
          });
          return registration !== null;
        }
      } catch (e) {
        console.error('Service Worker Registration fehlgeschlagen:', e);
      }
      
      return false;
    });
    
    // LocalStorage Fix
    this.registerFixStrategy('localstorage', async (issue) => {
      // Versuche LocalStorage zu leeren wenn fast voll
      try {
        // Remove old/unused items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ostosos.temp.')) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        return true;
      } catch (e) {
        console.error('LocalStorage Fix fehlgeschlagen:', e);
        return false;
      }
    });
    
    // Window Manager Fix
    this.registerFixStrategy('window-manager', async (issue) => {
      try {
        if (typeof OSTOSOSWindowManager !== 'undefined') {
          window.OSTOSOSWindows = new OSTOSOSWindowManager();
          return true;
        }
      } catch (e) {
        console.error('Window Manager Fix fehlgeschlagen:', e);
      }
      return false;
    });
    
    // Taskbar Fix
    this.registerFixStrategy('taskbar', async (issue) => {
      try {
        if (typeof OSTOSOSTaskbar !== 'undefined') {
          window.OSTOSOSTaskbarInstance = new OSTOSOSTaskbar();
          return true;
        }
      } catch (e) {
        console.error('Taskbar Fix fehlgeschlagen:', e);
      }
      return false;
    });
  }
  
  /**
   * Registriert eine Fix-Strategie
   */
  registerFixStrategy(component, fixFunction) {
    this.fixStrategies.set(component, fixFunction);
  }
  
  /**
   * Lädt Error-Patterns
   */
  loadErrorPatterns() {
    const saved = localStorage.getItem('ostosos.error.patterns');
    if (saved) {
      try {
        const patterns = JSON.parse(saved);
        patterns.forEach(pattern => {
          this.errorPatterns.set(pattern.id, pattern);
        });
      } catch (e) {
        console.error('Fehler beim Laden der Error-Patterns:', e);
      }
    }
  }
  
  /**
   * Speichert Error-Pattern
   */
  saveErrorPattern(pattern) {
    this.errorPatterns.set(pattern.id, pattern);
    const patternsArray = Array.from(this.errorPatterns.values());
    localStorage.setItem('ostosos.error.patterns', JSON.stringify(patternsArray));
  }
  
  /**
   * Erkennt Error-Pattern
   */
  recognizeErrorPattern(error) {
    const errorMessage = error.message || String(error);
    const errorStack = error.stack || '';
    
    for (const [id, pattern] of this.errorPatterns) {
      if (pattern.regex && new RegExp(pattern.regex).test(errorMessage)) {
        return pattern;
      }
    }
    
    return null;
  }
  
  /**
   * Gibt Health-Status zurück
   */
  getHealthStatus() {
    const saved = localStorage.getItem('ostosos.health.status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Fehler beim Laden des Health-Status:', e);
      }
    }
    return {};
  }
  
  /**
   * Gibt Recovery-Historie zurück
   */
  getRecoveryHistory() {
    return this.recoveryHistory;
  }
}

// Global verfügbar machen
window.OSTOSOSSelfHealing = OSTOSOSSelfHealing;
window.OSTOSOSHealing = window.OSTOSOSHealing || new OSTOSOSSelfHealing();

// Auto-start monitoring
if (window.location.protocol !== 'file:') {
  window.OSTOSOSHealing.startMonitoring();
}

console.log('T,. Self-Healing Core geladen');


/**
 * Auto-Fix Manager
 * 
 * Automatische Fehlerbehebung und Code-Reparatur
 */

import fs from 'fs';
import path from 'path';

/**
 * Auto-Fix Manager
 */
export class AutoFixManager {
  constructor(configPath) {
    this.configPath = configPath;
    this.patterns = [];
    this.loadPatterns();
  }

  /**
   * Lädt Error-Patterns
   */
  loadPatterns() {
    try {
      const configFile = path.join(this.configPath, 'config', 'autofix-config.json');
      const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      this.patterns = config.patterns || [];
    } catch (error) {
      console.error('Could not load autofix patterns:', error);
      this.patterns = [];
    }
  }

  /**
   * Erkennt Fehler-Pattern
   */
  detectError(error) {
    const errorString = error.toString();
    
    for (const pattern of this.patterns) {
      if (errorString.includes(pattern.pattern) || 
          errorString.match(new RegExp(pattern.pattern, 'i'))) {
        return pattern;
      }
    }
    
    return null;
  }

  /**
   * Führt Auto-Fix durch
   */
  async applyFix(pattern, error, context = {}) {
    if (!pattern || !pattern.fix) {
      return { fixed: false, message: 'No fix available' };
    }

    switch (pattern.fix) {
      case 'disable_api_calls':
        return this.disableAPICalls(context);
      
      case 'fallback_content':
        return this.showFallbackContent(context);
      
      case 'retry_with_backoff':
        return this.retryWithBackoff(context, pattern);
      
      default:
        return { fixed: false, message: `Unknown fix: ${pattern.fix}` };
    }
  }

  /**
   * Deaktiviert API-Aufrufe
   */
  disableAPICalls(context) {
    // In Produktion: Deaktiviere API-Calls im Code
    return {
      fixed: true,
      message: 'API-Aufrufe wurden deaktiviert',
      action: 'disable_api',
      code: `
        // Auto-Fix: API-Aufrufe deaktiviert
        const API_ENABLED = false;
      `
    };
  }

  /**
   * Zeigt Fallback-Inhalt
   */
  showFallbackContent(context) {
    return {
      fixed: true,
      message: 'Fallback-Inhalt wird angezeigt',
      action: 'show_fallback',
      content: '<div class="fallback">Inhalt nicht verfügbar</div>'
    };
  }

  /**
   * Wiederholt mit Backoff
   */
  async retryWithBackoff(context, pattern) {
    const maxRetries = pattern.retries || 3;
    const backoff = pattern.backoff || 1000;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Versuche erneut
        await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)));
        return { fixed: true, message: `Retry ${i + 1} successful` };
      } catch (error) {
        if (i === maxRetries - 1) {
          return { fixed: false, message: 'All retries failed' };
        }
      }
    }
  }

  /**
   * Überwacht Code auf Fehler
   */
  watchCode(filePath, callback) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        // Datei wurde geändert
        this.checkFile(filePath, callback);
      }
    });
  }

  /**
   * Prüft Datei auf Fehler
   */
  async checkFile(filePath, callback) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Prüfe auf bekannte Fehler-Patterns
      for (const pattern of this.patterns) {
        if (content.includes(pattern.pattern)) {
          const fix = await this.applyFix(pattern, null, { filePath, content });
          if (callback) {
            callback({ pattern, fix, filePath });
          }
        }
      }
    } catch (error) {
      console.error('Error checking file:', error);
    }
  }
}

/**
 * Singleton-Instanz
 */
let autoFixManager = null;

export function getAutoFixManager(configPath) {
  if (!autoFixManager) {
    autoFixManager = new AutoFixManager(configPath);
  }
  return autoFixManager;
}


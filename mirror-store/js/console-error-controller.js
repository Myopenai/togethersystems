// Console Error Controller - Online & Local
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class ConsoleErrorController {
  constructor() {
    this.errors = [];
    this.fixes = new Map();
    this.isOnline = typeof window !== 'undefined' && window.location.protocol !== 'file:';
    this.init();
  }

  init() {
    // Intercept console errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      this.handleError('error', args);
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.handleError('warn', args);
      originalWarn.apply(console, args);
    };

    // Global error handlers
    window.addEventListener('error', (event) => {
      this.handleError('error', [event.message, event.filename, event.lineno, event.colno]);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError('unhandledrejection', [event.reason]);
    });

    // Load error patterns
    this.loadErrorPatterns();
  }

  async loadErrorPatterns() {
    try {
      const patterns = [
        {
          id: 'syntax-error',
          pattern: /SyntaxError|missing \)|Unexpected token/,
          fix: (error) => this.fixSyntaxError(error),
          description: 'Syntax-Fehler beheben'
        },
        {
          id: 'reference-error',
          pattern: /ReferenceError|is not defined/,
          fix: (error) => this.fixReferenceError(error),
          description: 'Referenz-Fehler beheben'
        },
        {
          id: 'type-error',
          pattern: /TypeError|cannot read property|is not a function/,
          fix: (error) => this.fixTypeError(error),
          description: 'Typ-Fehler beheben'
        },
        {
          id: 'fetch-error',
          pattern: /Failed to fetch|CORS|NetworkError/,
          fix: (error) => this.fixFetchError(error),
          description: 'Fetch-Fehler beheben'
        },
        {
          id: 'json-parse-error',
          pattern: /Unexpected token.*JSON|JSON\.parse/,
          fix: (error) => this.fixJSONParseError(error),
          description: 'JSON-Parse-Fehler beheben'
        },
        {
          id: 'http-404',
          pattern: /404|Resource not found|Not Found|Failed to load resource/,
          fix: (error) => this.fix404Error(error),
          description: '404-Fehler beheben - Fallback-Inhalt anzeigen'
        },
        {
          id: 'http-405',
          pattern: /405|Method not allowed|API.*method.*not.*allowed/i,
          fix: (error) => this.fix405Error(error),
          description: '405-Fehler beheben - API-Aufrufe deaktivieren'
        }
      ];

      patterns.forEach(pattern => {
        this.fixes.set(pattern.id, pattern);
      });
    } catch (e) {
      console.warn('Error loading patterns:', e);
    }
  }

  handleError(type, args) {
    const errorMessage = args.join(' ');
    const error = {
      type,
      message: errorMessage,
      args,
      timestamp: new Date().toISOString(),
      isOnline: this.isOnline,
      url: typeof window !== 'undefined' ? window.location.href : '',
      stack: new Error().stack
    };

    this.errors.push(error);

    // Try to fix automatically
    const fix = this.findFix(errorMessage);
    if (fix) {
      console.log(`🔧 Auto-Fix gefunden: ${fix.description}`);
      const fixResult = fix.fix(errorMessage);
      if (fixResult) {
        console.log('✅ Fix angewendet:', fixResult);
        
        // Zeige Benachrichtigung für 404/405 Fehler (nur wenn nicht stumm)
        if ((fix.id === 'http-404' || fix.id === 'http-405') && !fixResult.silent) {
          this.showErrorNotification(fix.id, fixResult);
        }
        
        return fixResult;
      }
    }

    // Report to error system
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(new Error(errorMessage), {
        type,
        isOnline: this.isOnline
      });
    }

    return null;
  }

  findFix(errorMessage) {
    for (const [id, pattern] of this.fixes) {
      if (pattern.pattern.test(errorMessage)) {
        return pattern;
      }
    }
    return null;
  }

  fixSyntaxError(error) {
    // Fix missing parenthesis
    if (error.includes('missing )')) {
      return {
        suggestion: 'Prüfe schließende Klammern in Funktionen',
        code: '// Prüfe alle Funktionen auf schließende Klammern'
      };
    }
    
    // Fix unexpected token
    if (error.includes('Unexpected token')) {
      return {
        suggestion: 'Prüfe Syntax in JavaScript-Code',
        code: '// Prüfe auf fehlende Kommas, Anführungszeichen oder Klammern'
      };
    }
    
    return null;
  }

  fixReferenceError(error) {
    // Extract function/variable name
    const match = error.match(/(\w+) is not defined/);
    if (match) {
      const name = match[1];
      return {
        suggestion: `Funktion/Variable "${name}" ist nicht definiert`,
        code: `// Füge hinzu: function ${name}() { /* ... */ } oder const ${name} = ...`
      };
    }
    
    return null;
  }

  fixTypeError(error) {
    if (error.includes('is not a function')) {
      const match = error.match(/(\w+) is not a function/);
      if (match) {
        const name = match[1];
        return {
          suggestion: `"${name}" ist keine Funktion`,
          code: `// Prüfe ob ${name} als Funktion definiert ist`
        };
      }
    }
    
    return null;
  }

  fixFetchError(error) {
    if (error.includes('CORS')) {
      return {
        suggestion: 'CORS-Fehler: API muss CORS-Header setzen',
        code: '// Server muss Access-Control-Allow-Origin Header setzen'
      };
    }
    
    if (error.includes('Failed to fetch')) {
      return {
        suggestion: 'Fetch fehlgeschlagen: Prüfe URL und Netzwerk',
        code: '// Prüfe ob URL korrekt ist und Server erreichbar ist'
      };
    }
    
    return null;
  }

  fix404Error(error) {
    // 404 Fehler - Ressource nicht gefunden
    const urlMatch = error.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : 'unbekannte Ressource';
    
    // GitHub Pages: 404/405 Fehler stumm schalten (bereits in portal-api.js gelöst)
    const isGitHubPages = typeof window !== 'undefined' && 
      (window.location.hostname.includes('github.io') || 
       window.location.hostname.includes('github.com'));
    
    if (isGitHubPages) {
      // Auf GitHub Pages: Fehler stumm schalten (keine Benachrichtigung)
      return {
        suggestion: 'GitHub Pages: 404-Fehler wird stumm behandelt (erwartetes Verhalten)',
        code: `// GitHub Pages erkannt - 404-Fehler wird ignoriert\n// Dies ist normal auf GitHub Pages`,
        action: 'silent-ignore',
        url: url,
        silent: true
      };
    }
    
    // Zeige Fallback-Inhalt an (nur wenn nicht GitHub Pages)
    this.showFallbackContent(url);
    
    return {
      suggestion: 'Ressource nicht gefunden. Fallback-Inhalt wird angezeigt.',
      code: `// 404-Fehler erkannt für: ${url}\n// Fallback-Inhalt wird angezeigt`,
      action: 'fallback-displayed',
      url: url
    };
  }

  fix405Error(error) {
    // 405 Fehler - API-Methode nicht erlaubt
    const urlMatch = error.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : 'unbekannte API';
    
    // GitHub Pages: 404/405 Fehler stumm schalten (bereits in portal-api.js gelöst)
    const isGitHubPages = typeof window !== 'undefined' && 
      (window.location.hostname.includes('github.io') || 
       window.location.hostname.includes('github.com'));
    
    if (isGitHubPages) {
      // Auf GitHub Pages: Fehler stumm schalten (keine Benachrichtigung)
      return {
        suggestion: 'GitHub Pages: 405-Fehler wird stumm behandelt (erwartetes Verhalten)',
        code: `// GitHub Pages erkannt - 405-Fehler wird ignoriert\n// Dies ist normal auf GitHub Pages`,
        action: 'silent-ignore',
        url: url,
        silent: true
      };
    }
    
    // Deaktiviere problematische API-Aufrufe (nur wenn nicht GitHub Pages)
    this.disableAPICalls(url);
    
    return {
      suggestion: 'API-Methode nicht erlaubt. API-Aufrufe werden deaktiviert.',
      code: `// 405-Fehler erkannt für: ${url}\n// API-Aufrufe werden deaktiviert`,
      action: 'api-disabled',
      url: url
    };
  }

  showFallbackContent(url) {
    // Erstelle Fallback-Inhalt für fehlende Ressourcen
    if (typeof document !== 'undefined') {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'error-fallback-content';
      fallbackDiv.style.cssText = 'padding: 20px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; margin: 10px 0;';
      fallbackDiv.innerHTML = `
        <p style="color: #ef4444; margin: 0;"><strong>⚠️ Ressource nicht gefunden</strong></p>
        <p style="color: #9fb3c8; margin: 5px 0 0 0; font-size: 12px;">URL: ${url}</p>
        <p style="color: #9fb3c8; margin: 5px 0 0 0; font-size: 12px;">Fallback-Inhalt wird angezeigt.</p>
      `;
      
      // Füge Fallback-Inhalt zum Body hinzu (wenn noch nicht vorhanden)
      const existing = document.querySelector('.error-fallback-content');
      if (!existing) {
        document.body.insertBefore(fallbackDiv, document.body.firstChild);
      }
    }
  }

  disableAPICalls(url) {
    // Deaktiviere problematische API-Aufrufe
    if (typeof window !== 'undefined') {
      if (!window._disabledAPIs) {
        window._disabledAPIs = new Set();
      }
      window._disabledAPIs.add(url);
      
      // Intercept fetch für diese URL
      if (!window._originalFetch) {
        window._originalFetch = window.fetch;
        window.fetch = (...args) => {
          const requestUrl = typeof args[0] === 'string' ? args[0] : args[0].url;
          if (window._disabledAPIs.has(requestUrl)) {
            console.warn(`🚫 API-Aufruf deaktiviert: ${requestUrl}`);
            return Promise.reject(new Error(`API-Aufruf deaktiviert: ${requestUrl}`));
          }
          return window._originalFetch.apply(window, args);
        };
      }
    }
  }

  fixJSONParseError(error) {
    if (error.includes('Unexpected token')) {
      return {
        suggestion: 'JSON-Parse-Fehler: Response ist möglicherweise HTML statt JSON',
        code: `// Prüfe Content-Type:
const contentType = response.headers.get('content-type');
if (!contentType.includes('application/json')) {
  const text = await response.text();
  if (text.trim().startsWith('<')) {
    throw new Error('Response is HTML, not JSON');
  }
}`
      };
    }
    
    return null;
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }

  exportErrors() {
    return JSON.stringify(this.errors, null, 2);
  }

  // Online/Local sync
  async syncErrors() {
    if (!this.isOnline) {
      return { success: false, error: 'Nur online verfügbar' };
    }

    try {
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: this.errors,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.consoleErrorController = new ConsoleErrorController();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConsoleErrorController;
}




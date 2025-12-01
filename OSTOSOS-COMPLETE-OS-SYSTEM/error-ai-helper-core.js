// T,. OSTOSOS - Error AI Helper Core
// Fehler mit Quelle, Identifikation & AI-Hilfe

const ERROR_AI_HELPER = {
  errors: [],
  
  init() {
    // Fehler-Sammlung aktivieren
    this.setupErrorCollection();
    // Lade gespeicherte Fehler
    this.loadStoredErrors();
    // Zeige Fehler an
    this.displayErrors();
  },
  
  setupErrorCollection() {
    // Window Error Handler
    window.addEventListener('error', (e) => {
      this.addError({
        type: 'JavaScript Error',
        message: e.message,
        source: e.filename || 'Unbekannt',
        line: e.lineno,
        column: e.colno,
        stack: e.error ? e.error.stack : 'Kein Stack verfügbar',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
    
    // Unhandled Promise Rejection
    window.addEventListener('unhandledrejection', (e) => {
      this.addError({
        type: 'Unhandled Promise Rejection',
        message: e.reason ? e.reason.message || String(e.reason) : 'Unbekannter Fehler',
        source: 'Promise',
        stack: e.reason ? (e.reason.stack || 'Kein Stack verfügbar') : 'Kein Stack verfügbar',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
    
    // Console Error Interception
    const originalError = console.error;
    console.error = (...args) => {
      originalError.apply(console, args);
      this.addError({
        type: 'Console Error',
        message: args.map(a => String(a)).join(' '),
        source: 'Console',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    };
  },
  
  addError(error) {
    error.id = this.generateErrorId();
    this.errors.push(error);
    this.saveErrors();
    this.displayErrors();
  },
  
  generateErrorId() {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;
  },
  
  saveErrors() {
    localStorage.setItem('ostosos.errors', JSON.stringify(this.errors));
  },
  
  loadStoredErrors() {
    const stored = localStorage.getItem('ostosos.errors');
    if (stored) {
      this.errors = JSON.parse(stored);
    }
  },
  
  displayErrors() {
    const container = document.getElementById('errorList');
    if (!container) return;
    
    if (this.errors.length === 0) {
      container.innerHTML = '<div style="color:var(--davinci-muted,#9ca3af);padding:20px;text-align:center">✅ Keine Fehler gefunden</div>';
      return;
    }
    
    container.innerHTML = this.errors.map(error => `
      <div class="error-item">
        <h3>❌ ${error.type}</h3>
        <div style="color:var(--davinci-text,#ffffff);margin-bottom:10px"><strong>Fehler:</strong> ${this.escapeHtml(error.message)}</div>
        
        <div class="error-source">
          <strong>📍 Quelle:</strong> ${this.escapeHtml(error.source || 'Unbekannt')}
          ${error.line ? ` (Zeile: ${error.line}, Spalte: ${error.column || 'N/A'})` : ''}
        </div>
        
        ${error.stack ? `
        <div class="error-stack">
          <strong>📚 Stack Trace:</strong>
          <div class="error-details">${this.formatStack(error.stack)}</div>
        </div>
        ` : ''}
        
        <div style="color:var(--davinci-muted,#9ca3af);font-size:0.85em;margin-top:10px">
          <strong>🕐 Zeitpunkt:</strong> ${new Date(error.timestamp).toLocaleString('de-DE')}<br>
          <strong>🌐 URL:</strong> ${this.escapeHtml(error.url || 'N/A')}
        </div>
        
        <div class="ai-helper">
          <h4>🤖 AI-Hilfe Prompt (für ChatGPT, etc.)</h4>
          <div class="ai-prompt" id="aiPrompt-${error.id}">${this.generateAIPrompt(error)}</div>
          <button class="btn copy-btn" onclick="copyAIPrompt('${error.id}')">📋 Prompt kopieren</button>
          <button class="btn copy-btn" onclick="openAIChat('${error.id}')">💬 ChatGPT öffnen</button>
        </div>
        
        <div style="margin-top:15px">
          <button class="btn btn-secondary" onclick="fixError('${error.id}')">🔧 Auto-Fix versuchen</button>
          <button class="btn btn-secondary" onclick="ignoreError('${error.id}')">👁️ Ignorieren</button>
          <button class="btn btn-secondary" onclick="deleteError('${error.id}')">🗑️ Löschen</button>
        </div>
      </div>
    `).join('');
  },
  
  generateAIPrompt(error) {
    return `Ich habe einen Fehler in meinem OSTOSOS Betriebssystem (Web-basiert, HTML/CSS/JavaScript).

FEHLER-DETAILS:
- Typ: ${error.type}
- Fehlermeldung: ${error.message}
- Quelle: ${error.source || 'Unbekannt'}
${error.line ? `- Zeile: ${error.line}` : ''}
${error.column ? `- Spalte: ${error.column}` : ''}
${error.stack ? `- Stack Trace:\n${error.stack}` : ''}

KONTEXT:
- Browser: ${error.userAgent || navigator.userAgent}
- URL: ${error.url || window.location.href}
- Zeitpunkt: ${new Date(error.timestamp).toLocaleString('de-DE')}

BITTE HELFE MIR:
1. Was bedeutet dieser Fehler?
2. Wo liegt das Problem genau?
3. Wie kann ich den Fehler beheben?
4. Gibt es eine Schritt-für-Schritt-Anleitung?

Bitte gib mir detaillierte Hilfeanweisungen, damit ich den Fehler selbst fixen kann.`;
  },
  
  formatStack(stack) {
    if (!stack) return 'Kein Stack verfügbar';
    return this.escapeHtml(stack).replace(/\n/g, '<br>');
  },
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  async scanForErrors() {
    // Scanne nach Fehlern
    const checks = [
      { name: 'JavaScript-Fehler', func: this.checkJavaScriptErrors },
      { name: 'CSS-Fehler', func: this.checkCSSErrors },
      { name: 'API-Fehler', func: this.checkAPIErrors },
      { name: 'LocalStorage-Fehler', func: this.checkLocalStorageErrors },
      { name: 'IndexedDB-Fehler', func: this.checkIndexedDBErrors }
    ];
    
    for (const check of checks) {
      try {
        const result = await check.func();
        if (result && result.error) {
          this.addError(result);
        }
      } catch (error) {
        this.addError({
          type: 'Scan-Fehler',
          message: `Fehler beim Scannen: ${error.message}`,
          source: check.name,
          timestamp: new Date().toISOString()
        });
      }
    }
  },
  
  checkJavaScriptErrors() {
    // Prüfe auf JavaScript-Fehler
    return null;
  },
  
  checkCSSErrors() {
    // Prüfe auf CSS-Fehler
    const stylesheets = Array.from(document.styleSheets);
    const errors = [];
    stylesheets.forEach((sheet, index) => {
      try {
        const rules = sheet.cssRules || sheet.rules;
      } catch (e) {
        errors.push({
          type: 'CSS-Fehler',
          message: `CSS-Fehler in Stylesheet ${index}: ${e.message}`,
          source: sheet.href || 'Inline',
          timestamp: new Date().toISOString()
        });
      }
    });
    return errors.length > 0 ? errors[0] : null;
  },
  
  checkAPIErrors() {
    // Prüfe auf API-Fehler
    return null;
  },
  
  checkLocalStorageErrors() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return null;
    } catch (e) {
      return {
        type: 'LocalStorage-Fehler',
        message: `LocalStorage nicht verfügbar: ${e.message}`,
        source: 'LocalStorage API',
        timestamp: new Date().toISOString()
      };
    }
  },
  
  checkIndexedDBErrors() {
    if (typeof indexedDB === 'undefined') {
      return {
        type: 'IndexedDB-Fehler',
        message: 'IndexedDB nicht verfügbar',
        source: 'IndexedDB API',
        timestamp: new Date().toISOString()
      };
    }
    return null;
  },
  
  clearErrors() {
    this.errors = [];
    this.saveErrors();
    this.displayErrors();
  },
  
  deleteError(id) {
    this.errors = this.errors.filter(e => e.id !== id);
    this.saveErrors();
    this.displayErrors();
  },
  
  ignoreError(id) {
    const error = this.errors.find(e => e.id === id);
    if (error) {
      error.ignored = true;
      this.saveErrors();
      this.displayErrors();
    }
  },
  
  async fixError(id) {
    const error = this.errors.find(e => e.id === id);
    if (!error) return;
    
    // Versuche Auto-Fix
    if (window.PLAYWRIGHT_FIXSYSTEM) {
      const fix = await window.PLAYWRIGHT_FIXSYSTEM.generateFix(error.type);
      if (fix) {
        alert(`Auto-Fix verfügbar:\n\n${fix.description}\n\nCode:\n${fix.code}`);
      } else {
        alert('Kein Auto-Fix verfügbar. Bitte verwende AI-Hilfe (ChatGPT, etc.).');
      }
    }
  }
};

function scanForErrors() {
  ERROR_AI_HELPER.scanForErrors();
}

function clearErrors() {
  if (confirm('Alle Fehler wirklich löschen?')) {
    ERROR_AI_HELPER.clearErrors();
  }
}

function copyAIPrompt(id) {
  const prompt = document.getElementById(`aiPrompt-${id}`).textContent;
  navigator.clipboard.writeText(prompt).then(() => {
    alert('Prompt in Zwischenablage kopiert!');
  });
}

function openAIChat(id) {
  const prompt = document.getElementById(`aiPrompt-${id}`).textContent;
  const encoded = encodeURIComponent(prompt);
  window.open(`https://chat.openai.com/?q=${encoded}`, '_blank');
}

function fixError(id) {
  ERROR_AI_HELPER.fixError(id);
}

function ignoreError(id) {
  ERROR_AI_HELPER.ignoreError(id);
}

function deleteError(id) {
  if (confirm('Fehler wirklich löschen?')) {
    ERROR_AI_HELPER.deleteError(id);
  }
}

window.addEventListener('load', () => {
  ERROR_AI_HELPER.init();
});

// Global verfügbar machen
window.ERROR_AI_HELPER = ERROR_AI_HELPER;


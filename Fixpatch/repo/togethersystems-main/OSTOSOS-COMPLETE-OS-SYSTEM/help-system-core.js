// T,. OSTOSOS - Hilfe-System Core
// Kontextuelle Hilfe und Dokumentation

const HELP_SYSTEM = {
  helpDatabase: {},
  
  init() {
    this.loadHelpDatabase();
    this.setupContextualHelp();
  },
  
  loadHelpDatabase() {
    // Lade Hilfe-Datenbank
    const stored = localStorage.getItem('ostosos.help.database');
    if (stored) {
      this.helpDatabase = JSON.parse(stored);
    } else {
      this.helpDatabase = this.initializeHelpDatabase();
      this.saveHelpDatabase();
    }
  },
  
  initializeHelpDatabase() {
    return {
      'dev-tools': {
        title: 'Developer Expert Tools',
        category: 'development',
        description: 'Systemanalyse, Hardware-Identifizierung, Netzwerk-Komponenten, Audio-Geräte',
        sections: [
          {
            name: 'System-Informationen',
            content: 'Zeigt detaillierte System-Informationen: OS, Browser, Display, Speicher, Performance'
          },
          {
            name: 'Hardware-Details',
            content: 'CPU, RAM, Batterie, Video/Audio-Geräte - Alle Hardware-Komponenten'
          },
          {
            name: 'Netzwerk-Komponenten',
            content: 'Verbindung, Geolocation, Netzwerk-Status'
          },
          {
            name: 'Audio-Geräte',
            content: 'Eingabe/Ausgabe-Geräte, Web Audio API, Kopfhörerstecker-Erkennung'
          }
        ],
        examples: [
          'refreshSystemInfo() - System-Info aktualisieren',
          'refreshHardwareInfo() - Hardware-Info aktualisieren',
          'exportSystemInfo() - System-Info exportieren'
        ]
      },
      'extensions-manager': {
        title: 'Erweiterungen Manager',
        category: 'management',
        description: '200+ / 2000+ Erweiterungen installieren, deinstallieren, verwalten',
        sections: [
          {
            name: 'Installation',
            content: 'Erweiterungen installieren - Einfach auf "Installieren" klicken'
          },
          {
            name: 'Deinstallation',
            content: 'Erweiterungen deinstallieren - Auf "Deinstallieren" klicken, verifizierbar und rückgängig machbar'
          },
          {
            name: 'Kategorien',
            content: 'Filter nach Core, Tools, Design, Network, etc.'
          },
          {
            name: 'Suche',
            content: 'Erweiterungen nach Name, Beschreibung oder Kategorie suchen'
          }
        ],
        examples: [
          'installExtension("extension-id") - Erweiterung installieren',
          'uninstallExtension("extension-id") - Erweiterung deinstallieren',
          'searchExtensions("query") - Erweiterungen suchen'
        ]
      },
      'playwright-fixsystem': {
        title: 'Playwright-ähnliches Fixsystem',
        category: 'quality',
        description: 'Automatische Fehlererkennung, Tests und Reparatur',
        sections: [
          {
            name: 'Vollständige Diagnose',
            content: 'Automatische System-Diagnose - Erkennt alle Fehler'
          },
          {
            name: 'Auto-Fix',
            content: 'Automatische Fehlerbehebung - Generiert Fixes für erkannte Fehler'
          },
          {
            name: 'Test-Suite',
            content: 'Alle Tests ausführen - Prüft System-Funktionalität'
          },
          {
            name: 'Code-Reparatur',
            content: 'Code analysieren und automatisch reparieren'
          }
        ],
        examples: [
          'runFullDiagnostic() - Vollständige Diagnose',
          'runAutoFix() - Auto-Fix ausführen',
          'runAllTests() - Alle Tests ausführen'
        ]
      },
      'developer-studio': {
        title: 'Developer Studio',
        category: 'development',
        description: 'Experimentieren, Erweitern, Programmieren - Alle Schnittstellen zugänglich',
        sections: [
          {
            name: 'Code Editor',
            content: 'Code schreiben, ausführen, speichern - Vollständiger Code-Editor'
          },
          {
            name: 'API-Schnittstellen',
            content: 'Zugriff auf alle API-Schnittstellen - Fetch, WebSocket, etc.'
          },
          {
            name: 'Erweiterung erstellen',
            content: 'Eigene Erweiterungen programmieren - Template-basiert'
          },
          {
            name: 'Experiment-Modus',
            content: 'Sandbox-Modus - Experimentieren ohne System zu beschädigen'
          },
          {
            name: 'Aktionen-Historie',
            content: 'Rückgängig/Wiederholen - Alle Aktionen sind rückgängig machbar'
          }
        ],
        examples: [
          'loadTool("api") - API-Schnittstellen laden',
          'executeCode() - Code ausführen',
          'undoAction() - Aktion rückgängig machen'
        ]
      },
      'error-ai-helper': {
        title: 'Error AI Helper',
        category: 'quality',
        description: 'Fehler mit Quelle, Identifikation & AI-Hilfe',
        sections: [
          {
            name: 'Fehler-Erkennung',
            content: 'Automatische Fehler-Erkennung mit Quelle und Stack Trace'
          },
          {
            name: 'AI-Hilfe Prompt',
            content: 'Generiert Prompt für ChatGPT, etc. - Detaillierte Hilfeanweisungen'
          },
          {
            name: 'Auto-Fix',
            content: 'Versucht automatische Fehlerbehebung'
          },
          {
            name: 'Fehler-Verwaltung',
            content: 'Fehler ignorieren, löschen, exportieren'
          }
        ],
        examples: [
          'scanForErrors() - Fehler scannen',
          'copyAIPrompt(id) - AI-Prompt kopieren',
          'fixError(id) - Fehler automatisch fixen'
        ]
      }
    };
  },
  
  saveHelpDatabase() {
    localStorage.setItem('ostosos.help.database', JSON.stringify(this.helpDatabase));
  },
  
  setupContextualHelp() {
    // Tooltip-System für alle interaktiven Elemente
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      const helpKey = target.dataset.help || target.closest('[data-help]')?.dataset.help;
      
      if (helpKey && this.helpDatabase[helpKey]) {
        this.showTooltip(target, this.helpDatabase[helpKey]);
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      this.hideTooltip();
    });
  },
  
  showTooltip(element, helpData) {
    // Entferne existierende Tooltips
    const existing = document.querySelector('.help-tooltip');
    if (existing) existing.remove();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'help-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: var(--davinci-card, #1a1f3a);
      border: 2px solid var(--davinci-accent-primary, #10b981);
      border-radius: 8px;
      padding: 15px;
      max-width: 400px;
      z-index: 10000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      pointer-events: none;
    `;
    
    tooltip.innerHTML = `
      <h4 style="color: var(--davinci-accent-primary, #10b981); margin-bottom: 10px">${helpData.title}</h4>
      <p style="color: var(--davinci-text, #ffffff); font-size: 0.9em; margin-bottom: 10px">${helpData.description}</p>
      ${helpData.sections ? `
      <div style="margin-top: 10px">
        <strong style="color: var(--davinci-accent-primary, #10b981)">Bereiche:</strong>
        <ul style="margin-left: 20px; margin-top: 5px; font-size: 0.85em; color: var(--davinci-muted, #9ca3af)">
          ${helpData.sections.map(s => `<li>${s.name}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      ${helpData.examples ? `
      <div style="margin-top: 10px">
        <strong style="color: var(--davinci-accent-primary, #10b981)">Beispiele:</strong>
        <div style="background: #1e1e1e; padding: 10px; border-radius: 6px; margin-top: 5px; font-family: monospace; font-size: 0.8em; color: #d4d4d4">
          ${helpData.examples.map(e => `<div>${e}</div>`).join('')}
        </div>
      </div>
      ` : ''}
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--davinci-border, #223040)">
        <a href="./help/${helpData.category}/${helpData.title.toLowerCase().replace(/\s+/g, '-')}.html" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 0.9em">📖 Vollständige Dokumentation →</a>
      </div>
    `;
    
    document.body.appendChild(tooltip);
    
    // Positioniere Tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.right + 10) + 'px';
    tooltip.style.top = rect.top + 'px';
    
    // Anpassen falls außerhalb des Viewports
    setTimeout(() => {
      const tooltipRect = tooltip.getBoundingClientRect();
      if (tooltipRect.right > window.innerWidth) {
        tooltip.style.left = (rect.left - tooltipRect.width - 10) + 'px';
      }
      if (tooltipRect.bottom > window.innerHeight) {
        tooltip.style.top = (window.innerHeight - tooltipRect.height - 10) + 'px';
      }
    }, 0);
  },
  
  hideTooltip() {
    const tooltip = document.querySelector('.help-tooltip');
    if (tooltip) tooltip.remove();
  },
  
  getHelp(key) {
    return this.helpDatabase[key] || null;
  },
  
  searchHelp(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    Object.entries(this.helpDatabase).forEach(([key, data]) => {
      if (
        data.title.toLowerCase().includes(lowerQuery) ||
        data.description.toLowerCase().includes(lowerQuery) ||
        (data.sections && data.sections.some(s => s.name.toLowerCase().includes(lowerQuery)))
      ) {
        results.push({ key, ...data });
      }
    });
    
    return results;
  }
};

window.HELP_SYSTEM = HELP_SYSTEM;

window.addEventListener('load', () => {
  HELP_SYSTEM.init();
});


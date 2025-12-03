// T,. OSTOSOS - Developer Studio Core
// Experimentieren, Erweitern, Programmieren

const DEVELOPER_STUDIO = {
  history: [],
  historyIndex: -1,
  currentTool: null,
  
  init() {
    this.loadHistory();
    this.setupHelpSystem();
    this.setupCodeEditor();
  },
  
  setupHelpSystem() {
    // Kontextuelle Hilfe bei Mausbewegung
    document.addEventListener('mousemove', (e) => {
      const target = e.target;
      if (target.classList.contains('tool-item') || target.closest('.tool-item')) {
        this.showContextualHelp(target);
      }
    });
  },
  
  showContextualHelp(element) {
    const helpContent = document.getElementById('helpContent');
    const toolName = element.textContent.trim();
    const help = this.getHelpForTool(toolName);
    
    if (help) {
      helpContent.innerHTML = `
        <div style="background:var(--davinci-bg,#0f172a);padding:15px;border-radius:8px;border-left:3px solid var(--davinci-accent-primary,#10b981)">
          <h4 style="color:var(--davinci-accent-primary,#10b981);margin-bottom:10px">${toolName}</h4>
          <p style="color:var(--davinci-text,#ffffff);font-size:0.9em;line-height:1.6">${help.description}</p>
          ${help.example ? `
          <div style="margin-top:15px;padding:10px;background:#1e1e1e;border-radius:6px;font-family:monospace;font-size:0.85em;color:#d4d4d4">
            <strong style="color:#10b981">Beispiel:</strong><br>
            ${help.example}
          </div>
          ` : ''}
          ${help.docs ? `
          <div style="margin-top:10px">
            <a href="${help.docs}" target="_blank" style="color:#3b82f6;text-decoration:none;font-size:0.9em">📖 Vollständige Dokumentation →</a>
          </div>
          ` : ''}
        </div>
      `;
    }
  },
  
  getHelpForTool(toolName) {
    const helpDatabase = {
      '🌐 API-Schnittstellen': {
        description: 'Zugriff auf alle API-Schnittstellen des Systems. Experimentiere mit REST-APIs, WebSocket, Fetch, etc.',
        example: 'fetch("/api/data")\n  .then(r => r.json())\n  .then(data => console.log(data));',
        docs: './help/api-interfaces.html'
      },
      '💾 Storage-APIs': {
        description: 'LocalStorage, SessionStorage, IndexedDB - Alle Storage-APIs für Datenpersistenz.',
        example: 'localStorage.setItem("key", "value");\nconst data = localStorage.getItem("key");',
        docs: './help/storage-apis.html'
      },
      '🌐 Netzwerk-APIs': {
        description: 'Netzwerk-Funktionen: WebSocket, Fetch, XMLHttpRequest, Connection API.',
        example: 'const ws = new WebSocket("wss://...");\nws.onmessage = (e) => console.log(e.data);',
        docs: './help/network-apis.html'
      },
      '🎵 Media-APIs': {
        description: 'Audio, Video, MediaStream, WebRTC - Alle Media-Funktionen.',
        example: 'navigator.mediaDevices.getUserMedia({video:true})\n  .then(stream => {...});',
        docs: './help/media-apis.html'
      },
      '📱 Device-APIs': {
        description: 'Device-Informationen: Battery API, Device Orientation, Vibration, etc.',
        example: 'navigator.getBattery().then(battery => {\n  console.log(battery.level);\n});',
        docs: './help/device-apis.html'
      },
      '📦 Erweiterung erstellen': {
        description: 'Erstelle eigene Erweiterungen für OSTOSOS. Definiere Funktionen, UI, Konfiguration.',
        example: 'const extension = {\n  id: "my-extension",\n  name: "Meine Erweiterung",\n  init: () => {...}\n};',
        docs: './help/create-extension.html'
      },
      '🧪 Test erstellen': {
        description: 'Erstelle eigene Tests für Erweiterungen oder System-Komponenten.',
        example: 'test("Mein Test", () => {\n  expect(result).toBe(expected);\n});',
        docs: './help/create-test.html'
      },
      '🔬 Experiment-Modus': {
        description: 'Sicherer Sandbox-Modus zum Experimentieren ohne System zu beschädigen.',
        example: '// Alle Änderungen sind temporär\n// System bleibt unverändert',
        docs: './help/experiment-mode.html'
      }
    };
    
    return helpDatabase[toolName] || null;
  },
  
  setupCodeEditor() {
    const editor = document.getElementById('codeEditor');
    if (editor) {
      editor.addEventListener('input', () => {
        this.addToHistory('code-change', editor.value);
      });
    }
  },
  
  loadTool(tool) {
    this.currentTool = tool;
    const editor = document.getElementById('codeEditor');
    const title = document.getElementById('editorTitle');
    
    const templates = {
      api: {
        title: 'API-Schnittstellen',
        code: `// API-Schnittstellen Beispiel\n\n// Fetch API\nfetch('/api/data')\n  .then(response => response.json())\n  .then(data => {\n    console.log('Daten:', data);\n  })\n  .catch(error => {\n    console.error('Fehler:', error);\n  });\n\n// WebSocket\nconst ws = new WebSocket('wss://example.com');\nws.onmessage = (event) => {\n  console.log('Nachricht:', event.data);\n};`
      },
      storage: {
        title: 'Storage-APIs',
        code: `// Storage-APIs Beispiel\n\n// LocalStorage\nlocalStorage.setItem('key', 'value');\nconst value = localStorage.getItem('key');\n\n// IndexedDB\nconst request = indexedDB.open('myDB', 1);\nrequest.onsuccess = (event) => {\n  const db = event.target.result;\n  console.log('Datenbank geöffnet:', db);\n};`
      },
      network: {
        title: 'Netzwerk-APIs',
        code: `// Netzwerk-APIs Beispiel\n\n// Connection API\nconst connection = navigator.connection || navigator.mozConnection;\nif (connection) {\n  console.log('Verbindung:', connection.effectiveType);\n}\n\n// Fetch mit Abort\nconst controller = new AbortController();\nfetch('/api/data', { signal: controller.signal });`
      },
      media: {
        title: 'Media-APIs',
        code: `// Media-APIs Beispiel\n\n// GetUserMedia\nnavigator.mediaDevices.getUserMedia({ video: true, audio: true })\n  .then(stream => {\n    console.log('Stream erhalten:', stream);\n  })\n  .catch(error => {\n    console.error('Fehler:', error);\n  });`
      },
      device: {
        title: 'Device-APIs',
        code: `// Device-APIs Beispiel\n\n// Battery API\nnavigator.getBattery().then(battery => {\n  console.log('Batterie:', battery.level * 100 + '%');\n});\n\n// Device Orientation\nwindow.addEventListener('deviceorientation', (e) => {\n  console.log('Orientierung:', e.alpha, e.beta, e.gamma);\n});`
      },
      extension: {
        title: 'Erweiterung erstellen',
        code: `// OSTOSOS Erweiterung Template\n\nconst myExtension = {\n  id: 'my-custom-extension',\n  name: 'Meine Erweiterung',\n  version: '1.0.0',\n  category: 'tools',\n  description: 'Beschreibung meiner Erweiterung',\n  \n  init: function() {\n    console.log('Erweiterung initialisiert');\n    // Initialisierung\n  },\n  \n  execute: function() {\n    // Hauptfunktion\n  },\n  \n  cleanup: function() {\n    // Aufräumen\n  }\n};\n\n// Registrieren\nif (window.EXTENSIONS_REGISTRY) {\n  window.EXTENSIONS_REGISTRY.extensions.push(myExtension);\n}`
      },
      test: {
        title: 'Test erstellen',
        code: `// Test Template\n\nconst myTest = {\n  name: 'Mein Test',\n  category: 'custom',\n  \n  run: async function() {\n    // Test-Logik\n    const result = await someFunction();\n    \n    if (result === expected) {\n      return { passed: true, message: 'Test bestanden' };\n    } else {\n      return { passed: false, message: 'Test fehlgeschlagen' };\n    }\n  }\n};\n\n// Test ausführen\nmyTest.run().then(result => {\n  console.log('Test-Ergebnis:', result);\n});`
      },
      experiment: {
        title: 'Experiment-Modus',
        code: `// Experiment-Modus - Sandbox\n\n// Alle Änderungen sind temporär\n// System bleibt unverändert\n\nconst experiment = {\n  // Experiment-Code hier\n  test: () => {\n    console.log('Experiment läuft...');\n  }\n};\n\nexperiment.test();`
      }
    };
    
    const template = templates[tool];
    if (template) {
      title.textContent = template.title;
      editor.value = template.code;
      this.addToHistory('tool-loaded', tool);
    }
  },
  
  executeCode() {
    const code = document.getElementById('codeEditor').value;
    const output = document.getElementById('codeOutput');
    output.style.display = 'block';
    output.innerHTML = '<div style="color:#3b82f6">▶️ Code wird ausgeführt...</div>';
    
    try {
      // Sandbox-Ausführung
      const result = eval(code);
      output.innerHTML = `<div style="color:#22c55e">✅ Ausführung erfolgreich</div><div style="color:#d4d4d4;margin-top:10px">Resultat: ${JSON.stringify(result, null, 2)}</div>`;
      this.addToHistory('code-executed', code);
    } catch (error) {
      output.innerHTML = `<div style="color:#ef4444">❌ Fehler: ${error.message}</div><div style="color:#f59e0b;margin-top:10px;font-size:0.9em">Stack: ${error.stack}</div>`;
      // Fehler an Error AI Helper weiterleiten
      if (window.ERROR_AI_HELPER) {
        window.ERROR_AI_HELPER.addError({
          type: 'Developer Studio Error',
          message: error.message,
          source: 'Developer Studio',
          stack: error.stack,
          timestamp: new Date().toISOString(),
          code: code
        });
      }
    }
  },
  
  saveCode() {
    const code = document.getElementById('codeEditor').value;
    const tool = this.currentTool || 'general';
    localStorage.setItem(`ostosos.dev.code.${tool}`, code);
    this.addToHistory('code-saved', tool);
    alert('Code gespeichert!');
  },
  
  loadCode() {
    const tool = this.currentTool || 'general';
    const code = localStorage.getItem(`ostosos.dev.code.${tool}`);
    if (code) {
      document.getElementById('codeEditor').value = code;
      this.addToHistory('code-loaded', tool);
      alert('Code geladen!');
    } else {
      alert('Kein gespeicherter Code gefunden!');
    }
  },
  
  addToHistory(action, data) {
    const historyItem = {
      action,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Entferne alle Items nach currentIndex (für Redo)
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    this.history.push(historyItem);
    this.historyIndex = this.history.length - 1;
    
    // Max 50 Einträge
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
    
    this.saveHistory();
    this.updateHistoryDisplay();
  },
  
  undoAction() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreFromHistory();
      this.updateHistoryDisplay();
    }
  },
  
  redoAction() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreFromHistory();
      this.updateHistoryDisplay();
    }
  },
  
  restoreFromHistory() {
    const item = this.history[this.historyIndex];
    if (item && item.action === 'code-change') {
      document.getElementById('codeEditor').value = item.data;
    }
  },
  
  updateHistoryDisplay() {
    const container = document.getElementById('historyList');
    if (this.history.length === 0) {
      container.innerHTML = '<div style="color:var(--davinci-muted,#9ca3af);padding:10px;text-align:center;font-size:0.9em">Keine Aktionen</div>';
      return;
    }
    
    container.innerHTML = this.history.slice().reverse().map((item, index) => {
      const actualIndex = this.history.length - 1 - index;
      const isActive = actualIndex === this.historyIndex;
      return `
        <div class="history-item" onclick="restoreHistoryItem(${actualIndex})" style="${isActive ? 'border-left:3px solid var(--davinci-accent-primary,#10b981)' : ''}">
          <strong>${this.getActionName(item.action)}</strong><br>
          <span style="color:var(--davinci-muted,#9ca3af);font-size:0.8em">${new Date(item.timestamp).toLocaleTimeString('de-DE')}</span>
        </div>
      `;
    }).join('');
  },
  
  getActionName(action) {
    const names = {
      'code-change': 'Code geändert',
      'code-executed': 'Code ausgeführt',
      'code-saved': 'Code gespeichert',
      'code-loaded': 'Code geladen',
      'tool-loaded': 'Tool geladen'
    };
    return names[action] || action;
  },
  
  saveHistory() {
    localStorage.setItem('ostosos.dev.history', JSON.stringify(this.history));
    localStorage.setItem('ostosos.dev.historyIndex', this.historyIndex);
  },
  
  loadHistory() {
    const stored = localStorage.getItem('ostosos.dev.history');
    const storedIndex = localStorage.getItem('ostosos.dev.historyIndex');
    if (stored) {
      this.history = JSON.parse(stored);
      this.historyIndex = parseInt(storedIndex) || this.history.length - 1;
      this.updateHistoryDisplay();
    }
  },
  
  clearHistory() {
    if (confirm('Historie wirklich löschen?')) {
      this.history = [];
      this.historyIndex = -1;
      this.saveHistory();
      this.updateHistoryDisplay();
    }
  }
};

function loadTool(tool) {
  DEVELOPER_STUDIO.loadTool(tool);
}

function executeCode() {
  DEVELOPER_STUDIO.executeCode();
}

function saveCode() {
  DEVELOPER_STUDIO.saveCode();
}

function loadCode() {
  DEVELOPER_STUDIO.loadCode();
}

function undoAction() {
  DEVELOPER_STUDIO.undoAction();
}

function redoAction() {
  DEVELOPER_STUDIO.redoAction();
}

function clearHistory() {
  DEVELOPER_STUDIO.clearHistory();
}

function restoreHistoryItem(index) {
  DEVELOPER_STUDIO.historyIndex = index;
  DEVELOPER_STUDIO.restoreFromHistory();
  DEVELOPER_STUDIO.updateHistoryDisplay();
}

window.addEventListener('load', () => {
  DEVELOPER_STUDIO.init();
});

window.DEVELOPER_STUDIO = DEVELOPER_STUDIO;


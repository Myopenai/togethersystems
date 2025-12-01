// T,. OSTOSOS - AI Chat System Core
// Hybrid-Lösung: Transformers.js (Offline) + Online APIs (Optional)

const AI_CHAT_SYSTEM = {
  mode: 'auto', // 'offline', 'online', 'auto'
  context: ['settings', 'extensions', 'system'],
  messages: [],
  model: null,
  onlineAPI: null,
  
  async init() {
    this.updateStatus('Initialisiere AI-System...', 'loading');
    
    // Lade gespeicherte Einstellungen
    this.loadSettings();
    
    // Initialisiere Offline-Modell (Transformers.js)
    try {
      await this.initOfflineModel();
      this.updateStatus('Offline-Modus bereit', 'offline');
    } catch (error) {
      console.error('Offline-Modell konnte nicht geladen werden:', error);
      this.updateStatus('Offline-Modus nicht verfügbar', 'offline');
    }
    
    // Prüfe Online-Verfügbarkeit
    if (navigator.onLine) {
      try {
        await this.initOnlineAPI();
        this.updateStatus('Online-Modus verfügbar', 'online');
      } catch (error) {
        console.error('Online-API konnte nicht initialisiert werden:', error);
      }
    }
    
    // Lade Chat-Historie
    this.loadHistory();
    
    // Event-Listener
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    document.getElementById('aiMode').addEventListener('change', (e) => {
      this.mode = e.target.value;
      this.saveSettings();
      this.updateStatus(this.getStatusText(), this.getStatusType());
    });
    
    document.getElementById('contextMode').addEventListener('change', (e) => {
      this.context = Array.from(e.target.selectedOptions).map(o => o.value);
      this.saveSettings();
    });
  },
  
  async initOfflineModel() {
    // Transformers.js wird dynamisch geladen
    // Für Produktion: CDN oder lokale Datei
    if (typeof window.pipeline === 'undefined') {
      // Lade Transformers.js
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        setTimeout(reject, 10000); // Timeout nach 10 Sekunden
      });
    }
    
    // Initialisiere Modell (kleines Modell für Geschwindigkeit)
    try {
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
      this.model = await pipeline('text-generation', 'Xenova/phi-3-mini-4k-instruct', {
        device: 'webgpu', // Oder 'cpu' als Fallback
        dtype: 'q8' // Quantisiert für Geschwindigkeit
      });
      console.log('Offline-Modell geladen:', 'Xenova/phi-3-mini-4k-instruct');
    } catch (error) {
      console.warn('Transformers.js konnte nicht geladen werden, verwende Fallback:', error);
      // Fallback: Einfache Regel-basierte Antworten
      this.model = 'fallback';
    }
  },
  
  async initOnlineAPI() {
    // Prüfe ob API-Endpoint verfügbar ist
    try {
      const response = await fetch('/api/ai/status', { method: 'GET' });
      if (response.ok) {
        this.onlineAPI = 'available';
        return true;
      }
    } catch (error) {
      // API nicht verfügbar, aber das ist OK
      this.onlineAPI = null;
    }
    return false;
  },
  
  async generateResponse(prompt) {
    const context = this.buildContext(prompt);
    const fullPrompt = this.formatPrompt(context);
    
    // Wähle Modus
    if (this.mode === 'offline' || (this.mode === 'auto' && !navigator.onLine)) {
      return await this.generateOffline(fullPrompt);
    } else if (this.mode === 'online' && navigator.onLine) {
      return await this.generateOnline(fullPrompt);
    } else {
      // Auto: Versuche Online, Fallback zu Offline
      try {
        return await this.generateOnline(fullPrompt);
      } catch (error) {
        console.warn('Online-Generierung fehlgeschlagen, verwende Offline:', error);
        return await this.generateOffline(fullPrompt);
      }
    }
  },
  
  async generateOffline(prompt) {
    if (this.model === 'fallback') {
      return this.generateFallbackResponse(prompt);
    }
    
    try {
      const output = await this.model(prompt, {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true
      });
      
      return output[0].generated_text.replace(prompt, '').trim();
    } catch (error) {
      console.error('Offline-Generierung fehlgeschlagen:', error);
      return this.generateFallbackResponse(prompt);
    }
  },
  
  async generateOnline(prompt) {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: this.context })
      });
      
      if (!response.ok) throw new Error('API-Fehler');
      
      const data = await response.json();
      return data.response || data.text || 'Keine Antwort erhalten';
    } catch (error) {
      console.error('Online-Generierung fehlgeschlagen:', error);
      throw error;
    }
  },
  
  generateFallbackResponse(prompt) {
    // Einfache Regel-basierte Antworten als Fallback
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('fehler') || lowerPrompt.includes('error')) {
      return `Ich kann dir bei Fehlern helfen. Bitte beschreibe den Fehler genauer:\n- Was ist die Fehlermeldung?\n- Wo tritt der Fehler auf?\n- Was hast du vorher gemacht?\n\nDu kannst auch den Error AI Helper verwenden für detaillierte Fehleranalyse.`;
    }
    
    if (lowerPrompt.includes('code') || lowerPrompt.includes('programm')) {
      return `Ich kann dir bei Code helfen. Du kannst:\n- Code erklären lassen\n- Code optimieren\n- Code dokumentieren\n- Fehler im Code finden\n\nFüge den Code ein oder beschreibe was du brauchst.`;
    }
    
    if (lowerPrompt.includes('settings') || lowerPrompt.includes('einstellung')) {
      return `Ich kann dir bei Settings helfen:\n- Settings-Ordner verstehen\n- Settings erstellen\n- Settings optimieren\n- Erweiterungen-Settings verwalten\n\nWas möchtest du wissen?`;
    }
    
    return `Ich verstehe deine Frage. Für bessere Antworten:\n- Stelle spezifische Fragen\n- Füge Code oder Fehlermeldungen ein\n- Beschreibe dein Problem genau\n\nDu kannst auch zwischen Offline/Online-Modus wechseln für bessere Qualität.`;
  },
  
  buildContext(prompt) {
    const context = {
      prompt,
      mode: this.mode,
      context: this.context,
      timestamp: new Date().toISOString()
    };
    
    // Settings-Ordner-Kontext
    if (this.context.includes('settings')) {
      try {
        const settings = localStorage.getItem('ostosos.settings.registry');
        if (settings) {
          context.settings = JSON.parse(settings);
        }
      } catch (e) {
        console.warn('Settings-Kontext konnte nicht geladen werden:', e);
      }
    }
    
    // Erweiterungen-Kontext
    if (this.context.includes('extensions')) {
      try {
        const extensions = localStorage.getItem('ostosos.extensions.registry');
        if (extensions) {
          context.extensions = JSON.parse(extensions);
        }
      } catch (e) {
        console.warn('Erweiterungen-Kontext konnte nicht geladen werden:', e);
      }
    }
    
    // System-Info-Kontext
    if (this.context.includes('system')) {
      context.system = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        online: navigator.onLine
      };
    }
    
    return context;
  },
  
  formatPrompt(context) {
    let prompt = context.prompt;
    
    if (context.settings) {
      prompt += `\n\n[Settings-Kontext: ${JSON.stringify(context.settings).substring(0, 500)}]`;
    }
    
    if (context.extensions) {
      prompt += `\n\n[Erweiterungen-Kontext: ${JSON.stringify(context.extensions).substring(0, 500)}]`;
    }
    
    if (context.system) {
      prompt += `\n\n[System-Info: ${JSON.stringify(context.system)}]`;
    }
    
    return prompt;
  },
  
  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Zeige User-Nachricht
    this.addMessage('user', message);
    input.value = '';
    
    // Zeige Typing-Indicator
    this.showTyping(true);
    
    try {
      // Generiere Antwort
      const response = await this.generateResponse(message);
      
      // Zeige AI-Antwort
      this.addMessage('ai', response);
      
      // Speichere in Historie
      this.messages.push({ role: 'user', content: message });
      this.messages.push({ role: 'assistant', content: response });
      this.saveHistory();
    } catch (error) {
      console.error('Fehler bei Nachricht:', error);
      this.addMessage('ai', `❌ Fehler: ${error.message}\n\nBitte versuche es erneut oder wechsle den Modus.`);
    } finally {
      this.showTyping(false);
    }
  },
  
  addMessage(role, content) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    if (role === 'user') {
      messageDiv.innerHTML = `<strong>👤 Du:</strong> ${this.formatMessage(content)}`;
    } else {
      messageDiv.innerHTML = `<strong>🤖 AI:</strong> ${this.formatMessage(content)}`;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },
  
  formatMessage(content) {
    // Formatierung für Code-Blöcke
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${this.escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Formatierung für Inline-Code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Formatierung für Zeilenumbrüche
    content = content.replace(/\n/g, '<br>');
    
    return content;
  },
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  showTyping(show) {
    const indicator = document.getElementById('typingIndicator');
    const sendBtn = document.getElementById('sendBtn');
    
    if (show) {
      indicator.classList.add('active');
      sendBtn.disabled = true;
    } else {
      indicator.classList.remove('active');
      sendBtn.disabled = false;
    }
  },
  
  updateStatus(text, type) {
    document.getElementById('statusText').textContent = text;
    const indicator = document.getElementById('statusIndicator');
    indicator.className = `status-indicator status-${type}`;
  },
  
  getStatusText() {
    switch (this.mode) {
      case 'offline': return 'Offline-Modus aktiv';
      case 'online': return navigator.onLine ? 'Online-Modus aktiv' : 'Online-Modus (keine Verbindung)';
      case 'auto': return navigator.onLine ? 'Auto-Modus (Online verfügbar)' : 'Auto-Modus (Offline)';
      default: return 'Unbekannter Modus';
    }
  },
  
  getStatusType() {
    if (this.mode === 'offline') return 'offline';
    if (this.mode === 'online' && !navigator.onLine) return 'offline';
    return 'online';
  },
  
  loadSettings() {
    const saved = localStorage.getItem('ostosos.ai.settings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.mode = settings.mode || 'auto';
      this.context = settings.context || ['settings', 'extensions', 'system'];
      
      document.getElementById('aiMode').value = this.mode;
      const contextSelect = document.getElementById('contextMode');
      Array.from(contextSelect.options).forEach(opt => {
        opt.selected = this.context.includes(opt.value);
      });
    }
  },
  
  saveSettings() {
    localStorage.setItem('ostosos.ai.settings', JSON.stringify({
      mode: this.mode,
      context: this.context
    }));
  },
  
  loadHistory() {
    const saved = localStorage.getItem('ostosos.ai.history');
    if (saved) {
      this.messages = JSON.parse(saved);
      // Zeige letzte 10 Nachrichten
      const recent = this.messages.slice(-10);
      recent.forEach(msg => {
        this.addMessage(msg.role, msg.content);
      });
    }
  },
  
  saveHistory() {
    // Speichere nur letzte 50 Nachrichten
    const toSave = this.messages.slice(-50);
    localStorage.setItem('ostosos.ai.history', JSON.stringify(toSave));
  },
  
  clearHistory() {
    if (confirm('Chat-Historie wirklich löschen?')) {
      this.messages = [];
      localStorage.removeItem('ostosos.ai.history');
      document.getElementById('chatMessages').innerHTML = `
        <div class="message ai">
          <strong>🤖 AI:</strong> Historie gelöscht. Wie kann ich dir helfen?
        </div>
      `;
    }
  },
  
  exportHistory() {
    const data = JSON.stringify(this.messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ostosos-ai-chat-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

function sendMessage() {
  AI_CHAT_SYSTEM.sendMessage();
}

function quickAction(action) {
  const input = document.getElementById('chatInput');
  
  switch (action) {
    case 'explain':
      input.value = 'Erkläre mir diesen Code:\n\n[Code hier einfügen]';
      break;
    case 'fix':
      input.value = 'Fix diesen Fehler:\n\n[Fehlermeldung hier einfügen]';
      break;
    case 'optimize':
      input.value = 'Optimiere diesen Code:\n\n[Code hier einfügen]';
      break;
    case 'document':
      input.value = 'Erstelle Dokumentation für:\n\n[Code/Funktion hier einfügen]';
      break;
  }
  
  input.focus();
}

function clearHistory() {
  AI_CHAT_SYSTEM.clearHistory();
}

function exportHistory() {
  AI_CHAT_SYSTEM.exportHistory();
}

window.addEventListener('load', () => {
  AI_CHAT_SYSTEM.init();
});

window.AI_CHAT_SYSTEM = AI_CHAT_SYSTEM;


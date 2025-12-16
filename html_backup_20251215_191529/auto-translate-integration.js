// Automatische Übersetzung - Frontend-Integration
// Nutzt DeepL über AI Gateway

class AutoTranslate {
  constructor(apiBase = '/api') {
    this.apiBase = apiBase;
    this.supportedLanguages = [
      { code: 'DE', name: 'Deutsch' },
      { code: 'EN', name: 'English' },
      { code: 'FR', name: 'Français' },
      { code: 'ES', name: 'Español' },
      { code: 'IT', name: 'Italiano' },
      { code: 'NL', name: 'Nederlands' },
      { code: 'PL', name: 'Polski' },
      { code: 'PT', name: 'Português' },
      { code: 'RU', name: 'Русский' },
      { code: 'ZH', name: '中文' },
      { code: 'JA', name: '日本語' },
    ];
    this.userLanguage = this.detectLanguage();
  }

  // Browser-Sprache erkennen
  detectLanguage() {
    const lang = navigator.language || navigator.userLanguage || 'EN';
    const langCode = lang.split('-')[0].toUpperCase();
    
    // Prüfe ob unterstützt
    const supported = this.supportedLanguages.find(l => l.code === langCode);
    return supported ? langCode : 'EN';
  }

  // Einzelnen Text übersetzen
  async translate(text, targetLang = null, sourceLang = 'auto') {
    if (!text || !text.trim()) return text;
    
    const target = targetLang || this.userLanguage;
    
    try {
      const response = await fetch(`${this.apiBase}/ai/gateway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'translate',
          input: text,
          options: {
            target_language: target,
            source_language: sourceLang,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API-Fehler: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.ok && data.result) {
        return data.result;
      }
      
      throw new Error(data.error || 'Übersetzung fehlgeschlagen');
    } catch (err) {
      console.error('Übersetzungs-Fehler:', err);
      return text; // Fallback: Originaltext
    }
  }

  // Post automatisch übersetzen
  async translatePost(post, targetLang = null) {
    const target = targetLang || this.userLanguage;
    
    const translatedPost = {
      ...post,
      originalContent: post.content, // Original speichern
      originalTitle: post.title,
    };
    
    // Titel übersetzen
    if (post.title) {
      translatedPost.title = await this.translate(post.title, target);
    }
    
    // Inhalt übersetzen
    if (post.content) {
      translatedPost.content = await this.translate(post.content, target);
    }
    
    // Tags übersetzen
    if (post.tags && Array.isArray(post.tags)) {
      translatedPost.tags = await Promise.all(
        post.tags.map(tag => this.translate(tag, target))
      );
    }
    
    return translatedPost;
  }

  // Automatische Übersetzung für alle Posts im Feed
  async translateFeed(posts, targetLang = null) {
    const target = targetLang || this.userLanguage;
    const translatedPosts = [];
    
    for (const post of posts) {
      // Prüfe ob bereits in Zielsprache
      if (post.language === target) {
        translatedPosts.push(post);
        continue;
      }
      
      // Übersetzen
      const translated = await this.translatePost(post, target);
      translated.language = target;
      translatedPosts.push(translated);
    }
    
    return translatedPosts;
  }

  // UI-Integration: Übersetzungs-Button zu Post hinzufügen
  addTranslateButton(postElement, post) {
    // Prüfe ob Button bereits existiert
    if (postElement.querySelector('.translate-btn')) return;
    
    const button = document.createElement('button');
    button.className = 'btn secondary translate-btn';
    button.innerHTML = '🌐 Übersetzen';
    button.onclick = async () => {
      button.disabled = true;
      button.innerHTML = '⏳ Übersetze...';
      
      try {
        const translated = await this.translatePost(post);
        
        // Post-Inhalt aktualisieren
        const contentEl = postElement.querySelector('.post-content, .entry-content');
        if (contentEl) {
          contentEl.textContent = translated.content;
        }
        
        const titleEl = postElement.querySelector('.post-title, .entry-title, h3');
        if (titleEl && translated.title) {
          titleEl.textContent = translated.title;
        }
        
        button.innerHTML = '✅ Übersetzt';
        button.disabled = false;
      } catch (err) {
        button.innerHTML = '❌ Fehler';
        button.disabled = false;
        alert('Übersetzung fehlgeschlagen: ' + err.message);
      }
    };
    
    // Button zum Post hinzufügen
    const actionsEl = postElement.querySelector('.post-actions, .entry-actions');
    if (actionsEl) {
      actionsEl.appendChild(button);
    } else {
      // Erstelle Actions-Bereich
      const actions = document.createElement('div');
      actions.className = 'post-actions';
      actions.style.cssText = 'margin-top:8px;display:flex;gap:4px;';
      actions.appendChild(button);
      postElement.appendChild(actions);
    }
  }

  // Sprache wechseln
  setLanguage(langCode) {
    if (this.supportedLanguages.find(l => l.code === langCode)) {
      this.userLanguage = langCode;
      localStorage.setItem('user_preferred_language', langCode);
      return true;
    }
    return false;
  }

  // Gespeicherte Sprache laden
  loadSavedLanguage() {
    try {
      const saved = localStorage.getItem('user_preferred_language');
      if (saved && this.supportedLanguages.find(l => l.code === saved)) {
        this.userLanguage = saved;
        return saved;
      }
    } catch (e) {
      console.error('Sprache laden Fehler:', e);
    }
    return this.userLanguage;
  }
}

// Globale Instanz
const autoTranslate = new AutoTranslate();

// Auto-Init: Gespeicherte Sprache laden
if (typeof window !== 'undefined') {
  autoTranslate.loadSavedLanguage();
}

// Export
if (typeof window !== 'undefined') {
  window.AutoTranslate = AutoTranslate;
  window.autoTranslate = autoTranslate;
}










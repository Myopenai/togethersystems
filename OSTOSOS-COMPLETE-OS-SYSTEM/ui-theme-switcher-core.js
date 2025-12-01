// T,. OSTOSOS - UI/UX Theme Switcher Core
// User kann zwischen verschiedenen UI/UX-Designs wählen

const UI_THEME_SWITCHER = {
  themes: {
    'davinci-default': {
      name: 'Da Vinci Standard',
      description: 'Standard Da Vinci Enterprise Design',
      css: './css/da-vinci-xxxxxl-enterprise-standard.css',
      html: null
    },
    'davinci-minimal': {
      name: 'Da Vinci Minimal',
      description: 'Minimalistisches Design, weniger Effekte',
      css: './css/da-vinci-minimal.css',
      html: null
    },
    'davinci-maximal': {
      name: 'Da Vinci Maximal',
      description: 'Maximale Effekte und Animationen',
      css: './css/da-vinci-maximal.css',
      html: null
    },
    'modern-dark': {
      name: 'Modern Dark',
      description: 'Modernes Dark Theme',
      css: './css/modern-dark.css',
      html: null
    },
    'classic-light': {
      name: 'Classic Light',
      description: 'Klassisches Light Theme',
      css: './css/classic-light.css',
      html: null
    },
    'osos-tos-production': {
      name: 'OSOS · tOS Production',
      description: 'Original Production Software Fabrication UI',
      css: './css/osos-tos-production.css',
      html: './osos-tos-production-portal.html'
    }
  },
  
  currentTheme: 'davinci-default',
  
  init() {
    this.loadTheme();
    this.applyTheme(this.currentTheme);
    this.createThemeSwitcher();
  },
  
  loadTheme() {
    const saved = localStorage.getItem('ostosos.ui.theme');
    if (saved && this.themes[saved]) {
      this.currentTheme = saved;
    }
  },
  
  saveTheme(theme) {
    localStorage.setItem('ostosos.ui.theme', theme);
    this.currentTheme = theme;
  },
  
  async applyTheme(themeId) {
    const theme = this.themes[themeId];
    if (!theme) return;
    
    // Spezielle Behandlung für OSOS · tOS Production Theme
    if (themeId === 'osos-tos-production' && theme.html) {
      // Öffne das Production Portal
      if (confirm('OSOS · tOS Production UI öffnen? Dieses Theme hat eine spezielle Portal-Ansicht.')) {
        window.location.href = theme.html;
        return;
      }
    }
    
    // Entferne alte Theme-CSS
    const oldLink = document.getElementById('theme-stylesheet');
    if (oldLink) {
      oldLink.remove();
    }
    
    // Lade neues Theme
    const link = document.createElement('link');
    link.id = 'theme-stylesheet';
    link.rel = 'stylesheet';
    link.href = theme.css;
    
    // Fallback wenn Theme nicht existiert
    link.onerror = () => {
      console.warn(`Theme ${themeId} nicht gefunden, verwende Standard`);
      link.href = './css/da-vinci-xxxxxl-enterprise-standard.css';
    };
    
    document.head.appendChild(link);
    
    // Speichere Theme
    this.saveTheme(themeId);
    
    // Event für andere Komponenten
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeId, themeData: theme } }));
  },
  
  createThemeSwitcher() {
    // Erstelle Theme-Switcher-Button (wenn noch nicht vorhanden)
    if (document.getElementById('themeSwitcher')) return;
    
    const switcher = document.createElement('div');
    switcher.id = 'themeSwitcher';
    switcher.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      background: var(--davinci-card, #1a1f3a);
      border: 2px solid var(--davinci-accent-primary, #10b981);
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      min-width: 250px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    switcher.innerHTML = `
      <div style="color: var(--davinci-accent-primary, #10b981); font-weight: 600; margin-bottom: 10px; text-align: center">
        🎨 UI/UX Theme
      </div>
      <select id="themeSelect" style="width: 100%; padding: 8px; background: var(--davinci-bg, #0f172a); border: 1px solid var(--davinci-border, #223040); border-radius: 6px; color: var(--davinci-text, #ffffff); font-size: 0.9em; margin-bottom: 10px">
        ${Object.keys(this.themes).map(id => `
          <option value="${id}" ${id === this.currentTheme ? 'selected' : ''}>${this.themes[id].name}</option>
        `).join('')}
      </select>
      <div style="font-size: 0.8em; color: var(--davinci-muted, #9ca3af); text-align: center; margin-bottom: 10px" id="themeDescription">
        ${this.themes[this.currentTheme].description}
      </div>
      <button onclick="UI_THEME_SWITCHER.closeSwitcher()" style="width: 100%; padding: 8px; background: var(--davinci-border, #223040); border: none; border-radius: 6px; color: var(--davinci-text, #ffffff); cursor: pointer; font-size: 0.9em">
        Schließen
      </button>
    `;
    
    document.body.appendChild(switcher);
    
    // Event-Listener
    document.getElementById('themeSelect').addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
      document.getElementById('themeDescription').textContent = this.themes[e.target.value].description;
    });
    
    // Toggle-Button (wenn nicht im Sidebar)
    this.createToggleButton();
  },
  
  createToggleButton() {
    // Erstelle Toggle-Button für Theme-Switcher
    if (document.getElementById('themeToggle')) return;
    
    const toggle = document.createElement('button');
    toggle.id = 'themeToggle';
    toggle.innerHTML = '🎨';
    toggle.title = 'UI/UX Theme wechseln';
    toggle.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--davinci-accent-primary, #10b981);
      border: 2px solid var(--davinci-card, #1a1f3a);
      color: #00100a;
      font-size: 1.5em;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      transition: all 0.3s;
    `;
    
    toggle.addEventListener('click', () => {
      const switcher = document.getElementById('themeSwitcher');
      if (switcher) {
        switcher.style.display = switcher.style.display === 'none' ? 'block' : 'none';
      } else {
        this.createThemeSwitcher();
      }
    });
    
    toggle.addEventListener('mouseenter', () => {
      toggle.style.transform = 'scale(1.1)';
    });
    
    toggle.addEventListener('mouseleave', () => {
      toggle.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(toggle);
  },
  
  closeSwitcher() {
    const switcher = document.getElementById('themeSwitcher');
    if (switcher) {
      switcher.style.display = 'none';
    }
  },
  
  getCurrentTheme() {
    return this.currentTheme;
  },
  
  getThemeData(themeId) {
    return this.themes[themeId] || null;
  }
};

window.addEventListener('load', () => {
  UI_THEME_SWITCHER.init();
});

window.UI_THEME_SWITCHER = UI_THEME_SWITCHER;

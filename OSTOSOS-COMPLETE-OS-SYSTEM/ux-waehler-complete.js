// T,. OSOTOSOS - UX-Wähler Complete
// Vollständiger UX-Wähler mit Bestätigung und 6 Ansichten

const UX_WAEHLER = {
  views: {
    1: {
      name: 'Ansicht 1: Minimal',
      description: 'Minimalistisches Design, schnelle Performance',
      css: './css/classic-light.css',
      icon: '⚡'
    },
    2: {
      name: 'Ansicht 2: Modern Dark',
      description: 'Modernes Dark Theme, augenschonend',
      css: './css/modern-dark.css',
      icon: '🌙'
    },
    3: {
      name: 'Ansicht 3: Da Vinci Standard',
      description: 'Standard Da Vinci Enterprise Design',
      css: './css/da-vinci-xxxxxl-enterprise-standard.css',
      icon: '🎨'
    },
    4: {
      name: 'Ansicht 4: Da Vinci Minimal',
      description: 'Minimalistisches Da Vinci Design',
      css: './css/da-vinci-minimal.css',
      icon: '✨'
    },
    5: {
      name: 'Ansicht 5: Da Vinci Maximal',
      description: 'Maximale Effekte und Animationen',
      css: './css/da-vinci-maximal.css',
      icon: '🚀'
    },
    6: {
      name: 'Ansicht 6: Production Portal',
      description: 'OSOS · tOS Production Software Fabrication',
      css: './css/osos-tos-production.css',
      html: './osos-tos-production-portal.html',
      icon: '🏭'
    }
  },
  
  currentView: 1,
  
  init() {
    this.loadSavedView();
    this.createSwitcher();
    this.applyView(this.currentView, false); // Keine Bestätigung beim Start
  },
  
  loadSavedView() {
    const saved = localStorage.getItem('ostosos.ux.view');
    if (saved && this.views[saved]) {
      this.currentView = parseInt(saved);
    }
  },
  
  saveView(view) {
    localStorage.setItem('ostosos.ux.view', view);
    this.currentView = view;
  },
  
  createSwitcher() {
    // Prüfe ob Switcher bereits existiert
    if (document.getElementById('ux-waehler-container')) return;
    
    const container = document.createElement('div');
    container.id = 'ux-waehler-container';
    container.style.cssText = 'position:fixed;top:10px;right:10px;z-index:10000;background:#161b22;border:1px solid #30363d;border-radius:8px;padding:15px;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:400px;';
    
    const title = document.createElement('h3');
    title.textContent = '🎨 UX-Ansicht wählen';
    title.style.cssText = 'margin:0 0 10px 0;color:#e6edf3;font-size:1.1em;';
    container.appendChild(title);
    
    // Erstelle Buttons für alle 6 Ansichten
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px;';
    
    for (let i = 1; i <= 6; i++) {
      const view = this.views[i];
      const btn = document.createElement('button');
      btn.textContent = `${view.icon} ${i}`;
      btn.title = `${view.name}: ${view.description}`;
      btn.style.cssText = `padding:10px;background:${this.currentView === i ? '#10b981' : '#21262d'};color:#fff;border:1px solid #30363d;border-radius:6px;cursor:pointer;font-size:0.9em;`;
      
      if (this.currentView === i) {
        btn.style.border = '2px solid #10b981';
        btn.style.fontWeight = 'bold';
      }
      
      btn.onclick = () => this.selectView(i);
      buttonsContainer.appendChild(btn);
    }
    
    container.appendChild(buttonsContainer);
    
    // Bestätigungs-Button
    const confirmBtn = document.createElement('button');
    confirmBtn.id = 'ux-waehler-confirm';
    confirmBtn.textContent = '✅ Bestätigen';
    confirmBtn.style.cssText = 'width:100%;margin-top:10px;padding:10px;background:#10b981;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;display:none;';
    confirmBtn.onclick = () => this.confirmSelection();
    container.appendChild(confirmBtn);
    
    // Schließen-Button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Schließen';
    closeBtn.style.cssText = 'width:100%;margin-top:8px;padding:8px;background:#21262d;color:#fff;border:1px solid #30363d;border-radius:6px;cursor:pointer;';
    closeBtn.onclick = () => this.closeSwitcher();
    container.appendChild(closeBtn);
    
    document.body.appendChild(container);
  },
  
  selectView(viewNum) {
    // Markiere ausgewählte Ansicht
    const buttons = document.querySelectorAll('#ux-waehler-container button');
    buttons.forEach((btn, idx) => {
      if (idx < 6) { // Erste 6 Buttons sind Ansichten
        if (idx + 1 === viewNum) {
          btn.style.background = '#10b981';
          btn.style.border = '2px solid #10b981';
          btn.style.fontWeight = 'bold';
        } else {
          btn.style.background = '#21262d';
          btn.style.border = '1px solid #30363d';
          btn.style.fontWeight = 'normal';
        }
      }
    });
    
    // Zeige Vorschau
    this.previewView(viewNum);
    
    // Zeige Bestätigungs-Button
    const confirmBtn = document.getElementById('ux-waehler-confirm');
    if (confirmBtn) {
      confirmBtn.style.display = 'block';
      confirmBtn.dataset.selectedView = viewNum;
    }
  },
  
  previewView(viewNum) {
    const view = this.views[viewNum];
    if (!view) return;
    
    // Lade CSS für Vorschau (temporär)
    const previewLink = document.getElementById('ux-preview-stylesheet');
    if (previewLink) previewLink.remove();
    
    if (view.css) {
      const link = document.createElement('link');
      link.id = 'ux-preview-stylesheet';
      link.rel = 'stylesheet';
      link.href = view.css;
      link.onerror = () => console.warn(`Preview CSS nicht gefunden: ${view.css}`);
      document.head.appendChild(link);
    }
  },
  
  confirmSelection() {
    const confirmBtn = document.getElementById('ux-waehler-confirm');
    const selectedView = parseInt(confirmBtn?.dataset.selectedView || this.currentView);
    
    if (confirm(`Möchtest du wirklich zu "${this.views[selectedView].name}" wechseln?`)) {
      this.applyView(selectedView, true);
      this.closeSwitcher();
    }
  },
  
  applyView(viewNum, showMessage = true) {
    const view = this.views[viewNum];
    if (!view) return;
    
    // Spezielle Behandlung für Ansicht 6 (Production Portal)
    if (viewNum === 6 && view.html) {
      if (confirm('Production Portal öffnen? Dieses Theme hat eine spezielle Portal-Ansicht.')) {
        window.location.href = view.html;
        return;
      }
    }
    
    // Entferne alte Theme-CSS
    const oldLink = document.getElementById('theme-stylesheet');
    if (oldLink) oldLink.remove();
    
    // Lade neues Theme
    if (view.css) {
      const link = document.createElement('link');
      link.id = 'theme-stylesheet';
      link.rel = 'stylesheet';
      link.href = view.css;
      link.onerror = () => {
        console.warn(`Theme nicht gefunden: ${view.css}`);
        // Fallback
        link.href = './css/da-vinci-xxxxxl-enterprise-standard.css';
      };
      document.head.appendChild(link);
    }
    
    // Speichere Auswahl
    this.saveView(viewNum);
    
    if (showMessage) {
      const msg = document.createElement('div');
      msg.textContent = `✅ Ansicht ${viewNum} aktiviert: ${view.name}`;
      msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;z-index:10001;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    }
    
    // Event für andere Komponenten
    window.dispatchEvent(new CustomEvent('ux-view-changed', { detail: { view: viewNum, name: view.name } }));
  },
  
  closeSwitcher() {
    const container = document.getElementById('ux-waehler-container');
    if (container) {
      container.style.animation = 'fadeOut 0.3s';
      setTimeout(() => container.remove(), 300);
    }
  },
  
  openSwitcher() {
    if (!document.getElementById('ux-waehler-container')) {
      this.createSwitcher();
    }
    const container = document.getElementById('ux-waehler-container');
    if (container) {
      container.style.display = 'block';
      container.style.animation = 'fadeIn 0.3s';
    }
  }
};

// Auto-Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UX_WAEHLER.init());
} else {
  UX_WAEHLER.init();
}

// Global verfügbar
window.UX_WAEHLER = UX_WAEHLER;

// CSS für Animationen
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
`;
document.head.appendChild(style);


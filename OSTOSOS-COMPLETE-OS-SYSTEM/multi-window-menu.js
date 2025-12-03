// T,. OSOTOSOS - Multi-Window Menüführung
// Mehrere Fenster für verschiedene Funktionen

const MULTI_WINDOW_MENU = {
  windows: new Map(),
  
  init() {
    this.createMenuBar();
    this.loadWindowManager();
    console.log('T,. Multi-Window Menü aktiviert');
  },
  
  createMenuBar() {
    // Prüfe ob MenuBar bereits existiert
    if (document.getElementById('ostosos-menu-bar')) return;
    
    const menuBar = document.createElement('div');
    menuBar.id = 'ostosos-menu-bar';
    menuBar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#0d1117;border-bottom:1px solid #30363d;padding:8px 15px;z-index:10000;display:flex;gap:10px;align-items:center;';
    
    const logo = document.createElement('div');
    logo.textContent = 'T,. OSOTOSOS';
    logo.style.cssText = 'color:#10b981;font-weight:bold;margin-right:20px;';
    menuBar.appendChild(logo);
    
    // Menü-Items
    const menuItems = [
      { id: 'portal', name: 'Portal', url: './osos-tos-production-portal.html' },
      { id: 'manifest', name: 'Manifest', url: './manifest-portal.html' },
      { id: 'donation', name: 'Unterstützen', action: 'openDonation' },
      { id: 'settings', name: 'Einstellungen', action: 'openSettings' },
      { id: 'help', name: 'Hilfe', action: 'openHelp' }
    ];
    
    menuItems.forEach(item => {
      const btn = document.createElement('button');
      btn.textContent = item.name;
      btn.style.cssText = 'background:transparent;border:1px solid #30363d;color:#e6edf3;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:0.9em;';
      btn.onmouseover = () => btn.style.background = '#21262d';
      btn.onmouseout = () => btn.style.background = 'transparent';
      
      if (item.url) {
        btn.onclick = () => this.openWindow(item.id, item.name, item.url);
      } else if (item.action) {
        btn.onclick = () => this[item.action]();
      }
      
      menuBar.appendChild(btn);
    });
    
    document.body.appendChild(menuBar);
    
    // Padding für Body (damit Content nicht unter MenuBar ist)
    document.body.style.paddingTop = '50px';
  },
  
  openWindow(id, title, url) {
    // Verwende Window Manager falls verfügbar
    if (window.OSTOSOSWindowManager) {
      window.OSTOSOSWindowManager.openWindow({
        id: id,
        title: title,
        url: url,
        width: 1200,
        height: 800
      });
      return;
    }
    
    // Fallback: Öffne in neuem Tab
    window.open(url, '_blank');
  },
  
  openDonation() {
    // Erstelle Donation-Widget in neuem Fenster
    if (window.OSTOSOSWindowManager) {
      const windowId = window.OSTOSOSWindowManager.openWindow({
        id: 'donation-window',
        title: 'Unterstütze dieses Projekt',
        width: 600,
        height: 500,
        content: this.createDonationContent()
      });
      
      // Speichere Window-ID für späteres Schließen
      this.windows.set('donation', windowId);
    } else {
      // Fallback: Öffne in Modal
      this.showDonationModal();
    }
  },
  
  createDonationContent() {
    return `
      <div style="padding:20px;">
        <h2 style="color:#10b981;margin-bottom:15px;">💰 Unterstütze dieses Projekt</h2>
        <p style="color:#e6edf3;margin-bottom:20px;">Deine Unterstützung hilft uns, das Projekt weiterzuentwickeln.</p>
        ${window.OSTOSOSDonations ? window.OSTOSOSDonations.createWidgetHTML() : '<p>Donation System wird geladen...</p>'}
        <button onclick="window.OSTOSOSWindowManager?.closeWindow('donation-window')" style="margin-top:20px;padding:10px 20px;background:#dc3545;color:#fff;border:none;border-radius:6px;cursor:pointer;">Schließen</button>
      </div>
    `;
  },
  
  showDonationModal() {
    const modal = document.createElement('div');
    modal.id = 'donation-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:10001;display:flex;align-items:center;justify-content:center;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:#161b22;border:1px solid #30363d;border-radius:8px;padding:30px;max-width:600px;max-height:80vh;overflow-y:auto;';
    content.innerHTML = this.createDonationContent();
    
    modal.appendChild(content);
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    };
    
    document.body.appendChild(modal);
  },
  
  openSettings() {
    this.openWindow('settings', 'Einstellungen', './user-friendability-settings.html');
  },
  
  openHelp() {
    this.openWindow('help', 'Hilfe', './help/help-index.html');
  },
  
  loadWindowManager() {
    // Lade Window Manager falls nicht vorhanden
    if (!window.OSTOSOSWindowManager) {
      const script = document.createElement('script');
      script.src = './window-manager-core.js';
      script.onload = () => console.log('Window Manager geladen');
      document.head.appendChild(script);
    }
  }
};

// Auto-Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MULTI_WINDOW_MENU.init());
} else {
  MULTI_WINDOW_MENU.init();
}

window.MULTI_WINDOW_MENU = MULTI_WINDOW_MENU;


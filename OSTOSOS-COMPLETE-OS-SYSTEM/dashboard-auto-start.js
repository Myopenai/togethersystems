// T,. OSOTOSOS - Dashboard Auto-Start
// Startet Dashboard automatisch bei jeder Aktion

const DASHBOARD_AUTO_START = {
  isRunning: false,
  dashboardWindow: null,
  
  init() {
    // Warte auf DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
      return;
    }
    
    // Starte Dashboard automatisch
    setTimeout(() => this.startDashboard(), 500);
    
    // Event-Listener für alle Aktionen
    document.addEventListener('click', (e) => {
      // Prüfe ob es eine relevante Aktion ist
      if (e.target && (e.target.matches('button, a, [onclick]') || e.target.closest('button, a, [onclick]'))) {
        const target = e.target.matches('button, a, [onclick]') ? e.target : e.target.closest('button, a, [onclick]');
        if (target) this.onAction(target);
      }
    });
    
    // Event-Listener für Custom Events
    window.addEventListener('ostosos-action', () => {
      this.onAction();
    });
    
    console.log('T,. Dashboard Auto-Start aktiviert');
  },
  
  startDashboard() {
    if (this.isRunning) return;
    
    // Warte auf DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startDashboard());
      return;
    }
    
    // Erstelle Dashboard-Container falls nicht vorhanden
    if (!document.getElementById('ostosos-dashboard-container')) {
      this.createDashboard();
    }
    
    // Zeige Dashboard
    const container = document.getElementById('ostosos-dashboard-container');
    if (container) {
      container.style.display = 'block';
    }
    
    this.isRunning = true;
    this.updateDashboard();
    
    // Update alle 2 Sekunden
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => this.updateDashboard(), 2000);
    }
  },
  
  createDashboard() {
    const container = document.createElement('div');
    container.id = 'ostosos-dashboard-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;width:300px;background:#161b22;border:1px solid #30363d;border-radius:8px;padding:15px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:9999;max-height:400px;overflow-y:auto;';
    
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';
    
    const title = document.createElement('h3');
    title.textContent = '📊 Dashboard';
    title.style.cssText = 'margin:0;color:#e6edf3;font-size:1em;';
    header.appendChild(title);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:transparent;border:none;color:#8b949e;cursor:pointer;font-size:1.2em;';
    closeBtn.onclick = () => {
      container.style.display = 'none';
      this.isRunning = false;
    };
    header.appendChild(closeBtn);
    
    container.appendChild(header);
    
    const content = document.createElement('div');
    content.id = 'ostosos-dashboard-content';
    container.appendChild(content);
    
    document.body.appendChild(container);
  },
  
  updateDashboard() {
    const content = document.getElementById('ostosos-dashboard-content');
    if (!content) return;
    
    const metrics = this.collectMetrics();
    
    content.innerHTML = `
      <div style="margin-bottom:10px;">
        <div style="color:#8b949e;font-size:0.85em;">Aktive Aktionen</div>
        <div style="color:#10b981;font-size:1.2em;font-weight:bold;">${metrics.activeActions}</div>
      </div>
      <div style="margin-bottom:10px;">
        <div style="color:#8b949e;font-size:0.85em;">Zeitverlauf</div>
        <div style="color:#e6edf3;font-size:0.9em;">${metrics.timeElapsed}</div>
      </div>
      <div style="margin-bottom:10px;">
        <div style="color:#8b949e;font-size:0.85em;">Letzte Aktion</div>
        <div style="color:#e6edf3;font-size:0.9em;">${metrics.lastAction}</div>
      </div>
      <div style="margin-bottom:10px;">
        <div style="color:#8b949e;font-size:0.85em;">Status</div>
        <div style="color:#10b981;font-size:0.9em;">✅ Aktiv</div>
      </div>
    `;
  },
  
  collectMetrics() {
    return {
      activeActions: document.querySelectorAll('button:not([disabled]), a[href]').length,
      timeElapsed: new Date().toLocaleTimeString(),
      lastAction: localStorage.getItem('ostosos.lastAction') || 'Keine'
    };
  },
  
  onAction(element) {
    // Speichere letzte Aktion
    const actionName = element?.textContent?.trim() || element?.id || 'Unbekannt';
    localStorage.setItem('ostosos.lastAction', `${actionName} - ${new Date().toLocaleTimeString()}`);
    
    // Update Dashboard
    this.updateDashboard();
    
    // Zeige Dashboard falls versteckt
    const container = document.getElementById('ostosos-dashboard-container');
    if (container && container.style.display === 'none') {
      container.style.display = 'block';
      this.isRunning = true;
    }
  }
};

// Auto-Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DASHBOARD_AUTO_START.init());
} else {
  DASHBOARD_AUTO_START.init();
}

window.DASHBOARD_AUTO_START = DASHBOARD_AUTO_START;


/**
 * T,. OSTOSOS Taskbar Core
 * Vollständiges Taskbar System
 * 
 * Features:
 * - Taskleiste am unteren Rand
 * - Laufende Anwendungen anzeigen
 * - Fenster wechseln
 * - App-Launcher
 * - System-Tray
 */

class OSTOSOSTaskbar {
  constructor() {
    this.taskbarElement = null;
    this.taskbarItems = new Map();
    this.launcherApps = [];
    this.systemTrayItems = [];
    this.isVisible = true;
    
    this.init();
  }
  
  init() {
    this.createTaskbar();
    this.createAppLauncher();
    this.createSystemTray();
    
    // Link mit Window Manager
    if (window.OSTOSOSWindows) {
      this.linkWithWindowManager();
    }
    
    console.log('T,. Taskbar initialisiert');
  }
  
  /**
   * Erstellt die Taskbar
   */
  createTaskbar() {
    this.taskbarElement = document.createElement('div');
    this.taskbarElement.id = 'ostosos-taskbar';
    this.taskbarElement.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: var(--davinci-bg, #0f172a);
      border-top: 2px solid var(--davinci-accent-primary, #10b981);
      display: flex;
      align-items: center;
      padding: 0 10px;
      z-index: 10000;
      box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.5);
    `;
    
    // App Launcher Button
    const launcherBtn = document.createElement('button');
    launcherBtn.id = 'ostosos-taskbar-launcher';
    launcherBtn.innerHTML = 'T,.';
    launcherBtn.style.cssText = `
      width: 45px;
      height: 45px;
      border: none;
      background: var(--davinci-accent-primary, #10b981);
      color: white;
      border-radius: 8px;
      font-weight: 900;
      cursor: pointer;
      margin-right: 10px;
      transition: all 0.2s;
    `;
    
    launcherBtn.addEventListener('mouseenter', () => {
      launcherBtn.style.transform = 'scale(1.1)';
    });
    
    launcherBtn.addEventListener('mouseleave', () => {
      launcherBtn.style.transform = 'scale(1)';
    });
    
    launcherBtn.addEventListener('click', () => {
      this.toggleAppLauncher();
    });
    
    this.taskbarElement.appendChild(launcherBtn);
    
    // Taskbar Items Container
    const itemsContainer = document.createElement('div');
    itemsContainer.id = 'ostosos-taskbar-items';
    itemsContainer.style.cssText = `
      flex: 1;
      display: flex;
      gap: 5px;
      overflow-x: auto;
      overflow-y: hidden;
    `;
    
    this.taskbarElement.appendChild(itemsContainer);
    
    // System Tray Container
    const systemTrayContainer = document.createElement('div');
    systemTrayContainer.id = 'ostosos-taskbar-systemtray';
    systemTrayContainer.style.cssText = `
      display: flex;
      gap: 5px;
      align-items: center;
      padding-left: 10px;
      border-left: 1px solid var(--davinci-border, #223040);
    `;
    
    this.taskbarElement.appendChild(systemTrayContainer);
    
    document.body.appendChild(this.taskbarElement);
    
    // Auto-hide on scroll down (optional)
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        this.hide();
      } else {
        // Scrolling up
        this.show();
      }
      lastScrollTop = scrollTop;
    });
  }
  
  /**
   * Erstellt den App Launcher
   */
  createAppLauncher() {
    this.launcherElement = document.createElement('div');
    this.launcherElement.id = 'ostosos-app-launcher';
    this.launcherElement.style.cssText = `
      position: fixed;
      bottom: 60px;
      left: 10px;
      width: 400px;
      max-height: 600px;
      background: var(--davinci-card, #1a1f3a);
      border: 2px solid var(--davinci-accent-primary, #10b981);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      display: none;
      flex-direction: column;
      z-index: 10001;
      overflow: hidden;
    `;
    
    // Search Bar
    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.placeholder = 'App suchen...';
    searchBar.style.cssText = `
      padding: 15px;
      border: none;
      border-bottom: 1px solid var(--davinci-border, #223040);
      background: var(--davinci-bg, #0f172a);
      color: var(--davinci-text, #ffffff);
      font-size: 16px;
      outline: none;
    `;
    
    searchBar.addEventListener('input', (e) => {
      this.filterApps(e.target.value);
    });
    
    this.launcherElement.appendChild(searchBar);
    
    // Apps Grid
    const appsGrid = document.createElement('div');
    appsGrid.id = 'ostosos-launcher-apps';
    appsGrid.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
    `;
    
    this.launcherElement.appendChild(appsGrid);
    
    document.body.appendChild(this.launcherElement);
    
    // Default Apps
    this.registerDefaultApps();
  }
  
  /**
   * Registriert Standard-Apps
   */
  registerDefaultApps() {
    const defaultApps = [
      { id: 'portal', name: 'Portal', icon: '🌐', url: './index.html' },
      { id: 'manifest-forum', name: 'Manifest Forum', icon: '💬', url: './manifest-forum.html' },
      { id: 'manifest-portal', name: 'Manifest Portal', icon: '📝', url: './manifest-portal.html' },
      { id: 'telbank', name: 'Telbank', icon: '💰', url: './TELBANK/index.html' },
      { id: 'honeycomb', name: 'Honeycomb', icon: '🍯', url: './honeycomb.html' },
      { id: 'legal-hub', name: 'Legal Hub', icon: '⚖️', url: './legal-hub.html' },
      { id: 'settings', name: 'Einstellungen', icon: '⚙️', url: null, action: () => {
        if (window.showSection) {
          showSection('settings', null);
        }
      }},
      { id: 'dev-tools', name: 'Dev Tools', icon: '🔧', url: './dev-tools-system.html' },
      { id: 'help', name: 'Hilfe', icon: '🔍', url: './complete-help-system.html' }
    ];
    
    defaultApps.forEach(app => this.registerApp(app));
  }
  
  /**
   * Registriert eine App im Launcher
   */
  registerApp(app) {
    this.launcherApps.push(app);
    this.renderAppInLauncher(app);
  }
  
  /**
   * Rendert eine App im Launcher
   */
  renderAppInLauncher(app) {
    const appsGrid = document.getElementById('ostosos-launcher-apps');
    if (!appsGrid) return;
    
    const appElement = document.createElement('div');
    appElement.className = 'ostosos-launcher-app';
    appElement.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    `;
    
    const icon = document.createElement('div');
    icon.textContent = app.icon || '📱';
    icon.style.cssText = 'font-size: 32px; margin-bottom: 5px;';
    
    const name = document.createElement('div');
    name.textContent = app.name;
    name.style.cssText = `
      font-size: 12px;
      color: var(--davinci-text, #ffffff);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    `;
    
    appElement.appendChild(icon);
    appElement.appendChild(name);
    
    appElement.addEventListener('mouseenter', () => {
      appElement.style.background = 'var(--davinci-card, #2d3748)';
      appElement.style.transform = 'scale(1.1)';
    });
    
    appElement.addEventListener('mouseleave', () => {
      appElement.style.background = 'transparent';
      appElement.style.transform = 'scale(1)';
    });
    
    appElement.addEventListener('click', () => {
      this.launchApp(app);
      this.toggleAppLauncher();
    });
    
    appsGrid.appendChild(appElement);
  }
  
  /**
   * Filtert Apps im Launcher
   */
  filterApps(query) {
    const apps = document.querySelectorAll('.ostosos-launcher-app');
    apps.forEach(app => {
      const name = app.querySelector('div:last-child').textContent.toLowerCase();
      if (name.includes(query.toLowerCase())) {
        app.style.display = 'flex';
      } else {
        app.style.display = 'none';
      }
    });
  }
  
  /**
   * Zeigt/Versteckt App Launcher
   */
  toggleAppLauncher() {
    const launcher = document.getElementById('ostosos-app-launcher');
    if (!launcher) return;
    
    if (launcher.style.display === 'none' || !launcher.style.display) {
      launcher.style.display = 'flex';
      document.getElementById('ostosos-taskbar-launcher').focus();
    } else {
      launcher.style.display = 'none';
    }
  }
  
  /**
   * Startet eine App
   */
  launchApp(app) {
    if (app.action) {
      app.action();
      return;
    }
    
    if (app.url) {
      // Öffne in neuem Fenster über Window Manager
      if (window.OSTOSOSWindows) {
        window.OSTOSOSWindows.createWindow({
          title: app.name,
          url: app.url,
          icon: app.icon,
          width: 1000,
          height: 700
        });
      } else {
        window.open(app.url, '_blank');
      }
    }
  }
  
  /**
   * Erstellt System Tray
   */
  createSystemTray() {
    // Clock
    this.addSystemTrayItem({
      id: 'clock',
      content: () => {
        const clock = document.createElement('div');
        clock.style.cssText = `
          padding: 5px 10px;
          font-size: 12px;
          color: var(--davinci-text, #ffffff);
        `;
        
        const updateClock = () => {
          const now = new Date();
          clock.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        };
        
        updateClock();
        setInterval(updateClock, 1000);
        
        return clock;
      }
    });
    
    // System Status
    this.addSystemTrayItem({
      id: 'status',
      icon: '✅',
      tooltip: 'System Status',
      action: () => {
        console.log('System Status angezeigt');
      }
    });
  }
  
  /**
   * Fügt ein System Tray Item hinzu
   */
  addSystemTrayItem(item) {
    const trayContainer = document.getElementById('ostosos-taskbar-systemtray');
    if (!trayContainer) return;
    
    const trayItem = document.createElement('div');
    trayItem.className = 'ostosos-systemtray-item';
    trayItem.style.cssText = `
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;
    `;
    
    if (item.content) {
      const content = item.content();
      trayItem.appendChild(content);
    } else if (item.icon) {
      trayItem.textContent = item.icon;
      trayItem.title = item.tooltip || '';
    }
    
    if (item.action) {
      trayItem.addEventListener('click', item.action);
    }
    
    trayItem.addEventListener('mouseenter', () => {
      trayItem.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    
    trayItem.addEventListener('mouseleave', () => {
      trayItem.style.background = 'transparent';
    });
    
    trayContainer.appendChild(trayItem);
    this.systemTrayItems.push({ id: item.id, element: trayItem });
  }
  
  /**
   * Fügt ein Fenster zur Taskbar hinzu
   */
  addWindow(windowId, title, icon) {
    const itemsContainer = document.getElementById('ostosos-taskbar-items');
    if (!itemsContainer) return;
    
    const item = document.createElement('div');
    item.className = 'ostosos-taskbar-item';
    item.dataset.windowId = windowId;
    item.style.cssText = `
      min-width: 150px;
      max-width: 250px;
      height: 40px;
      background: var(--davinci-card, #1a1f3a);
      border: 1px solid var(--davinci-border, #223040);
      border-radius: 6px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      cursor: pointer;
      transition: all 0.2s;
      overflow: hidden;
    `;
    
    if (icon) {
      const iconEl = document.createElement('span');
      iconEl.textContent = icon;
      iconEl.style.marginRight = '8px';
      item.appendChild(iconEl);
    }
    
    const titleEl = document.createElement('span');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--davinci-text, #ffffff);
      font-size: 13px;
    `;
    item.appendChild(titleEl);
    
    item.addEventListener('mouseenter', () => {
      item.style.background = 'var(--davinci-card, #2d3748)';
      item.style.borderColor = 'var(--davinci-accent-primary, #10b981)';
    });
    
    item.addEventListener('mouseleave', () => {
      if (!item.classList.contains('active')) {
        item.style.background = 'var(--davinci-card, #1a1f3a)';
        item.style.borderColor = 'var(--davinci-border, #223040)';
      }
    });
    
    item.addEventListener('click', () => {
      this.focusWindow(windowId);
    });
    
    itemsContainer.appendChild(item);
    this.taskbarItems.set(windowId, item);
  }
  
  /**
   * Entfernt ein Fenster aus der Taskbar
   */
  removeWindow(windowId) {
    const item = this.taskbarItems.get(windowId);
    if (item && item.parentNode) {
      item.parentNode.removeChild(item);
      this.taskbarItems.delete(windowId);
    }
  }
  
  /**
   * Setzt aktives Fenster
   */
  setActiveWindow(windowId) {
    this.taskbarItems.forEach((item, id) => {
      if (id === windowId) {
        item.classList.add('active');
        item.style.background = 'var(--davinci-accent-primary, #10b981)';
        item.style.borderColor = 'var(--davinci-accent-primary, #10b981)';
      } else {
        item.classList.remove('active');
        item.style.background = 'var(--davinci-card, #1a1f3a)';
        item.style.borderColor = 'var(--davinci-border, #223040)';
      }
    });
  }
  
  /**
   * Aktualisiert Fenster-Status
   */
  updateWindowState(windowId, state) {
    const item = this.taskbarItems.get(windowId);
    if (!item) return;
    
    if (state === 'minimized') {
      item.style.opacity = '0.5';
    } else {
      item.style.opacity = '1';
    }
  }
  
  /**
   * Fokussiert ein Fenster
   */
  focusWindow(windowId) {
    if (window.OSTOSOSWindows) {
      window.OSTOSOSWindows.bringToFront(windowId);
      
      const window = window.OSTOSOSWindows.getWindow(windowId);
      if (window && window.state === 'minimized') {
        window.OSTOSOSWindows.minimizeWindow(windowId); // Toggle minimize
      }
    }
  }
  
  /**
   * Verknüpft Taskbar mit Window Manager
   */
  linkWithWindowManager() {
    const originalCreateWindow = window.OSTOSOSWindows.createWindow.bind(window.OSTOSOSWindows);
    
    window.OSTOSOSWindows.createWindow = (options) => {
      const windowId = originalCreateWindow(options);
      const window = window.OSTOSOSWindows.getWindow(windowId);
      
      if (window) {
        // Link Taskbar reference
        window.OSTOSOSTaskbar = this;
        
        // Add to Taskbar
        this.addWindow(windowId, options.title || 'Neues Fenster', options.icon || '📱');
        this.setActiveWindow(windowId);
      }
      
      return windowId;
    };
  }
  
  /**
   * Zeigt Taskbar
   */
  show() {
    if (this.taskbarElement) {
      this.taskbarElement.style.bottom = '0';
      this.isVisible = true;
    }
  }
  
  /**
   * Versteckt Taskbar
   */
  hide() {
    if (this.taskbarElement) {
      this.taskbarElement.style.bottom = '-50px';
      this.isVisible = false;
    }
  }
  
  /**
   * Toggle Taskbar Visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

// Global verfügbar machen
window.OSTOSOSTaskbar = OSTOSOSTaskbar;
window.OSTOSOSTaskbarInstance = window.OSTOSOSTaskbarInstance || new OSTOSOSTaskbar();

console.log('T,. Taskbar Core geladen');


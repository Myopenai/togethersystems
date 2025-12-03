/**
 * T,. OSTOSOS Window Manager Core
 * Vollständiges Window Management System
 * 
 * Features:
 * - Fenster minimieren, maximieren, schließen
 * - Fenster verschieben, resize
 * - Multi-Window Support
 * - Window-Snap (links/rechts)
 * - Z-Order Management
 */

class OSTOSOSWindowManager {
  constructor() {
    this.windows = new Map();
    this.windowIdCounter = 0;
    this.zIndexBase = 1000;
    this.activeWindowId = null;
    this.windowHistory = [];
    
    // Window Snap Zones
    this.snapZones = {
      left: { x: 0, y: 0, width: '50%', height: '100%' },
      right: { x: '50%', y: 0, width: '50%', height: '100%' },
      top: { x: 0, y: 0, width: '100%', height: '50%' },
      bottom: { x: 0, y: '50%', width: '100%', height: '50%' },
      fullscreen: { x: 0, y: 0, width: '100%', height: '100%' }
    };
    
    this.init();
  }
  
  init() {
    // Event Listener für Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt+Tab: Window wechseln
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        this.switchToNextWindow();
      }
      
      // Alt+F4: Aktives Fenster schließen
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        if (this.activeWindowId) {
          this.closeWindow(this.activeWindowId);
        }
      }
      
      // Windows+Left/Right: Snap
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.snapWindow(this.activeWindowId, 'left');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.snapWindow(this.activeWindowId, 'right');
        }
      }
    });
    
    console.log('T,. Window Manager initialisiert');
  }
  
  /**
   * Erstellt ein neues Fenster
   */
  createWindow(options = {}) {
    const windowId = `window-${++this.windowIdCounter}`;
    const defaultOptions = {
      title: 'Neues Fenster',
      url: null,
      content: null,
      width: 800,
      height: 600,
      x: 100 + (this.windowIdCounter % 5) * 50,
      y: 100 + (this.windowIdCounter % 5) * 50,
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true,
      icon: null,
      modal: false
    };
    
    const config = { ...defaultOptions, ...options, id: windowId };
    
    const windowElement = this.createWindowElement(config);
    document.body.appendChild(windowElement);
    
    this.windows.set(windowId, {
      id: windowId,
      element: windowElement,
      config: config,
      state: 'normal', // normal, minimized, maximized
      zIndex: this.zIndexBase + this.windows.size,
      position: { x: config.x, y: config.y },
      size: { width: config.width, height: config.height }
    });
    
    this.bringToFront(windowId);
    this.windowHistory.push(windowId);
    
    console.log(`T,. Fenster erstellt: ${windowId}`);
    return windowId;
  }
  
  /**
   * Erstellt das HTML-Element für ein Fenster
   */
  createWindowElement(config) {
    const window = document.createElement('div');
    window.className = 'ostosos-window';
    window.id = config.id;
    window.style.cssText = `
      position: fixed;
      left: ${config.x}px;
      top: ${config.y}px;
      width: ${config.width}px;
      height: ${config.height}px;
      background: var(--davinci-card, #1a1f3a);
      border: 2px solid var(--davinci-accent-primary, #10b981);
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      z-index: ${this.zIndexBase + this.windows.size};
      overflow: hidden;
      transition: all 0.3s ease;
    `;
    
    // Title Bar
    const titleBar = document.createElement('div');
    titleBar.className = 'ostosos-window-titlebar';
    titleBar.style.cssText = `
      background: var(--davinci-bg, #0f172a);
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
      border-bottom: 1px solid var(--davinci-border, #223040);
    `;
    
    const titleLeft = document.createElement('div');
    titleLeft.style.cssText = 'display: flex; align-items: center; gap: 10px;';
    
    if (config.icon) {
      const icon = document.createElement('span');
      icon.textContent = config.icon;
      icon.style.fontSize = '18px';
      titleLeft.appendChild(icon);
    }
    
    const title = document.createElement('span');
    title.textContent = config.title;
    title.style.cssText = 'color: var(--davinci-text, #ffffff); font-weight: 600;';
    titleLeft.appendChild(title);
    
    const titleRight = document.createElement('div');
    titleRight.style.cssText = 'display: flex; gap: 5px;';
    
    // Minimize Button
    if (config.minimizable) {
      const minBtn = this.createWindowButton('−', () => this.minimizeWindow(config.id));
      titleRight.appendChild(minBtn);
    }
    
    // Maximize Button
    if (config.maximizable) {
      const maxBtn = this.createWindowButton('□', () => this.maximizeWindow(config.id));
      titleRight.appendChild(maxBtn);
    }
    
    // Close Button
    if (config.closable) {
      const closeBtn = this.createWindowButton('×', () => this.closeWindow(config.id), true);
      titleRight.appendChild(closeBtn);
    }
    
    titleBar.appendChild(titleLeft);
    titleBar.appendChild(titleRight);
    
    // Content Area
    const content = document.createElement('div');
    content.className = 'ostosos-window-content';
    content.style.cssText = `
      flex: 1;
      overflow: auto;
      padding: 20px;
      background: var(--davinci-card, #1a1f3a);
    `;
    
    if (config.url) {
      const iframe = document.createElement('iframe');
      iframe.src = config.url;
      iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
      content.appendChild(iframe);
    } else if (config.content) {
      if (typeof config.content === 'string') {
        content.innerHTML = config.content;
      } else {
        content.appendChild(config.content);
      }
    }
    
    window.appendChild(titleBar);
    window.appendChild(content);
    
    // Drag & Resize Functionality
    this.setupWindowDrag(window, titleBar, config.id);
    if (config.resizable) {
      this.setupWindowResize(window, config.id);
    }
    
    // Click to Focus
    window.addEventListener('mousedown', () => {
      this.bringToFront(config.id);
    });
    
    return window;
  }
  
  /**
   * Erstellt einen Window-Button
   */
  createWindowButton(symbol, onClick, isClose = false) {
    const btn = document.createElement('button');
    btn.textContent = symbol;
    btn.style.cssText = `
      width: 30px;
      height: 30px;
      border: none;
      background: transparent;
      color: var(--davinci-text, #ffffff);
      cursor: pointer;
      border-radius: 4px;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    `;
    
    btn.addEventListener('mouseenter', () => {
      btn.style.background = isClose ? '#ef4444' : 'rgba(255, 255, 255, 0.1)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
    });
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    
    return btn;
  }
  
  /**
   * Setup Window Drag
   */
  setupWindowDrag(windowElement, titleBar, windowId) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    titleBar.addEventListener('mousedown', (e) => {
      if (e.target === titleBar || titleBar.contains(e.target)) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = windowElement.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        this.bringToFront(windowId);
        
        e.preventDefault();
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const window = this.windows.get(windowId);
        if (window && window.state === 'normal') {
          const newX = startLeft + deltaX;
          const newY = startTop + deltaY;
          
          windowElement.style.left = `${newX}px`;
          windowElement.style.top = `${newY}px`;
          
          window.position = { x: newX, y: newY };
        }
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
  
  /**
   * Setup Window Resize
   */
  setupWindowResize(windowElement, windowId) {
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'ostosos-window-resize-handle';
    resizeHandle.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      cursor: nwse-resize;
      background: linear-gradient(-45deg, transparent 0%, transparent 30%, var(--davinci-border, #223040) 30%, var(--davinci-border, #223040) 35%, transparent 35%, transparent 65%, var(--davinci-border, #223040) 65%, var(--davinci-border, #223040) 70%, transparent 70%);
    `;
    
    windowElement.appendChild(resizeHandle);
    
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = windowElement.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      
      this.bringToFront(windowId);
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isResizing) {
        const window = this.windows.get(windowId);
        if (window && window.state === 'normal') {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          
          const newWidth = Math.max(300, startWidth + deltaX);
          const newHeight = Math.max(200, startHeight + deltaY);
          
          windowElement.style.width = `${newWidth}px`;
          windowElement.style.height = `${newHeight}px`;
          
          window.size = { width: newWidth, height: newHeight };
        }
      }
    });
    
    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  }
  
  /**
   * Minimiert ein Fenster
   */
  minimizeWindow(windowId) {
    const window = this.windows.get(windowId);
    if (!window) return;
    
    if (window.state === 'minimized') {
      // Restore
      window.element.style.display = 'flex';
      window.element.style.transform = 'scale(1)';
      window.element.style.opacity = '1';
      window.state = 'normal';
      
      if (window.position && window.size) {
        window.element.style.left = `${window.position.x}px`;
        window.element.style.top = `${window.position.y}px`;
        window.element.style.width = `${window.size.width}px`;
        window.element.style.height = `${window.size.height}px`;
      }
    } else {
      // Minimize
      window.element.style.transform = 'scale(0.1)';
      window.element.style.opacity = '0';
      setTimeout(() => {
        if (window.state === 'minimized') {
          window.element.style.display = 'none';
        }
      }, 300);
      window.state = 'minimized';
    }
    
    // Update Taskbar
    if (window.OSTOSOSTaskbar) {
      window.OSTOSOSTaskbar.updateWindowState(windowId, window.state);
    }
    
    console.log(`T,. Fenster ${window.state === 'minimized' ? 'minimiert' : 'wiederhergestellt'}: ${windowId}`);
  }
  
  /**
   * Maximiert ein Fenster
   */
  maximizeWindow(windowId) {
    const window = this.windows.get(windowId);
    if (!window) return;
    
    if (window.state === 'maximized') {
      // Restore
      window.element.style.width = `${window.size.width}px`;
      window.element.style.height = `${window.size.height}px`;
      window.element.style.left = `${window.position.x}px`;
      window.element.style.top = `${window.position.y}px`;
      window.element.style.borderRadius = '8px';
      window.state = 'normal';
    } else {
      // Save current position and size
      window.position = {
        x: parseInt(window.element.style.left) || window.position.x,
        y: parseInt(window.element.style.top) || window.position.y
      };
      window.size = {
        width: parseInt(window.element.style.width) || window.size.width,
        height: parseInt(window.element.style.height) || window.size.height
      };
      
      // Maximize
      window.element.style.width = '100%';
      window.element.style.height = '100%';
      window.element.style.left = '0';
      window.element.style.top = '0';
      window.element.style.borderRadius = '0';
      window.state = 'maximized';
    }
    
    console.log(`T,. Fenster ${window.state === 'maximized' ? 'maximiert' : 'wiederhergestellt'}: ${windowId}`);
  }
  
  /**
   * Schließt ein Fenster
   */
  closeWindow(windowId) {
    const window = this.windows.get(windowId);
    if (!window) return;
    
    window.element.style.transform = 'scale(0.8)';
    window.element.style.opacity = '0';
    
    setTimeout(() => {
      if (window.element && window.element.parentNode) {
        window.element.parentNode.removeChild(window.element);
      }
      this.windows.delete(windowId);
      
      // Remove from history
      const index = this.windowHistory.indexOf(windowId);
      if (index > -1) {
        this.windowHistory.splice(index, 1);
      }
      
      // Update active window
      if (this.activeWindowId === windowId) {
        this.activeWindowId = this.windowHistory[this.windowHistory.length - 1] || null;
        if (this.activeWindowId) {
          this.bringToFront(this.activeWindowId);
        }
      }
      
      // Update Taskbar
      if (window.OSTOSOSTaskbar) {
        window.OSTOSOSTaskbar.removeWindow(windowId);
      }
      
      console.log(`T,. Fenster geschlossen: ${windowId}`);
    }, 300);
  }
  
  /**
   * Bringt ein Fenster nach vorne
   */
  bringToFront(windowId) {
    const window = this.windows.get(windowId);
    if (!window) return;
    
    this.activeWindowId = windowId;
    this.zIndexBase++;
    window.zIndex = this.zIndexBase;
    window.element.style.zIndex = window.zIndex;
    
    // Update Taskbar
    if (window.OSTOSOSTaskbar) {
      window.OSTOSOSTaskbar.setActiveWindow(windowId);
    }
  }
  
  /**
   * Snap Window
   */
  snapWindow(windowId, position) {
    const window = this.windows.get(windowId);
    if (!window) return;
    
    const zone = this.snapZones[position];
    if (!zone) return;
    
    // Save current state if not maximized
    if (window.state !== 'maximized') {
      window.position = {
        x: parseInt(window.element.style.left) || window.position.x,
        y: parseInt(window.element.style.top) || window.position.y
      };
      window.size = {
        width: parseInt(window.element.style.width) || window.size.width,
        height: parseInt(window.element.style.height) || window.size.height
      };
    }
    
    window.element.style.left = typeof zone.x === 'number' ? `${zone.x}px` : zone.x;
    window.element.style.top = typeof zone.y === 'number' ? `${zone.y}px` : zone.y;
    window.element.style.width = typeof zone.width === 'number' ? `${zone.width}px` : zone.width;
    window.element.style.height = typeof zone.height === 'number' ? `${zone.height}px` : zone.height;
    
    window.state = position === 'fullscreen' ? 'maximized' : 'normal';
    this.bringToFront(windowId);
    
    console.log(`T,. Fenster gesnapped: ${windowId} → ${position}`);
  }
  
  /**
   * Wechselt zum nächsten Fenster
   */
  switchToNextWindow() {
    if (this.windowHistory.length < 2) return;
    
    const currentIndex = this.windowHistory.indexOf(this.activeWindowId);
    const nextIndex = (currentIndex + 1) % this.windowHistory.length;
    const nextWindowId = this.windowHistory[nextIndex];
    
    this.bringToFront(nextWindowId);
  }
  
  /**
   * Gibt alle Fenster zurück
   */
  getAllWindows() {
    return Array.from(this.windows.values());
  }
  
  /**
   * Gibt ein Fenster zurück
   */
  getWindow(windowId) {
    return this.windows.get(windowId);
  }
}

// Global verfügbar machen
window.OSTOSOSWindowManager = OSTOSOSWindowManager;
window.OSTOSOSWindows = window.OSTOSOSWindows || new OSTOSOSWindowManager();

console.log('T,. Window Manager Core geladen');


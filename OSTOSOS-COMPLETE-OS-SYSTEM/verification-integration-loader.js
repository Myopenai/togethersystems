/**
 * T,. OSOTOSOS Verification Integration Loader
 * Automatisches Laden der Verifizierungs-Komponenten in alle Portale
 */

(function() {
  'use strict';
  
  // Pfad zur OSOTOSOS-COMPLETE-OS-SYSTEM
  const OSTOSOS_BASE_PATH = './OSTOSOS-COMPLETE-OS-SYSTEM/';
  
  /**
   * Lädt Verification Core System
   */
  function loadVerificationSystem() {
    const scripts = [
      OSTOSOS_BASE_PATH + 'verification-core.js',
      OSTOSOS_BASE_PATH + 'portal-binding-core.js',
      OSTOSOS_BASE_PATH + 'verification-visualization-core.js'
    ];
    
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.onerror = () => console.warn(`Verification Script nicht geladen: ${src}`);
      document.head.appendChild(script);
    });
    
    console.log('T,. Verification System wird geladen...');
  }
  
  /**
   * Lädt Verification Widget
   */
  function loadVerificationWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container nicht gefunden: ${containerId}`);
      return;
    }
    
    const iframe = document.createElement('iframe');
    iframe.src = OSTOSOS_BASE_PATH + 'verification-widget.html';
    iframe.style.cssText = 'width: 100%; min-height: 600px; border: none; border-radius: 12px;';
    iframe.onerror = () => {
      container.innerHTML = '<p style="color: #ef4444;">Verification Widget konnte nicht geladen werden.</p>';
    };
    
    container.appendChild(iframe);
    console.log('T,. Verification Widget geladen');
  }
  
  /**
   * Initialisiert Auto-Verifizierung
   */
  function initializeAutoVerification() {
    // Warte auf Verification System
    const checkInterval = setInterval(() => {
      if (window.OSOTOSOSVerify) {
        clearInterval(checkInterval);
        window.OSOTOSOSVerify.performAutoVerification();
      }
    }, 100);
    
    // Timeout nach 10 Sekunden
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  }
  
  /**
   * Erstellt Verifizierungs-Link in Navigation
   */
  function addVerificationLink() {
    // Suche nach Navigation-Elementen
    const navSelectors = ['nav', '.nav', '.navigation', '#navigation', 'header nav'];
    
    navSelectors.forEach(selector => {
      const nav = document.querySelector(selector);
      if (nav) {
        const link = document.createElement('a');
        link.href = '#';
        link.innerHTML = 'T,. 🔐 Verifizierung';
        link.style.cssText = `
          display: inline-block;
          padding: 10px 15px;
          margin: 5px;
          background: var(--accent, #10b981);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
        `;
        link.onclick = (e) => {
          e.preventDefault();
          showVerificationModal();
        };
        
        nav.appendChild(link);
        console.log('T,. Verifizierungs-Link hinzugefügt');
        return;
      }
    });
  }
  
  /**
   * Zeigt Verifizierungs-Modal
   */
  function showVerificationModal() {
    const modal = document.createElement('div');
    modal.id = 'osotosos-verification-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: var(--card, #1a1f3a);
      border-radius: 15px;
      padding: 0;
      max-width: 90%;
      max-height: 90vh;
      overflow: auto;
    `;
    
    const iframe = document.createElement('iframe');
    iframe.src = OSTOSOS_BASE_PATH + 'verification-ui.html';
    iframe.style.cssText = 'width: 100%; min-height: 800px; border: none;';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
      z-index: 10001;
    `;
    closeBtn.onclick = () => {
      document.body.removeChild(modal);
    };
    
    content.appendChild(iframe);
    modal.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
  
  /**
   * Initialisiert alles
   */
  function init() {
    // Lade Verification System
    loadVerificationSystem();
    
    // Initialisiere Auto-Verifizierung nach kurzer Verzögerung
    setTimeout(() => {
      initializeAutoVerification();
    }, 1000);
    
    // Füge Verifizierungs-Link hinzu
    setTimeout(() => {
      addVerificationLink();
    }, 2000);
    
    console.log('T,. OSOTOSOS Verification Integration Loader initialisiert');
  }
  
  // Auto-Init beim DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Global verfügbar machen
  window.OSOTOSOSVerificationLoader = {
    loadWidget: loadVerificationWidget,
    showModal: showVerificationModal,
    init: init
  };
  
})();

console.log('T,. OSOTOSOS Verification Integration Loader geladen');


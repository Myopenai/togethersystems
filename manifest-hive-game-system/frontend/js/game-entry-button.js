// Universal Game Entry Button Component
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV
//
// Diese Komponente kann in alle Apps integriert werden:
// - MyOpenAI Repos
// - Unity System Repos
// - Alle anderen Applikationen

(function() {
  'use strict';
  
  // Konfiguration
  const CONFIG = {
    // Pfad zum Ritual-Wizard (relativ zum Script-Pfad oder absolut)
    ritualWizardUrl: (() => {
      // Versuche relativen Pfad basierend auf Script-Location
      const scriptPath = document.currentScript?.src || '';
      if (scriptPath.includes('/frontend/js/')) {
        return scriptPath.replace('/js/game-entry-button.js', '/ritual-wizard.html');
      }
      // Fallback: absoluter Pfad
      return '/manifest-hive-game-system/frontend/ritual-wizard.html';
    })(),
    // nBlockbuster URL
    nblockbusterUrl: (() => {
      const scriptPath = document.currentScript?.src || '';
      if (scriptPath.includes('/frontend/js/')) {
        return scriptPath.replace('/js/game-entry-button.js', '/../nblockbuster/frontend/year-panel.html');
      }
      return '/manifest-hive-game-system/nblockbuster/frontend/year-panel.html';
    })(),
    apiBase: window.location.origin + '/api',
    buttonText: 'Spiel eröffnen',
    buttonIcon: '✨',
    nblockbusterText: 'Zeiten & Erinnerungen',
    nblockbusterIcon: '📚',
    styles: {
      button: `
        background: linear-gradient(135deg, #10b981, #f59e0b);
        border: none;
        border-radius: 20px;
        padding: 16px 32px;
        font-size: 18px;
        font-weight: 700;
        color: #00100a;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-family: system-ui, -apple-system, sans-serif;
      `,
      buttonHover: `
        transform: translateY(-4px);
        box-shadow: 0 12px 48px rgba(16, 185, 129, 0.5);
      `,
      hexIcon: `
        width: 24px;
        height: 24px;
        background: rgba(255, 255, 255, 0.2);
        clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
        position: relative;
      `
    }
  };
  
  // Erstelle Button HTML mit Tabs
  function createButtonHTML() {
    return `
      <div class="manifest-hive-entry-container" style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; gap: 8px; justify-content: center;">
          <button class="manifest-hive-tab-btn active" data-mode="game" style="padding: 8px 16px; background: var(--card, #111827); border: 1px solid var(--border, #1f2937); border-radius: 8px; color: var(--text, #e5e7eb); cursor: pointer;">
            ${CONFIG.buttonIcon} Spiel
          </button>
          <button class="manifest-hive-tab-btn" data-mode="memory" style="padding: 8px 16px; background: var(--card, #111827); border: 1px solid var(--border, #1f2937); border-radius: 8px; color: var(--text, #e5e7eb); cursor: pointer;">
            ${CONFIG.nblockbusterIcon} Zeiten
          </button>
        </div>
        <button class="manifest-hive-game-entry-btn" style="${CONFIG.styles.button}">
          <div class="manifest-hive-hex-icon" style="${CONFIG.styles.hexIcon}">
            <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 14px;">${CONFIG.buttonIcon}</span>
          </div>
          <span>${CONFIG.buttonText}</span>
        </button>
      </div>
    `;
  }
  
  // Initialisiere Button
  function initButton(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn('[Manifest-Hive] Container nicht gefunden:', containerSelector);
      return null;
    }
    
    const buttonHTML = createButtonHTML();
    container.innerHTML = buttonHTML;
    
    const button = container.querySelector('.manifest-hive-game-entry-btn');
    if (button) {
      button.addEventListener('mouseenter', () => {
        button.style.cssText = CONFIG.styles.button + CONFIG.styles.buttonHover;
      });
      button.addEventListener('mouseleave', () => {
        button.style.cssText = CONFIG.styles.button;
      });
      button.addEventListener('click', startGameRitual);
    }
    
    // Tab-Handler
    const tabs = container.querySelectorAll('.manifest-hive-tab-btn');
    let currentMode = 'game';
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-mode');
        currentMode = mode;
        
        tabs.forEach(t => {
          t.classList.remove('active');
          t.style.background = 'var(--card, #111827)';
        });
        tab.classList.add('active');
        tab.style.background = 'rgba(16, 185, 129, 0.2)';
        
        // Update Button
        const btn = container.querySelector('.manifest-hive-game-entry-btn');
        const icon = container.querySelector('.manifest-hive-hex-icon span');
        const text = container.querySelector('.manifest-hive-game-entry-btn span');
        
        if (mode === 'memory') {
          icon.textContent = CONFIG.nblockbusterIcon;
          text.textContent = CONFIG.nblockbusterText;
          btn.onclick = startNblockbuster;
        } else {
          icon.textContent = CONFIG.buttonIcon;
          text.textContent = CONFIG.buttonText;
          btn.onclick = startGameRitual;
        }
      });
    });
    
    return button;
  }
  
  // Starte Spiel-Ritual
  function startGameRitual() {
    // Öffne Ritual-Wizard in neuem Tab oder Modal
    const wizardUrl = CONFIG.ritualWizardUrl;
    
    // Prüfe ob wir im selben Origin sind
    if (wizardUrl.startsWith('/') || wizardUrl.startsWith(window.location.origin)) {
      window.location.href = wizardUrl;
    } else {
      // Externe URL: Öffne in neuem Tab
      window.open(wizardUrl, '_blank');
    }
  }
  
  // Starte nBlockbuster
  function startNblockbuster() {
    const nbUrl = CONFIG.nblockbusterUrl;
    
    if (nbUrl.startsWith('/') || nbUrl.startsWith(window.location.origin)) {
      window.location.href = nbUrl;
    } else {
      window.open(nbUrl, '_blank');
    }
  }
  
  // Auto-Init wenn Data-Attribut vorhanden
  document.addEventListener('DOMContentLoaded', () => {
    const autoInit = document.querySelector('[data-manifest-hive-game-entry]');
    if (autoInit) {
      const selector = autoInit.getAttribute('data-manifest-hive-game-entry');
      initButton(selector || '[data-manifest-hive-game-entry]');
    }
  });
  
  // Export für globale Verwendung
  window.ManifestHiveGameEntry = {
    init: initButton,
    startRitual: startGameRitual,
    startNblockbuster: startNblockbuster,
    createButton: createButtonHTML,
    config: CONFIG
  };
  
  // Console-Hinweis
  console.log('[Manifest-Hive] Game Entry Button System geladen. Nutze window.ManifestHiveGameEntry.init("#container")');
})();



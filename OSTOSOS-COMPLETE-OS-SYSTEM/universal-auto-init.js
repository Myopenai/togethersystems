// T,. OSOTOSOS - Universal Auto-Initialisierung
// Automatisiert alle User-Interaktionen - 99.99% System, 0.01% User

(function() {
  'use strict';
  
  // Warte auf DOM ready
  function init() {
    // 1. Auto-Fill alle Input-Felder (wo möglich)
    autoFillInputs();
    
    // 2. Auto-Enable alle Buttons (wo sinnvoll)
    autoEnableButtons();
    
    // 3. Auto-Show alle Help-Tooltips
    autoShowTooltips();
    
    // 4. Auto-Complete für alle Inputs
    enableAutoComplete();
    
    // 5. Progress-Indikatoren für alle Buttons
    addProgressIndicators();
    
    // 6. Auto-Expand alle Collapsible Sections
    autoExpandSections();
    
    // 7. Auto-Scroll zu wichtigem Content
    autoScrollToContent();
    
    console.log('[AUTO-INIT] Alle Auto-Funktionen aktiviert');
  }
  
  function autoFillInputs() {
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], textarea').forEach(input => {
      // Prüfe ob bereits Wert vorhanden
      if (input.value) return;
      
      // Prüfe ob localStorage Wert hat
      const key = `auto-fill-${input.id || input.name || input.placeholder}`;
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          input.value = saved;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } catch(e) {}
      
      // Auto-Save bei Änderung
      input.addEventListener('input', function() {
        try {
          localStorage.setItem(key, this.value);
        } catch(e) {}
      });
    });
  }
  
  function autoEnableButtons() {
    // Buttons die automatisch aktiviert werden können
    document.querySelectorAll('button[disabled], button:not([onclick]):not([id])').forEach(btn => {
      // Prüfe ob Button wirklich disabled sein sollte
      if (btn.hasAttribute('data-manual-only')) return;
      
      // Auto-Enable nach kurzer Verzögerung
      setTimeout(() => {
        if (btn.disabled && !btn.hasAttribute('data-keep-disabled')) {
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      }, 100);
    });
  }
  
  function autoShowTooltips() {
    // Füge Tooltips zu allen Buttons ohne title hinzu
    document.querySelectorAll('button:not([title]), a:not([title])').forEach(el => {
      const text = el.textContent.trim() || el.innerText.trim();
      if (text && text.length < 50) {
        el.setAttribute('title', text);
        el.setAttribute('aria-label', text);
      }
    });
  }
  
  function enableAutoComplete() {
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="url"]').forEach(input => {
      if (!input.hasAttribute('autocomplete')) {
        // Bestimme autocomplete basierend auf placeholder/name/id
        let autocomplete = 'off';
        const placeholder = (input.placeholder || '').toLowerCase();
        const name = (input.name || input.id || '').toLowerCase();
        
        if (placeholder.includes('email') || name.includes('email')) autocomplete = 'email';
        else if (placeholder.includes('name') || name.includes('name')) autocomplete = 'name';
        else if (placeholder.includes('url') || name.includes('url')) autocomplete = 'url';
        else if (placeholder.includes('suche') || name.includes('search')) autocomplete = 'off';
        else autocomplete = 'on';
        
        input.setAttribute('autocomplete', autocomplete);
      }
    });
  }
  
  function addProgressIndicators() {
    document.querySelectorAll('button:not([data-no-progress])').forEach(btn => {
      // Prüfe ob bereits Progress-Indikator vorhanden
      if (btn.querySelector('.progress-indicator')) return;
      
      const indicator = document.createElement('span');
      indicator.className = 'progress-indicator';
      indicator.style.cssText = 'display:none;margin-left:8px;';
      indicator.innerHTML = '⏳';
      btn.appendChild(indicator);
      
      // Zeige Progress bei Click
      btn.addEventListener('click', function() {
        indicator.style.display = 'inline';
        setTimeout(() => {
          indicator.style.display = 'none';
        }, 2000);
      });
    });
  }
  
  function autoExpandSections() {
    // Auto-Expand alle Collapsible Sections (wenn nicht explizit collapsed)
    document.querySelectorAll('details, .collapsible, [data-collapsible]').forEach(section => {
      if (!section.hasAttribute('data-keep-collapsed')) {
        section.open = true;
        section.classList.remove('collapsed');
      }
    });
  }
  
  function autoScrollToContent() {
    // Auto-Scroll zu wichtigem Content (nur wenn keine Hash vorhanden)
    if (!window.location.hash) {
      const mainContent = document.querySelector('main, .main-content, #content');
      if (mainContent) {
        setTimeout(() => {
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }
  
  // Initialisiere sofort wenn DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Export für externe Nutzung
  window.OSOS_AUTO_INIT = {
    reinit: init,
    autoFillInputs: autoFillInputs,
    autoEnableButtons: autoEnableButtons,
    autoShowTooltips: autoShowTooltips
  };
})();


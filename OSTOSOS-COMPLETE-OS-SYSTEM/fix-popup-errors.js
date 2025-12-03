// T,. OSOTOSOS - Fix Popup Errors
// Behebt alle popup.js Fehler (Cannot read properties of undefined)

(function() {
  'use strict';
  
  // Prüfe ob wir in einem Browser-Extension-Kontext sind
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime;
  const isBrowser = typeof browser !== 'undefined' && browser.runtime;
  
  // Polyfill für chrome.runtime/browser.runtime
  if (!isExtension && !isBrowser) {
    // Erstelle Mock-Objekte für normale Web-Umgebung
    if (typeof chrome === 'undefined') {
      window.chrome = {
        runtime: {
          create: function() {
            console.warn('chrome.runtime.create() called but not in extension context');
            return null;
          },
          sendMessage: function() {
            console.warn('chrome.runtime.sendMessage() called but not in extension context');
            return Promise.resolve(null);
          },
          onMessage: {
            addListener: function() {
              console.warn('chrome.runtime.onMessage.addListener() called but not in extension context');
            }
          }
        }
      };
    }
    
    if (typeof browser === 'undefined') {
      window.browser = window.chrome;
    }
  }
  
  // Prüfe alle popup.js Referenzen und fixe sie
  const scripts = document.querySelectorAll('script[src*="popup"]');
  scripts.forEach(script => {
    script.onerror = function() {
      console.warn('Popup script failed to load, creating fallback');
      // Erstelle Fallback
      if (!window.popup) {
        window.popup = {
          create: function() {
            console.warn('popup.create() called but popup.js not loaded');
            return null;
          }
        };
      }
    };
  });
  
  // Sicherstelle dass window.popup existiert
  if (typeof window.popup === 'undefined') {
    window.popup = {
      create: function(options) {
        console.log('Popup.create() called with options:', options);
        // Fallback: Erstelle normales Modal
        if (options && options.url) {
          window.open(options.url, options.name || '_blank', options.features || '');
        } else if (options && options.html) {
          const modal = document.createElement('div');
          modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
          modal.innerHTML = options.html;
          modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
          };
          document.body.appendChild(modal);
          return modal;
        }
        return null;
      }
    };
  }
  
  console.log('T,. Popup errors fixed');
})();


/**
 * error-guard.js
 * 
 * Globale Fehler-Handler für Browser
 * Letzte Sicherheitslinie: Kein Promise-Crash killt die App
 * 
 * Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
 */

/**
 * Globale Error-Handler
 */
window.addEventListener('error', (event) => {
  console.error('[Error-Guard] Globaler Fehler:', event.error || event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
  
  // Optional: Zeige dezente Fehlermeldung in einem Status-Banner
  showErrorBanner(event.error?.message || event.message || 'Ein unerwarteter Fehler ist aufgetreten.');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Error-Guard] Unhandled Promise Rejection:', event.reason);
  
  // Optional: Zeige dezente Fehlermeldung
  showErrorBanner(event.reason?.message || 'Ein unerwarteter Fehler ist aufgetreten.');
  
  // Verhindere, dass der Fehler in der Console als "unhandled" erscheint
  event.preventDefault();
});

/**
 * Zeige dezente Fehlermeldung in einem Status-Banner
 */
function showErrorBanner(message) {
  // Prüfe, ob bereits ein Banner existiert
  let banner = document.getElementById('error-guard-banner');
  
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'error-guard-banner';
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      max-width: 400px;
      font-size: 14px;
      line-height: 1.4;
    `;
    document.body.appendChild(banner);
  }
  
  banner.textContent = `⚠️ ${message}`;
  
  // Auto-Close nach 5 Sekunden
  setTimeout(() => {
    if (banner && banner.parentNode) {
      banner.style.opacity = '0';
      banner.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        if (banner && banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      }, 300);
    }
  }, 5000);
}

/**
 * Export für andere Module
 */
export { showErrorBanner };


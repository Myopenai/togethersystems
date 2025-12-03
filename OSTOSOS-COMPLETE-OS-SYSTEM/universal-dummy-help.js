// T,. OSOTOSOS - Universal Dummy-Help System
// Fügt automatisch Erklärungen für technische Begriffe hinzu

(function() {
  'use strict';
  
  const explanations = {
    'API': 'Application Programming Interface - Eine Schnittstelle, über die Programme miteinander kommunizieren. Du musst nichts tun, das System macht das automatisch.',
    'REST': 'Representational State Transfer - Ein Standard für die Kommunikation zwischen Programmen. Funktioniert automatisch im Hintergrund.',
    'JSON': 'JavaScript Object Notation - Ein Format zum Speichern von Daten. Du siehst es nicht, das System nutzt es automatisch.',
    'WebSocket': 'Eine Verbindungstechnologie für Echtzeit-Kommunikation. Funktioniert automatisch, du musst nichts tun.',
    'HMAC': 'Hash-based Message Authentication Code - Ein Sicherheitscode zur Verifizierung. Wird automatisch erstellt und geprüft.',
    'Ed25519': 'Ein Verschlüsselungsalgorithmus. Wird automatisch verwendet, du musst nichts wissen.',
    'ECDSA': 'Elliptic Curve Digital Signature Algorithm - Ein Verschlüsselungsalgorithmus. Funktioniert automatisch.',
    'IndexedDB': 'Eine Datenbank im Browser. Speichert Daten automatisch, du siehst sie nicht.',
    'Service Worker': 'Ein Hintergrundprogramm für Offline-Funktionalität. Läuft automatisch, du merkst es nicht.',
    'P2P': 'Peer-to-Peer - Direkte Verbindung zwischen Geräten. Funktioniert automatisch im Hintergrund.',
    'Mesh': 'Mesh-Netzwerk - Geräte verbinden sich direkt miteinander. Passiert automatisch, du musst nichts tun.'
  };
  
  function addExplanations() {
    // Finde alle technischen Begriffe im Text
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim().length > 0) {
        textNodes.push(node);
      }
    }
    
    // Füge Erklärungen hinzu
    textNodes.forEach(textNode => {
      let text = textNode.textContent;
      let modified = false;
      
      Object.keys(explanations).forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (regex.test(text) && !text.includes(explanations[term])) {
          text = text.replace(regex, (match) => {
            modified = true;
            return `${match} <span class="dummy-help" title="${explanations[term]}" style="cursor:help;border-bottom:1px dotted;color:var(--davinci-accent-primary,#10b981)">ℹ️</span>`;
          });
        }
      });
      
      if (modified) {
        const wrapper = document.createElement('span');
        wrapper.innerHTML = text;
        textNode.parentNode.replaceChild(wrapper, textNode);
      }
    });
  }
  
  // Initialisiere
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addExplanations);
  } else {
    addExplanations();
  }
  
  window.OSOS_DUMMY_HELP = { addExplanations };
})();


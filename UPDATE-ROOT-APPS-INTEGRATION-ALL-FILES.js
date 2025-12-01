// T,. UPDATE ROOT APPS INTEGRATION - ALL FILES
// Aktualisiert ROOT-APPS-INTEGRATION.js mit ALLEN HTML-Dateien aus dem Root

/**
 * Diese Funktion scannt automatisch alle HTML-Dateien im Root
 * und fügt sie zur ROOT-APPS-INTEGRATION hinzu
 */

function scanAllRootHTMLFiles() {
  // Diese Funktion wird im Browser ausgeführt
  // Sie scannt alle verfügbaren HTML-Dateien
  
  const knownFiles = [
    // Core System
    'index.html', 'admin.html', 'admin-monitoring.html', 'business-admin.html',
    'manifest-forum.html', 'manifest-portal.html', 'honeycomb.html', 'legal-hub.html',
    
    // Help Files
    'help-portal.html', 'help-online-portal.html', 'help-manifest.html',
    'help-honeycomb.html', 'help-legal-hub.html', 'help-getting-started.html',
    
    // OS Files
    'osos-full.html', 'OSOSOS-COMPLETE-OFFLINE-OS.html', 'OSTOSOS-OS-COMPLETE-SYSTEM.html',
    'OSTOSOS-OPERATING-SYSTEM-INSTALLER.html', 'OSTOSOS-ANKUENDIGUNG.html',
    
    // Production
    'OSO-PRODUKTIONS-SYSTEM-COMPLETE.html', 'OSO-PRODUKTIONS-SYSTEM-COMPLETE-EXTENDED.html',
    'production-dashboard.html', 'PRODUKTIONSPROZESS-DATEIEN-DASHBOARD.html',
    
    // Tools
    'encryption-dashboard.html', 'encryption-laboratory.html',
    'source-code-fach.html', 'suos-braintext-system.html',
    'neural-network-console.html',
    
    // Business
    'investment-presentation.html', 'bank-contact-universe.html',
    'duurzaam-bouwen-nederland.html',
    
    // Visualization & Healing
    'Cosmic Visualizer Enterprise Universe XXL.html',
    'Interaktive Applikation – Heilungsspirale Studio.html',
    'Global Healing Portal – Wisdom & Traditions.html',
    'heilungspirale.html', 'Heilungsspirale Pro.html',
    'Heilungsspirale Pro – Standalone.html', 'Heilungsspirale DR.Tel.html',
    
    // Other
    'Builder – Bereinigte Version.html', 'ostos-branding.html',
    'cms-dashboard.html', 'JJC-SUPERVISOR-GATE.html',
    'Portal – Start.html', '404.html',
    'ABSOLUTES SYSTEM – TTT Enterprise Universe Manifest.html',
    'G0XBU WEBSDR - Jodrell 1.html',
    'IN TIME - Die Zeit läuft ab _ Gently Overdone.html',
    'OnAirMulTiMedia – Start.html', 'OnAirMulTiMedia – Start & Verteiler.html',
    'Job-Angebot - Together Systems Developer.html',
    'JOB-ANGEBOT-ENTWICKLER.html',
    'Microsoft-Account-Android-Erklaerung.html',
    'OS-GERAETE-UND-PLATTFORMEN.html',
    'TTT-UPLOAD-STORY-INTERACTIVE.html',
    'TTT 9 1 1 T..html',
    'TogetherSystems · Enterprise Universe Licensed Space T,.&T,,. · Upload Portal.html',
    'Together Systems & Startup Systems · Global Invitation · Studio DaVinci XL.html',
    'Progressor Systems · Together Systems · Globaler Local Host Zirkel.html',
    'TTT · T-Point · Teladia · Telbank · Deutsche Bank · American Express Route Systems.html',
    'TEL1.NL Parteiprogramm - Sozial gerechter Einsatz des BBP in den Niederlanden _ Partei X _ Raymond Demitrio Dr. Tel.html',
    'TEL1.NL Parteiprogramm - Interaktive Datenbank.html',
    'suppliers-story.html',
    'settings-graph-explorer.html',
    'SETTINGS-MASTER-DASHBOARD.html',
    'FINANZIERUNGSERSCHEN-VIEWUNITY-TOGETHERSYSTEMS.html',
    'Developer Portal - Together Systems.html'
  ];
  
  // Alle konvertierten MD-Dateien (werden automatisch erkannt)
  const mdConvertedFiles = [];
  knownFiles.forEach(file => {
    if (file.endsWith('.md')) {
      mdConvertedFiles.push(file.replace('.md', '.html'));
    }
  });
  
  return {
    knownFiles: knownFiles.filter(f => f.endsWith('.html')),
    mdConvertedFiles,
    total: knownFiles.filter(f => f.endsWith('.html')).length + mdConvertedFiles.length
  };
}

// Auto-Update ROOT-APPS-INTEGRATION
if (typeof window !== 'undefined' && window.ROOT_APPS_INTEGRATION) {
  const scannedFiles = scanAllRootHTMLFiles();
  console.log(`📦 ${scannedFiles.total} HTML-Dateien für Integration gefunden`);
  
  // Erweitere apps-Array dynamisch
  scannedFiles.knownFiles.forEach(file => {
    const exists = window.ROOT_APPS_INTEGRATION.apps.some(app => app.file === file);
    if (!exists) {
      const id = file.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      window.ROOT_APPS_INTEGRATION.apps.push({
        id,
        title: file.replace('.html', ''),
        description: `Automatisch integrierte Datei: ${file}`,
        file,
        category: 'documentation',
        icon: '📄',
        standalone: true
      });
    }
  });
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scanAllRootHTMLFiles };
}


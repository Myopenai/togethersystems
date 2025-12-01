// Browser-basiertes Extraktions-Script
// Wird im Browser-Konsole von thynkorders.com ausgeführt
// Extrahiert ALLE Daten direkt vom Browser

// Anleitung:
// 1. Loggen Sie sich in thynkorders.com ein
// 2. Öffnen Sie Browser-Konsole (F12)
// 3. Kopieren Sie diesen Code und fügen Sie ein
// 4. Führen Sie aus: extractAllThynkData()

async function extractAllThynkData() {
  console.log('🔍 Starte vollständige Extraktion aller THYNK ORDERS Daten...\n');
  
  const extracted = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    salesforce: {},
    dimensions: {},
    neural_networks: {},
    database: {},
    api_endpoints: {},
    workflows: {}
  };

  try {
    // 1. Salesforce-Konfigurationen aus Window-Objekten
    if (window.sfdc) {
      extracted.salesforce = {
        org_id: window.sfdc.orgId || window.sfdc.organizationId,
        instance_url: window.sfdc.instanceUrl,
        api_version: window.sfdc.apiVersion,
        session_id: window.sfdc.sessionId ? '[REDACTED]' : null,
        user_id: window.sfdc.userId
      };
    }

    // 2. Alle LocalStorage-Daten
    const localStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('thynk') || key.includes('salesforce') || key.includes('order')) {
        try {
          localStorageData[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          localStorageData[key] = localStorage.getItem(key);
        }
      }
    }
    extracted.localStorage = localStorageData;

    // 3. Alle SessionStorage-Daten
    const sessionStorageData = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      try {
        sessionStorageData[key] = JSON.parse(sessionStorage.getItem(key));
      } catch {
        sessionStorageData[key] = sessionStorage.getItem(key);
      }
    }
    extracted.sessionStorage = sessionStorageData;

    // 4. API-Endpunkte aus Network-Requests
    const apiEndpoints = new Set();
    if (window.performance && window.performance.getEntriesByType) {
      const entries = window.performance.getEntriesByType('resource');
      entries.forEach(entry => {
        if (entry.name.includes('/api/') || entry.name.includes('/services/')) {
          apiEndpoints.add(entry.name);
        }
      });
    }
    extracted.api_endpoints = Array.from(apiEndpoints);

    // 5. JavaScript-Objekte analysieren
    const windowObjects = {};
    for (let key in window) {
      if (key.includes('thynk') || key.includes('order') || key.includes('salesforce')) {
        try {
          windowObjects[key] = typeof window[key];
        } catch {}
      }
    }
    extracted.window_objects = windowObjects;

    // 6. Angular/React/Vue Komponenten (falls vorhanden)
    if (window.ng) {
      extracted.framework = 'Angular';
      extracted.angular_components = Object.keys(window.ng.probe(document.body)?.componentInstance || {});
    }
    if (window.React) {
      extracted.framework = 'React';
    }
    if (window.Vue) {
      extracted.framework = 'Vue';
    }

    // 7. Alle Config-Objekte im Window
    const configs = {};
    for (let key in window) {
      if (key.toLowerCase().includes('config') || key.toLowerCase().includes('setting')) {
        try {
          configs[key] = window[key];
        } catch {}
      }
    }
    extracted.configs = configs;

    // 8. Alle API-Calls aus Network-Listener
    const networkCalls = [];
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      networkCalls.push({
        url: args[0],
        method: args[1]?.method || 'GET',
        headers: args[1]?.headers,
        timestamp: new Date().toISOString()
      });
      return originalFetch.apply(this, args);
    };

    // 9. Download als JSON
    const dataStr = JSON.stringify(extracted, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thynk-orders-extraction-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('✅ Extraktion abgeschlossen!');
    console.log('📥 JSON-Datei wurde heruntergeladen');
    
    return extracted;

  } catch (error) {
    console.error('❌ Fehler bei Extraktion:', error);
    return { error: error.message };
  }
}

// Funktion für manuelle Ausführung
window.extractThynkOrdersData = extractAllThynkData;

console.log('✅ Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractAllThynkData()');
console.log('   Oder: window.extractThynkOrdersData()');


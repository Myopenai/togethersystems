// Script zur Analyse von thynkorders.com und Extraktion aller Konfigurationen
// Quelle: https://thynkorders.com/#/userCenter

// Dieses Script analysiert die thynkorders.com Website und extrahiert:
// - Salesforce CRM Konfigurationen
// - Dimensionen
// - Neuronale Netzwerke
// - User Center Einstellungen

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://thynkorders.com';
const CONFIG_DIR = path.join(__dirname, '../config');
const EXPORT_DIR = path.join(__dirname, '../exports');

// Erstelle Verzeichnisse falls nicht vorhanden
[CONFIG_DIR, EXPORT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Fetch-Funktion für HTTPS
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Analysiere HTML/JavaScript nach Konfigurationen
function extractConfigsFromHTML(html) {
  const configs = {
    salesforce: {},
    dimensions: {},
    neural_networks: {},
    user_center: {}
  };

  // Suche nach Salesforce-Konfigurationen
  const salesforceMatches = html.match(/salesforce[\s\S]{0,500}/gi);
  if (salesforceMatches) {
    console.log('📋 Salesforce-Konfigurationen gefunden');
    // Extrahiere relevante Informationen
  }

  // Suche nach Dimensionen
  const dimensionMatches = html.match(/dimension[s]?[\s\S]{0,500}/gi);
  if (dimensionMatches) {
    console.log('📐 Dimensionen gefunden');
  }

  // Suche nach Neural Network / AI
  const aiMatches = html.match(/(neural|ai|machine.?learning|ml|prediction)[\s\S]{0,500}/gi);
  if (aiMatches) {
    console.log('🧠 AI/Neural Network Referenzen gefunden');
  }

  return configs;
}

// API-Endpunkte analysieren (falls verfügbar)
async function analyzeAPIEndpoints() {
  const endpoints = [
    '/api/config',
    '/api/salesforce',
    '/api/dimensions',
    '/api/neural-network',
    '/api/user-center'
  ];

  const foundEndpoints = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(BASE_URL + endpoint);
      if (response.status === 200) {
        foundEndpoints.push({
          endpoint,
          status: response.status,
          available: true
        });
        console.log(`✅ API gefunden: ${endpoint}`);
      }
    } catch (err) {
      // Endpoint nicht verfügbar - normal
    }
  }

  return foundEndpoints;
}

// Hauptfunktion: Vollständige Analyse
async function analyzeThynkOrders() {
  console.log('🔍 Starte Analyse von thynkorders.com...\n');

  try {
    // 1. Hauptseite analysieren
    console.log('📄 Analysiere Hauptseite...');
    const mainPage = await fetch(BASE_URL);
    const html = await mainPage.text();
    
    // Speichere HTML für spätere Analyse
    fs.writeFileSync(
      path.join(EXPORT_DIR, 'thynk-orders-html-export.html'),
      html
    );
    console.log('✅ HTML gespeichert\n');

    // 2. Configs aus HTML extrahieren
    const configs = extractConfigsFromHTML(html);

    // 3. API-Endpunkte prüfen
    console.log('🔌 Prüfe API-Endpunkte...');
    const apiEndpoints = await analyzeAPIEndpoints();
    console.log(`✅ ${apiEndpoints.length} API-Endpunkte gefunden\n`);

    // 4. Salesforce-spezifische Analyse
    console.log('☁️ Analysiere Salesforce-Integration...');
    const salesforceInfo = {
      platform: 'Salesforce CRM',
      detected: html.includes('salesforce') || html.includes('Salesforce'),
      org_id: extractOrgId(html),
      api_version: extractAPIVersion(html)
    };
    console.log('✅ Salesforce-Info gesammelt\n');

    // 5. Zusammenfassung erstellen
    const analysisReport = {
      analyzed_at: new Date().toISOString(),
      source: BASE_URL,
      findings: {
        salesforce: salesforceInfo,
        api_endpoints: apiEndpoints,
        html_size: html.length,
        detected_features: {
          has_salesforce: html.includes('salesforce'),
          has_dimensions: html.includes('dimension'),
          has_ai: html.includes('neural') || html.includes('ai') || html.includes('prediction'),
          has_user_center: html.includes('userCenter') || html.includes('user-center')
        }
      },
      recommendations: [
        'Fügen Sie manuell Salesforce Org-ID und Credentials hinzu',
        'Überprüfen Sie die API-Endpunkte mit authentifiziertem Zugriff',
        'Extrahiere Neuronale Netzwerk-Konfigurationen aus dem Backend',
        'Übernehme User Center Konfigurationen 1:1'
      ]
    };

    // Speichere Analyse-Report
    fs.writeFileSync(
      path.join(EXPORT_DIR, 'thynk-orders-analysis-report.json'),
      JSON.stringify(analysisReport, null, 2)
    );

    console.log('📊 Analyse-Report erstellt\n');
    console.log('✅ Analyse abgeschlossen!');
    console.log(`📁 Reports gespeichert in: ${EXPORT_DIR}`);

    return analysisReport;

  } catch (error) {
    console.error('❌ Fehler bei der Analyse:', error);
    throw error;
  }
}

// Hilfsfunktionen
function extractOrgId(html) {
  const match = html.match(/(?:org[_-]?id|organization[_-]?id|instance[_-]?url)[\s:=]+([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

function extractAPIVersion(html) {
  const match = html.match(/(?:api[_-]?version|v\d{2}\.0)/i);
  return match ? match[0] : null;
}

// Export
if (require.main === module) {
  analyzeThynkOrders()
    .then(report => {
      console.log('\n📋 Zusammenfassung:');
      console.log(JSON.stringify(report.findings, null, 2));
    })
    .catch(console.error);
}

module.exports = { analyzeThynkOrders, extractConfigsFromHTML };


// Automatisches Test-System - Testet alle HTML-Dateien unaufhörlich bis fehlerfrei
// Nutzt Playwright MCP für Browser-Tests

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HTML_FILES = [
  { file: 'index.html', name: 'Index' },
  { file: 'manifest-forum.html', name: 'Manifest Forum' },
  { file: 'manifest-portal.html', name: 'Manifest Portal', features: ['Gleichgewichts-Börse', 'Nachrichten-System'] },
  { file: 'legal-hub.html', name: 'Legal Hub' },
  { file: 'honeycomb.html', name: 'Honeycomb' },
  { file: 'neural-network-console.html', name: 'Neural Network Console', features: ['AI Gateway', 'Neural Network'] },
  { file: 'admin-monitoring.html', name: 'Admin Monitoring' },
  { file: 'admin.html', name: 'Admin' },
  { file: 'business-admin.html', name: 'Business Admin' },
  { file: 'production-dashboard.html', name: 'Production Dashboard', features: ['Production Metrics', 'KPI Dashboard'] },
];

let iteration = 0;
let totalErrors = 0;
let consecutiveClean = 0;

async function testPage(filePath, name, features = []) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  const featureTests = [];
  
  // Console-Error-Handler
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      // Filtere bekannte/erwartete Fehler
      if (!text.includes('favicon') && !text.includes('404') && !text.includes('net::ERR_FILE_NOT_FOUND') && !text.includes('/api/')) {
        errors.push({
          type: 'console',
          message: text,
          location: msg.location().url
        });
      }
    } else if (type === 'warning') {
      warnings.push({
        type: 'warning',
        message: text
      });
    }
  });
  
  // Page-Error-Handler
  page.on('pageerror', error => {
    errors.push({
      type: 'pageerror',
      message: error.message,
      stack: error.stack
    });
  });
  
  // Request-Error-Handler
  page.on('requestfailed', request => {
    const url = request.url();
    // Filtere bekannte 404s (z.B. API-Endpoints die auf GitHub Pages nicht verfügbar sind)
    if (!url.includes('/api/') && !url.includes('favicon') && request.failure()) {
      errors.push({
        type: 'request',
        message: `Request failed: ${url}`,
        failure: request.failure().errorText
      });
    }
  });
  
  try {
    // Navigate zur Seite
    const fullPath = path.resolve(filePath);
    await page.goto(`file://${fullPath}`, { waitUntil: 'networkidle', timeout: 10000 });
    
    // Warte kurz für JavaScript-Initialisierung
    await page.waitForTimeout(2000);
    
    // Teste spezifische Features
    if (filePath === 'manifest-portal.html') {
      // Test Gleichgewichts-Börse
      try {
        const boerseTab = page.locator('#navBalancedExchange');
        if (await boerseTab.isVisible()) {
          featureTests.push({ feature: 'Gleichgewichts-Börse Tab', status: 'OK' });
          await boerseTab.click();
          await page.waitForTimeout(500);
          
          const boersePanel = page.locator('#balanced-exchange-panel');
          if (await boersePanel.isVisible()) {
            featureTests.push({ feature: 'Gleichgewichts-Börse Panel', status: 'OK' });
          } else {
            featureTests.push({ feature: 'Gleichgewichts-Börse Panel', status: 'MISSING' });
          }
        } else {
          featureTests.push({ feature: 'Gleichgewichts-Börse Tab', status: 'MISSING' });
        }
      } catch (e) {
        featureTests.push({ feature: 'Gleichgewichts-Börse', status: 'ERROR', error: e.message });
      }
      
      // Test Nachrichten-System
      try {
        const messagesTab = page.locator('#navMessages');
        if (await messagesTab.isVisible()) {
          featureTests.push({ feature: 'Nachrichten Tab', status: 'OK' });
          await messagesTab.click();
          await page.waitForTimeout(500);
          
          const messagesPanel = page.locator('#messages-panel');
          if (await messagesPanel.isVisible()) {
            featureTests.push({ feature: 'Nachrichten Panel', status: 'OK' });
          } else {
            featureTests.push({ feature: 'Nachrichten Panel', status: 'MISSING' });
          }
        } else {
          featureTests.push({ feature: 'Nachrichten Tab', status: 'MISSING' });
        }
      } catch (e) {
        featureTests.push({ feature: 'Nachrichten-System', status: 'ERROR', error: e.message });
      }
    }
    
    // Prüfe auf JavaScript-Fehler in der Konsole
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    // Prüfe auf uncaught exceptions
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
  } catch (err) {
    errors.push({
      type: 'navigation',
      message: err.message
    });
  } finally {
    await browser.close();
  }
  
  return { errors, warnings, featureTests };
}

async function runTests() {
  console.log(`\n🔄 Test-Iteration ${++iteration}\n`);
  console.log('='.repeat(60));
  
  let iterationErrors = 0;
  let allResults = {};
  
  for (const { file, name } of HTML_FILES) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  ${name}: Datei nicht gefunden\n`);
      continue;
    }
    
    console.log(`📄 Teste: ${name} (${file})`);
    
    try {
      const result = await testPage(file, name, fileConfig?.features || []);
      allResults[file] = result;
      
      // Feature-Tests anzeigen
      if (result.featureTests && result.featureTests.length > 0) {
        console.log(`   🎯 Features:`);
        result.featureTests.forEach(test => {
          if (test.status === 'OK') {
            console.log(`      ✅ ${test.feature}`);
          } else if (test.status === 'MISSING') {
            console.log(`      ❌ ${test.feature} - FEHLT!`);
            iterationErrors++;
          } else {
            console.log(`      ⚠️  ${test.feature} - ERROR: ${test.error}`);
            iterationErrors++;
          }
        });
      }
      
      if (result.errors.length > 0) {
        iterationErrors += result.errors.length;
        console.log(`   ❌ ${result.errors.length} Fehler gefunden:`);
        result.errors.forEach((err, idx) => {
          console.log(`      ${idx + 1}. [${err.type}] ${err.message.substring(0, 100)}`);
        });
      } else {
        console.log(`   ✅ Keine JavaScript-Fehler`);
      }
      
      if (result.warnings.length > 0) {
        console.log(`   ⚠️  ${result.warnings.length} Warnungen`);
      }
    } catch (err) {
      iterationErrors++;
      console.log(`   ❌ Test-Fehler: ${err.message}`);
    }
    
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log(`\n📊 Iteration ${iteration} Ergebnis:`);
  console.log(`   - Fehler gefunden: ${iterationErrors}`);
  console.log(`   - Dateien geprüft: ${HTML_FILES.length}\n`);
  
  totalErrors += iterationErrors;
  
  if (iterationErrors === 0) {
    consecutiveClean++;
    console.log(`✅ Clean run #${consecutiveClean}`);
    
    if (consecutiveClean >= 3) {
      console.log('\n✅✅✅ ALLE TESTS BESTANDEN! ✅✅✅\n');
      console.log(`📊 Gesamt-Statistiken:`);
      console.log(`   - Iterationen: ${iteration}`);
      console.log(`   - Gesamt-Fehler: ${totalErrors}`);
      console.log(`   - Dateien geprüft: ${HTML_FILES.length}\n`);
      return { success: true, errors: 0 };
    }
  } else {
    consecutiveClean = 0;
    console.log(`⚠️  ${iterationErrors} Fehler gefunden, führe Fix aus...\n`);
  }
  
  return { success: false, errors: iterationErrors, results: allResults };
}

// Automatischer Loop: Test → Fix → Test → ...
async function runUntilPerfect() {
  console.log('🚀 Starte automatisches Test-System...\n');
  console.log('📋 Ziel: Alle HTML-Dateien fehlerfrei testen\n');
  
  let maxIterations = 100; // Safety limit
  let needsFix = false;
  
  while (maxIterations-- > 0) {
    const result = await runTests();
    
    if (result.success) {
      console.log('✅✅✅ ALLE TESTS BESTANDEN - SYSTEM BEREIT FÜR DEPLOYMENT ✅✅✅\n');
      break;
    }
    
    if (result.errors > 0) {
      needsFix = true;
      console.log(`\n🔧 Starte automatische Fehlerbehebung...\n`);
      
      // Führe Fix-Script aus
      const { execSync } = require('child_process');
      try {
        execSync('node fix-all-api-errors.js', { stdio: 'inherit' });
        console.log('\n✅ Fehlerbehebung abgeschlossen\n');
      } catch (err) {
        console.log(`\n⚠️  Fehlerbehebung fehlgeschlagen: ${err.message}\n`);
      }
    }
    
    // Warte kurz vor nächstem Test
    console.log('⏳ Warte 2 Sekunden vor nächstem Test...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  if (maxIterations <= 0) {
    console.log('\n⚠️  Maximale Iterationen erreicht');
  }
  
  return { success: consecutiveClean >= 3, totalErrors };
}

// Export für Module-Nutzung
module.exports = { runUntilPerfect, testPage, runTests };

// Auto-Run wenn direkt ausgeführt
if (require.main === module) {
  runUntilPerfect().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(err => {
    console.error('❌ Fataler Fehler:', err);
    process.exit(1);
  });
}


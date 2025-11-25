// AUTOMATISCHER TEST-RUNNER FÜR ALLE NEUEN FEATURES
// Testet Gleichgewichts-Börse, Nachrichten, Production Dashboard, Neural Network Console

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FEATURES_TO_TEST = {
  'manifest-portal.html': {
    features: [
      { name: 'Gleichgewichts-Börse Tab', selector: '#navBalancedExchange', action: 'click' },
      { name: 'Gleichgewichts-Börse Panel', selector: '#balanced-exchange-panel', wait: 500 },
      { name: 'Nachrichten Tab', selector: '#navMessages', action: 'click' },
      { name: 'Nachrichten Panel', selector: '#messages-panel', wait: 500 },
      { name: 'Nachrichten Inbox Button', selector: '#btnMessagesInbox' },
      { name: 'Nachrichten Outbox Button', selector: '#btnMessagesOutbox' },
      { name: 'Nachrichten Compose Button', selector: '#btnMessagesCompose' },
      { name: 'Instrumente laden Button', selector: '#btnLoadInstruments' },
      { name: 'Real-Bilanz-Waage', selector: '#balanceWaage' },
    ]
  },
  'production-dashboard.html': {
    features: [
      { name: 'Global KPIs', selector: '.kpi' },
      { name: 'Production Progress', selector: 'text=Production Progress' },
      { name: 'Error Behavior', selector: 'text=Error Behavior' },
      { name: 'Backup Status', selector: 'text=Backup Status' },
    ]
  },
  'neural-network-console.html': {
    features: [
      { name: 'AI Operationen', selector: 'select, [data-operation]' },
      { name: 'Eingabefelder', selector: 'textarea' },
      { name: 'Ergebnis-Anzeige', selector: '.result, [id*="result"]' },
    ]
  }
};

async function testFeature(file, feature) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const results = [];
  
  try {
    const fullPath = path.resolve(file);
    await page.goto(`file://${fullPath}`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Prüfe Console-Errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404') && !text.includes('net::ERR_FILE_NOT_FOUND') && !text.includes('/api/')) {
          errors.push({ type: 'console_error', message: text });
        }
      }
    });
    
    page.on('pageerror', error => {
      errors.push({ type: 'page_error', message: error.message });
    });
    
    // Teste Feature
    try {
      if (feature.action === 'click') {
        await page.click(feature.selector, { timeout: 3000 });
        if (feature.wait) await page.waitForTimeout(feature.wait);
      }
      
      const element = page.locator(feature.selector);
      const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        results.push({ feature: feature.name, status: 'OK' });
      } else {
        results.push({ feature: feature.name, status: 'MISSING' });
        errors.push({ type: 'feature_missing', message: `Feature "${feature.name}" nicht sichtbar` });
      }
    } catch (e) {
      results.push({ feature: feature.name, status: 'ERROR', error: e.message });
      errors.push({ type: 'feature_error', message: `Feature "${feature.name}": ${e.message}` });
    }
    
  } catch (err) {
    errors.push({ type: 'navigation_error', message: err.message });
  } finally {
    await browser.close();
  }
  
  return { errors, results };
}

async function testAllFeatures() {
  console.log('🧪 Teste ALLE neuen Features...\n');
  console.log('='.repeat(70));
  
  let totalErrors = 0;
  let totalFeatures = 0;
  let passedFeatures = 0;
  const allResults = {};
  
  for (const [file, config] of Object.entries(FEATURES_TO_TEST)) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  Datei nicht gefunden: ${file}\n`);
      continue;
    }
    
    console.log(`\n📄 Datei: ${file}\n`);
    allResults[file] = {};
    
    for (const feature of config.features) {
      totalFeatures++;
      console.log(`   🎯 ${feature.name}...`);
      
      const result = await testFeature(file, feature);
      allResults[file][feature.name] = result;
      
      if (result.errors.length > 0) {
        totalErrors += result.errors.length;
        result.errors.forEach(err => {
          console.log(`      ❌ [${err.type}] ${err.message.substring(0, 80)}`);
        });
      } else {
        passedFeatures++;
        console.log(`      ✅ OK`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 ZUSAMMENFASSUNG:\n`);
  console.log(`   - Features getestet: ${totalFeatures}`);
  console.log(`   - Features OK: ${passedFeatures}`);
  console.log(`   - Fehler gefunden: ${totalErrors}`);
  console.log(`   - Erfolgsquote: ${((passedFeatures / totalFeatures) * 100).toFixed(1)}%\n`);
  
  // Speichere Ergebnisse
  const report = {
    timestamp: new Date().toISOString(),
    totalFeatures,
    passedFeatures,
    totalErrors,
    successRate: ((passedFeatures / totalFeatures) * 100).toFixed(1) + '%',
    results: allResults
  };
  
  fs.writeFileSync('FEATURE-TEST-REPORT.json', JSON.stringify(report, null, 2));
  fs.appendFileSync('FEATURE-TEST-LOG.txt', `[${new Date().toISOString()}] Test abgeschlossen: ${passedFeatures}/${totalFeatures} Features OK\n`);
  
  return totalErrors === 0;
}

if (require.main === module) {
  testAllFeatures().then(success => {
    console.log(success ? '\n✅✅✅ ALLE FEATURES GETESTET - ERFOLGREICH! ✅✅✅\n' : '\n⚠️  Einige Features haben Fehler\n');
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error('❌ Fataler Fehler:', err);
    process.exit(1);
  });
}

module.exports = { testAllFeatures };



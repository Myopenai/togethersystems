// Umfassende Feature-Tests für alle neuen Features
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FEATURES_TO_TEST = {
  'manifest-portal.html': {
    features: [
      { name: 'Gleichgewichts-Börse Tab', selector: '#navBalancedExchange' },
      { name: 'Gleichgewichts-Börse Panel', selector: '#balanced-exchange-panel' },
      { name: 'Nachrichten Tab', selector: '#navMessages' },
      { name: 'Nachrichten Panel', selector: '#messages-panel' },
      { name: 'Nachrichten Inbox Button', selector: '#btnMessagesInbox' },
      { name: 'Nachrichten Outbox Button', selector: '#btnMessagesOutbox' },
      { name: 'Nachrichten Compose Button', selector: '#btnMessagesCompose' },
      { name: 'Nachrichten Sync Button', selector: '#btnSyncMessages' },
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
      { name: 'Ergebnis-Anzeige', selector: '.result' },
    ]
  }
};

async function testFeature(file, feature) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  
  try {
    const fullPath = path.resolve(file);
    await page.goto(`file://${fullPath}`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Prüfe ob Feature vorhanden
    try {
      await page.waitForSelector(feature.selector, { timeout: 3000 });
    } catch (e) {
      errors.push({ type: 'feature_missing', message: `Feature "${feature.name}" nicht gefunden: ${feature.selector}` });
    }
    
    // Prüfe Console-Errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404') && !text.includes('net::ERR_FILE_NOT_FOUND')) {
          errors.push({ type: 'console_error', message: text });
        }
      }
    });
    
    page.on('pageerror', error => {
      errors.push({ type: 'page_error', message: error.message });
    });
    
    await page.waitForTimeout(1000);
    
  } catch (err) {
    errors.push({ type: 'navigation_error', message: err.message });
  } finally {
    await browser.close();
  }
  
  return errors;
}

async function testAllFeatures() {
  console.log('🧪 Teste alle neuen Features...\n');
  
  let totalErrors = 0;
  let totalFeatures = 0;
  
  for (const [file, config] of Object.entries(FEATURES_TO_TEST)) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  Datei nicht gefunden: ${file}\n`);
      continue;
    }
    
    console.log(`📄 Teste: ${file}\n`);
    
    for (const feature of config.features) {
      totalFeatures++;
      console.log(`   🎯 Feature: ${feature.name}`);
      
      const errors = await testFeature(file, feature);
      
      if (errors.length > 0) {
        totalErrors += errors.length;
        errors.forEach(err => {
          console.log(`      ❌ [${err.type}] ${err.message.substring(0, 100)}`);
        });
      } else {
        console.log(`      ✅ OK`);
      }
    }
    
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log(`\n📊 Ergebnis:`);
  console.log(`   - Features getestet: ${totalFeatures}`);
  console.log(`   - Fehler gefunden: ${totalErrors}\n`);
  
  return totalErrors === 0;
}

if (require.main === module) {
  testAllFeatures().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testAllFeatures };



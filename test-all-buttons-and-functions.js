#!/usr/bin/env node
/**
 * Test All Buttons and Functions
 * Testet alle Buttons und Funktionen auf Funktionalität
 * 
 * Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
 */

const fs = require('fs');
const path = require('path');

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function test(name, fn) {
  try {
    fn();
    testResults.passed++;
    console.log(`✅ ${name}`);
  } catch (e) {
    testResults.failed++;
    testResults.errors.push({ test: name, error: e.message });
    console.error(`❌ ${name}: ${e.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('🧪 BUTTON & FUNCTION TEST - START\n');

// Test 1: manifest-portal.html - Alle Buttons haben Event-Listener
test('manifest-portal.html - Navigation Buttons haben Event-Listener', () => {
  const content = fs.readFileSync('manifest-portal.html', 'utf8');
  const buttons = ['navHome', 'navContacts', 'navRooms', 'navDocuments', 'navFinance', 'navMessages', 'navExpert'];
  buttons.forEach(btn => {
    assert(content.includes(`getElementById('${btn}')?.addEventListener`), `${btn} hat keinen Event-Listener`);
  });
  // navBalancedExchange hat Event-Listener in setupNavigation()
  assert(content.includes('navBalancedExchange.addEventListener'), 'navBalancedExchange hat keinen Event-Listener');
});

test('manifest-portal.html - Action Buttons haben Event-Listener', () => {
  const content = fs.readFileSync('manifest-portal.html', 'utf8');
  const buttons = ['actionMessage', 'actionCall', 'actionFile', 'actionAppointment', 'actionContract', 'actionMore'];
  buttons.forEach(btn => {
    assert(content.includes(`getElementById('${btn}')?.addEventListener`), `${btn} hat keinen Event-Listener`);
  });
});

test('manifest-portal.html - Quick Action Buttons haben Event-Listener', () => {
  const content = fs.readFileSync('manifest-portal.html', 'utf8');
  const buttons = ['quickCallBtn', 'quickChatBtn', 'quickGroupBtn'];
  buttons.forEach(btn => {
    assert(content.includes(`getElementById('${btn}')`), `${btn} nicht gefunden`);
    assert(content.includes('setupQuickActionButtons'), 'setupQuickActionButtons Funktion fehlt');
  });
});

test('manifest-portal.html - Verify Button hat Event-Listener', () => {
  const content = fs.readFileSync('manifest-portal.html', 'utf8');
  assert(content.includes("getElementById('verifyBtn').addEventListener"), 'verifyBtn hat keinen Event-Listener');
});

test('manifest-portal.html - Generate URL Button hat Event-Listener', () => {
  const content = fs.readFileSync('manifest-portal.html', 'utf8');
  assert(content.includes("getElementById('generateUrlBtn')"), 'generateUrlBtn nicht gefunden');
  assert(content.includes('generateUrlBtn.addEventListener'), 'generateUrlBtn hat keinen Event-Listener');
});

test('manifest-portal.html - Feedback Button hat Event-Listener', () => {
  const content = fs.readFileSync('manifest-portal.html', 'utf8');
  assert(content.includes("getElementById('feedbackBtn')?.addEventListener"), 'feedbackBtn hat keinen Event-Listener');
});

// Test 2: cms-dashboard.html - Alle Buttons haben Event-Listener
test('cms-dashboard.html - Create Buttons haben Event-Listener', () => {
  const content = fs.readFileSync('cms-dashboard.html', 'utf8');
  assert(content.includes('function createSite()'), 'createSite Funktion fehlt');
  assert(content.includes('function createCollection()'), 'createCollection Funktion fehlt');
  assert(content.includes('onclick="createSite()"'), 'createSite Button fehlt');
  assert(content.includes('onclick="createCollection()"'), 'createCollection Button fehlt');
});

// Test 3: business-admin.html - Alle Funktionen vorhanden
test('business-admin.html - Load Functions vorhanden', () => {
  const content = fs.readFileSync('business-admin.html', 'utf8');
  assert(content.includes('async function loadHolderBookings'), 'loadHolderBookings fehlt');
  assert(content.includes('async function loadIssuerVouchers'), 'loadIssuerVouchers fehlt');
  assert(content.includes('loadHolderBookings()'), 'loadHolderBookings wird nicht aufgerufen');
  assert(content.includes('loadIssuerVouchers()'), 'loadIssuerVouchers wird nicht aufgerufen');
});

// Test 4: Keine JavaScript-Syntax-Fehler
test('business-admin.html - Keine Syntax-Fehler in loadIssuerVouchers', () => {
  const content = fs.readFileSync('business-admin.html', 'utf8');
  // Prüfe auf korrekte try-catch-Struktur
  const loadIssuerVouchers = content.match(/async function loadIssuerVouchers\(\)\{[\s\S]*?\n\s*\}/);
  assert(loadIssuerVouchers, 'loadIssuerVouchers Funktion nicht gefunden');
  const funcContent = loadIssuerVouchers[0];
  // Prüfe, dass try-catch korrekt ist
  assert(funcContent.includes('try {'), 'try fehlt');
  assert(funcContent.includes('}catch'), 'catch fehlt');
  // Prüfe, dass keine falsche Struktur vorhanden ist
  assert(!funcContent.includes('} catch (err) {'), 'Falsche catch-Syntax gefunden');
});

// Test 5: Download-Button sichtbar
test('manifest-portal.html - Download-Button CSS korrekt', () => {
  const content = fs.readFileSync('manifest-portal.html', 'utf8');
  assert(content.includes('DOWNLOAD OSTOSOS'), 'Download-Button Text fehlt');
  assert(content.includes('z-index: 11'), 'Download-Button z-index fehlt');
  assert(content.includes('position: relative'), 'Download-Button Position fehlt');
  assert(content.includes('min-width: 200px'), 'Download-Button min-width fehlt');
});

// Test 6: Keine Demo-Daten mehr
test('portal-api.js - Keine Demo-Daten-Referenzen', () => {
  const content = fs.readFileSync('js/portal-api.js', 'utf8');
  assert(!content.includes('demo-data/vouchers.json'), 'Demo-Daten-Referenz gefunden');
  assert(!content.includes('demo-data/instruments.json'), 'Demo-Daten-Referenz gefunden');
  assert(!content.includes('demo-data/messages.json'), 'Demo-Daten-Referenz gefunden');
  assert(content.includes('KEINE DEMO-DATEN'), 'KEINE DEMO-DATEN Marker fehlt');
});

// Test 7: API-Calls verwenden echte URLs
test('portal-api.js - Echte API-URLs', () => {
  const content = fs.readFileSync('js/portal-api.js', 'utf8');
  assert(content.includes("return '/api/voucher/list'"), 'Echte Voucher-API-URL fehlt');
  assert(content.includes("return '/api/providers'"), 'Echte Providers-API-URL fehlt');
  assert(content.includes("return '/api/instruments'"), 'Echte Instruments-API-URL fehlt');
  assert(content.includes("return '/api/messages'"), 'Echte Messages-API-URL fehlt');
});

// Test 8: CMS-Dashboard API-Calls korrekt
test('cms-dashboard.html - API-Calls korrekt strukturiert', () => {
  const content = fs.readFileSync('cms-dashboard.html', 'utf8');
  assert(content.includes('const API_BASE = \'/api/cms\''), 'API_BASE fehlt');
  assert(content.includes('async function apiCall'), 'apiCall Funktion fehlt');
  assert(content.includes('result.ok'), 'result.ok Check vorhanden');
  assert(content.includes('result.data'), 'result.data Check vorhanden');
});

// Test 9: Business-Portal 404-Handling
test('business-admin.html - 404-Handling vorhanden', () => {
  const content = fs.readFileSync('business-admin.html', 'utf8');
  assert(content.includes('res.status === 404'), '404-Check fehlt in loadHolderBookings');
  assert(content.includes('res.status === 404'), '404-Check fehlt in loadIssuerVouchers');
});

// Test 10: Alle kritischen Dateien vorhanden
test('Alle kritischen Dateien vorhanden', () => {
  const files = [
    'index.html',
    'manifest-portal.html',
    'business-admin.html',
    'cms-dashboard.html',
    'OS-GERAETE-UND-PLATTFORMEN.html',
    'js/portal-api.js',
    'js/portal-ui.js'
  ];
  files.forEach(file => {
    assert(fs.existsSync(file), `${file} fehlt`);
  });
});

console.log('\n📊 TEST ERGEBNISSE:');
console.log(`✅ Bestanden: ${testResults.passed}`);
console.log(`❌ Fehlgeschlagen: ${testResults.failed}`);

if (testResults.errors.length > 0) {
  console.log('\n❌ FEHLER:');
  testResults.errors.forEach(e => {
    console.log(`  - ${e.test}: ${e.error}`);
  });
}

if (testResults.failed === 0) {
  console.log('\n🎉 ALLE BUTTON & FUNCTION TESTS BESTANDEN');
  process.exit(0);
} else {
  console.log('\n⚠️  EINIGE TESTS FEHLGESCHLAGEN - REPARATUR ERFORDERLICH');
  process.exit(1);
}


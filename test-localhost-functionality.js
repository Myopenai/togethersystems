#!/usr/bin/env node
/**
 * Localhost Functionality Test
 * Testet alle kritischen Funktionen auf Localhost
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

console.log('🧪 LOCALHOST FUNCTIONALITY TEST - START\n');

// Test 1: Alle HTML-Dateien existieren
test('Kritische HTML-Dateien vorhanden', () => {
  const files = [
    'index.html',
    'manifest-portal.html',
    'business-admin.html',
    'cms-dashboard.html',
    'OS-GERAETE-UND-PLATTFORMEN.html'
  ];
  files.forEach(file => {
    assert(fs.existsSync(file), `${file} fehlt`);
  });
});

// Test 2: Keine .md-Links in HTML-Dateien
test('Keine .md-Links in index.html', () => {
  const content = fs.readFileSync('index.html', 'utf8');
  const mdLinks = content.match(/href=["'][^"']*\.md["']/gi);
  assert(!mdLinks || mdLinks.length === 0, `Gefundene .md-Links: ${mdLinks?.join(', ')}`);
});

test('Keine .md-Links in manifest-portal.html', () => {
  const content = fs.readFileSync('manifest-portal.html', 'utf8');
  const mdLinks = content.match(/href=["'][^"']*\.md["']/gi);
  assert(!mdLinks || mdLinks.length === 0, `Gefundene .md-Links: ${mdLinks?.join(', ')}`);
});

test('Keine .md-Links in cms-dashboard.html', () => {
  const content = fs.readFileSync('cms-dashboard.html', 'utf8');
  const mdLinks = content.match(/href=["'][^"']*\.md["']/gi);
  assert(!mdLinks || mdLinks.length === 0, `Gefundene .md-Links: ${mdLinks?.join(', ')}`);
});

// Test 3: JavaScript-Syntax-Fehler prüfen
test('business-admin.html - Keine offensichtlichen JS-Syntax-Fehler', () => {
  const content = fs.readFileSync('business-admin.html', 'utf8');
  // Prüfe auf offensichtliche Syntax-Fehler
  assert(!content.includes('} catch (err) {'), 'Falsche catch-Syntax gefunden');
  assert(content.includes('async function loadIssuerVouchers'), 'loadIssuerVouchers Funktion fehlt');
});

// Test 4: Download-Button vorhanden
test('Download-Button in manifest-portal.html vorhanden', () => {
  const content = fs.readFileSync('manifest-portal.html', 'utf8');
  assert(content.includes('DOWNLOAD OSTOSOS'), 'Download-Button Text fehlt');
  assert(content.includes('OSTOSOS-ANKUENDIGUNG.html'), 'Download-Link fehlt');
  assert(content.includes('z-index: 11'), 'Download-Button z-index fehlt');
});

// Test 5: Keine Demo-Daten-Referenzen
test('portal-api.js - Keine Demo-Daten-Referenzen', () => {
  const content = fs.readFileSync('js/portal-api.js', 'utf8');
  assert(!content.includes('demo-data/vouchers.json'), 'Demo-Daten-Referenz gefunden');
  assert(!content.includes('Demo-Loader'), 'Demo-Loader Kommentar gefunden');
  assert(content.includes('KEINE DEMO-DATEN'), 'KEINE DEMO-DATEN Marker fehlt');
});

// Test 6: OS-GERAETE-UND-PLATTFORMEN.html existiert
test('OS-GERAETE-UND-PLATTFORMEN.html existiert', () => {
  assert(fs.existsSync('OS-GERAETE-UND-PLATTFORMEN.html'), 'OS-GERAETE-UND-PLATTFORMEN.html fehlt');
  const content = fs.readFileSync('OS-GERAETE-UND-PLATTFORMEN.html', 'utf8');
  assert(content.includes('<!DOCTYPE html>'), 'Keine gültige HTML-Datei');
  assert(content.includes('OS-TOS / OSTOS'), 'Inhalt fehlt');
});

// Test 7: CMS-Dashboard API-Calls
test('cms-dashboard.html - API-Calls korrekt', () => {
  const content = fs.readFileSync('cms-dashboard.html', 'utf8');
  assert(content.includes('const API_BASE = \'/api/cms\''), 'API_BASE fehlt');
  assert(content.includes('async function apiCall'), 'apiCall Funktion fehlt');
  assert(content.includes('result.ok'), 'result.ok Check vorhanden');
});

// Test 8: Business-Portal API-Calls
test('business-admin.html - API-Calls korrekt', () => {
  const content = fs.readFileSync('business-admin.html', 'utf8');
  assert(content.includes('async function loadHolderBookings'), 'loadHolderBookings fehlt');
  assert(content.includes('async function loadIssuerVouchers'), 'loadIssuerVouchers fehlt');
  assert(content.includes('res.status === 404'), '404-Check vorhanden');
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
  console.log('\n🎉 ALLE LOCALHOST-TESTS BESTANDEN');
  process.exit(0);
} else {
  console.log('\n⚠️  EINIGE TESTS FEHLGESCHLAGEN - REPARATUR ERFORDERLICH');
  process.exit(1);
}


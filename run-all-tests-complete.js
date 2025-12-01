// VOLLSTÄNDIGER TEST-RUNNER - Startet ALLE Tests nacheinander
const { execSync, spawn } = require('child_process');
const fs = require('fs');

let testResults = {
  featureTests: { status: 'pending', errors: 0 },
  codeAnalysis: { status: 'pending', errors: 0 },
  autoTests: { status: 'pending', errors: 0 },
  playwrightTests: { status: 'pending', errors: 0 }
};

async function runAllTests() {
  console.log('🧪 STARTE ALLE TESTS...\n');
  console.log('='.repeat(70));

  // Test 1: Feature-Tests
  console.log('\n📝 Test 1/4: Feature-Tests für neue Features...\n');
  try {
    execSync('node auto-test-all-features.js', { stdio: 'inherit', timeout: 120000 });
    testResults.featureTests.status = 'success';
    console.log('\n✅ Feature-Tests abgeschlossen\n');
  } catch (err) {
    testResults.featureTests.status = 'error';
    testResults.featureTests.errors++;
    console.log(`\n⚠️  Feature-Tests: ${err.message}\n`);
  }

  // Test 2: Code-Analyse
  console.log('📝 Test 2/4: Code-Analyse (API/JSON-Fehler)...\n');
  try {
    execSync('node simple-error-checker.js', { stdio: 'inherit', timeout: 30000 });
    testResults.codeAnalysis.status = 'success';
    console.log('\n✅ Code-Analyse: Keine Fehler\n');
  } catch (err) {
    testResults.codeAnalysis.status = 'error';
    testResults.codeAnalysis.errors++;
    console.log(`\n⚠️  Code-Analyse: Fehler gefunden - behebe automatisch...\n`);
    
    // Automatische Fehlerbehebung
    try {
      execSync('node fix-all-api-errors.js', { stdio: 'inherit', timeout: 60000 });
      execSync('node fix-response-json-errors.js', { stdio: 'inherit', timeout: 30000 });
      execSync('node fix-all-response-json-explicit.js', { stdio: 'inherit', timeout: 30000 });
      console.log('\n✅ Automatische Fehlerbehebung abgeschlossen\n');
    } catch (fixErr) {
      console.log(`\n⚠️  Fehlerbehebung: ${fixErr.message}\n`);
    }
  }

  // Test 3: Automatisches Test-System
  console.log('📝 Test 3/4: Automatisches Test-System (Alle Seiten)...\n');
  try {
    execSync('node auto-test-all-pages.js', { stdio: 'inherit', timeout: 180000 });
    testResults.autoTests.status = 'success';
    console.log('\n✅ Automatisches Test-System abgeschlossen\n');
  } catch (err) {
    testResults.autoTests.status = 'error';
    testResults.autoTests.errors++;
    console.log(`\n⚠️  Automatisches Test-System: ${err.message}\n`);
  }

  // Test 4: Playwright-Tests
  console.log('📝 Test 4/4: Playwright-Tests (Browser-Tests)...\n');
  if (fs.existsSync('businessconnecthub-playwright-tests-full')) {
    try {
      process.chdir('businessconnecthub-playwright-tests-full');
      execSync('npx playwright test --project=Chromium', { stdio: 'inherit', timeout: 300000 });
      process.chdir('..');
      testResults.playwrightTests.status = 'success';
      console.log('\n✅ Playwright-Tests abgeschlossen\n');
    } catch (err) {
      process.chdir('..');
      testResults.playwrightTests.status = 'error';
      testResults.playwrightTests.errors++;
      console.log(`\n⚠️  Playwright-Tests: ${err.message}\n`);
    }
  } else {
    console.log('⚠️  Playwright-Test-Verzeichnis nicht gefunden\n');
    testResults.playwrightTests.status = 'skipped';
  }

  // Zusammenfassung
  console.log('='.repeat(70));
  console.log('\n📊 TEST-ZUSAMMENFASSUNG:\n');
  
  let totalErrors = 0;
  Object.entries(testResults).forEach(([test, result]) => {
    const statusIcon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏭️';
    console.log(`   ${statusIcon} ${test}: ${result.status} ${result.errors > 0 ? `(${result.errors} Fehler)` : ''}`);
    totalErrors += result.errors || 0;
  });

  console.log(`\n   📊 Gesamt-Fehler: ${totalErrors}\n`);

  // Speichere Ergebnisse
  const report = {
    timestamp: new Date().toISOString(),
    results: testResults,
    totalErrors
  };

  fs.writeFileSync('ALL-TESTS-REPORT.json', JSON.stringify(report, null, 2));
  fs.appendFileSync('ALL-TESTS-LOG.txt', `[${new Date().toISOString()}] Alle Tests abgeschlossen: ${totalErrors} Fehler\n`);

  if (totalErrors === 0) {
    console.log('✅✅✅ ALLE TESTS BESTANDEN! ✅✅✅\n');
    return true;
  } else {
    console.log('⚠️  Einige Tests haben Fehler - siehe Report\n');
    return false;
  }
}

if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error('❌ Fataler Fehler:', err);
    process.exit(1);
  });
}

module.exports = { runAllTests };










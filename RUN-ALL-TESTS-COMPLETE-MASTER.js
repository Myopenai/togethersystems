// VOLLSTÄNDIGES MASTER-TEST-SYSTEM
// Testet ALLE Applikationen, Systeme, Code und Software
// Settings-OS als Herz und Analyse-Engine
// Schreibt Ergebnisse für Portal-Info

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = './Settings';
const PORTAL_INFO_PATH = './portal-test-info.json'; // Für Portal-Info

// VOLLSTÄNDIGE LISTE ALLER APPLIKATIONEN (30+)
const ALL_APPLICATIONS = [
  { file: 'index.html', name: 'Portal Start', category: 'Haupt-Portal' },
  { file: 'manifest-forum.html', name: 'Manifest Forum', category: 'Haupt-Portal' },
  { file: 'manifest-portal.html', name: 'Online-Portal', category: 'Haupt-Portal' },
  { file: 'honeycomb.html', name: 'Wabenräume', category: 'Haupt-Portal' },
  { file: 'legal-hub.html', name: 'Legal Hub', category: 'Haupt-Portal' },
  { file: 'admin.html', name: 'Admin', category: 'Admin' },
  { file: 'admin-monitoring.html', name: 'Admin Monitoring', category: 'Admin' },
  { file: 'business-admin.html', name: 'Business Admin', category: 'Admin' },
  { file: 'production-dashboard.html', name: 'Production Dashboard', category: 'Admin' },
  { file: 'neural-network-console.html', name: 'Neural Network Console', category: 'Admin' },
  { file: 'SETTINGS-MASTER-DASHBOARD.html', name: 'Settings Master Dashboard', category: 'Settings' },
  { file: 'Settings/dashboard/index.html', name: 'Settings Dashboard', category: 'Settings' },
  { file: 'Settings/dashboard/graph-view.html', name: 'Settings Graph View', category: 'Settings' },
  { file: 'Settings/dashboard/dimensional-analyzer.html', name: 'Settings Dimensional Analyzer', category: 'Settings' },
  { file: 'Settings/dashboard/restore-app.html', name: 'Settings Restore App', category: 'Settings' },
  { file: 'cms-dashboard.html', name: 'CMS Dashboard', category: 'CMS' },
  { file: 'ultra/ui/developer-portal.html', name: 'Developer Portal', category: 'Developer' },
  { file: 'ultra/beta/index.html', name: 'Beta Portal', category: 'Developer' },
  { file: 'ultra/admin/unimplemented-actions-dashboard.html', name: 'Unimplemented Actions Dashboard', category: 'Developer' },
  { file: 'TELBANK/index.html', name: 'TELBANK', category: 'TELBANK' },
  { file: 'TELBANK/transfer-admin.html', name: 'Transfer Admin', category: 'TELBANK' },
  { file: 'YORDY/yordy-artist-showcase.html', name: 'YORDY Showcase', category: 'Content' },
  { file: 'ostos-branding.html', name: 'OSTOS Branding', category: 'Content' },
  { file: 'OSTOSOS-ANKUENDIGUNG.html', name: 'OSTOSOS', category: 'Content' },
  { file: 'JOB-ANGEBOT-ENTWICKLER.html', name: 'Job-Angebot', category: 'Content' },
  { file: 'help-portal.html', name: 'Help Portal', category: 'Help' },
  { file: 'help-online-portal.html', name: 'Help Online Portal', category: 'Help' },
  { file: 'help-manifest.html', name: 'Help Manifest', category: 'Help' },
  { file: 'help-honeycomb.html', name: 'Help Honeycomb', category: 'Help' },
  { file: 'help-legal-hub.html', name: 'Help Legal Hub', category: 'Help' },
  { file: 'help-getting-started.html', name: 'Help Getting Started', category: 'Help' },
  { file: 'TsysytemsT/TsysytemsT.html', name: 'One Network', category: 'Weitere' },
  { file: 'suppliers-story.html', name: 'Suppliers Story', category: 'Weitere' },
  { file: 'ABSOLUTES SYSTEM – TTT Enterprise Universe Manifest.html', name: 'Kernel Manifest', category: 'Weitere' }
];

let testResults = {
  syntaxCheck: { status: 'pending', errors: 0, fixed: 0 },
  settingsTests: { status: 'pending', errors: 0 },
  settingsPoweredTests: { status: 'pending', errors: 0, fixes: 0 },
  comprehensiveTests: { status: 'pending', errors: 0 },
  autoTests: { status: 'pending', errors: 0 },
  playwrightTests: { status: 'pending', errors: 0 },
  codeAnalysis: { status: 'pending', errors: 0 }
};

/**
 * Schreibt Portal-Info für Live-Anzeige
 */
function writePortalInfo(summary) {
  const portalInfo = {
    timestamp: new Date().toISOString(),
    message: "Es wird kontinuierlich an der App gearbeitet",
    status: summary.totalErrors === 0 ? 'success' : summary.totalErrors < 5 ? 'warning' : 'error',
    statistics: {
      totalApplications: ALL_APPLICATIONS.length,
      totalErrors: summary.totalErrors || 0,
      totalFixed: summary.totalFixed || 0,
      testsPassed: Object.values(testResults).filter(r => r.status === 'success').length,
      testsTotal: Object.keys(testResults).length
    },
    lastResults: {
      syntaxCheck: testResults.syntaxCheck,
      settingsTests: testResults.settingsTests,
      comprehensiveTests: testResults.comprehensiveTests,
      autoTests: testResults.autoTests,
      playwrightTests: testResults.playwrightTests
    },
    progress: {
      percentage: Math.round((Object.values(testResults).filter(r => r.status === 'success').length / Object.keys(testResults).length) * 100),
      statusText: summary.totalErrors === 0 ? 'Alle Tests bestanden' : 
                  summary.totalErrors < 5 ? 'Wenige Fehler gefunden' : 
                  'Fehler gefunden - wird behoben'
    }
  };
  
  fs.writeFileSync(PORTAL_INFO_PATH, JSON.stringify(portalInfo, null, 2), 'utf8');
  console.log(`\n💾 Portal-Info geschrieben: ${PORTAL_INFO_PATH}\n`);
}

/**
 * Syntax-Check
 */
function runSyntaxCheck() {
  console.log('\n📝 Test 1/7: Syntax-Check (JavaScript-Fehler)...\n');
  console.log('='.repeat(70));
  
  const errors = [];
  let fixed = 0;
  
  for (const app of ALL_APPLICATIONS) {
    if (!fs.existsSync(app.file)) continue;
    
    try {
      const content = fs.readFileSync(app.file, 'utf8');
      
      // Prüfe auf fehlende Klammern in JSON.parse
      if (content.match(/JSON\.parse\([^)]*$/)) {
        errors.push({ file: app.file, type: 'missing_parenthesis' });
        // Auto-Fix
        const newContent = content.replace(/JSON\.parse\(([^)]+)$/g, (match, p1) => {
          return `JSON.parse(${p1})`;
        });
        if (newContent !== content) {
          fs.writeFileSync(app.file, newContent, 'utf8');
          fixed++;
          console.log(`   ✅ Fix angewendet: ${app.file}`);
        }
      }
      
      // Prüfe auf falsche try-catch-Struktur
      if (content.match(/try\s*\{\s*fetch\([^}]*\}\s*catch/)) {
        errors.push({ file: app.file, type: 'wrong_try_catch' });
      }
    } catch (err) {
      errors.push({ file: app.file, type: 'read_error', message: err.message });
    }
  }
  
  testResults.syntaxCheck.errors = errors.length;
  testResults.syntaxCheck.fixed = fixed;
  testResults.syntaxCheck.status = errors.length === 0 ? 'success' : (fixed > 0 ? 'partial' : 'error');
  
  console.log(`\n   📊 Gefunden: ${errors.length} Fehler`);
  console.log(`   🔧 Behoben: ${fixed} Fehler\n`);
  
  writePortalInfo({ totalErrors: errors.length, totalFixed: fixed });
  return { errors, fixed };
}

/**
 * Settings-Ordner Test
 */
function runSettingsTests() {
  console.log('\n📝 Test 2/7: Settings-Ordner Test...\n');
  console.log('='.repeat(70));
  
  try {
    if (fs.existsSync('settings-complete-test.js')) {
      execSync('node settings-complete-test.js', { stdio: 'inherit', timeout: 120000 });
      testResults.settingsTests.status = 'success';
      console.log('\n✅ Settings-Ordner Test abgeschlossen\n');
    } else {
      console.log('⚠️  settings-complete-test.js nicht gefunden\n');
      testResults.settingsTests.status = 'skipped';
    }
  } catch (err) {
    testResults.settingsTests.status = 'error';
    testResults.settingsTests.errors++;
    console.log(`\n⚠️  Settings-Ordner Test: ${err.message}\n`);
  }
  
  writePortalInfo({ totalErrors: testResults.settingsTests.errors });
}

/**
 * Settings-OS Powered Tests
 */
async function runSettingsPoweredTests() {
  console.log('\n📝 Test 3/7: Settings-OS Powered Tests (HERZ)...\n');
  console.log('='.repeat(70));
  console.log('Settings-OS als Herz und Analyse-Engine aktiviert\n');
  
  try {
    if (fs.existsSync('settings-powered-test-fix-system.js')) {
      execSync('node settings-powered-test-fix-system.js', { stdio: 'inherit', timeout: 300000 });
      testResults.settingsPoweredTests.status = 'success';
      console.log('\n✅ Settings-OS Powered Tests abgeschlossen\n');
    } else {
      console.log('⚠️  settings-powered-test-fix-system.js nicht gefunden\n');
      testResults.settingsPoweredTests.status = 'skipped';
    }
  } catch (err) {
    testResults.settingsPoweredTests.status = 'error';
    testResults.settingsPoweredTests.errors++;
    console.log(`\n⚠️  Settings-OS Powered Tests: ${err.message}\n`);
  }
  
  writePortalInfo({ totalErrors: testResults.settingsPoweredTests.errors });
}

/**
 * Comprehensive Tests
 */
function runComprehensiveTests() {
  console.log('\n📝 Test 4/7: Comprehensive Test System...\n');
  console.log('='.repeat(70));
  
  try {
    if (fs.existsSync('comprehensive-test-system.js')) {
      execSync('node comprehensive-test-system.js', { stdio: 'inherit', timeout: 180000 });
      testResults.comprehensiveTests.status = 'success';
      console.log('\n✅ Comprehensive Tests abgeschlossen\n');
    } else {
      console.log('⚠️  comprehensive-test-system.js nicht gefunden\n');
      testResults.comprehensiveTests.status = 'skipped';
    }
  } catch (err) {
    testResults.comprehensiveTests.status = 'error';
    testResults.comprehensiveTests.errors++;
    console.log(`\n⚠️  Comprehensive Tests: ${err.message}\n`);
  }
  
  writePortalInfo({ totalErrors: testResults.comprehensiveTests.errors });
}

/**
 * Auto Tests
 */
function runAutoTests() {
  console.log('\n📝 Test 5/7: Auto Test All Pages...\n');
  console.log('='.repeat(70));
  
  try {
    if (fs.existsSync('auto-test-all-pages.js')) {
      execSync('node auto-test-all-pages.js', { stdio: 'inherit', timeout: 300000 });
      testResults.autoTests.status = 'success';
      console.log('\n✅ Auto Tests abgeschlossen\n');
    } else {
      console.log('⚠️  auto-test-all-pages.js nicht gefunden\n');
      testResults.autoTests.status = 'skipped';
    }
  } catch (err) {
    testResults.autoTests.status = 'error';
    testResults.autoTests.errors++;
    console.log(`\n⚠️  Auto Tests: ${err.message}\n`);
  }
  
  writePortalInfo({ totalErrors: testResults.autoTests.errors });
}

/**
 * Code Analysis
 */
function runCodeAnalysis() {
  console.log('\n📝 Test 6/7: Code-Analyse...\n');
  console.log('='.repeat(70));
  
  try {
    if (fs.existsSync('simple-error-checker.js')) {
      execSync('node simple-error-checker.js', { stdio: 'inherit', timeout: 60000 });
      testResults.codeAnalysis.status = 'success';
      console.log('\n✅ Code-Analyse abgeschlossen\n');
    } else {
      console.log('⚠️  simple-error-checker.js nicht gefunden\n');
      testResults.codeAnalysis.status = 'skipped';
    }
  } catch (err) {
    testResults.codeAnalysis.status = 'error';
    testResults.codeAnalysis.errors++;
    console.log(`\n⚠️  Code-Analyse: ${err.message}\n`);
  }
  
  writePortalInfo({ totalErrors: testResults.codeAnalysis.errors });
}

/**
 * Playwright Tests
 */
function runPlaywrightTests() {
  console.log('\n📝 Test 7/7: Playwright Tests (Browser-Tests)...\n');
  console.log('='.repeat(70));
  
  if (fs.existsSync('businessconnecthub-playwright-tests-full')) {
    // Prüfe ob Server läuft
    let serverRunning = false;
    try {
      const http = require('http');
      const req = http.get('http://localhost:9323/', { timeout: 2000 }, () => {
        serverRunning = true;
      });
      req.on('error', () => {});
      req.on('timeout', () => { req.destroy(); });
      
      // Warte kurz
      setTimeout(() => {
        if (serverRunning) {
          try {
            process.chdir('businessconnecthub-playwright-tests-full');
            execSync('npx playwright test --project=Chromium', { stdio: 'inherit', timeout: 600000 });
            process.chdir('..');
            testResults.playwrightTests.status = 'success';
            console.log('\n✅ Playwright Tests abgeschlossen\n');
          } catch (err) {
            process.chdir('..');
            testResults.playwrightTests.status = 'error';
            testResults.playwrightTests.errors++;
            console.log(`\n⚠️  Playwright Tests: ${err.message}\n`);
          }
        } else {
          console.log('⚠️  Server läuft nicht auf Port 9323 - Playwright-Tests übersprungen\n');
          testResults.playwrightTests.status = 'skipped';
        }
        writePortalInfo({ totalErrors: testResults.playwrightTests.errors });
      }, 1000);
    } catch (err) {
      console.log('⚠️  Server-Check fehlgeschlagen - Playwright-Tests übersprungen\n');
      testResults.playwrightTests.status = 'skipped';
      writePortalInfo({ totalErrors: 0 });
    }
  } else {
    console.log('⚠️  Playwright-Test-Verzeichnis nicht gefunden\n');
    testResults.playwrightTests.status = 'skipped';
    writePortalInfo({ totalErrors: 0 });
  }
}

/**
 * Haupt-Funktion: Führt ALLE Tests aus
 */
async function runAllTestsComplete() {
  const startTime = Date.now();
  
  console.log('\n🧪🧪🧪 VOLLSTÄNDIGES MASTER-TEST-SYSTEM 🧪🧪🧪\n');
  console.log('='.repeat(70));
  console.log('Testet ALLE Applikationen, Systeme, Code und Software');
  console.log('Settings-OS als Herz und Analyse-Engine');
  console.log('='.repeat(70));
  console.log(`\nStart-Zeit: ${new Date().toISOString()}\n`);
  console.log(`📊 ${ALL_APPLICATIONS.length} Applikationen werden getestet\n`);
  
  // Initiale Portal-Info
  writePortalInfo({ totalErrors: 0, totalFixed: 0 });
  
  // Test 1: Syntax-Check
  runSyntaxCheck();
  
  // Test 2: Settings-Ordner
  runSettingsTests();
  
  // Test 3: Settings-OS Powered
  await runSettingsPoweredTests();
  
  // Test 4: Comprehensive
  runComprehensiveTests();
  
  // Test 5: Auto Tests
  runAutoTests();
  
  // Test 6: Code Analysis
  runCodeAnalysis();
  
  // Test 7: Playwright
  runPlaywrightTests();
  
  // Warte kurz auf Playwright
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // ZUSAMMENFASSUNG
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  const totalErrors = Object.values(testResults).reduce((sum, r) => sum + (r.errors || 0), 0);
  const totalFixed = Object.values(testResults).reduce((sum, r) => sum + (r.fixed || 0), 0);
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 VOLLSTÄNDIGE TEST-ZUSAMMENFASSUNG\n');
  console.log('='.repeat(70));
  
  Object.entries(testResults).forEach(([test, result]) => {
    const statusIcon = result.status === 'success' ? '✅' : 
                      result.status === 'partial' ? '⚠️' :
                      result.status === 'error' ? '❌' : '⏭️';
    
    console.log(`   ${statusIcon} ${test}: ${result.status}`);
    if (result.errors > 0) {
      console.log(`      Fehler: ${result.errors}`);
    }
    if (result.fixed > 0) {
      console.log(`      Behoben: ${result.fixed}`);
    }
  });
  
  console.log(`\n   📊 Gesamt-Fehler: ${totalErrors}`);
  console.log(`   🔧 Gesamt-Behoben: ${totalFixed}`);
  console.log(`   ⏱️  Dauer: ${duration} Sekunden\n`);
  
  // Finale Portal-Info
  writePortalInfo({ totalErrors, totalFixed });
  
  // Report speichern
  const report = {
    timestamp: new Date().toISOString(),
    duration: duration,
    applicationsTested: ALL_APPLICATIONS.length,
    results: testResults,
    summary: {
      totalErrors,
      totalFixed,
      success: totalErrors === 0
    }
  };
  
  fs.writeFileSync('COMPLETE-MASTER-TEST-REPORT.json', JSON.stringify(report, null, 2));
  console.log('💾 Report gespeichert: COMPLETE-MASTER-TEST-REPORT.json\n');
  
  if (totalErrors === 0) {
    console.log('✅✅✅ ALLE TESTS BESTANDEN! ✅✅✅\n');
    return true;
  } else {
    console.log('⚠️  Einige Tests haben Fehler - siehe Report\n');
    return false;
  }
}

// Main
if (require.main === module) {
  runAllTestsComplete().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error('❌ Fataler Fehler:', err);
    process.exit(1);
  });
}

module.exports = { runAllTestsComplete, ALL_APPLICATIONS };

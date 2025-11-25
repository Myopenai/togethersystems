// Prüft Test-Status und zeigt Ergebnisse
const fs = require('fs');
const path = require('path');

console.log('📊 TEST-ERGEBNISSE PRÜFEN...\n');
console.log('='.repeat(70));

// Prüfe Test-Reports
const reports = {
  'ALL-TESTS-REPORT.json': 'Alle Tests Report',
  'FEATURE-TEST-REPORT.json': 'Feature-Test Report',
  'ALL-TESTS-LOG.txt': 'Alle Tests Log',
  'FEATURE-TEST-LOG.txt': 'Feature-Test Log'
};

let reportsFound = 0;

for (const [file, name] of Object.entries(reports)) {
  if (fs.existsSync(file)) {
    reportsFound++;
    const stats = fs.statSync(file);
    console.log(`✅ ${name}:`);
    console.log(`   Datei: ${file}`);
    console.log(`   Größe: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Änderung: ${stats.mtime.toLocaleString()}`);
    
    if (file.endsWith('.json')) {
      try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        console.log(`   Inhalt:`);
        
        if (content.totalFeatures) {
          console.log(`      - Features getestet: ${content.totalFeatures}`);
          console.log(`      - Erfolgreich: ${content.passedFeatures}`);
          console.log(`      - Fehler: ${content.totalErrors}`);
          console.log(`      - Erfolgsquote: ${content.successRate}`);
        }
        
        if (content.totalErrors !== undefined) {
          console.log(`      - Gesamt-Fehler: ${content.totalErrors}`);
        }
        
        if (content.results) {
          console.log(`      - Test-Ergebnisse: ${Object.keys(content.results).length} Dateien`);
        }
      } catch (e) {
        console.log(`   ⚠️  JSON-Parse Fehler: ${e.message}`);
      }
    }
    console.log('');
  } else {
    console.log(`❌ ${name}: Datei nicht gefunden (${file})\n`);
  }
}

// Prüfe Playwright-Report
if (fs.existsSync('businessconnecthub-playwright-tests-full/playwright-report')) {
  console.log('✅ Playwright-Report gefunden');
  console.log(`   Pfad: businessconnecthub-playwright-tests-full/playwright-report/index.html`);
  console.log('');
}

// Führe schnelle Code-Analyse durch
console.log('📝 Schnelle Code-Analyse...\n');
try {
  const { execSync } = require('child_process');
  const output = execSync('node simple-error-checker.js 2>&1', { encoding: 'utf8', timeout: 10000 });
  console.log(output);
} catch (e) {
  console.log('⚠️  Code-Analyse konnte nicht ausgeführt werden');
}

console.log('='.repeat(70));
console.log(`\n📊 Zusammenfassung:`);
console.log(`   - Reports gefunden: ${reportsFound}/${Object.keys(reports).length}`);
console.log('');

if (reportsFound === 0) {
  console.log('⚠️  Keine Test-Reports gefunden - Tests laufen möglicherweise noch...\n');
} else {
  console.log('✅ Test-Reports vorhanden - Details siehe oben\n');
}



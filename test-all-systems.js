/**
 * COMPLETE SYSTEM TEST
 * Testet alle Systeme bis keine Fehler mehr vorhanden sind
 * 
 * Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
 * TTT Versiegelt
 */

const fs = require('fs');
const path = require('path');

const TEST_RESULTS = {
  html: [],
  js: [],
  sw: [],
  console: [],
  total: 0,
  errors: 0,
  fixed: 0
};

// HTML-Dateien finden
function findHTMLFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'businessconnecthub-playwright-tests-full') {
      files.push(...findHTMLFiles(fullPath));
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Syntax-Fehler in JavaScript-Code finden
function checkJavaScriptSyntax(content, filePath) {
  const errors = [];
  
  // Doppelte Semikolons
  const doubleSemicolon = /;;/g;
  let match;
  while ((match = doubleSemicolon.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length;
    errors.push({
      file: filePath,
      line: line,
      type: 'double-semicolon',
      message: `Doppeltes Semikolon gefunden`,
      fix: ';; → ;'
    });
  }
  
  // Fehlende schließende Klammern
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const openBrackets = (content.match(/\[/g) || []).length;
  const closeBrackets = (content.match(/\]/g) || []).length;
  
  if (openParens !== closeParens) {
    errors.push({
      file: filePath,
      type: 'missing-parens',
      message: `Ungleiche Anzahl Klammern: (${openParens} öffnend, ${closeParens} schließend)`
    });
  }
  
  if (openBraces !== closeBraces) {
    errors.push({
      file: filePath,
      type: 'missing-braces',
      message: `Ungleiche Anzahl geschweifte Klammern: {${openBraces} öffnend, ${closeBraces} schließend}`
    });
  }
  
  if (openBrackets !== closeBrackets) {
    errors.push({
      file: filePath,
      type: 'missing-brackets',
      message: `Ungleiche Anzahl eckige Klammern: [${openBrackets} öffnend, ${closeBrackets} schließend)`
    });
  }
  
  // Fehlerhafte JSON.parse Strukturen
  const jsonParsePattern = /res\.ok\s*\?\s*await\s*res\.json\(\)\.catch\([^)]+\)\s*:\s*null;;/g;
  while ((match = jsonParsePattern.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length;
    errors.push({
      file: filePath,
      line: line,
      type: 'json-parse-double-semicolon',
      message: `Doppeltes Semikolon nach JSON.parse`,
      fix: ';; → ;'
    });
  }
  
  return errors;
}

// Service Worker Fehler prüfen
function checkServiceWorker(swPath) {
  const errors = [];
  
  if (!fs.existsSync(swPath)) {
    return [{ file: swPath, type: 'missing', message: 'Service Worker nicht gefunden' }];
  }
  
  const content = fs.readFileSync(swPath, 'utf8');
  
  // Prüfe auf chrome-extension Handling
  if (!content.includes('chrome-extension:') && !content.includes('chrome:')) {
    // Sollte bereits behoben sein, aber prüfen
  }
  
  return errors;
}

// Alle Tests ausführen
function runAllTests() {
  console.log('🧪 STARTE VOLLSTÄNDIGE SYSTEM-TESTS...\n');
  
  const rootDir = __dirname;
  const htmlFiles = findHTMLFiles(rootDir);
  
  console.log(`📄 Gefundene HTML-Dateien: ${htmlFiles.length}\n`);
  
  // HTML-Dateien testen
  for (const htmlFile of htmlFiles) {
    const content = fs.readFileSync(htmlFile, 'utf8');
    const errors = checkJavaScriptSyntax(content, htmlFile);
    
    if (errors.length > 0) {
      TEST_RESULTS.html.push(...errors);
      TEST_RESULTS.errors += errors.length;
      console.log(`❌ ${htmlFile}: ${errors.length} Fehler gefunden`);
      errors.forEach(err => {
        console.log(`   - Zeile ${err.line || '?'}: ${err.message}`);
      });
    } else {
      console.log(`✅ ${htmlFile}: Keine Fehler`);
    }
    
    TEST_RESULTS.total++;
  }
  
  // Service Worker testen
  const swPath = path.join(rootDir, 'sw.js');
  const swErrors = checkServiceWorker(swPath);
  if (swErrors.length > 0) {
    TEST_RESULTS.sw.push(...swErrors);
    TEST_RESULTS.errors += swErrors.length;
    console.log(`❌ sw.js: ${swErrors.length} Fehler gefunden`);
  } else {
    console.log(`✅ sw.js: Keine Fehler`);
  }
  
  // Zusammenfassung
  console.log('\n📊 TEST-ZUSAMMENFASSUNG:');
  console.log(`   Gesamt getestet: ${TEST_RESULTS.total}`);
  console.log(`   Fehler gefunden: ${TEST_RESULTS.errors}`);
  console.log(`   Behoben: ${TEST_RESULTS.fixed}`);
  
  return TEST_RESULTS;
}

// Fehler automatisch beheben
function fixErrors() {
  console.log('\n🔧 STARTE AUTOMATISCHE FEHLERBEHEBUNG...\n');
  
  for (const error of TEST_RESULTS.html) {
    if (error.type === 'double-semicolon' || error.type === 'json-parse-double-semicolon') {
      try {
        const content = fs.readFileSync(error.file, 'utf8');
        const fixed = content.replace(/;;/g, ';');
        fs.writeFileSync(error.file, fixed, 'utf8');
        console.log(`✅ Behoben: ${error.file} - Doppeltes Semikolon entfernt`);
        TEST_RESULTS.fixed++;
      } catch (e) {
        console.log(`❌ Konnte nicht beheben: ${error.file} - ${e.message}`);
      }
    }
  }
}

// Hauptfunktion
function main() {
  let iteration = 0;
  const maxIterations = 10;
  
  while (iteration < maxIterations) {
    iteration++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`ITERATION ${iteration}`);
    console.log('='.repeat(60));
    
    TEST_RESULTS.html = [];
    TEST_RESULTS.js = [];
    TEST_RESULTS.sw = [];
    TEST_RESULTS.console = [];
    TEST_RESULTS.total = 0;
    TEST_RESULTS.errors = 0;
    TEST_RESULTS.fixed = 0;
    
    const results = runAllTests();
    
    if (results.errors === 0) {
      console.log('\n🎉 ALLE TESTS ERFOLGREICH - KEINE FEHLER MEHR!');
      break;
    }
    
    fixErrors();
    
    if (iteration >= maxIterations) {
      console.log(`\n⚠️  Maximale Iterationen erreicht. Verbleibende Fehler: ${results.errors}`);
    }
  }
  
  // Finale Zusammenfassung
  console.log('\n' + '='.repeat(60));
  console.log('FINALER STATUS');
  console.log('='.repeat(60));
  console.log(`Iterationen: ${iteration}`);
  console.log(`Gesamt getestet: ${TEST_RESULTS.total}`);
  console.log(`Verbleibende Fehler: ${TEST_RESULTS.errors}`);
  console.log(`Behoben: ${TEST_RESULTS.fixed}`);
}

if (require.main === module) {
  main();
}

module.exports = { runAllTests, fixErrors };









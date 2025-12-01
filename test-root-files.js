/**
 * TEST ROOT FILES ONLY
 * Testet nur die kritischen Root-Dateien
 */

const fs = require('fs');
const path = require('path');

const ROOT_FILES = [
  'index.html',
  'manifest-portal.html',
  'manifest-forum.html',
  'admin-monitoring.html',
  'business-admin.html',
  'legal-hub.html',
  'honeycomb.html',
  'ostos-branding.html',
  'sw.js',
  'console-monitor.js'
];

function checkSyntax(content, filePath) {
  const errors = [];
  
  // Doppelte Semikolons
  const doubleSemicolon = /;;/g;
  let match;
  while ((match = doubleSemicolon.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length;
    errors.push({
      file: path.basename(filePath),
      line: line,
      type: 'double-semicolon',
      message: `Doppeltes Semikolon gefunden`
    });
  }
  
  // Fehlende schließende Klammern (vereinfacht)
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  if (Math.abs(openParens - closeParens) > 5) {
    errors.push({
      file: path.basename(filePath),
      type: 'parens-mismatch',
      message: `Ungleiche Anzahl Klammern: (${openParens} öffnend, ${closeParens} schließend)`
    });
  }
  
  // JSON.parse Fehler
  const jsonParsePattern = /res\.ok\s*\?\s*await\s*res\.json\(\)\.catch.*\)\s*:\s*null;;/g;
  while ((match = jsonParsePattern.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length;
    errors.push({
      file: path.basename(filePath),
      line: line,
      type: 'json-parse-double-semicolon',
      message: `Doppeltes Semikolon nach JSON.parse`
    });
  }
  
  return errors;
}

function main() {
  console.log('🧪 TESTE KRITISCHE ROOT-DATEIEN...\n');
  
  const rootDir = __dirname;
  let totalErrors = 0;
  let fixed = 0;
  
  for (const file of ROOT_FILES) {
    const filePath = path.join(rootDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file}: Nicht gefunden`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = checkSyntax(content, filePath);
    
    if (errors.length > 0) {
      console.log(`❌ ${file}: ${errors.length} Fehler gefunden`);
      errors.forEach(err => {
        console.log(`   - Zeile ${err.line || '?'}: ${err.message}`);
      });
      
      // Auto-Fix doppelte Semikolons
      if (errors.some(e => e.type === 'double-semicolon' || e.type === 'json-parse-double-semicolon')) {
        const fixed = content.replace(/;;/g, ';');
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(`   ✅ Behoben: Doppelte Semikolons entfernt`);
        fixed++;
      }
      
      totalErrors += errors.length;
    } else {
      console.log(`✅ ${file}: Keine Fehler`);
    }
  }
  
  console.log('\n📊 ZUSAMMENFASSUNG:');
  console.log(`   Getestet: ${ROOT_FILES.length} Dateien`);
  console.log(`   Fehler gefunden: ${totalErrors}`);
  console.log(`   Behoben: ${fixed}`);
  
  if (totalErrors === 0) {
    console.log('\n🎉 ALLE ROOT-DATEIEN FEHLERFREI!');
  }
}

main();









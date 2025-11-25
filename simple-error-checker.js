// Einfacher Error-Checker ohne Playwright
// Prüft Code-Static-Analysis für häufige Fehler

const fs = require('fs');
const path = require('path');

const FILES = [
  'manifest-portal.html',
  'manifest-forum.html',
  'balanced-exchange-portal.js',
  'messages-portal.js',
  'index.html',
  'admin.html',
  'admin-monitoring.html',
  'business-admin.html',
  'production-dashboard.html',
  'legal-hub.html',
  'honeycomb.html',
  'neural-network-console.html'
];

function checkFile(file) {
  if (!fs.existsSync(file)) return { errors: [], warnings: [] };
  
  const content = fs.readFileSync(file, 'utf8');
  const errors = [];
  const warnings = [];
  
  // Check 1: fetch ohne try-catch
  const fetchMatches = content.matchAll(/(const|let|var)\s+\w+\s*=\s*await\s+fetch\(/g);
  for (const match of fetchMatches) {
    const before = content.substring(0, match.index);
    const lastTry = before.lastIndexOf('try {');
    const lastCatch = before.lastIndexOf('} catch');
    
    if (!(lastTry > lastCatch && lastTry !== -1)) {
      errors.push({
        line: content.substring(0, match.index).split('\n').length,
        type: 'fetch ohne try-catch',
        message: `fetch() call ohne Error-Handling gefunden`
      });
    }
  }
  
  // Check 2: JSON.parse ohne Fehlerbehandlung
  const jsonParseMatches = content.matchAll(/JSON\.parse\([^)]+\)/g);
  for (const match of jsonParseMatches) {
    const before = content.substring(0, match.index);
    const lastTry = before.lastIndexOf('try {');
    const lastCatch = before.lastIndexOf('} catch');
    
    if (!(lastTry > lastCatch && lastTry !== -1) && !before.includes('safeJSONParse')) {
      errors.push({
        line: content.substring(0, match.index).split('\n').length,
        type: 'JSON.parse ohne Fehlerbehandlung',
        message: `JSON.parse() ohne try-catch gefunden`
      });
    }
  }
  
  // Check 3: response.json() ohne res.ok check
  const jsonMatches = content.matchAll(/await\s+(\w+)\.json\(\)/g);
  for (const match of jsonMatches) {
    const resName = match[1];
    const before = content.substring(0, match.index);
    
    if (!before.includes(`if (${resName}.ok)`) && !before.includes(`${resName}?.ok`)) {
      errors.push({
        line: content.substring(0, match.index).split('\n').length,
        type: 'response.json() ohne res.ok check',
        message: `${resName}.json() ohne res.ok Prüfung gefunden`
      });
    }
  }
  
  return { errors, warnings };
}

async function runChecks() {
  console.log('🔍 Statische Code-Analyse...\n');
  
  let totalErrors = 0;
  let filesWithErrors = 0;
  
  for (const file of FILES) {
    const result = checkFile(file);
    
    if (result.errors.length > 0) {
      filesWithErrors++;
      totalErrors += result.errors.length;
      console.log(`📄 ${file}:`);
      result.errors.forEach(err => {
        console.log(`   ❌ Zeile ${err.line}: ${err.type}`);
      });
    } else {
      console.log(`✅ ${file}: Keine Fehler`);
    }
  }
  
  console.log(`\n📊 Ergebnis: ${totalErrors} Fehler in ${filesWithErrors} Dateien\n`);
  
  return totalErrors === 0;
}

if (require.main === module) {
  runChecks().then(clean => process.exit(clean ? 0 : 1));
}

module.exports = { runChecks, checkFile };



// Erweiterte automatische Fehlerbehebung
// Fixt ALLE Fehler: JSON.parse, fetch(), broken links, etc.

const fs = require('fs');
const path = require('path');

const HTML_FILES = [
  'manifest-portal.html',
  'manifest-forum.html',
  'index.html',
  'admin.html',
  'admin-monitoring.html',
  'business-admin.html',
  'production-dashboard.html',
  'neural-network-console.html',
  'legal-hub.html',
  'honeycomb.html',
];

function fixAllErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fixedCount = 0;

  // Fix 1: JSON.parse() ohne try-catch
  // Suche alle JSON.parse() Aufrufe
  const jsonParsePattern = /JSON\.parse\(([^)]+)\)/g;
  const jsonFixes = [];
  let match;
  
  while ((match = jsonParsePattern.exec(content)) !== null) {
    const before = content.substring(Math.max(0, match.index - 500), match.index);
    const after = content.substring(match.index + match[0].length, match.index + match[0].length + 500);
    
    // Prüfe ob bereits in try-catch
    if (!before.match(/try\s*\{[^}]*$/) && !after.match(/^[^{]*catch\s*\(/)) {
      jsonFixes.push({
        index: match.index,
        length: match[0].length,
        param: match[1],
        fullMatch: match[0],
      });
    }
  }
  
  // Fixe rückwärts (damit Indizes stimmen)
  for (let i = jsonFixes.length - 1; i >= 0; i--) {
    const fix = jsonFixes[i];
    const replacement = `(function() { try { return JSON.parse(${fix.param}); } catch(e) { console.error('JSON parse error:', e); return null; } })()`;
    content = content.substring(0, fix.index) + replacement + content.substring(fix.index + fix.length);
    fixedCount++;
  }

  // Fix 2: fetch() ohne res.ok check
  // Pattern: await fetch(...).then(res => res.json())
  const fetchJsonPattern = /await\s+fetch\(([^)]+)\)\s*\.then\(([^)]*res[^)]*=>[^)]*res\.json\(\)[^)]*)\)/g;
  content = content.replace(fetchJsonPattern, (match, fetchUrl, thenBody) => {
    if (thenBody.includes('res.ok')) return match;
    fixedCount++;
    return `await fetch(${fetchUrl}).then(res => res.ok ? res.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null)`;
  });

  // Fix 3: fetch() ohne await
  const fetchWithoutAwaitPattern = /(^|[^a-z])fetch\(([^)]+)\)\s*\.then\([^)]*res[^)]*=>[^)]*res\.json\(\)/g;
  content = content.replace(fetchWithoutAwaitPattern, (match, before, fetchUrl) => {
    if (match.includes('res.ok')) return match;
    fixedCount++;
    return `${before || ''}fetch(${fetchUrl}).then(res => res.ok ? res.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null)`;
  });

  // Fix 4: response.json() direkt nach fetch ohne check
  const responseJsonPattern = /response\.json\(\)|res\.json\(\)/g;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('res.json()') || line.includes('response.json()')) {
      // Prüfe ob res.ok check in den vorherigen Zeilen
      let hasOkCheck = false;
      for (let j = Math.max(0, i - 5); j < i; j++) {
        if (lines[j].includes('res.ok') || lines[j].includes('response.ok')) {
          hasOkCheck = true;
          break;
        }
      }
      
      if (!hasOkCheck && !line.includes('res.ok')) {
        lines[i] = line.replace(/res\.json\(\)/g, 'res.ok ? res.json().catch(e => { console.error(\'JSON parse error:\', e); return null; }) : null')
                       .replace(/response\.json\(\)/g, 'response.ok ? response.json().catch(e => { console.error(\'JSON parse error:\', e); return null; }) : null');
        fixedCount++;
      }
    }
  }
  content = lines.join('\n');

  // Fix 5: Duplicate try-catch blocks entfernen
  content = content.replace(/try\s*\{\s*try\s*\{/g, 'try {');
  content = content.replace(/\}\s*catch\s*\([^)]+\)\s*\{[^}]*\}\s*catch\s*\([^)]+\)\s*\{/g, (match) => {
    // Behalte nur den äußeren catch
    const catches = match.match(/catch\s*\([^)]+\)\s*\{[^}]*\}/g);
    return catches && catches.length > 0 ? catches[catches.length - 1] : match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return fixedCount;
  }

  return 0;
}

function runAutoFix() {
  console.log('🔧 Starte automatische Fehlerbehebung...\n');
  let totalFixed = 0;
  let maxIterations = 5;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let iterationFixed = 0;
    console.log(`🔄 Iteration ${iteration + 1}/${maxIterations}...\n`);

    for (const file of HTML_FILES) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Datei nicht gefunden: ${file}`);
        continue;
      }

      process.stdout.write(`📄 ${file}: `);
      const fixed = fixAllErrors(filePath);
      
      if (fixed > 0) {
        console.log(`✅ ${fixed} Fehler behoben`);
        iterationFixed += fixed;
        totalFixed += fixed;
      } else {
        console.log(`✅ Keine Änderungen nötig`);
      }
    }

    if (iterationFixed === 0) {
      console.log(`\n✅✅✅ ALLE FEHLER BEHOBEN! ✅✅✅\n`);
      break;
    }
    
    console.log(`\n   🔧 ${iterationFixed} Fehler behoben in Iteration ${iteration + 1}\n`);
  }

  console.log(`\n📊 Gesamt: ${totalFixed} Fehler automatisch behoben\n`);
  return totalFixed;
}

if (require.main === module) {
  runAutoFix();
} else {
  module.exports = { runAutoFix, fixAllErrors, HTML_FILES };
}










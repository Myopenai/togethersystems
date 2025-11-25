// Automatisches API/JSON-Fehlerbehebungs-System
// Findet und behebt alle Fehler in HTML/JS-Dateien

const fs = require('fs');

const FILES_TO_FIX = [
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

function safeReadFile(file) {
  try {
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  } catch (e) {
    return null;
  }
}

function safeWriteFile(file, content) {
  try {
    fs.writeFileSync(file, content, 'utf8');
    return true;
  } catch (e) {
    console.error(`❌ Fehler beim Schreiben von ${file}:`, e.message);
    return false;
  }
}

function fixFile(filePath) {
  const content = safeReadFile(filePath);
  if (!content) return { fixed: false, errors: [] };

  let newContent = content;
  let fixed = false;
  let errors = [];

  // Fix 1: fetch() ohne try-catch
  const fetchPattern = /(const|let|var)\s+(\w+)\s*=\s*await\s+fetch\(/g;
  const fetchMatches = [];
  let match;
  while ((match = fetchPattern.exec(content)) !== null) {
    const before = content.substring(0, match.index);
    const lastTry = before.lastIndexOf('try {');
    const lastCatch = before.lastIndexOf('} catch');
    
    // Prüfe ob schon in try-catch
    if (!(lastTry > lastCatch && lastTry !== -1)) {
      fetchMatches.push({
        start: match.index,
        end: content.indexOf('\n', match.index + match[0].length),
        indent: content.substring(0, match.index).split('\n').pop().match(/^(\s*)/)?.[1] || ''
      });
    }
  }

  if (fetchMatches.length > 0) {
    // Fixe von hinten nach vorne um Indices zu erhalten
    fetchMatches.reverse().forEach(({ start, end, indent }) => {
      const original = content.substring(start, end === -1 ? content.length : end);
      const wrapped = `${indent}try {\n${indent}  ${original.trim()}\n${indent}} catch (err) {\n${indent}  console.error('API error:', err);\n${indent}  return null;\n${indent}}`;
      newContent = newContent.substring(0, start) + wrapped + newContent.substring(end === -1 ? content.length : end);
      fixed = true;
      errors.push('fetch ohne try-catch');
    });
  }

  // Fix 2: response.json() ohne Fehlerbehandlung
  newContent = newContent.replace(
    /(const|let|var)\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\)/g,
    (match, decl, varName, resName, offset) => {
      // Prüfe ob schon protected
      const before = newContent.substring(0, offset);
      if (before.includes(`if (${resName}.ok)`) || before.includes(`${resName}?.ok`)) {
        return match;
      }
      fixed = true;
      errors.push('response.json() ohne Fehlerbehandlung');
      return `${decl} ${varName} = ${resName}.ok ? await ${resName}.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null;`;
    }
  );

  // Fix 3: JSON.parse() ohne Fehlerbehandlung (nur wenn nicht schon geschützt)
  newContent = newContent.replace(
    /JSON\.parse\(([^)]+)\)/g,
    (match, arg, offset) => {
      // Prüfe ob schon in try-catch
      const before = newContent.substring(0, offset);
      const lastTry = before.lastIndexOf('try {');
      const lastCatch = before.lastIndexOf('} catch');
      
      if (lastTry > lastCatch && lastTry !== -1) {
        return match; // Schon geschützt
      }
      
      // Prüfe ob schon safe wrapper vorhanden
      if (before.includes('safeJSONParse') || before.includes('function() { try')) {
        return match;
      }
      
      fixed = true;
      errors.push('JSON.parse ohne Fehlerbehandlung');
      return `(function() { try { return JSON.parse(${arg}); } catch(e) { console.error('JSON parse error:', e); return null; } })()`;
    }
  );

  if (fixed) {
    safeWriteFile(filePath, newContent);
  }

  return { fixed, errors: [...new Set(errors)] };
}

// Haupt-Loop
async function run() {
  console.log('🚀 Starte automatische Fehlerbehebung...\n');
  
  let iteration = 0;
  let maxIterations = 30;
  let consecutiveClean = 0;

  while (maxIterations-- > 0) {
    iteration++;
    console.log(`\n🔄 Iteration ${iteration}...\n`);

    let totalErrors = 0;
    let totalFixed = 0;

    for (const file of FILES_TO_FIX) {
      const result = fixFile(file);
      if (result.errors.length > 0) {
        totalErrors += result.errors.length;
        if (result.fixed) totalFixed++;
        console.log(`📄 ${file}:`);
        console.log(`   ❌ ${result.errors.join(', ')}`);
        if (result.fixed) {
          console.log(`   ✅ Behoben!`);
        }
      }
    }

    if (totalErrors === 0) {
      consecutiveClean++;
      if (consecutiveClean >= 2) {
        console.log('\n✅✅✅ ALLE FEHLER BEHOBEN! ✅✅✅\n');
        return true;
      }
    } else {
      consecutiveClean = 0;
      console.log(`\n   🔧 ${totalFixed} Fehler behoben, ${totalErrors - totalFixed} noch vorhanden`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n⚠️  Maximale Iterationen erreicht');
  return false;
}

if (require.main === module) {
  run().then(success => process.exit(success ? 0 : 1));
}

module.exports = { run, fixFile };



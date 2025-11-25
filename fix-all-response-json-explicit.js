// Expliziter Fixer für alle response.json() Fehler
// Behebt auch die Fälle, die in try-catch sind aber kein res.ok haben

const fs = require('fs');

const FILES_TO_FIX = [
  'manifest-portal.html',
  'balanced-exchange-portal.js',
  'admin-monitoring.html',
  'business-admin.html',
  'production-dashboard.html',
  'neural-network-console.html'
];

function fixResponseJsonExplicit(file) {
  if (!fs.existsSync(file)) return { fixed: false, changes: 0 };
  
  let content = fs.readFileSync(file, 'utf8');
  let changes = 0;
  let fixed = false;
  
  // Pattern: await res.json() - auch wenn in try-catch
  content = content.replace(
    /(const|let|var)\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\)/g,
    (match, decl, varName, resName, offset) => {
      // Prüfe ob schon res.ok check vorhanden
      const before = content.substring(Math.max(0, offset - 200), offset);
      
      // Skip if already has res.ok check in nearby code
      if (before.includes(`if (${resName}.ok)`) || 
          before.includes(`${resName}?.ok`) ||
          before.includes(`${resName}.ok ?`)) {
        return match;
      }
      
      // Prüfe ob in try-catch - dann füge res.ok check DAVOR ein
      const beforeFull = content.substring(0, offset);
      const lastTry = beforeFull.lastIndexOf('try {');
      const lastCatch = beforeFull.lastIndexOf('} catch');
      const isInTryCatch = lastTry > lastCatch && lastTry !== -1;
      
      if (isInTryCatch) {
        // Füge res.ok check in try-catch ein
        const indent = match.match(/^(\s*)/)?.[1] || '';
        const beforeLine = content.substring(0, offset);
        const lines = beforeLine.split('\n');
        const currentIndent = lines[lines.length - 1].match(/^(\s*)/)?.[1] || '';
        
        // Prüfe ob schon if (!res.ok) return vorhanden
        const checkBefore = content.substring(Math.max(0, offset - 100), offset);
        if (!checkBefore.includes(`if (!${resName}.ok`) && !checkBefore.includes(`if (${resName}.ok`)) {
          // Füge res.ok check ein
          const newCode = `${currentIndent}if (!${resName}.ok) {\n${currentIndent}  return null;\n${currentIndent}}\n${match}`;
          fixed = true;
          changes++;
          return newCode;
        }
      } else {
        // Nicht in try-catch - ersetze komplett
        fixed = true;
        changes++;
        return `${decl} ${varName} = ${resName}.ok ? await ${resName}.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null;`;
      }
      
      return match;
    }
  );
  
  if (fixed) {
    fs.writeFileSync(file, content, 'utf8');
  }
  
  return { fixed, changes };
}

console.log('🔧 Behebe ALLE response.json() Fehler explizit...\n');

let totalChanges = 0;
for (const file of FILES_TO_FIX) {
  const result = fixResponseJsonExplicit(file);
  if (result.fixed) {
    totalChanges += result.changes;
    console.log(`✅ ${file}: ${result.changes} Änderungen`);
  } else {
    console.log(`✅ ${file}: Keine Änderungen nötig`);
  }
}

console.log(`\n📊 Gesamt: ${totalChanges} Änderungen\n`);



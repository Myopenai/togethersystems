// Spezifischer Fixer für response.json() ohne res.ok checks

const fs = require('fs');

const FILES = [
  'manifest-portal.html',
  'balanced-exchange-portal.js',
  'admin-monitoring.html',
  'business-admin.html',
  'production-dashboard.html',
  'neural-network-console.html'
];

function fixResponseJson(file) {
  if (!fs.existsSync(file)) return { fixed: false, changes: 0 };
  
  let content = fs.readFileSync(file, 'utf8');
  let changes = 0;
  let fixed = false;
  
  // Pattern: const data = await res.json();
  // Fix: const data = res.ok ? await res.json().catch(...) : null;
  content = content.replace(
    /(const|let|var)\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\)/g,
    (match, decl, varName, resName, offset) => {
      // Prüfe ob schon protected
      const before = content.substring(0, offset);
      
      // Skip if already has res.ok check
      if (before.includes(`if (${resName}.ok)`) || 
          before.includes(`${resName}?.ok`) ||
          before.includes(`${resName}.ok ?`)) {
        return match;
      }
      
      // Skip if in try-catch that already handles errors
      const lastTry = before.lastIndexOf('try {');
      const lastCatch = before.lastIndexOf('} catch');
      if (lastTry > lastCatch && lastTry !== -1) {
        // Check if catch block handles json errors
        const after = content.substring(offset + match.length, offset + match.length + 200);
        const catchStart = content.indexOf('} catch', offset);
        if (catchStart > offset && catchStart < offset + 500) {
          const catchBlock = content.substring(catchStart, catchStart + 100);
          if (catchBlock.includes('json') || catchBlock.includes('JSON')) {
            return match; // Already handled
          }
        }
      }
      
      changes++;
      fixed = true;
      return `${decl} ${varName} = ${resName}.ok ? await ${resName}.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null;`;
    }
  );
  
  if (fixed) {
    fs.writeFileSync(file, content, 'utf8');
  }
  
  return { fixed, changes };
}

console.log('🔧 Behebe response.json() Fehler...\n');

let totalChanges = 0;
for (const file of FILES) {
  const result = fixResponseJson(file);
  if (result.fixed) {
    totalChanges += result.changes;
    console.log(`✅ ${file}: ${result.changes} Änderungen`);
  } else {
    console.log(`✅ ${file}: Keine Änderungen nötig`);
  }
}

console.log(`\n📊 Gesamt: ${totalChanges} Änderungen\n`);



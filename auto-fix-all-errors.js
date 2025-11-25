// Automatisches Fehlerbehebungs-System für TogetherSystems
// Prüft alle HTML-Dateien, findet API/JSON-Fehler und behebt sie automatisch

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HTML_FILES = [
  'index.html',
  'manifest-forum.html',
  'manifest-portal.html',
  'legal-hub.html',
  'honeycomb.html',
  'neural-network-console.html',
  'admin-monitoring.html',
  'admin.html',
  'business-admin.html',
  'production-dashboard.html',
  'help-portal.html',
  'help-online-portal.html',
  'help-manifest.html',
  'help-legal-hub.html',
  'help-honeycomb.html',
  'help-getting-started.html',
  'Portal – Start.html',
  'suppliers-story.html',
];

const JS_FILES = [
  'balanced-exchange-portal.js',
  'messages-portal.js',
  'ai-frontend-integration.js',
  'autofix-client.js',
  'ambient-media.js',
];

// Fehlermuster die gefunden und behoben werden sollen
const ERROR_PATTERNS = [
  {
    name: 'fetch ohne try-catch',
    pattern: /(?:^|\n)\s*(?:const|let|var)\s+\w+\s*=\s*await\s+fetch\(/g,
    fix: (match, file) => {
      // Prüfe ob schon try-catch vorhanden
      if (file.includes('try') && file.includes('catch')) return null;
      return `try {\n      ${match.trim()}`;
    }
  },
  {
    name: 'JSON.parse ohne try-catch',
    pattern: /JSON\.parse\([^)]+\)(?!\s*(?:\n\s*)\} catch)/g,
    fix: (match) => {
      return `(function() { try { return JSON.parse(${match.match(/\(.+\)/)?.[0] || '...')}) } catch(e) { console.error('JSON parse error:', e); return null; } })()`;
    }
  },
  {
    name: 'response.json() ohne Fehlerbehandlung',
    pattern: /const\s+\w+\s*=\s*await\s+\w+\.json\(\)/g,
    fix: (match) => {
      return `const ${match.match(/const\s+(\w+)/)?.[1] || 'data'} = res.ok ? await res.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null;`;
    }
  },
  {
    name: 'undefined/null-Zugriffe',
    pattern: /\.(json|data|ok|error)\(\)/g,
    fix: (match, file, index) => {
      // Prüfe ob schon Null-Check vorhanden
      const before = file.substring(Math.max(0, index - 50), index);
      if (before.includes('?.') || before.includes('if (')) return null;
      return match.replace('.', '?.');
    }
  }
];

let totalErrors = 0;
let totalFixes = 0;
let iteration = 0;

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`❌ Kann Datei nicht lesen: ${filePath}`, err.message);
    return null;
  }
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err) {
    console.error(`❌ Kann Datei nicht schreiben: ${filePath}`, err.message);
    return false;
  }
}

function findAndFixErrors(filePath) {
  const content = readFile(filePath);
  if (!content) return { errors: [], fixed: false };

  let newContent = content;
  let errors = [];
  let fixed = false;

  // Prüfe auf häufige Fehlermuster
  const checks = [
    {
      name: 'fetch ohne Error-Handling',
      test: /(?:^|\n)(?!.*try)(?:const|let|var)\s+\w+\s*=\s*await\s+fetch\(/,
      fix: (content) => {
        // Wrap fetch in try-catch
        return content.replace(
          /(?:^|\n)(\s*)(?:const|let|var)\s+(\w+)\s*=\s*await\s+fetch\(/g,
          (match, indent, varName) => {
            const before = content.substring(0, content.indexOf(match));
            const linesBefore = before.split('\n');
            const lastLine = linesBefore[linesBefore.length - 1];
            
            // Prüfe ob schon in try-catch
            if (content.substring(0, content.indexOf(match)).includes('try {')) {
              return match;
            }
            
            return `${indent}try {\n${indent}  const ${varName} = await fetch(`;
          }
        );
      }
    },
    {
      name: 'JSON.parse ohne Fehlerbehandlung',
      test: /JSON\.parse\([^)]+\)(?!\s*[,\n].*catch)/,
      fix: (content) => {
        return content.replace(
          /JSON\.parse\(([^)]+)\)/g,
          (match, arg) => {
            if (content.includes(`try`) && content.indexOf(`try`) < content.indexOf(match) && 
                content.includes(`catch`) && content.indexOf(`catch`) > content.indexOf(match)) {
              return match; // Schon in try-catch
            }
            return `(function() { try { return JSON.parse(${arg}); } catch(e) { console.error('JSON parse error:', e); return null; } })()`;
          }
        );
      }
    },
    {
      name: 'response.json() ohne Fehlerbehandlung',
      test: /const\s+\w+\s*=\s*await\s+\w+\.json\(\)(?!\s*[,\n].*catch)/,
      fix: (content) => {
        return content.replace(
          /(const|let|var)\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\)/g,
          (match, decl, varName, resName) => {
            // Prüfe ob res.ok schon geprüft wird
            const before = content.substring(0, content.indexOf(match));
            const after = content.substring(content.indexOf(match) + match.length);
            
            if (before.includes(`if (${resName}.ok)`)) {
              return match; // Schon geprüft
            }
            
            return `${decl} ${varName} = ${resName}.ok ? await ${resName}.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null;`;
          }
        );
      }
    }
  ];

  checks.forEach(check => {
    if (check.test.test(newContent)) {
      errors.push(check.name);
      const fixedContent = check.fix(newContent);
      if (fixedContent !== newContent) {
        newContent = fixedContent;
        fixed = true;
      }
    }
  });

  if (fixed && writeFile(filePath, newContent)) {
    totalFixes++;
    return { errors, fixed: true };
  }

  return { errors, fixed: false };
}

function wrapFetchWithErrorHandling(content) {
  // Finde alle fetch-Calls die nicht in try-catch sind
  const fetchRegex = /(?:^|\n)(\s*)(?:const|let|var)\s+(\w+)\s*=\s*await\s+fetch\(/g;
  let match;
  let offset = 0;
  const replacements = [];

  while ((match = fetchRegex.exec(content)) !== null) {
    const startPos = match.index;
    const indent = match[1];
    const varName = match[2];
    
    // Prüfe ob schon in try-catch
    const before = content.substring(0, startPos);
    const lastTryIndex = before.lastIndexOf('try {');
    const lastCatchIndex = before.lastIndexOf('} catch');
    
    if (lastTryIndex > lastCatchIndex && lastTryIndex !== -1) {
      continue; // Schon in try-catch
    }
    
    // Finde das Ende dieser fetch-Zeile
    let lineEnd = content.indexOf('\n', startPos + match[0].length);
    if (lineEnd === -1) lineEnd = content.length;
    
    // Finde nächste Zeile (meist response.json() oder ähnlich)
    const nextLineStart = lineEnd + 1;
    let nextLineEnd = content.indexOf('\n', nextLineStart);
    if (nextLineEnd === -1) nextLineEnd = content.length;
    
    // Wrap in try-catch
    const original = content.substring(startPos, nextLineEnd);
    const wrapped = `${indent}try {\n${original.replace(/\n/g, '\n  ')}\n${indent}} catch (err) {\n${indent}  console.error('API error:', err);\n${indent}  // Handle error appropriately\n${indent}}`;
    
    replacements.push({ start: startPos, end: nextLineEnd, replacement: wrapped });
  }
  
  // Apply replacements from end to start to maintain indices
  replacements.reverse().forEach(({ start, end, replacement }) => {
    content = content.substring(0, start) + replacement + content.substring(end);
  });
  
  return content;
}

function fixJSONParsing(content) {
  // Wrap JSON.parse in safe wrapper
  return content.replace(
    /JSON\.parse\(([^)]+)\)/g,
    (match, arg) => {
      // Prüfe ob schon in try-catch
      const before = content.substring(0, content.indexOf(match));
      const lastTry = before.lastIndexOf('try {');
      const lastCatch = before.lastIndexOf('} catch');
      
      if (lastTry > lastCatch && lastTry !== -1) {
        return match; // Schon geschützt
      }
      
      return `(function() { try { return JSON.parse(${arg}); } catch(e) { console.error('JSON parse error:', e); return null; } })()`;
    }
  );
}

function fixResponseJson(content) {
  // Fix response.json() calls
  return content.replace(
    /(const|let|var)\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\)/g,
    (match, decl, varName, resName) => {
      // Prüfe ob schon protected
      const before = content.substring(0, content.indexOf(match));
      if (before.includes(`if (${resName}.ok)`) || before.includes(`${resName}?.ok`)) {
        return match;
      }
      
      return `${decl} ${varName} = ${resName}.ok ? await ${resName}.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null;`;
    }
  );
}

function processAllFiles() {
  console.log(`\n🔄 Iteration ${++iteration} - Prüfe alle Dateien...\n`);
  
  let errorsFound = 0;
  
  HTML_FILES.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  Datei nicht gefunden: ${file}`);
      return;
    }
    
    console.log(`📄 Prüfe: ${file}`);
    const result = findAndFixErrors(file);
    
    if (result.errors.length > 0) {
      errorsFound += result.errors.length;
      console.log(`   ❌ Gefunden: ${result.errors.join(', ')}`);
      if (result.fixed) {
        console.log(`   ✅ Behoben!`);
      }
    } else {
      console.log(`   ✅ Keine Fehler`);
    }
  });
  
  JS_FILES.forEach(file => {
    if (!fs.existsSync(file)) {
      return;
    }
    
    console.log(`📄 Prüfe: ${file}`);
    const result = findAndFixErrors(file);
    
    if (result.errors.length > 0) {
      errorsFound += result.errors.length;
      console.log(`   ❌ Gefunden: ${result.errors.join(', ')}`);
      if (result.fixed) {
        console.log(`   ✅ Behoben!`);
      }
    }
  });
  
  totalErrors += errorsFound;
  
  return errorsFound;
}

// Haupt-Loop: Wiederhole bis fehlerfrei
async function runUntilPerfect() {
  console.log('🚀 Starte automatische Fehlerbehebung...\n');
  console.log('📋 Ziel: Alle API- und JSON-Fehler beheben\n');
  
  let maxIterations = 50; // Safety limit
  let consecutiveClean = 0;
  
  while (maxIterations-- > 0) {
    const errors = processAllFiles();
    
    if (errors === 0) {
      consecutiveClean++;
      if (consecutiveClean >= 2) {
        console.log('\n✅✅✅ ALLE FEHLER BEHOBEN! ✅✅✅\n');
        console.log(`📊 Statistiken:`);
        console.log(`   - Iterationen: ${iteration}`);
        console.log(`   - Behobene Fehler: ${totalFixes}`);
        break;
      }
    } else {
      consecutiveClean = 0;
    }
    
    console.log(`\n⏳ Warte 1 Sekunde vor nächster Prüfung...\n`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (maxIterations <= 0) {
    console.log('\n⚠️  Maximale Iterationen erreicht. Einige Fehler könnten noch vorhanden sein.');
  }
  
  return totalErrors === 0;
}

if (require.main === module) {
  runUntilPerfect().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runUntilPerfect, findAndFixErrors };



// Umfassender Fehlerbehebungs-Engine
// Behebt systematisch alle API/JSON/HTML-Fehler in allen Dateien

const fs = require('fs');
const path = require('path');

// Alle zu prüfenden Dateien
const ALL_FILES = [
  // HTML Root
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
  // JavaScript
  'balanced-exchange-portal.js',
  'messages-portal.js',
  'ai-frontend-integration.js',
  'autofix-client.js',
  'ambient-media.js',
  'backup-restore.js',
  'router.js',
];

// Fehlerbehebungs-Regeln
const FIX_RULES = [
  {
    name: 'fetch ohne Error-Handling',
    pattern: /(const|let|var)\s+(\w+)\s*=\s*await\s+fetch\([^)]+\)/g,
    needsTryCatch: true,
    checkContext: (content, matchIndex) => {
      const before = content.substring(0, matchIndex);
      const lastTry = before.lastIndexOf('try {');
      const lastCatch = before.lastIndexOf('} catch');
      return lastTry > lastCatch && lastTry !== -1;
    }
  },
  {
    name: 'JSON.parse ohne Fehlerbehandlung',
    pattern: /JSON\.parse\([^)]+\)/g,
    wrapSafe: true,
    checkContext: (content, matchIndex) => {
      const before = content.substring(0, matchIndex);
      return before.includes('try {') && before.lastIndexOf('try {') > before.lastIndexOf('} catch');
    }
  },
  {
    name: 'response.json() ohne Fehlerbehandlung',
    pattern: /await\s+(\w+)\.json\(\)/g,
    checkOk: true,
    checkContext: (content, matchIndex, matches) => {
      const resName = matches[1];
      const before = content.substring(0, matchIndex);
      return before.includes(`if (${resName}.ok)`) || before.includes(`${resName}?.ok`);
    }
  },
  {
    name: 'undefined/null property access',
    pattern: /(\w+)\.(json|data|ok|error|message)\(?/g,
    useOptional: true
  }
];

class ErrorFixer {
  constructor() {
    this.stats = {
      filesChecked: 0,
      errorsFound: 0,
      errorsFixed: 0,
      iterations: 0
    };
  }

  readFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      console.error(`❌ Kann ${filePath} nicht lesen:`, err.message);
      return null;
    }
  }

  writeFile(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (err) {
      console.error(`❌ Kann ${filePath} nicht schreiben:`, err.message);
      return false;
    }
  }

  wrapInTryCatch(code, indent = '') {
    // Prüfe ob schon in try-catch
    if (code.includes('try {') && code.includes('} catch')) {
      return code;
    }
    
    return `${indent}try {\n${code.split('\n').map(line => indent + '  ' + line).join('\n')}\n${indent}} catch (err) {\n${indent}  console.error('Error:', err);\n${indent}  return null;\n${indent}}`;
  }

  safeJSONParse(expression) {
    return `(function() { try { return JSON.parse(${expression}); } catch(e) { console.error('JSON parse error:', e); return null; } })()`;
  }

  safeResponseJson(resName, varName, declType = 'const') {
    return `${declType} ${varName} = ${resName}.ok ? await ${resName}.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null;`;
  }

  fixFetchCalls(content) {
    let fixed = false;
    const lines = content.split('\n');
    const newLines = [];
    let inTryCatch = false;
    let tryCatchDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const indent = line.match(/^(\s*)/)?.[1] || '';
      
      // Track try-catch nesting
      if (line.includes('try {')) {
        inTryCatch = true;
        tryCatchDepth++;
      }
      if (line.includes('} catch')) {
        tryCatchDepth--;
        if (tryCatchDepth === 0) inTryCatch = false;
      }
      
      // Finde fetch calls ohne Error-Handling
      if (/^\s*(?:const|let|var)\s+\w+\s*=\s*await\s+fetch\(/.test(line) && !inTryCatch) {
        // Starte try-catch block
        newLines.push(`${indent}try {`);
        
        // Finde alle zusammengehörigen Zeilen (bis zum nächsten Statement)
        let fetchBlock = [line];
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          const nextIndent = nextLine.match(/^(\s*)/)?.[1] || '';
          
          // Stop wenn weniger eingerückt
          if (nextIndent.length <= indent.length && nextLine.trim() && !nextLine.trim().startsWith('//')) {
            break;
          }
          
          // Stop bei leerer Zeile nach fetch + response.json
          if (nextLine.trim() === '' && fetchBlock.some(l => l.includes('.json()'))) {
            break;
          }
          
          fetchBlock.push(nextLine);
          j++;
        }
        
        // Füge fetch block hinzu (mit mehr Indentation)
        fetchBlock.forEach(l => {
          newLines.push('  ' + l.replace(/^\s*/, ''));
        });
        
        // Füge catch block hinzu
        newLines.push(`${indent}} catch (err) {`);
        newLines.push(`${indent}  console.error('API error:', err);`);
        newLines.push(`${indent}  // Handle error appropriately`);
        newLines.push(`${indent}}`);
        
        i = j - 1; // Skip processed lines
        fixed = true;
      } else {
        newLines.push(line);
      }
    }

    return { content: newLines.join('\n'), fixed };
  }

  fixJSONParsing(content) {
    let fixed = false;
    
    // Finde alle JSON.parse() calls
    content = content.replace(/JSON\.parse\(([^)]+)\)/g, (match, arg, offset) => {
      // Prüfe ob schon in try-catch
      const before = content.substring(0, offset);
      const lastTry = before.lastIndexOf('try {');
      const lastCatch = before.lastIndexOf('} catch');
      
      if (lastTry > lastCatch && lastTry !== -1) {
        return match; // Schon geschützt
      }
      
      fixed = true;
      return this.safeJSONParse(arg);
    });
    
    return { content, fixed };
  }

  fixResponseJson(content) {
    let fixed = false;
    
    // Fix response.json() calls
    content = content.replace(/(const|let|var)\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\)/g, (match, decl, varName, resName, offset) => {
      // Prüfe ob schon protected
      const before = content.substring(0, offset);
      if (before.includes(`if (${resName}.ok)`) || before.includes(`${resName}?.ok`)) {
        return match;
      }
      
      fixed = true;
      return this.safeResponseJson(resName, varName, decl);
    });
    
    return { content, fixed };
  }

  fixOptionalChaining(content) {
    let fixed = false;
    
    // Konvertiere .property zu ?.property wo sinnvoll
    content = content.replace(/(\w+)\.(json|data|ok|error|message)\(?/g, (match, obj, prop, offset) => {
      // Skip wenn schon optional chaining
      if (match.includes('?.')) return match;
      
      // Skip in bestimmten Kontexten
      const before = content.substring(Math.max(0, offset - 50), offset);
      if (before.includes('if (') || before.includes('?.') || before.includes('try {')) {
        return match;
      }
      
      fixed = true;
      return `${obj}?.${prop}${match.endsWith('(') ? '(' : ''}`;
    });
    
    return { content, fixed };
  }

  fixFile(filePath) {
    const content = this.readFile(filePath);
    if (!content) return { errors: [], fixed: false };

    let newContent = content;
    let errors = [];
    let fixed = false;

    // 1. Fix fetch calls
    const fetchResult = this.fixFetchCalls(newContent);
    if (fetchResult.fixed) {
      errors.push('fetch ohne Error-Handling');
      fixed = true;
      newContent = fetchResult.content;
    }

    // 2. Fix JSON parsing
    const jsonResult = this.fixJSONParsing(newContent);
    if (jsonResult.fixed) {
      errors.push('JSON.parse ohne Fehlerbehandlung');
      fixed = true;
      newContent = jsonResult.content;
    }

    // 3. Fix response.json()
    const responseJsonResult = this.fixResponseJson(newContent);
    if (responseJsonResult.fixed) {
      errors.push('response.json() ohne Fehlerbehandlung');
      fixed = true;
      newContent = responseJsonResult.content;
    }

    // 4. Optional: Optional chaining (vorsichtiger)
    // const optionalResult = this.fixOptionalChaining(newContent);
    // if (optionalResult.fixed) {
    //   newContent = optionalResult.content;
    // }

    if (fixed) {
      this.writeFile(filePath, newContent);
      this.stats.errorsFixed++;
    }

    return { errors, fixed };
  }

  async run() {
    console.log('🚀 Starte umfassende Fehlerbehebung...\n');

    let maxIterations = 20;
    let consecutiveClean = 0;

    while (maxIterations-- > 0) {
      this.stats.iterations++;
      console.log(`\n🔄 Iteration ${this.stats.iterations}...\n`);

      let totalErrors = 0;

      for (const file of ALL_FILES) {
        if (!fs.existsSync(file)) {
          continue;
        }

        this.stats.filesChecked++;
        const result = this.fixFile(file);

        if (result.errors.length > 0) {
          totalErrors += result.errors.length;
          this.stats.errorsFound += result.errors.length;
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
          break;
        }
      } else {
        consecutiveClean = 0;
        console.log(`\n⏳ ${totalErrors} Fehler gefunden, behebe...`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n📊 Statistiken:');
    console.log(`   - Iterationen: ${this.stats.iterations}`);
    console.log(`   - Dateien geprüft: ${this.stats.filesChecked}`);
    console.log(`   - Fehler gefunden: ${this.stats.errorsFound}`);
    console.log(`   - Fehler behoben: ${this.stats.errorsFixed}`);

    return this.stats.errorsFound === 0;
  }
}

if (require.main === module) {
  const fixer = new ErrorFixer();
  fixer.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { ErrorFixer };










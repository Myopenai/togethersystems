// Komplettes Auto-Fix-System - Fixt ALLE Fehler automatisch
// Läuft in einer Schleife bis keine Fehler mehr vorhanden sind

const fs = require('fs');
const path = require('path');
const { ComprehensiveTestSystem } = require('./comprehensive-test-system');

class CompleteAutoFixSystem {
  constructor() {
    this.testSystem = new ComprehensiveTestSystem();
    this.maxIterations = 10;
    this.totalFixed = 0;
  }

  // Fixt eine Datei umfassend
  async fixFileCompletely(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixedCount = 0;
    let maxFixes = 50; // Sicherheitsgrenze
    let fixIterations = 0;

    while (fixIterations < maxFixes) {
      let iterationFixed = 0;
      fixIterations++;

      // Fix 1: Duplicate try-catch entfernen
      const duplicateTryPattern = /try\s*\{\s*try\s*\{/g;
      if (duplicateTryPattern.test(content)) {
        content = content.replace(/try\s*\{\s*try\s*\{/g, 'try {');
        iterationFixed++;
      }

      // Fix 2: JSON.parse() ohne try-catch
      const jsonPattern = /JSON\.parse\(([^)]+)\)/g;
      const jsonMatches = [];
      let match;
      let lastIndex = 0;
      
      while ((match = jsonPattern.exec(content)) !== null && lastIndex < match.index + 10000) {
        const before = content.substring(Math.max(0, match.index - 500), match.index);
        const after = content.substring(match.index + match[0].length, Math.min(content.length, match.index + match[0].length + 500));
        
        // Prüfe ob bereits geschützt
        const hasTryCatch = before.includes('try {') && after.includes('catch');
        const isInFunction = before.match(/function\s*\([^)]*\)\s*\{[^}]*$/);
        
        if (!hasTryCatch && !isInFunction) {
          jsonMatches.push({
            index: match.index,
            length: match[0].length,
            param: match[1],
          });
        }
        lastIndex = match.index;
      }
      
      // Fixe JSON.parse rückwärts
      for (let i = jsonMatches.length - 1; i >= 0; i--) {
        const m = jsonMatches[i];
        const replacement = `(function() { try { return JSON.parse(${m.param}); } catch(e) { console.error('JSON parse error:', e); return null; } })()`;
        content = content.substring(0, m.index) + replacement + content.substring(m.index + m.length);
        iterationFixed++;
      }

      // Fix 3: fetch() ohne res.ok check
      // Pattern: await fetch(...).then(res => res.json())
      const fetchPatterns = [
        /await\s+fetch\(([^)]+)\)\s*\.then\(([^)]*res[^)]*=>[^)]*res\.json\(\)[^)]*)\)/g,
        /fetch\(([^)]+)\)\s*\.then\(([^)]*res[^)]*=>[^)]*res\.json\(\)[^)]*)\)/g,
      ];

      for (const pattern of fetchPatterns) {
        content = content.replace(pattern, (match, url, thenBody) => {
          if (match.includes('res.ok') || match.includes('response.ok')) return match;
          iterationFixed++;
          return match.replace(/res\.json\(\)/, 'res.ok ? res.json().catch(e => { console.error(\'JSON parse error:\', e); return null; }) : null');
        });
      }

      // Fix 4: response.json() direkt ohne check
      content = content.replace(/(?<!res\.ok\s*\?\s*)res\.json\(\)(?![^}]*catch)/g, (match) => {
        iterationFixed++;
        return 'res.ok ? res.json().catch(e => { console.error(\'JSON parse error:\', e); return null; }) : null';
      });

      // Fix 5: Korrigiere fehlerhafte try-catch Strukturen
      // z.B. try { try { ... } catch (err) { ... } } catch { ... }
      content = content.replace(/try\s*\{\s*try\s*\{/g, 'try {');
      
      // Entferne doppelte catch-Blöcke
      const duplicateCatchPattern = /\}\s*catch\s*\([^)]+\)\s*\{[^}]*\}\s*catch\s*\([^)]+\)\s*\{/g;
      if (duplicateCatchPattern.test(content)) {
        content = content.replace(duplicateCatchPattern, (match) => {
          // Behalte nur den letzten catch
          const catches = match.match(/catch\s*\([^)]+\)\s*\{[^}]*\}/g);
          return catches && catches.length > 0 ? catches[catches.length - 1] : match;
        });
        iterationFixed++;
      }

      if (iterationFixed === 0) break;
      fixedCount += iterationFixed;
    }

    if (fixedCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
    }

    return fixedCount;
  }

  // Alle Dateien fixen
  async fixAllFiles() {
    await this.testSystem.findHTMLFiles();
    const files = this.testSystem.htmlFiles.filter(f => {
      const rel = path.relative(__dirname, f);
      return !rel.includes('Produktionsordner') && 
             !rel.includes('archive') && 
             !rel.includes('playwright-report');
    });

    console.log(`\n🔧 Fixe ${files.length} Dateien...\n`);

    for (const file of files) {
      const relPath = path.relative(__dirname, file);
      process.stdout.write(`📄 ${relPath}: `);
      
      try {
        const fixed = await this.fixFileCompletely(file);
        if (fixed > 0) {
          console.log(`✅ ${fixed} Fixes`);
          this.totalFixed += fixed;
        } else {
          console.log(`✅ OK`);
        }
      } catch (err) {
        console.log(`❌ Fehler: ${err.message}`);
      }
    }
  }

  // Vollständiger Test- und Fix-Zyklus
  async runCompleteTestAndFix() {
    console.log('🚀 Starte vollständiges Test- und Fix-System...\n');
    
    for (let iteration = 1; iteration <= this.maxIterations; iteration++) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 ITERATION ${iteration}/${this.maxIterations}`);
      console.log(`${'='.repeat(60)}\n`);

      // 1. Alle Dateien fixen
      await this.fixAllFiles();

      // 2. Tests ausführen
      console.log(`\n🧪 Führe Tests aus...\n`);
      const success = await this.testSystem.runAllTests();

      if (success) {
        console.log(`\n✅✅✅ ALLE TESTS BESTANDEN! ✅✅✅\n`);
        console.log(`📊 Gesamt: ${this.totalFixed} Fehler behoben in ${iteration} Iteration(en)\n`);
        return true;
      }

      console.log(`\n⚠️  Iteration ${iteration}: ${this.testSystem.errors.length} Dateien mit Fehlern verbleiben.\n`);
    }

    console.log(`\n⚠️  Maximal ${this.maxIterations} Iterationen erreicht.`);
    console.log(`📊 Gesamt: ${this.totalFixed} Fehler behoben.\n`);
    return false;
  }
}

// Main
if (require.main === module) {
  const fixSystem = new CompleteAutoFixSystem();
  fixSystem.runCompleteTestAndFix().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error('Fataler Fehler:', err);
    process.exit(1);
  });
}

module.exports = { CompleteAutoFixSystem };



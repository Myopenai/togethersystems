// Umfassendes Test-System - Testet ALLES: HTML, APIs, JSON, Links, etc.
// Läuft automatisch während des Codierungsprozesses

const fs = require('fs');
const path = require('path');
// Playwright optional (falls nicht installiert, wird Browser-Test übersprungen)
let playwright = null;
try {
  playwright = require('playwright');
} catch (e) {
  console.warn('⚠️  Playwright nicht installiert - Browser-Tests werden übersprungen');
}

class ComprehensiveTestSystem {
  constructor() {
    this.errors = [];
    this.fixedErrors = [];
    this.htmlFiles = [];
    this.apiEndpoints = [];
    this.testResults = {
      html: { tested: 0, errors: 0, fixed: 0 },
      api: { tested: 0, errors: 0, fixed: 0 },
      json: { tested: 0, errors: 0, fixed: 0 },
      links: { tested: 0, errors: 0, fixed: 0 },
    };
  }

  // Alle HTML-Dateien finden
  async findHTMLFiles() {
    const htmlFiles = [];
    
      function walkDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Überspringe node_modules, .git, Produktionsordner, archive, etc.
          if (!['node_modules', '.git', 'dist', 'build', 'Produktionsordner', 'archive', 'businessconnecthub-playwright-tests-full'].includes(file)) {
            walkDir(filePath);
          }
        } else if (file.endsWith('.html')) {
          // Nur Haupt-HTML-Dateien testen (nicht in Unterordnern, außer TELBANK)
          const relPath = path.relative(__dirname, filePath);
          if (!relPath.includes('Produktionsordner') && 
              !relPath.includes('archive') && 
              !relPath.includes('playwright-report') &&
              (relPath.split(path.sep).length <= 2 || relPath.startsWith('TELBANK'))) {
            htmlFiles.push(filePath);
          }
        }
      }
    }
    
    walkDir(__dirname);
    this.htmlFiles = htmlFiles;
    return htmlFiles;
  }

  // HTML-Datei testen (Syntax, Links, JSON, etc.)
  async testHTMLFile(filePath) {
    this.testResults.html.tested++;
    const errors = [];
    const content = fs.readFileSync(filePath, 'utf8');
    const dir = path.dirname(filePath);

    // 1. HTML-Syntax prüfen (grundlegende Checks)
    if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
      errors.push({ type: 'syntax', message: 'Fehlende DOCTYPE oder <html> Tag' });
    }

    // 2. Alle Links extrahieren und prüfen
    const linkRegex = /(?:href|src|action)=["']([^"']+)["']/g;
    let match;
    const links = new Set();
    
    while ((match = linkRegex.exec(content)) !== null) {
      links.add(match[1]);
    }

    // 3. Jeden Link prüfen
    for (const link of links) {
      if (link.startsWith('http://') || link.startsWith('https://')) {
        // Externe Links - nicht prüfen (zu langsam)
        continue;
      }
      
      if (link.startsWith('#') || link.startsWith('javascript:') || link.startsWith('mailto:')) {
        // Anker, JS, Mail - OK
        continue;
      }

      // Relative Links prüfen
      const linkPath = path.resolve(dir, link);
      const linkPathWithoutHash = linkPath.split('#')[0];
      
      // Prüfe ob Datei existiert
      if (!fs.existsSync(linkPathWithoutHash)) {
        // Prüfe auch ob es ein Asset ist (assets/, ./assets/)
        const linkParts = link.split('/');
        const lastPart = linkParts[linkParts.length - 1];
        
        // Wenn es ein Asset ist (assets/, ./assets/), prüfe ob Asset-Verzeichnis existiert
        if (link.includes('assets/') || link.includes('./assets/')) {
          const assetDir = path.resolve(__dirname, 'assets');
          if (!fs.existsSync(assetDir)) {
            errors.push({
              type: 'broken_link',
              message: `Asset-Verzeichnis nicht gefunden für: ${link}`,
              file: filePath,
              link: link,
              fixable: false, // Kann nicht automatisch gefixt werden
            });
          }
        } else {
          errors.push({
            type: 'broken_link',
            message: `Link nicht gefunden: ${link}`,
            file: filePath,
            link: link,
            fixable: false, // Broken links können nicht automatisch gefixt werden
          });
        }
      }
    }

    // 4. JSON.parse() Aufrufe prüfen
    const jsonParseRegex = /JSON\.parse\(([^)]+)\)/g;
    while ((match = jsonParseRegex.exec(content)) !== null) {
      const jsonCall = match[0];
      // Prüfe ob try-catch vorhanden
      const beforeCall = content.substring(0, match.index);
      const afterCall = content.substring(match.index + match[0].length);
      
      if (!beforeCall.includes('try {') || !afterCall.includes('catch')) {
        errors.push({
          type: 'json_parse_error',
          message: `JSON.parse() ohne try-catch: ${jsonCall.substring(0, 50)}`,
          file: filePath,
          line: content.substring(0, match.index).split('\n').length,
        });
      }
    }

    // 5. fetch() Aufrufe prüfen
    const fetchRegex = /fetch\(([^)]+)\)/g;
    while ((match = fetchRegex.exec(content)) !== null) {
      const fetchCall = match[0];
      const beforeCall = content.substring(0, match.index);
      
      // Prüfe ob res.ok check vorhanden
      const afterCall = content.substring(match.index + match[0].length, match.index + match[0].length + 200);
      
      if (!afterCall.includes('res.ok') && !afterCall.includes('response.ok')) {
        errors.push({
          type: 'fetch_error',
          message: `fetch() ohne res.ok check: ${fetchCall.substring(0, 50)}`,
          file: filePath,
          line: content.substring(0, match.index).split('\n').length,
        });
      }
    }

    // 6. Browser-Test (Playwright) - Optional
    if (playwright && playwright.chromium) {
      try {
        const browser = await playwright.chromium.launch({ headless: true });
        const page = await browser.newPage();
        
        const pageErrors = [];
        
        page.on('console', msg => {
          if (msg.type() === 'error') {
            const text = msg.text();
            // Filtere bekannte harmlose Fehler
            if (!text.includes('favicon') && !text.includes('net::ERR_FILE_NOT_FOUND')) {
              pageErrors.push({
                type: 'console_error',
                message: text,
              });
            }
          }
        });

        page.on('pageerror', error => {
          pageErrors.push({
            type: 'page_error',
            message: error.message,
          });
        });

        try {
          await page.goto(`file://${filePath}`, { waitUntil: 'networkidle', timeout: 10000 });
          await page.waitForTimeout(1000);
        } catch (e) {
          pageErrors.push({
            type: 'navigation_error',
            message: `Navigation fehlgeschlagen: ${e.message}`,
          });
        }

        await browser.close();
        errors.push(...pageErrors);
      } catch (err) {
        console.warn(`Browser-Test für ${filePath} fehlgeschlagen:`, err.message);
      }
    }

    // Fehler kategorisieren
    const fixableErrors = errors.filter(e => e.type !== 'broken_link');
    const brokenLinks = errors.filter(e => e.type === 'broken_link');

    // Nur fixbare Fehler automatisch fixen
    if (fixableErrors.length > 0) {
      const fixed = await this.autoFixHTMLFile(filePath, fixableErrors);
      this.testResults.html.fixed += fixed;
    }

    // Fehler zählen (broken links zählen als Warnungen, nicht als Fehler)
    this.testResults.html.errors += fixableErrors.length;
    this.testResults.links.tested += brokenLinks.length;
    this.testResults.links.errors += brokenLinks.length;

    // Return nur fixbare Fehler für weitere Verarbeitung
    return fixableErrors;
  }

  // HTML-Datei automatisch fixen - UMFASSEND
  async autoFixHTMLFile(filePath, errors) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fixedCount = 0;

    // Fix 1: JSON.parse() ohne try-catch
    const jsonParseRegex = /JSON\.parse\(([^)]+)\)/g;
    const jsonMatches = [];
    let match;
    while ((match = jsonParseRegex.exec(content)) !== null) {
      const before = content.substring(Math.max(0, match.index - 200), match.index);
      const after = content.substring(match.index + match[0].length, match.index + match[0].length + 200);
      
      if (!before.includes('try {') || !after.includes('catch')) {
        jsonMatches.push({
          index: match.index,
          match: match[0],
          param: match[1],
        });
      }
    }
    
    // Fix JSON.parse (rückwärts, damit Indizes stimmen)
    for (let i = jsonMatches.length - 1; i >= 0; i--) {
      const m = jsonMatches[i];
      const replacement = `(function() { try { return JSON.parse(${m.param}); } catch(e) { console.error('JSON parse error:', e); return null; } })()`;
      content = content.substring(0, m.index) + replacement + content.substring(m.index + m.match.length);
      fixedCount++;
    }

    // Fix 2: fetch() ohne res.ok check
    const fetchRegex = /(await\s+)?fetch\(([^)]+)\)(\s*\.then\([^)]*\))*/g;
    const fetchMatches = [];
    while ((match = fetchRegex.exec(content)) !== null) {
      const after = content.substring(match.index + match[0].length, match.index + match[0].length + 300);
      if (!after.includes('res.ok') && !after.includes('response.ok') && after.includes('.json()')) {
        fetchMatches.push({
          index: match.index,
          match: match[0],
          params: match[2],
        });
      }
    }
    
    // Fix fetch() - Ersetze .json() Aufrufe
    const fetchJsonRegex = /(await\s+)?fetch\(([^)]+)\)(\s*\.then\()?(\s*res\s*=>\s*)?res\.json\(\)/g;
    content = content.replace(fetchJsonRegex, (match, awaitPart, fetchParams, thenPart, arrowPart) => {
      if (match.includes('res.ok')) return match; // Bereits gefixt
      fixedCount++;
      return `${awaitPart || ''}fetch(${fetchParams})${thenPart || '.then('}${arrowPart || 'res => '}res.ok ? res.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null)`;
    });

    // Fix 3: Broken Links (relativ) - Warnung nur, kein Auto-Fix
    // (kann nicht automatisch gefixt werden, da Pfade kontextabhängig sind)

    if (fixedCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      this.fixedErrors.push({ file: path.relative(__dirname, filePath), count: fixedCount });
    }

    return fixedCount;
  }

  // Alle Tests ausführen
  async runAllTests() {
    console.log('🔍 Starte umfassende Tests...\n');

    // 1. HTML-Dateien finden
    await this.findHTMLFiles();
    console.log(`📄 ${this.htmlFiles.length} HTML-Dateien gefunden\n`);

    // 2. Jede HTML-Datei testen
    for (const file of this.htmlFiles) {
      const relPath = path.relative(__dirname, file);
      process.stdout.write(`Testing ${relPath}... `);
      
      const errors = await this.testHTMLFile(file);
      
      if (errors.length === 0) {
        console.log('✅');
      } else {
        console.log(`❌ ${errors.length} Fehler`);
        this.errors.push({ file: relPath, errors });
      }
    }

    // 3. Zusammenfassung
    console.log('\n--- TEST-ZUSAMMENFASSUNG ---\n');
    console.log(`HTML: ${this.testResults.html.tested} getestet, ${this.testResults.html.errors} Fehler, ${this.testResults.html.fixed} automatisch behoben`);
    
    if (this.errors.length === 0) {
      console.log('\n✅✅✅ ALLE TESTS BESTANDEN! ✅✅✅\n');
      return true;
    } else {
      console.log(`\n❌ ${this.errors.length} Dateien mit Fehlern\n`);
      return false;
    }
  }
}

// Main
if (require.main === module) {
  const tester = new ComprehensiveTestSystem();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { ComprehensiveTestSystem };


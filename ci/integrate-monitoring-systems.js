// Integrate Monitoring Systems - Integriert Console-Monitor und HTTP Resource Monitor in HTML-Dateien
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MonitoringIntegrator {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.excludeDirs = ['node_modules', '.git', 'backup', 'Fixpatch', '.wrangler', 'artifacts', 'builds', 'test-results', 'playwright-report'];
    this.stats = {
      processed: 0,
      consoleMonitorAdded: 0,
      httpMonitorAdded: 0,
      alreadyHasConsole: 0,
      alreadyHasHttp: 0,
      errors: 0
    };
  }

  integrate() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  INTEGRATE MONITORING SYSTEMS');
    console.log('  BRANDING: .T. TogetherSystems - ModularFlux Architecture');
    console.log('  VERSION: 3.0.0');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    const htmlFiles = this.findHtmlFiles();
    console.log(`📊 Gefundene HTML-Dateien: ${htmlFiles.length}`);
    console.log('');

    htmlFiles.forEach(file => {
      this.processFile(file);
    });

    this.generateReport();
  }

  findHtmlFiles() {
    const htmlFiles = [];
    
    const scanDir = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (!this.excludeDirs.some(ex => entry.name.includes(ex))) {
              scanDir(fullPath);
            }
          } else if (entry.isFile() && entry.name.endsWith('.html')) {
            htmlFiles.push(fullPath);
          }
        }
      } catch (e) {
        // Ignore errors
      }
    };

    scanDir(this.rootDir);
    return htmlFiles;
  }

  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Prüfe und füge Console-Monitor hinzu
      if (!content.includes('console-monitor.js') && !content.includes('console-monitor')) {
        // Finde </head> oder <body>
        const headEnd = content.indexOf('</head>');
        const bodyStart = content.indexOf('<body');
        
        if (headEnd !== -1) {
          const relativePath = this.getRelativePath(filePath, 'console-monitor.js');
          const scriptTag = `  <script src="${relativePath}"></script>\n`;
          content = content.slice(0, headEnd) + scriptTag + content.slice(headEnd);
          modified = true;
          this.stats.consoleMonitorAdded++;
        } else if (bodyStart !== -1) {
          const relativePath = this.getRelativePath(filePath, 'console-monitor.js');
          const scriptTag = `  <script src="${relativePath}"></script>\n`;
          content = content.slice(0, bodyStart) + scriptTag + content.slice(bodyStart);
          modified = true;
          this.stats.consoleMonitorAdded++;
        }
      } else {
        this.stats.alreadyHasConsole++;
      }

      // Prüfe und füge HTTP Resource Monitor hinzu
      if (!content.includes('http-resource-monitor') && !content.includes('HTTP-Resource-Monitor')) {
        // Finde </head> oder <body>
        const headEnd = content.indexOf('</head>');
        const bodyStart = content.indexOf('<body');
        
        if (headEnd !== -1) {
          const relativePath = this.getRelativePath(filePath, 'http-resource-monitor-browser.js');
          const scriptTag = `  <script src="${relativePath}"></script>\n`;
          content = content.slice(0, headEnd) + scriptTag + content.slice(headEnd);
          modified = true;
          this.stats.httpMonitorAdded++;
        } else if (bodyStart !== -1) {
          const relativePath = this.getRelativePath(filePath, 'http-resource-monitor-browser.js');
          const scriptTag = `  <script src="${relativePath}"></script>\n`;
          content = content.slice(0, bodyStart) + scriptTag + content.slice(bodyStart);
          modified = true;
          this.stats.httpMonitorAdded++;
        }
      } else {
        this.stats.alreadyHasHttp++;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.stats.processed++;
      }
    } catch (e) {
      console.error(`Fehler bei ${filePath}:`, e.message);
      this.stats.errors++;
    }
  }

  getRelativePath(fromFile, toFile) {
    const fromDir = path.dirname(fromFile);
    const toPath = path.join(this.rootDir, toFile);
    const relative = path.relative(fromDir, toPath).replace(/\\/g, '/');
    return relative.startsWith('.') ? relative : './' + relative;
  }

  generateReport() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  INTEGRATION REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`✅ Console-Monitor hinzugefügt: ${this.stats.consoleMonitorAdded}`);
    console.log(`✅ HTTP Resource Monitor hinzugefügt: ${this.stats.httpMonitorAdded}`);
    console.log(`ℹ️ Bereits vorhanden (Console): ${this.stats.alreadyHasConsole}`);
    console.log(`ℹ️ Bereits vorhanden (HTTP): ${this.stats.alreadyHasHttp}`);
    console.log(`📄 Dateien verarbeitet: ${this.stats.processed}`);
    if (this.stats.errors > 0) {
      console.log(`❌ Fehler: ${this.stats.errors}`);
    }
    console.log('');
    console.log('✅ Integration abgeschlossen!');
    console.log('');
  }
}

// Ausführung
const integrator = new MonitoringIntegrator();
integrator.integrate();


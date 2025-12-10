// System Verification - Verifiziert alle permanenten Routinen
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SystemVerifier {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.results = {
      consoleMonitoring: { status: 'unknown', details: [] },
      httpResourceMonitor: { status: 'unknown', details: [] },
      industrialFabrication: { status: 'unknown', details: [] }
    };
  }

  verify() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  SYSTEM VERIFICATION - PERMANENT ROUTINES');
    console.log('  BRANDING: .T. TogetherSystems - ModularFlux Architecture');
    console.log('  VERSION: 3.0.0');
    console.log('  STANDARD: IBM STANDARD - PERMANENT AKTIV');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    // 1. Console-Monitoring-System verifizieren
    this.verifyConsoleMonitoring();

    // 2. HTTP Resource Monitor verifizieren
    this.verifyHttpResourceMonitor();

    // 3. Industrial Fabrication Routine verifizieren
    this.verifyIndustrialFabrication();

    // Report generieren
    this.generateReport();
  }

  verifyConsoleMonitoring() {
    console.log('🔍 Verifiziere Console-Monitoring-System...');
    
    const configPath = path.join(this.rootDir, 'settings', 'CONSOLE-MONITORING-SYSTEM.json');
    const scriptPath = path.join(this.rootDir, 'console-monitor.js');

    // Prüfe Config
    if (fs.existsSync(configPath)) {
      try {
        let content = fs.readFileSync(configPath, 'utf8');
        // Entferne BOM falls vorhanden
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1);
        }
        // Entferne andere unsichtbare Zeichen am Anfang
        content = content.trim();
        const config = JSON.parse(content);
        if (config.enabled === true) {
          this.results.consoleMonitoring.details.push('✅ Config-Datei existiert und ist aktiviert');
        } else {
          this.results.consoleMonitoring.details.push('⚠️ Config-Datei existiert, aber enabled=false');
        }
      } catch (e) {
        this.results.consoleMonitoring.details.push('❌ Config-Datei kann nicht gelesen werden: ' + e.message);
      }
    } else {
      this.results.consoleMonitoring.details.push('❌ Config-Datei nicht gefunden: ' + configPath);
    }

    // Prüfe Script
    if (fs.existsSync(scriptPath)) {
      const content = fs.readFileSync(scriptPath, 'utf8');
      if (content.includes('CONSOLE-MONITOR') && content.includes('System aktiviert')) {
        this.results.consoleMonitoring.details.push('✅ console-monitor.js existiert und ist implementiert');
      } else {
        this.results.consoleMonitoring.details.push('⚠️ console-monitor.js existiert, aber Implementierung unvollständig');
      }
    } else {
      this.results.consoleMonitoring.details.push('❌ console-monitor.js nicht gefunden: ' + scriptPath);
    }

    // Prüfe Integration in HTML-Dateien
    const htmlFiles = this.findHtmlFiles();
    let integratedCount = 0;
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('console-monitor.js') || content.includes('console-monitor')) {
        integratedCount++;
      }
    });

    if (integratedCount > 0) {
      this.results.consoleMonitoring.details.push(`✅ In ${integratedCount} HTML-Dateien integriert`);
    } else {
      this.results.consoleMonitoring.details.push('⚠️ Nicht in HTML-Dateien integriert');
    }

    // Status bestimmen
    const hasErrors = this.results.consoleMonitoring.details.some(d => d.startsWith('❌'));
    const hasWarnings = this.results.consoleMonitoring.details.some(d => d.startsWith('⚠️'));
    
    if (hasErrors) {
      this.results.consoleMonitoring.status = 'error';
    } else if (hasWarnings) {
      this.results.consoleMonitoring.status = 'warning';
    } else {
      this.results.consoleMonitoring.status = 'ok';
    }

    console.log(`  Status: ${this.results.consoleMonitoring.status.toUpperCase()}`);
    console.log('');
  }

  verifyHttpResourceMonitor() {
    console.log('🔍 Verifiziere HTTP Resource Monitor...');
    
    const configPath = path.join(this.rootDir, 'settings', 'HTTP-RESOURCE-MONITOR-ROUTINE.json');
    const scriptPath = path.join(this.rootDir, 'http-resource-monitor-browser.js');
    const errorStorePath = path.join(this.rootDir, 'settings', '404-errors.json');

    // Prüfe Config
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.status === 'PERMANENT-ACTIVE' && config.mandatory === true) {
          this.results.httpResourceMonitor.details.push('✅ Config-Datei existiert und ist PERMANENT-ACTIVE');
        } else {
          this.results.httpResourceMonitor.details.push('⚠️ Config-Datei existiert, aber Status nicht PERMANENT-ACTIVE');
        }
      } catch (e) {
        this.results.httpResourceMonitor.details.push('❌ Config-Datei kann nicht gelesen werden: ' + e.message);
      }
    } else {
      this.results.httpResourceMonitor.details.push('❌ Config-Datei nicht gefunden: ' + configPath);
    }

    // Prüfe Script
    if (fs.existsSync(scriptPath)) {
      const content = fs.readFileSync(scriptPath, 'utf8');
      if (content.includes('HTTP RESOURCE MONITOR') && content.includes('PERMANENT-ACTIVE')) {
        this.results.httpResourceMonitor.details.push('✅ http-resource-monitor-browser.js existiert und ist implementiert');
      } else {
        this.results.httpResourceMonitor.details.push('⚠️ http-resource-monitor-browser.js existiert, aber Implementierung unvollständig');
      }
    } else {
      this.results.httpResourceMonitor.details.push('❌ http-resource-monitor-browser.js nicht gefunden: ' + scriptPath);
    }

    // Prüfe Error-Store
    if (fs.existsSync(errorStorePath)) {
      this.results.httpResourceMonitor.details.push('✅ Error-Store existiert: ' + errorStorePath);
    } else {
      this.results.httpResourceMonitor.details.push('ℹ️ Error-Store wird beim ersten Fehler erstellt');
    }

    // Prüfe Integration in HTML-Dateien
    const htmlFiles = this.findHtmlFiles();
    let integratedCount = 0;
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('http-resource-monitor') || content.includes('HTTP-Resource-Monitor')) {
        integratedCount++;
      }
    });

    if (integratedCount > 0) {
      this.results.httpResourceMonitor.details.push(`✅ In ${integratedCount} HTML-Dateien integriert`);
    } else {
      this.results.httpResourceMonitor.details.push('⚠️ Nicht in HTML-Dateien integriert');
    }

    // Status bestimmen
    const hasErrors = this.results.httpResourceMonitor.details.some(d => d.startsWith('❌'));
    const hasWarnings = this.results.httpResourceMonitor.details.some(d => d.startsWith('⚠️'));
    
    if (hasErrors) {
      this.results.httpResourceMonitor.status = 'error';
    } else if (hasWarnings) {
      this.results.httpResourceMonitor.status = 'warning';
    } else {
      this.results.httpResourceMonitor.status = 'ok';
    }

    console.log(`  Status: ${this.results.httpResourceMonitor.status.toUpperCase()}`);
    console.log('');
  }

  verifyIndustrialFabrication() {
    console.log('🔍 Verifiziere Industrial Fabrication Routine...');
    
    const configPath = path.join(this.rootDir, 'settings', 'INDUSTRIAL-FABRICATION-ROUTINE.json');
    const errorPatternsPath = path.join(this.rootDir, 'settings', 'error-patterns.json');

    // Prüfe Config
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.status === 'PERMANENT-ACTIVE' && config.mandatory === true && config.hardCoded === true) {
          this.results.industrialFabrication.details.push('✅ Config-Datei existiert und ist PERMANENT-ACTIVE');
          
          // Prüfe Workflow
          if (config.workflow && config.workflow.pre && config.workflow.during && config.workflow.post) {
            this.results.industrialFabrication.details.push(`✅ Workflow definiert (pre: ${config.workflow.pre.length}, during: ${config.workflow.during.length}, post: ${config.workflow.post.length} Schritte)`);
          } else {
            this.results.industrialFabrication.details.push('⚠️ Workflow unvollständig definiert');
          }

          // Prüfe Error-Prevention
          if (config.errorPrevention && config.errorPrevention.patternStorePath) {
            this.results.industrialFabrication.details.push('✅ Error-Prevention konfiguriert');
          } else {
            this.results.industrialFabrication.details.push('⚠️ Error-Prevention nicht vollständig konfiguriert');
          }

          // Prüfe Console-Heart
          if (config.consoleHeart && config.consoleHeart.enabled === true) {
            this.results.industrialFabrication.details.push('✅ Console-Heart aktiviert');
          } else {
            this.results.industrialFabrication.details.push('⚠️ Console-Heart nicht aktiviert');
          }

          // Prüfe Constraints
          if (config.constraints && config.constraints.forbidGuardDeactivation === true) {
            this.results.industrialFabrication.details.push('✅ Guard-Deaktivierung verboten');
          } else {
            this.results.industrialFabrication.details.push('⚠️ Guard-Deaktivierung nicht verboten');
          }
        } else {
          this.results.industrialFabrication.details.push('❌ Config-Datei existiert, aber Status nicht PERMANENT-ACTIVE');
        }
      } catch (e) {
        this.results.industrialFabrication.details.push('❌ Config-Datei kann nicht gelesen werden: ' + e.message);
      }
    } else {
      this.results.industrialFabrication.details.push('❌ Config-Datei nicht gefunden: ' + configPath);
    }

    // Prüfe Error-Patterns
    if (fs.existsSync(errorPatternsPath)) {
      try {
        const patterns = JSON.parse(fs.readFileSync(errorPatternsPath, 'utf8'));
        if (patterns.patterns && patterns.patterns.length > 0) {
          this.results.industrialFabrication.details.push(`✅ Error-Patterns geladen (${patterns.patterns.length} Patterns)`);
        } else {
          this.results.industrialFabrication.details.push('⚠️ Error-Patterns-Datei existiert, aber keine Patterns definiert');
        }
      } catch (e) {
        this.results.industrialFabrication.details.push('❌ Error-Patterns-Datei kann nicht gelesen werden: ' + e.message);
      }
    } else {
      this.results.industrialFabrication.details.push('❌ Error-Patterns-Datei nicht gefunden: ' + errorPatternsPath);
    }

    // Status bestimmen
    const hasErrors = this.results.industrialFabrication.details.some(d => d.startsWith('❌'));
    const hasWarnings = this.results.industrialFabrication.details.some(d => d.startsWith('⚠️'));
    
    if (hasErrors) {
      this.results.industrialFabrication.status = 'error';
    } else if (hasWarnings) {
      this.results.industrialFabrication.status = 'warning';
    } else {
      this.results.industrialFabrication.status = 'ok';
    }

    console.log(`  Status: ${this.results.industrialFabrication.status.toUpperCase()}`);
    console.log('');
  }

  findHtmlFiles() {
    const htmlFiles = [];
    const excludeDirs = ['node_modules', '.git', 'backup', 'Fixpatch', '.wrangler', 'artifacts', 'builds', 'test-results', 'playwright-report'];
    
    const scanDir = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (!excludeDirs.some(ex => entry.name.includes(ex))) {
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
    return htmlFiles.slice(0, 10); // Nur erste 10 für Performance
  }

  generateReport() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  VERIFICATION REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    // Console-Monitoring
    console.log('1. CONSOLE-MONITORING-SYSTEM:');
    this.results.consoleMonitoring.details.forEach(d => console.log('   ' + d));
    console.log('');

    // HTTP Resource Monitor
    console.log('2. HTTP-RESOURCE-MONITOR-ROUTINE:');
    this.results.httpResourceMonitor.details.forEach(d => console.log('   ' + d));
    console.log('');

    // Industrial Fabrication
    console.log('3. INDUSTRIAL-FABRICATION-ROUTINE:');
    this.results.industrialFabrication.details.forEach(d => console.log('   ' + d));
    console.log('');

    // Zusammenfassung
    const allOk = Object.values(this.results).every(r => r.status === 'ok');
    const hasErrors = Object.values(this.results).some(r => r.status === 'error');
    const hasWarnings = Object.values(this.results).some(r => r.status === 'warning');

    console.log('═══════════════════════════════════════════════════════════');
    if (allOk) {
      console.log('  ✅ ALLE SYSTEME VERIFIZIERT - ALLE AKTIV');
    } else if (hasErrors) {
      console.log('  ❌ FEHLER GEFUNDEN - SYSTEME MÜSSEN REPARIERT WERDEN');
    } else if (hasWarnings) {
      console.log('  ⚠️ WARNUNGEN GEFUNDEN - SYSTEME FUNKTIONIEREN, ABER OPTIMIERUNGEN MÖGLICH');
    }
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    // Speichere Report
    const reportPath = path.join(this.rootDir, 'SYSTEM-VERIFICATION-REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      branding: '.T. TogetherSystems - ModularFlux Architecture',
      standard: 'IBM STANDARD - PERMANENT AKTIV',
      results: this.results
    }, null, 2), 'utf8');

    console.log('📄 Report gespeichert: ' + reportPath);
    console.log('');
  }
}

// Ausführung
const verifier = new SystemVerifier();
verifier.verify();


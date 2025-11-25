// AUTOMATISCHE KONTROLLE BEI JEDER CODE-ÄNDERUNG
// Läuft bei: Code-Generierung, Datei-Speicherung, Git Commit, Build

const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

class AutoControlOnChange {
  constructor() {
    this.running = false;
    this.queue = [];
  }

  async runAutoControl() {
    if (this.running) {
      console.log('⏳ Kontrolle läuft bereits, warte...');
      return;
    }

    this.running = true;
    console.log('\n🔍 Automatische Code-Kontrolle startet...\n');

    try {
      // 1. Automatische Fixes
      console.log('📝 Schritt 1: Automatische Fixes...');
      execSync('node fix-all-api-errors.js', { stdio: 'pipe', timeout: 60000 });
      execSync('node fix-response-json-errors.js', { stdio: 'pipe', timeout: 30000 });
      execSync('node fix-all-response-json-explicit.js', { stdio: 'pipe', timeout: 30000 });

      // 2. Code-Tests
      console.log('🧪 Schritt 2: Code-Tests...');
      execSync('node simple-error-checker.js', { stdio: 'pipe', timeout: 30000 });

      // 3. Status speichern
      const status = {
        timestamp: new Date().toISOString(),
        status: 'AUTO_CONTROL_COMPLETE',
        message: 'Automatische Kontrolle abgeschlossen'
      };
      fs.writeFileSync('AUTO-CONTROL-STATUS.json', JSON.stringify(status, null, 2));
      fs.appendFileSync('AUTO-CONTROL-LOG.txt', `[${new Date().toISOString()}] AUTO CONTROL: Complete\n`);

      console.log('✅ Automatische Kontrolle abgeschlossen\n');
    } catch (err) {
      console.log(`⚠️  Fehler bei automatischer Kontrolle: ${err.message}\n`);
      const status = {
        timestamp: new Date().toISOString(),
        status: 'AUTO_CONTROL_ERROR',
        error: err.message
      };
      fs.writeFileSync('AUTO-CONTROL-STATUS.json', JSON.stringify(status, null, 2));
    }

    this.running = false;
  }

  // Wird aufgerufen bei Datei-Änderung
  onFileChange(filePath) {
    console.log(`📝 Änderung erkannt: ${filePath}`);
    this.runAutoControl();
  }

  // Setup File Watcher
  setupFileWatcher() {
    console.log('👁️  Setup File Watcher für automatische Kontrolle...\n');

    const watchPatterns = ['*.html', '*.js'];
    const files = [];

    // Finde alle relevanten Dateien
    function findFiles(dir) {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.name.startsWith('.') || item.name === 'node_modules') continue;
        
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          findFiles(fullPath);
        } else if (item.isFile() && (item.name.endsWith('.html') || item.name.endsWith('.js'))) {
          files.push(fullPath);
          fs.watchFile(fullPath, { interval: 1000 }, (curr, prev) => {
            if (curr.mtime !== prev.mtime) {
              this.onFileChange(fullPath);
            }
          });
        }
      }
    }

    findFiles('.');
    console.log(`✅ Überwache ${files.length} Dateien\n`);
  }

  // Setup Git Hooks
  setupGitHooks() {
    const hooksDir = '.git/hooks';
    if (!fs.existsSync(hooksDir)) {
      console.log('⚠️  Git-Verzeichnis nicht gefunden\n');
      return;
    }

    // Pre-Commit Hook
    const preCommitHook = `${hooksDir}/pre-commit`;
    const hookContent = `#!/bin/sh
# Automatische Code-Kontrolle vor Commit
node auto-control-on-every-change.js
`;

    fs.writeFileSync(preCommitHook, hookContent);
    try {
      fs.chmodSync(preCommitHook, '755');
    } catch (e) {
      // Windows - ignore
    }

    console.log('✅ Git Pre-Commit Hook installiert\n');
  }
}

// Export für Module
if (require.main === module) {
  const controller = new AutoControlOnChange();
  
  // Führe sofort aus
  controller.runAutoControl().then(() => {
    // Setup File Watcher
    controller.setupFileWatcher();
    
    // Setup Git Hooks
    controller.setupGitHooks();
    
    console.log('✅ Automatisches Kontroll-System aktiv\n');
  });
}

module.exports = { AutoControlOnChange };



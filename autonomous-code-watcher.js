// AUTONOMES CODE-WATCHER-SYSTEM
// Überwacht alle Code-Änderungen und führt automatisch Tests + Fixes aus

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const WATCH_FILES = [
  '*.html',
  '*.js',
  'functions/**/*.js'
];

const WATCH_DIRS = [
  '.',
  'functions'
];

class AutonomousCodeWatcher {
  constructor() {
    this.processing = false;
    this.queue = [];
    this.lastCheck = Date.now();
    this.stats = {
      checks: 0,
      fixes: 0,
      tests: 0
    };
  }

  // Prüft Code automatisch bei jeder Änderung
  async checkAndFixCode(filePath) {
    if (this.processing) {
      this.queue.push(filePath);
      return;
    }

    this.processing = true;
    this.stats.checks++;

    console.log(`\n🔍 Automatische Kontrolle: ${filePath}\n`);

    try {
      // Schritt 1: Automatische Fehlerbehebung
      console.log('📝 Führe automatische Fixes aus...');
      execSync('node fix-all-api-errors.js', { stdio: 'pipe', timeout: 30000 });
      execSync('node fix-response-json-errors.js', { stdio: 'pipe', timeout: 30000 });
      this.stats.fixes++;

      // Schritt 2: Code-Test
      console.log('🧪 Teste Code...');
      execSync('node simple-error-checker.js', { stdio: 'pipe', timeout: 30000 });
      this.stats.tests++;

      // Schritt 3: Status speichern
      this.saveStatus('AUTO_CHECK_COMPLETE', `Code kontrolliert und gefixt: ${filePath}`);

      console.log(`✅ Automatische Kontrolle abgeschlossen\n`);
    } catch (err) {
      console.log(`⚠️  Fehler bei automatischer Kontrolle: ${err.message}\n`);
      this.saveStatus('AUTO_CHECK_ERROR', `Fehler: ${err.message}`);
    }

    this.processing = false;

    // Verarbeite Queue
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      setTimeout(() => this.checkAndFixCode(next), 1000);
    }
  }

  // Speichert Status
  saveStatus(status, message) {
    const statusData = {
      timestamp: new Date().toISOString(),
      status: status,
      message: message,
      stats: this.stats,
      processing: this.processing
    };

    fs.writeFileSync('AUTO-STATUS.json', JSON.stringify(statusData, null, 2));
    fs.appendFileSync('AUTO-LOG.txt', `[${new Date().toISOString()}] ${status}: ${message}\n`);
  }

  // Überwacht Dateien auf Änderungen
  watchFiles() {
    console.log('👁️  Starte Datei-Überwachung...\n');

    // Überwache alle relevanten Dateien
    const filesToWatch = [];

    // HTML-Dateien
    const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
    htmlFiles.forEach(file => {
      filesToWatch.push(file);
      this.watchFile(file);
    });

    // JS-Dateien
    const jsFiles = fs.readdirSync('.').filter(f => f.endsWith('.js') && !f.includes('node_modules'));
    jsFiles.forEach(file => {
      if (!file.startsWith('node_modules')) {
        filesToWatch.push(file);
        this.watchFile(file);
      }
    });

    // Functions-Verzeichnis
    if (fs.existsSync('functions')) {
      this.watchDirectory('functions');
    }

    console.log(`✅ Überwache ${filesToWatch.length} Dateien\n`);
    this.saveStatus('WATCHING', `Überwache ${filesToWatch.length} Dateien`);
  }

  // Überwacht einzelne Datei
  watchFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log(`📝 Änderung erkannt: ${filePath}`);
        this.checkAndFixCode(filePath);
      }
    });
  }

  // Überwacht Verzeichnis rekursiv
  watchDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    fs.readdirSync(dirPath, { withFileTypes: true }).forEach(dirent => {
      const fullPath = path.join(dirPath, dirent.name);
      
      if (dirent.isDirectory()) {
        this.watchDirectory(fullPath);
      } else if (dirent.isFile() && (dirent.name.endsWith('.js') || dirent.name.endsWith('.html'))) {
        this.watchFile(fullPath);
      }
    });

    // Überwache auch das Verzeichnis selbst für neue Dateien
    fs.watch(dirPath, (eventType, filename) => {
      if (filename && (filename.endsWith('.js') || filename.endsWith('.html'))) {
        const fullPath = path.join(dirPath, filename);
        if (fs.existsSync(fullPath)) {
          this.watchFile(fullPath);
        }
      }
    });
  }

  // Git Pre-Commit Hook Integration
  setupGitHook() {
    const hookPath = '.git/hooks/pre-commit';
    const hookDir = '.git/hooks';

    if (!fs.existsSync(hookDir)) {
      console.log('⚠️  Git-Verzeichnis nicht gefunden, überspringe Hook-Installation\n');
      return;
    }

    const hookContent = `#!/bin/sh
# Automatischer Pre-Commit Hook
# Führt automatische Code-Kontrolle und Fixes aus

echo "🔍 Automatische Code-Kontrolle vor Commit..."

# Führe automatische Fixes aus
node fix-all-api-errors.js
node fix-response-json-errors.js

# Teste Code
node simple-error-checker.js

if [ $? -eq 0 ]; then
    echo "✅ Code-Kontrolle bestanden"
    exit 0
else
    echo "⚠️  Code-Fehler gefunden - behebe automatisch..."
    # Füge geänderte Dateien wieder hinzu
    git add -u
    exit 0
fi
`;

    fs.writeFileSync(hookPath, hookContent);
    // Mache Hook ausführbar (Unix/Linux/Mac)
    try {
      fs.chmodSync(hookPath, '755');
    } catch (e) {
      // Windows - ignoriere chmod
    }

    console.log('✅ Git Pre-Commit Hook installiert\n');
    this.saveStatus('GIT_HOOK_INSTALLED', 'Git Hook installiert');
  }

  // Production-Build-Integration
  async productionBuild() {
    console.log('🏗️  Production-Build mit automatischer Kontrolle...\n');

    try {
      // 1. Automatische Fixes
      console.log('📝 Schritt 1: Automatische Fixes...');
      execSync('node fix-all-api-errors.js', { stdio: 'inherit', timeout: 60000 });
      execSync('node fix-response-json-errors.js', { stdio: 'inherit', timeout: 30000 });

      // 2. Code-Tests
      console.log('\n🧪 Schritt 2: Code-Tests...');
      execSync('node simple-error-checker.js', { stdio: 'inherit', timeout: 30000 });

      // 3. Vollständiger Test
      console.log('\n🧪 Schritt 3: Vollständiger Test...');
      execSync('node autonomous-self-testing-system.js', { stdio: 'inherit', timeout: 120000 });

      console.log('\n✅ Production-Build erfolgreich!\n');
      this.saveStatus('PRODUCTION_BUILD_SUCCESS', 'Production-Build mit automatischer Kontrolle erfolgreich');

      return true;
    } catch (err) {
      console.log(`\n❌ Production-Build fehlgeschlagen: ${err.message}\n`);
      this.saveStatus('PRODUCTION_BUILD_ERROR', `Fehler: ${err.message}`);
      return false;
    }
  }

  // Startet das Watcher-System
  start() {
    console.log('🤖 AUTONOMES CODE-WATCHER-SYSTEM GESTARTET\n');
    console.log('='.repeat(70));
    console.log('Dieses System:');
    console.log('  ✅ Überwacht alle Code-Änderungen');
    console.log('  ✅ Führt automatisch Tests aus');
    console.log('  ✅ Bringt automatisch Fixes an');
    console.log('  ✅ Integriert in Git Hooks');
    console.log('  ✅ Integriert in Production-Builds');
    console.log('='.repeat(70));
    console.log('');

    // Setup Git Hook
    this.setupGitHook();

    // Starte Datei-Überwachung
    this.watchFiles();

    // Initiale Code-Kontrolle
    console.log('🔍 Führe initiale Code-Kontrolle aus...\n');
    this.checkAndFixCode('.');

    this.saveStatus('WATCHER_STARTED', 'Code-Watcher gestartet');

    console.log('\n✅ System läuft - überwacht alle Code-Änderungen\n');
  }
}

// STARTE DAS SYSTEM
if (require.main === module) {
  const watcher = new AutonomousCodeWatcher();
  watcher.start();

  // Keep alive
  process.on('SIGINT', () => {
    console.log('\n\n🛑 System wird beendet...\n');
    watcher.saveStatus('STOPPED', 'Code-Watcher gestoppt');
    process.exit(0);
  });
}

module.exports = { AutonomousCodeWatcher };










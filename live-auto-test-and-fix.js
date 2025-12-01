// Live Auto-Test & Fix System
// Überwacht Code-Änderungen und testet/fixt automatisch

const fs = require('fs');
const path = require('path');
const { ComprehensiveTestSystem } = require('./comprehensive-test-system');

class LiveAutoTestAndFix {
  constructor() {
    this.watchedFiles = new Set();
    this.isRunning = false;
    this.testSystem = new ComprehensiveTestSystem();
    this.interval = null;
  }

  // Datei-Änderungen überwachen
  watchFiles() {
    const watchDir = __dirname;
    
    fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      
      // Nur relevante Dateien
      if (filename.endsWith('.html') || filename.endsWith('.js') || filename.endsWith('.json')) {
        const filePath = path.join(watchDir, filename);
        this.watchedFiles.add(filePath);
        
        // Kurze Verzögerung, um sicherzustellen dass Datei geschrieben ist
        setTimeout(() => {
          this.handleFileChange(filePath);
        }, 500);
      }
    });

    console.log('👁️  Überwache Datei-Änderungen...');
  }

  // Datei-Änderung behandeln
  async handleFileChange(filePath) {
    if (this.isRunning) {
      // Test läuft bereits - später erneut versuchen
      return;
    }

    this.isRunning = true;
    const relPath = path.relative(__dirname, filePath);
    console.log(`\n📝 Datei geändert: ${relPath}`);
    
    try {
      // Prüfe Dateityp
      if (filePath.endsWith('.html')) {
        await this.testSystem.testHTMLFile(filePath);
      } else if (filePath.endsWith('.js')) {
        await this.testJSFile(filePath);
      } else if (filePath.endsWith('.json')) {
        await this.testJSONFile(filePath);
      }

      // Vollständiger Test alle 5 Datei-Änderungen
      if (this.watchedFiles.size % 5 === 0) {
        console.log('\n🔄 Führe vollständigen Test-Durchlauf aus...');
        await this.testSystem.runAllTests();
      }
    } catch (err) {
      console.error(`❌ Fehler beim Testen von ${relPath}:`, err);
    } finally {
      this.isRunning = false;
    }
  }

  // JS-Datei testen
  async testJSFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Syntax-Check (versuche zu parsen)
    try {
      // Vereinfachter Check
      if (content.includes('JSON.parse') && !content.includes('try {') && !content.includes('catch')) {
        errors.push({ type: 'json_parse_error', message: 'JSON.parse() ohne try-catch' });
      }
    } catch (err) {
      errors.push({ type: 'syntax_error', message: err.message });
    }

    // Auto-Fix
    if (errors.length > 0) {
      await this.testSystem.autoFixHTMLFile(filePath, errors); // Reuse fix logic
    }
  }

  // JSON-Datei testen
  async testJSONFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      console.log(`✅ ${path.basename(filePath)}: Valide JSON`);
    } catch (err) {
      console.error(`❌ ${path.basename(filePath)}: Ungültige JSON - ${err.message}`);
    }
  }

  // Periodischer vollständiger Test
  startPeriodicTests(intervalMs = 30000) {
    this.interval = setInterval(async () => {
      if (!this.isRunning) {
        console.log('\n⏰ Periodischer Test-Durchlauf...');
        await this.testSystem.runAllTests();
      }
    }, intervalMs);
  }

  // Starten
  start() {
    console.log('🚀 Live Auto-Test & Fix System gestartet\n');
    
    // Dateien überwachen
    this.watchFiles();
    
    // Periodische Tests (alle 30 Sekunden)
    this.startPeriodicTests(30000);
    
    // Initialer Test
    this.testSystem.runAllTests();
  }

  // Stoppen
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    console.log('🛑 Live Auto-Test & Fix System gestoppt');
  }
}

// Main
if (require.main === module) {
  const liveSystem = new LiveAutoTestAndFix();
  liveSystem.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    liveSystem.stop();
    process.exit(0);
  });
}

module.exports = { LiveAutoTestAndFix };










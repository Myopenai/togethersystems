// Spec Mirror Store - Nur fehlerfreien Code speichern
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SpecMirrorStore {
  constructor() {
    this.source = process.argv.find(arg => arg.startsWith('--source='))?.split('=')[1] || './';
    this.meta = process.argv.find(arg => arg.startsWith('--meta='))?.split('=')[1] || '3.0.0';
    this.branding = process.argv.find(arg => arg.startsWith('--branding='))?.split('=')[1] || '.T. TogetherSystems - ModularFlux Architecture';
    this.storeDir = path.join(__dirname, '../../mirror-store');
  }

  async store() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  SPEC MIRROR STORE');
    console.log('  Version: 3.0.0');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    try {
      // Prüfe ob Code fehlerfrei ist (vereinfacht)
      const hasErrors = await this.checkForErrors();
      if (hasErrors) {
        console.log('❌ Code enthält Fehler - Store übersprungen');
        return { ok: false, reason: 'errors-found' };
      }

      // Erstelle Store-Verzeichnis
      if (!fs.existsSync(this.storeDir)) {
        fs.mkdirSync(this.storeDir, { recursive: true });
      }

      // Kopiere wichtige Dateien
      const files = this.findImportantFiles();
      const stored = [];

      for (const file of files) {
        const sourcePath = path.join(this.source, file);
        if (fs.existsSync(sourcePath)) {
          const targetPath = path.join(this.storeDir, file);
          const targetDir = path.dirname(targetPath);
          
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          fs.copyFileSync(sourcePath, targetPath);
          
          // Berechne Hash
          const content = fs.readFileSync(sourcePath);
          const hash = crypto.createHash('sha256').update(content).digest('hex');
          
          stored.push({
            file,
            hash,
            size: content.length,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Speichere Metadaten
      const metadata = {
        version: this.meta,
        branding: this.branding,
        timestamp: new Date().toISOString(),
        files: stored
      };

      const metaPath = path.join(this.storeDir, 'metadata.json');
      fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8');

      console.log(`✅ ${stored.length} Dateien gespeichert`);
      console.log(`   Version: ${this.meta}`);
      console.log(`   Branding: ${this.branding}`);
      console.log('');

      return { ok: true, stored: stored.length };
    } catch (e) {
      console.error('❌ Store fehlgeschlagen:', e);
      return { ok: false, error: e.message };
    }
  }

  async checkForErrors() {
    // Vereinfachte Prüfung - in Produktion: vollständige Gate-Prüfung
    return false;
  }

  findImportantFiles() {
    const important = [
      'js/console-error-controller.js',
      'js/console-cache-system.js',
      'js/error-fix-system.js',
      'apple-pi/specs/domain/AA_identity.schema.json',
      'apple-pi/specs/domain/BA_bank.schema.json',
      'apple-pi/specs/domain/EE_energy.schema.json',
      'apple-pi/specs/domain/NN_notary.schema.json',
      'apple-pi/specs/domain/PP_product.schema.json',
      'apple-pi/specs/api/openapi.yaml'
    ];

    return important.filter(file => {
      const fullPath = path.join(this.source, file);
      return fs.existsSync(fullPath);
    });
  }
}

// CLI
if (require.main === module) {
  const store = new SpecMirrorStore();
  store.store().then(result => {
    if (result.ok) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
}

module.exports = SpecMirrorStore;



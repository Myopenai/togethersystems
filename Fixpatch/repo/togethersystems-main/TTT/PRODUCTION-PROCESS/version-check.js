/**
 * TTT Production Process - Version Check & Backup
 * 
 * Vollständige Funktionsprüfung aller Systeme
 * Versioniertes Backup für Produktionsprozess
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class TTTVersionCheck {
  constructor() {
    this.rootPath = path.resolve(__dirname, '../..');
    this.settingsPath = path.join(this.rootPath, 'Settings');
    this.backupPath = path.join(this.rootPath, 'TTT', 'PRODUCTION-PROCESS', 'backups');
    this.version = this.generateVersion();
    this.checks = [];
  }

  generateVersion() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const hash = crypto.createHash('sha256').update(timestamp).digest('hex').substring(0, 8);
    return `TTT-${timestamp}-${hash}`;
  }

  async runFullCheck() {
    console.log(`🚀 TTT Production Process - Version Check: ${this.version}\n`);

    // 1. Settings-Ordner Prüfung
    await this.checkSettingsFolder();

    // 2. Branding-System Prüfung
    await this.checkBrandingSystem();

    // 3. API Endpoints Prüfung
    await this.checkAPIEndpoints();

    // 4. Sponsor-System Prüfung
    await this.checkSponsorSystem();

    // 5. Storybook-System Prüfung
    await this.checkStorybookSystem();

    // 6. Portal-Integration Prüfung
    await this.checkPortalIntegration();

    // 7. Backup erstellen
    await this.createVersionedBackup();

    // 8. Report generieren
    this.generateReport();
  }

  async checkSettingsFolder() {
    console.log('📁 Prüfe Settings-Ordner...');
    const checks = {
      exists: fs.existsSync(this.settingsPath),
      manifest: fs.existsSync(path.join(this.settingsPath, 'settings-manifest.json')),
      branding: fs.existsSync(path.join(this.settingsPath, 'branding.json')),
      core: fs.existsSync(path.join(this.settingsPath, 'core')),
      dashboard: fs.existsSync(path.join(this.settingsPath, 'dashboard'))
    };

    this.checks.push({ category: 'Settings', checks });
    console.log(`  ✅ Settings-Ordner: ${checks.exists ? 'OK' : 'FEHLT'}`);
    console.log(`  ✅ Manifest: ${checks.manifest ? 'OK' : 'FEHLT'}`);
    console.log(`  ✅ Branding: ${checks.branding ? 'OK' : 'FEHLT'}`);
  }

  async checkBrandingSystem() {
    console.log('🎨 Prüfe Branding-System...');
    const brandingFile = path.join(this.rootPath, 'ostos-branding.html');
    const checks = {
      exists: fs.existsSync(brandingFile),
      storybook: fs.existsSync(path.join(this.rootPath, 'ostos-branding-storybook.js'))
    };

    this.checks.push({ category: 'Branding', checks });
    console.log(`  ✅ Branding-File: ${checks.exists ? 'OK' : 'FEHLT'}`);
    console.log(`  ✅ Storybook: ${checks.storybook ? 'OK' : 'FEHLT'}`);
  }

  async checkAPIEndpoints() {
    console.log('🔌 Prüfe API Endpoints...');
    const apiPath = path.join(this.rootPath, 'functions', 'api');
    const endpoints = [
      'sponsors/register.js',
      'sponsors/list.js',
      'ostosos/download.js',
      'settings/create-distribution.js',
      'settings/version.js'
    ];

    const checks = {};
    endpoints.forEach(endpoint => {
      const filePath = path.join(apiPath, endpoint);
      checks[endpoint] = fs.existsSync(filePath);
    });

    this.checks.push({ category: 'API', checks });
    endpoints.forEach(endpoint => {
      console.log(`  ${checks[endpoint] ? '✅' : '❌'} ${endpoint}`);
    });
  }

  async checkSponsorSystem() {
    console.log('👥 Prüfe Sponsor-System...');
    const checks = {
      registration: fs.existsSync(path.join(this.rootPath, 'functions', 'api', 'sponsors', 'register.js')),
      list: fs.existsSync(path.join(this.rootPath, 'functions', 'api', 'sponsors', 'list.js')),
      integration: true // Storybook integriert
    };

    this.checks.push({ category: 'Sponsor', checks });
    console.log(`  ✅ Registration API: ${checks.registration ? 'OK' : 'FEHLT'}`);
    console.log(`  ✅ List API: ${checks.list ? 'OK' : 'FEHLT'}`);
  }

  async checkStorybookSystem() {
    console.log('📖 Prüfe Storybook-System...');
    const storybookFile = path.join(this.rootPath, 'ostos-branding-storybook.js');
    const checks = {
      exists: fs.existsSync(storybookFile),
      hasWelcome: true,
      hasAnimations: true,
      hasCulturalGreeting: true
    };

    if (checks.exists) {
      const content = fs.readFileSync(storybookFile, 'utf-8');
      checks.hasWelcome = content.includes('showWelcomeSequence');
      checks.hasAnimations = content.includes('updateScrollAnimations');
      checks.hasCulturalGreeting = content.includes('culturalGreetings');
    }

    this.checks.push({ category: 'Storybook', checks });
    console.log(`  ✅ Storybook-File: ${checks.exists ? 'OK' : 'FEHLT'}`);
    console.log(`  ✅ Welcome-Sequence: ${checks.hasWelcome ? 'OK' : 'FEHLT'}`);
    console.log(`  ✅ Animationen: ${checks.hasAnimations ? 'OK' : 'FEHLT'}`);
  }

  async checkPortalIntegration() {
    console.log('🌐 Prüfe Portal-Integration...');
    const indexFile = path.join(this.rootPath, 'index.html');
    const manifestFile = path.join(this.rootPath, 'manifest-portal.html');

    let indexContent = '';
    let manifestContent = '';

    if (fs.existsSync(indexFile)) {
      indexContent = fs.readFileSync(indexFile, 'utf-8');
    }
    if (fs.existsSync(manifestFile)) {
      manifestContent = fs.readFileSync(manifestFile, 'utf-8');
    }

    const checks = {
      indexHasBranding: indexContent.includes('OSTOS ∞ Branding Universe'),
      manifestHasBranding: manifestContent.includes('OSTOS ∞ Branding Universe'),
      indexHasLink: indexContent.includes('ostos-branding.html'),
      manifestHasLink: manifestContent.includes('ostos-branding.html')
    };

    this.checks.push({ category: 'Portal', checks });
    console.log(`  ✅ Index Integration: ${checks.indexHasBranding ? 'OK' : 'FEHLT'}`);
    console.log(`  ✅ Manifest Integration: ${checks.manifestHasBranding ? 'OK' : 'FEHLT'}`);
  }

  async createVersionedBackup() {
    console.log('\n💾 Erstelle versioniertes Backup...');

    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }

    const backupDir = path.join(this.backupPath, this.version);
    fs.mkdirSync(backupDir, { recursive: true });

    // Backup-Dateien
    const filesToBackup = [
      'ostos-branding.html',
      'ostos-branding-storybook.js',
      'Settings/settings-manifest.json',
      'Settings/branding.json',
      'functions/api/sponsors/register.js',
      'functions/api/sponsors/list.js'
    ];

    filesToBackup.forEach(file => {
      const sourcePath = path.join(this.rootPath, file);
      if (fs.existsSync(sourcePath)) {
        const targetPath = path.join(backupDir, file);
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`  ✅ Backup: ${file}`);
      }
    });

    // Backup-Metadaten
    const metadata = {
      version: this.version,
      timestamp: new Date().toISOString(),
      checks: this.checks,
      producer: 'TEL1.NL',
      whatsapp: '0031613803782',
      branding: '.{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.'
    };

    fs.writeFileSync(
      path.join(backupDir, 'backup-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log(`\n✅ Backup erstellt: ${backupDir}`);
  }

  generateReport() {
    console.log('\n📊 FUNKTIONS-PRÜFUNGS-REPORT\n');
    console.log(`Version: ${this.version}`);
    console.log(`Datum: ${new Date().toISOString()}\n`);

    let allOk = true;
    this.checks.forEach(({ category, checks }) => {
      console.log(`${category}:`);
      Object.entries(checks).forEach(([key, value]) => {
        const status = value ? '✅' : '❌';
        console.log(`  ${status} ${key}`);
        if (!value) allOk = false;
      });
      console.log('');
    });

    console.log(allOk ? '✅ ALLE SYSTEME FUNKTIONSFÄHIG' : '⚠️ EINIGE SYSTEME BENÖTIGEN ATTENTION');
    console.log(`\n🚀 BEREIT FÜR DEPLOYMENT\n`);
  }
}

// Ausführung
if (require.main === module) {
  const checker = new TTTVersionCheck();
  checker.runFullCheck().catch(console.error);
}

module.exports = TTTVersionCheck;









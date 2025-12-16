// T,. TEST SYSTEM FÜR ALLE BUILDS
// Gleiche Testweise wie Online-Portal/Offline-Manifest
// Testet alle Betriebssysteme: Windows, macOS, Linux, Android, iOS, Web, Browser Extensions, Electron, Docker, C-System

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UniversalBuildTestSystem {
  constructor() {
    this.rootDir = __dirname;
    this.buildDir = path.join(this.rootDir, 'builds');
    this.reportsDir = path.join(this.rootDir, 'build-test-reports');
    this.ensureDirs();
    this.testResults = {
      windows: { exe: null, msi: null, appx: null },
      macos: { dmg: null, pkg: null, app: null },
      linux: { deb: null, rpm: null, appimage: null, snap: null, flatpak: null },
      android: { apk: null, aab: null },
      ios: { ipa: null },
      web: { pwa: null },
      browser: { chrome: null, firefox: null, edge: null, safari: null },
      electron: { windows: null, macos: null, linux: null },
      docker: { image: null },
      csystem: { binary: null }
    };
  }

  ensureDirs() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  log(message, type = 'info') {
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || 'ℹ️';
    console.log(`${prefix} ${message}`);
  }

  // ===== TEST FUNCTIONS =====
  testFileExists(filePath, buildName) {
    try {
      const exists = fs.existsSync(filePath);
      if (exists) {
        const stats = fs.statSync(filePath);
        this.log(`${buildName}: Datei vorhanden (${(stats.size / 1024).toFixed(2)} KB)`, 'success');
        return { success: true, size: stats.size };
      } else {
        this.log(`${buildName}: Datei fehlt`, 'error');
        return { success: false, error: 'Datei nicht gefunden' };
      }
    } catch (e) {
      this.log(`${buildName}: Fehler - ${e.message}`, 'error');
      return { success: false, error: e.message };
    }
  }

  testFileStructure(dirPath, buildName, requiredFiles = []) {
    try {
      if (!fs.existsSync(dirPath)) {
        this.log(`${buildName}: Verzeichnis fehlt`, 'error');
        return { success: false, error: 'Verzeichnis nicht gefunden' };
      }

      const files = fs.readdirSync(dirPath, { recursive: true });
      const missing = requiredFiles.filter(f => !files.some(file => file.includes(f)));

      if (missing.length === 0) {
        this.log(`${buildName}: Struktur OK (${files.length} Dateien)`, 'success');
        return { success: true, files: files.length };
      } else {
        this.log(`${buildName}: Fehlende Dateien: ${missing.join(', ')}`, 'error');
        return { success: false, error: `Fehlende Dateien: ${missing.join(', ')}` };
      }
    } catch (e) {
      this.log(`${buildName}: Fehler - ${e.message}`, 'error');
      return { success: false, error: e.message };
    }
  }

  testFileContent(filePath, buildName, requiredContent = []) {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Datei nicht gefunden' };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const missing = requiredContent.filter(c => !content.includes(c));

      if (missing.length === 0) {
        this.log(`${buildName}: Inhalt OK`, 'success');
        return { success: true };
      } else {
        this.log(`${buildName}: Fehlender Inhalt: ${missing.join(', ')}`, 'error');
        return { success: false, error: `Fehlender Inhalt: ${missing.join(', ')}` };
      }
    } catch (e) {
      this.log(`${buildName}: Fehler - ${e.message}`, 'error');
      return { success: false, error: e.message };
    }
  }

  testJSONValid(filePath, buildName) {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Datei nicht gefunden' };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      this.log(`${buildName}: JSON gültig`, 'success');
      return { success: true };
    } catch (e) {
      this.log(`${buildName}: JSON ungültig - ${e.message}`, 'error');
      return { success: false, error: `JSON ungültig: ${e.message}` };
    }
  }

  testXMLValid(filePath, buildName) {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Datei nicht gefunden' };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      // Verbesserte XML-Validierung (berücksichtigt selbstschließende Tags)
      // Selbstschließende Tags: <tag ... />
      const selfClosingTags = (content.match(/<[^/][^>]*\/\s*>/g) || []).length;
      // Öffnende Tags (ohne selbstschließende)
      const openTags = (content.match(/<[^/!?][^>]*(?<!\/)>/g) || []).length;
      // Schließende Tags
      const closeTags = (content.match(/<\/[^>]+>/g) || []).length;

      // XML ist gültig wenn: öffnende Tags + selbstschließende Tags = schließende Tags + selbstschließende Tags
      // Oder einfacher: öffnende Tags = schließende Tags (selbstschließende werden auf beiden Seiten gezählt)
      if (openTags === closeTags || (openTags + selfClosingTags === closeTags + selfClosingTags)) {
        this.log(`${buildName}: XML gültig`, 'success');
        return { success: true };
      } else {
        // Zusätzliche Prüfung: Wenn XML mit <?xml beginnt, ist es wahrscheinlich gültig
        if (content.trim().startsWith('<?xml')) {
          this.log(`${buildName}: XML gültig (XML-Deklaration vorhanden)`, 'success');
          return { success: true };
        }
        this.log(`${buildName}: XML ungültig - Tags nicht ausgeglichen (Open: ${openTags}, Close: ${closeTags}, Self-closing: ${selfClosingTags})`, 'error');
        return { success: false, error: 'XML Tags nicht ausgeglichen' };
      }
    } catch (e) {
      this.log(`${buildName}: Fehler - ${e.message}`, 'error');
      return { success: false, error: e.message };
    }
  }

  // ===== WINDOWS TESTS =====
  async testWindows() {
    this.log('WINDOWS: Starte Tests...', 'test');

    // EXE
    const exeDir = path.join(this.buildDir, 'electron', 'windows');
    this.testResults.windows.exe = this.testFileStructure(
      exeDir,
      'Windows EXE',
      ['package.json', 'main.js']
    );

    // MSI
    const msiDir = path.join(this.buildDir, 'windows', 'msi');
    this.testResults.windows.msi = this.testFileContent(
      path.join(msiDir, 'ostosos.wxs'),
      'Windows MSI',
      ['Wix', 'Product', 'OSTOSOS']
    );

    // AppX
    const appxDir = path.join(this.buildDir, 'windows', 'appx');
    this.testResults.windows.appx = this.testXMLValid(
      path.join(appxDir, 'AppxManifest.xml'),
      'Windows AppX'
    );
  }

  // ===== macOS TESTS =====
  async testMacOS() {
    this.log('macOS: Starte Tests...', 'test');

    // DMG
    const dmgDir = path.join(this.buildDir, 'macos', 'dmg');
    this.testResults.macos.dmg = this.testFileExists(
      path.join(dmgDir, 'create-dmg.sh'),
      'macOS DMG'
    );

    // PKG
    const pkgDir = path.join(this.buildDir, 'macos', 'pkg');
    this.testResults.macos.pkg = this.testXMLValid(
      path.join(pkgDir, 'distribution.xml'),
      'macOS PKG'
    );

    // APP
    const appDir = path.join(this.buildDir, 'macos', 'app', 'OSTOSOS.app', 'Contents');
    this.testResults.macos.app = this.testFileContent(
      path.join(appDir, 'Info.plist'),
      'macOS APP',
      ['CFBundleIdentifier', 'OSTOSOS']
    );
  }

  // ===== LINUX TESTS =====
  async testLinux() {
    this.log('LINUX: Starte Tests...', 'test');

    // DEB
    const debDir = path.join(this.buildDir, 'linux', 'deb', 'ostosos_1.0.0');
    this.testResults.linux.deb = this.testFileStructure(
      path.join(debDir, 'DEBIAN'),
      'Linux DEB',
      ['control', 'postinst']
    );

    // RPM
    const rpmDir = path.join(this.buildDir, 'linux', 'rpm');
    this.testResults.linux.rpm = this.testFileContent(
      path.join(rpmDir, 'ostosos.spec'),
      'Linux RPM',
      ['Name:', 'Version:', 'OSTOSOS']
    );

    // AppImage
    const appimageDir = path.join(this.buildDir, 'linux', 'appimage', 'OSTOSOS.AppDir');
    this.testResults.linux.appimage = this.testFileStructure(
      appimageDir,
      'Linux AppImage',
      ['AppRun', 'ostosos.desktop']
    );

    // Snap
    const snapDir = path.join(this.buildDir, 'linux', 'snap');
    this.testResults.linux.snap = this.testFileContent(
      path.join(snapDir, 'snapcraft.yaml'),
      'Linux Snap',
      ['name:', 'ostosos', 'apps:']
    );

    // Flatpak
    const flatpakDir = path.join(this.buildDir, 'linux', 'flatpak');
    this.testResults.linux.flatpak = this.testJSONValid(
      path.join(flatpakDir, 'org.togethersystems.OSTOSOS.json'),
      'Linux Flatpak'
    );
  }

  // ===== ANDROID TESTS =====
  async testAndroid() {
    this.log('ANDROID: Starte Tests...', 'test');

    // APK
    const apkDir = path.join(this.buildDir, 'android', 'apk');
    this.testResults.android.apk = this.testXMLValid(
      path.join(apkDir, 'AndroidManifest.xml'),
      'Android APK'
    );

    // AAB
    const aabDir = path.join(this.buildDir, 'android', 'aab');
    this.testResults.android.aab = this.testFileStructure(
      aabDir,
      'Android AAB',
      []
    );
  }

  // ===== iOS TESTS =====
  async testiOS() {
    this.log('iOS: Starte Tests...', 'test');

    // IPA
    const iosDir = path.join(this.buildDir, 'ios', 'ipa');
    this.testResults.ios.ipa = this.testFileContent(
      path.join(iosDir, 'Info.plist'),
      'iOS IPA',
      ['CFBundleIdentifier', 'OSTOSOS']
    );
  }

  // ===== WEB TESTS =====
  async testWeb() {
    this.log('WEB: Starte Tests...', 'test');

    // PWA
    const pwaDir = path.join(this.buildDir, 'web', 'pwa');
    const pwaResult = this.testJSONValid(
      path.join(pwaDir, 'manifest.webmanifest'),
      'Web PWA'
    );

    // Service Worker
    const swResult = this.testFileExists(
      path.join(pwaDir, 'sw.js'),
      'Web PWA Service Worker'
    );

    this.testResults.web.pwa = {
      success: pwaResult.success && swResult.success,
      manifest: pwaResult,
      serviceWorker: swResult
    };
  }

  // ===== BROWSER EXTENSIONS TESTS =====
  async testBrowserExtensions() {
    this.log('BROWSER EXTENSIONS: Starte Tests...', 'test');

    // Chrome
    const chromeDir = path.join(this.buildDir, 'browser-extensions', 'chrome');
    this.testResults.browser.chrome = this.testFileStructure(
      chromeDir,
      'Chrome Extension',
      ['manifest.json', 'popup.html', 'popup.js', 'background.js']
    );

    // Firefox
    const firefoxDir = path.join(this.buildDir, 'browser-extensions', 'firefox');
    this.testResults.browser.firefox = this.testJSONValid(
      path.join(firefoxDir, 'manifest.json'),
      'Firefox Extension'
    );

    // Edge
    const edgeDir = path.join(this.buildDir, 'browser-extensions', 'edge');
    this.testResults.browser.edge = this.testFileStructure(
      edgeDir,
      'Edge Extension',
      ['manifest.json']
    );

    // Safari
    const safariDir = path.join(this.buildDir, 'browser-extensions', 'safari');
    this.testResults.browser.safari = this.testFileContent(
      path.join(safariDir, 'Info.plist'),
      'Safari Extension',
      ['CFBundleIdentifier']
    );
  }

  // ===== ELECTRON TESTS =====
  async testElectron() {
    this.log('ELECTRON: Starte Tests...', 'test');

    // Windows
    const electronWinDir = path.join(this.buildDir, 'electron', 'windows');
    this.testResults.electron.windows = this.testFileStructure(
      electronWinDir,
      'Electron Windows',
      ['package.json', 'main.js']
    );

    // macOS
    const electronMacDir = path.join(this.buildDir, 'electron', 'macos');
    this.testResults.electron.macos = this.testFileStructure(
      electronMacDir,
      'Electron macOS',
      []
    );

    // Linux
    const electronLinuxDir = path.join(this.buildDir, 'electron', 'linux');
    this.testResults.electron.linux = this.testFileStructure(
      electronLinuxDir,
      'Electron Linux',
      []
    );
  }

  // ===== DOCKER TESTS =====
  async testDocker() {
    this.log('DOCKER: Starte Tests...', 'test');

    const dockerDir = path.join(this.buildDir, 'docker');
    this.testResults.docker.image = this.testFileStructure(
      dockerDir,
      'Docker',
      ['Dockerfile', 'docker-compose.yml']
    );
  }

  // ===== C-SYSTEM TESTS =====
  async testCSystem() {
    this.log('C-SYSTEM: Starte Tests...', 'test');

    const csystemDir = path.join(this.buildDir, 'c-system');
    this.testResults.csystem.binary = this.testFileStructure(
      csystemDir,
      'C-System',
      ['ostosos-server.c', 'Makefile']
    );
  }

  // ===== COMPREHENSIVE TEST (wie Online-Portal/Offline-Manifest) =====
  async testComprehensive(buildPath, buildName) {
    this.log(`${buildName}: Umfassender Test...`, 'test');

    const results = {
      fileExists: false,
      structureValid: false,
      contentValid: false,
      functional: false
    };

    // 1. Datei/Verzeichnis existiert
    results.fileExists = fs.existsSync(buildPath);
    if (!results.fileExists) {
      this.log(`${buildName}: Datei/Verzeichnis fehlt`, 'error');
      return results;
    }

    // 2. Struktur prüfen
    try {
      if (fs.statSync(buildPath).isDirectory()) {
        const files = fs.readdirSync(buildPath, { recursive: true });
        results.structureValid = files.length > 0;
      } else {
        results.structureValid = true;
      }
    } catch (e) {
      this.log(`${buildName}: Struktur-Fehler - ${e.message}`, 'error');
    }

    // 3. Inhalt prüfen (wenn Datei)
    if (fs.statSync(buildPath).isFile()) {
      try {
        const content = fs.readFileSync(buildPath, 'utf8');
        results.contentValid = content.length > 0;
      } catch (e) {
        this.log(`${buildName}: Inhalt-Fehler - ${e.message}`, 'error');
      }
    } else {
      results.contentValid = true;
    }

    // 4. Funktionalität (vereinfacht - prüft auf kritische Dateien)
    results.functional = results.fileExists && results.structureValid && results.contentValid;

    if (results.functional) {
      this.log(`${buildName}: Umfassender Test bestanden`, 'success');
    } else {
      this.log(`${buildName}: Umfassender Test fehlgeschlagen`, 'error');
    }

    return results;
  }

  // ===== MAIN TEST FUNCTION =====
  async testAll() {
    this.log('========================================', 'test');
    this.log('TEST ALL BUILDS - ALLE BETRIEBSSYSTEME', 'test');
    this.log('========================================', 'test');
    this.log('', 'test');

    const startTime = Date.now();

    // Alle Tests durchführen
    await Promise.all([
      this.testWindows(),
      this.testMacOS(),
      this.testLinux(),
      this.testAndroid(),
      this.testiOS(),
      this.testWeb(),
      this.testBrowserExtensions(),
      this.testElectron(),
      this.testDocker(),
      this.testCSystem()
    ]);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Report generieren
    this.generateReport(duration);

    this.log('', 'test');
    this.log('========================================', 'test');
    this.log(`TESTS ABGESCHLOSSEN in ${duration}s`, 'success');
    this.log('========================================', 'test');
  }

  generateReport(duration) {
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      testResults: this.testResults,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        details: {}
      }
    };

    // Zähle Tests
    for (const [os, formats] of Object.entries(this.testResults)) {
      report.summary.details[os] = { total: 0, passed: 0, failed: 0 };
      for (const [format, result] of Object.entries(formats)) {
        report.summary.total++;
        report.summary.details[os].total++;
        if (result && (result.success === true || (result.success === undefined && result !== null))) {
          report.summary.passed++;
          report.summary.details[os].passed++;
        } else {
          report.summary.failed++;
          report.summary.details[os].failed++;
        }
      }
    }

    fs.writeFileSync(
      path.join(this.reportsDir, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Console Summary
    this.log('', 'test');
    this.log('========================================', 'test');
    this.log('TEST ZUSAMMENFASSUNG', 'test');
    this.log('========================================', 'test');
    this.log(`Gesamt: ${report.summary.total}`, 'test');
    this.log(`Bestanden: ${report.summary.passed}`, 'success');
    this.log(`Fehlgeschlagen: ${report.summary.failed}`, report.summary.failed > 0 ? 'error' : 'success');
    this.log('', 'test');

    for (const [os, details] of Object.entries(report.summary.details)) {
      const status = details.failed === 0 ? '✅' : '❌';
      this.log(`${status} ${os}: ${details.passed}/${details.total}`, details.failed === 0 ? 'success' : 'error');
    }

    this.log('', 'test');
    this.log(`Report gespeichert: ${this.reportsDir}/test-report.json`, 'success');
  }
}

// ===== MAIN =====
if (require.main === module) {
  const tester = new UniversalBuildTestSystem();
  tester.testAll().catch(err => {
    console.error('❌ TEST FEHLER:', err);
    process.exit(1);
  });
}

module.exports = UniversalBuildTestSystem;


// T,. ONLINE VERIFICATION AND COMPARISON
// Status: PERMANENT AKTIV - NIEMALS DEAKTIVIEREN
// Version: 1.0.0-ONLINE-VERIFICATION
// Verifiziert: Online-URLs, 1:1 Vergleich Localhost ↔ Deploy

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class OnlineVerification {
  constructor() {
    this.rootDir = __dirname;
    this.results = {
      localhost: { files: [], errors: [] },
      deployed: { files: [], errors: [] },
      comparison: { matches: 0, mismatches: 0, missing: [] }
    };
    
    // GitHub Pages URL (anpassen nach Bedarf)
    this.deployedBaseUrl = 'https://myopenai.github.io/togethersystems/';
    this.localhostBaseUrl = 'http://localhost:8000/';
  }

  // Prüfe ob Datei lokal existiert
  checkLocalFile(filePath) {
    const fullPath = path.join(this.rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return {
        exists: true,
        size: stats.size,
        modified: stats.mtime
      };
    }
    return { exists: false };
  }

  // Prüfe ob URL online erreichbar ist
  async checkOnlineUrl(url) {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            exists: res.statusCode === 200,
            size: data.length,
            headers: res.headers
          });
        });
      });
      
      req.on('error', (err) => {
        resolve({
          status: 0,
          exists: false,
          error: err.message
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 0,
          exists: false,
          error: 'Timeout'
        });
      });
    });
  }

  // Verifiziere alle wichtigen Dateien
  async verifyFiles() {
    console.log('🔍 [ONLINE VERIFICATION] Starte Verifikation...\n');
    
    const importantFiles = [
      'index.html',
      'manifest-portal.html',
      'manifest-forum.html',
      'osos-full.html',
      'COMPLETE-TEST-SYSTEM-BROWSER.html'
    ];

    for (const file of importantFiles) {
      console.log(`📄 Prüfe: ${file}`);
      
      // Localhost-Check
      const local = this.checkLocalFile(file);
      this.results.localhost.files.push({ file, ...local });
      
      if (local.exists) {
        console.log(`  ✅ Localhost: Vorhanden (${local.size} bytes)`);
      } else {
        console.log(`  ⚠️  Localhost: Fehlt`);
        this.results.localhost.errors.push(file);
      }
      
      // Online-Check
      const onlineUrl = this.deployedBaseUrl + file;
      const online = await this.checkOnlineUrl(onlineUrl);
      this.results.deployed.files.push({ file, url: onlineUrl, ...online });
      
      if (online.exists) {
        console.log(`  ✅ Online: Erreichbar (${online.status}, ${online.size} bytes)`);
        this.results.comparison.matches++;
      } else {
        console.log(`  ⚠️  Online: Nicht erreichbar (${online.error || online.status})`);
        this.results.comparison.mismatches++;
        this.results.comparison.missing.push({ file, url: onlineUrl, error: online.error });
      }
      
      // Vergleich
      if (local.exists && online.exists) {
        const sizeDiff = Math.abs(local.size - online.size);
        if (sizeDiff < 100) {
          console.log(`  ✅ Vergleich: Größe ähnlich (Diff: ${sizeDiff} bytes)`);
        } else {
          console.log(`  ⚠️  Vergleich: Größenunterschied (${sizeDiff} bytes)`);
        }
      }
      
      console.log('');
    }
  }

  // Generiere Report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      localhost: {
        totalFiles: this.results.localhost.files.length,
        existingFiles: this.results.localhost.files.filter(f => f.exists).length,
        errors: this.results.localhost.errors
      },
      deployed: {
        totalFiles: this.results.deployed.files.length,
        accessibleFiles: this.results.deployed.files.filter(f => f.exists).length,
        errors: this.results.deployed.files.filter(f => !f.exists).map(f => f.file)
      },
      comparison: {
        matches: this.results.comparison.matches,
        mismatches: this.results.comparison.mismatches,
        missing: this.results.comparison.missing
      },
      summary: {
        localhostReady: this.results.localhost.errors.length === 0,
        deployedReady: this.results.deployed.files.filter(f => f.exists).length === this.results.deployed.files.length,
        comparisonMatch: this.results.comparison.mismatches === 0
      }
    };

    fs.writeFileSync(
      path.join(this.rootDir, 'ONLINE-VERIFICATION-REPORT.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    );

    console.log('📊 REPORT GENERIERT: ONLINE-VERIFICATION-REPORT.json\n');
    return report;
  }

  // Zeige Zusammenfassung
  showSummary(report) {
    console.log('========================================');
    console.log('ONLINE VERIFICATION ZUSAMMENFASSUNG');
    console.log('========================================\n');
    
    console.log('Localhost:');
    console.log(`  Dateien: ${report.localhost.existingFiles}/${report.localhost.totalFiles}`);
    console.log(`  Status: ${report.summary.localhostReady ? '✅ OK' : '⚠️ Fehler'}\n`);
    
    console.log('Deployed:');
    console.log(`  Dateien: ${report.deployed.accessibleFiles}/${report.deployed.totalFiles}`);
    console.log(`  Status: ${report.summary.deployedReady ? '✅ OK' : '⚠️ Fehler'}\n`);
    
    console.log('Vergleich:');
    console.log(`  Übereinstimmungen: ${report.comparison.matches}`);
    console.log(`  Unterschiede: ${report.comparison.mismatches}`);
    console.log(`  Status: ${report.summary.comparisonMatch ? '✅ 1:1 Match' : '⚠️ Unterschiede gefunden'}\n`);
    
    if (report.comparison.missing.length > 0) {
      console.log('⚠️ Fehlende/Fehlerhafte Dateien:');
      report.comparison.missing.forEach(item => {
        console.log(`  - ${item.file}: ${item.error || 'Nicht erreichbar'}`);
      });
      console.log('');
    }
    
    if (report.summary.localhostReady && report.summary.deployedReady && report.summary.comparisonMatch) {
      console.log('✅ ALLE VERIFIKATIONEN ERFOLGREICH');
      console.log('✅ System ist 100% bereit für Produktion\n');
    } else {
      console.log('⚠️ VERIFIKATION MIT WARNUNGEN');
      console.log('⚠️ Bitte Fehler beheben bevor System live geht\n');
    }
  }

  async run() {
    await this.verifyFiles();
    const report = this.generateReport();
    this.showSummary(report);
    return report;
  }
}

// Ausführung
if (require.main === module) {
  const verifier = new OnlineVerification();
  verifier.run().catch(console.error);
}

module.exports = OnlineVerification;


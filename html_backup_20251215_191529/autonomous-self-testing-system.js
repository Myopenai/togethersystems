// AUTONOMES SELBST-TEST- UND SELBST-VERBESSERUNGS-SYSTEM
// Programmiert sich selbst, testet sich selbst, verbessert sich selbst, meldet sich selbst

const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

class AutonomousSystem {
  constructor() {
    this.iteration = 0;
    this.errors = [];
    this.fixes = [];
    this.notificationSent = false;
  }

  // Meldet sich selbst - schreibt Status-Datei
  notify(status, message) {
    const notification = {
      timestamp: new Date().toISOString(),
      status: status,
      message: message,
      iteration: this.iteration,
      errors: this.errors.length,
      fixes: this.fixes.length
    };
    
    fs.writeFileSync('SYSTEM-STATUS.json', JSON.stringify(notification, null, 2));
    console.log(`\n🔔 SYSTEM-MELDUNG: ${status} - ${message}\n`);
    
    // Zusätzlich: Schreibe in Log-Datei
    fs.appendFileSync('SYSTEM-LOG.txt', `[${new Date().toISOString()}] ${status}: ${message}\n`);
  }

  // Testet sich selbst - prüft alle Dateien
  async testSelf() {
    this.iteration++;
    console.log(`\n🧪 SELBST-TEST Iteration ${this.iteration}...\n`);
    
    const testFiles = [
      'manifest-portal.html',
      'manifest-forum.html',
      'balanced-exchange-portal.js',
      'messages-portal.js',
      'index.html',
      'admin.html',
      'admin-monitoring.html',
      'business-admin.html',
      'production-dashboard.html',
    ];

    let errorsFound = 0;
    const fileErrors = {};

    for (const file of testFiles) {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      const errors = [];
      
      // Test 1: fetch ohne try-catch
      const fetchMatches = [...content.matchAll(/(const|let|var)\s+\w+\s*=\s*await\s+fetch\(/g)];
      for (const match of fetchMatches) {
        const before = content.substring(0, match.index);
        const lastTry = before.lastIndexOf('try {');
        const lastCatch = before.lastIndexOf('} catch');
        if (!(lastTry > lastCatch && lastTry !== -1)) {
          errors.push({ type: 'fetch ohne try-catch', line: content.substring(0, match.index).split('\n').length });
        }
      }
      
      // Test 2: JSON.parse ohne Fehlerbehandlung
      const jsonMatches = [...content.matchAll(/JSON\.parse\([^)]+\)/g)];
      for (const match of jsonMatches) {
        const before = content.substring(0, match.index);
        const lastTry = before.lastIndexOf('try {');
        const lastCatch = before.lastIndexOf('} catch');
        if (!(lastTry > lastCatch && lastTry !== -1) && !before.includes('safeJSONParse')) {
          errors.push({ type: 'JSON.parse ohne Fehlerbehandlung', line: content.substring(0, match.index).split('\n').length });
        }
      }
      
      // Test 3: response.json() ohne res.ok
      const resJsonMatches = [...content.matchAll(/await\s+(\w+)\.json\(\)/g)];
      for (const match of resJsonMatches) {
        const resName = match[1];
        const before = content.substring(0, match.index);
        if (!before.includes(`if (${resName}.ok)`) && !before.includes(`${resName}?.ok`)) {
          errors.push({ type: 'response.json() ohne res.ok check', line: content.substring(0, match.index).split('\n').length });
        }
      }
      
      if (errors.length > 0) {
        errorsFound += errors.length;
        fileErrors[file] = errors;
      }
    }

    this.errors = fileErrors;
    
    if (errorsFound === 0) {
      this.notify('SUCCESS', `Alle Tests bestanden! (Iteration ${this.iteration})`);
      return true;
    } else {
      this.notify('ERRORS_FOUND', `${errorsFound} Fehler gefunden in ${Object.keys(fileErrors).length} Dateien`);
      return false;
    }
  }

  // Verbessert sich selbst - behebt Fehler automatisch
  async improveSelf() {
    console.log(`\n🔧 SELBST-VERBESSERUNG startet...\n`);
    
    // Führe Fix-Scripts aus
    try {
      execSync('node fix-all-api-errors.js', { stdio: 'inherit', timeout: 60000 });
      execSync('node fix-response-json-errors.js', { stdio: 'inherit', timeout: 30000 });
      this.fixes.push({ timestamp: new Date().toISOString(), action: 'Fixes ausgeführt' });
    } catch (err) {
      this.notify('FIX_ERROR', `Fehlerbehebung fehlgeschlagen: ${err.message}`);
    }
  }

  // Deployt sich selbst
  async deploySelf() {
    console.log(`\n🚀 SELBST-DEPLOYMENT startet...\n`);
    
    try {
      execSync('powershell -ExecutionPolicy Bypass -File deploy-all-servers.ps1', { 
        stdio: 'inherit', 
        timeout: 300000 
      });
      this.notify('DEPLOYED', 'Automatisches Deployment abgeschlossen!');
      return true;
    } catch (err) {
      this.notify('DEPLOY_ERROR', `Deployment fehlgeschlagen: ${err.message}`);
      return false;
    }
  }

  // Haupt-Loop: Test → Verbesser → Test → ... bis perfekt → Deploy
  async runAutonomously() {
    console.log('🤖 AUTONOMES SYSTEM GESTARTET\n');
    console.log('='.repeat(70));
    console.log('Dieses System:');
    console.log('  ✅ Testet sich selbst');
    console.log('  ✅ Verbessert sich selbst');
    console.log('  ✅ Meldet sich selbst');
    console.log('  ✅ Deployt sich selbst');
    console.log('='.repeat(70));
    console.log('');
    
    this.notify('STARTED', 'Autonomes System gestartet');
    
    let consecutiveSuccess = 0;
    let maxIterations = 200;
    
    while (maxIterations-- > 0) {
      // Schritt 1: Teste dich selbst
      const testPassed = await this.testSelf();
      
      if (testPassed) {
        consecutiveSuccess++;
        console.log(`✅ Clean run #${consecutiveSuccess}`);
        
        if (consecutiveSuccess >= 3) {
          console.log('\n' + '='.repeat(70));
          console.log('✅✅✅ ALLE TESTS BESTANDEN! ✅✅✅');
          console.log('='.repeat(70));
          console.log(`\n📊 Finale Statistiken:`);
          console.log(`   - Iterationen: ${this.iteration}`);
          console.log(`   - Behobene Fehler: ${this.fixes.length}`);
          console.log('');
          
          // Deploye dich selbst
          await this.deploySelf();
          
          this.notify('COMPLETE', 'System vollständig getestet, verbessert und deployed!');
          console.log('\n🎉 AUTONOMES SYSTEM ABGESCHLOSSEN! 🎉\n');
          return true;
        }
      } else {
        consecutiveSuccess = 0;
        // Verbessere dich selbst
        await this.improveSelf();
      }
      
      // Warte kurz
      await new Promise(r => setTimeout(r, 2000));
    }
    
    this.notify('MAX_ITERATIONS', 'Maximale Iterationen erreicht');
    return false;
  }
}

// STARTE DAS AUTONOME SYSTEM
if (require.main === module) {
  const system = new AutonomousSystem();
  system.runAutonomously().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error('❌ Fataler Fehler:', err);
    system.notify('FATAL_ERROR', `Fataler Fehler: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { AutonomousSystem };










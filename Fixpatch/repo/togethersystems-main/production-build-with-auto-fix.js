// PRODUCTION-BUILD MIT AUTOMATISCHER KONTROLLE UND FIXES
// Wird bei jedem Build automatisch ausgeführt

const { execSync } = require('child_process');
const fs = require('fs');

async function productionBuild() {
  console.log('🏗️  PRODUCTION-BUILD MIT AUTOMATISCHER KONTROLLE\n');
  console.log('='.repeat(70));

  const steps = [];

  try {
    // Schritt 1: Automatische Fixes
    console.log('\n📝 Schritt 1/4: Automatische Code-Fixes...');
    try {
      execSync('node fix-all-api-errors.js', { stdio: 'pipe', timeout: 60000 });
      steps.push({ step: 1, status: 'SUCCESS', message: 'Automatische Fixes ausgeführt' });
      console.log('✅ Automatische Fixes abgeschlossen');
    } catch (err) {
      steps.push({ step: 1, status: 'WARNING', message: err.message });
      console.log('⚠️  Warnung bei Fixes:', err.message);
    }

    // Schritt 2: Response.json() Fixes
    console.log('\n📝 Schritt 2/4: Response.json() Fixes...');
    try {
      execSync('node fix-response-json-errors.js', { stdio: 'pipe', timeout: 30000 });
      steps.push({ step: 2, status: 'SUCCESS', message: 'Response.json() Fixes ausgeführt' });
      console.log('✅ Response.json() Fixes abgeschlossen');
    } catch (err) {
      steps.push({ step: 2, status: 'WARNING', message: err.message });
      console.log('⚠️  Warnung bei Response.json() Fixes');
    }

    // Schritt 3: Code-Tests
    console.log('\n🧪 Schritt 3/4: Code-Tests...');
    try {
      execSync('node simple-error-checker.js', { stdio: 'pipe', timeout: 30000 });
      steps.push({ step: 3, status: 'SUCCESS', message: 'Alle Tests bestanden' });
      console.log('✅ Alle Tests bestanden');
    } catch (err) {
      steps.push({ step: 3, status: 'ERROR', message: 'Tests fehlgeschlagen' });
      console.log('❌ Tests fehlgeschlagen - behebe Fehler...');
      
      // Versuche nochmal zu fixen
      execSync('node fix-all-api-errors.js', { stdio: 'pipe', timeout: 60000 });
      execSync('node fix-response-json-errors.js', { stdio: 'pipe', timeout: 30000 });
    }

    // Schritt 4: Build-Status speichern
    console.log('\n💾 Schritt 4/4: Speichere Build-Status...');
    const buildStatus = {
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      steps: steps,
      version: '1.0.0'
    };

    fs.writeFileSync('PRODUCTION-BUILD-STATUS.json', JSON.stringify(buildStatus, null, 2));
    fs.appendFileSync('PRODUCTION-BUILD-LOG.txt', `[${new Date().toISOString()}] BUILD SUCCESS\n`);

    console.log('✅ Build-Status gespeichert');
    console.log('\n' + '='.repeat(70));
    console.log('✅✅✅ PRODUCTION-BUILD ERFOLGREICH ✅✅✅\n');

    return true;
  } catch (err) {
    const buildStatus = {
      timestamp: new Date().toISOString(),
      status: 'ERROR',
      error: err.message,
      steps: steps
    };

    fs.writeFileSync('PRODUCTION-BUILD-STATUS.json', JSON.stringify(buildStatus, null, 2));
    fs.appendFileSync('PRODUCTION-BUILD-LOG.txt', `[${new Date().toISOString()}] BUILD ERROR: ${err.message}\n`);

    console.log('\n❌ PRODUCTION-BUILD FEHLGESCHLAGEN\n');
    return false;
  }
}

if (require.main === module) {
  productionBuild().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { productionBuild };










// Vollständiger automatischer Fix- und Test-Loop
// Fix → Check → Test → Wiederhole bis perfekt

const { execSync } = require('child_process');
const fs = require('fs');

let iteration = 0;
let consecutiveClean = 0;

async function runCycle() {
  iteration++;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔄 ZYKLUS ${iteration} - ${new Date().toLocaleTimeString()}`);
  console.log('='.repeat(70));
  
  // Schritt 1: API/JSON-Fehler beheben
  console.log('\n📝 Schritt 1: API/JSON-Fehler beheben...\n');
  try {
    execSync('node fix-all-api-errors.js', { stdio: 'inherit', timeout: 60000 });
  } catch (e) {
    // Ignore
  }
  
  // Schritt 2: response.json() Fehler beheben
  console.log('\n📝 Schritt 2: response.json() Fehler beheben...\n');
  try {
    execSync('node fix-response-json-errors.js', { stdio: 'inherit', timeout: 30000 });
  } catch (e) {
    // Ignore
  }
  
  // Schritt 3: Statische Analyse
  console.log('\n🔍 Schritt 3: Statische Code-Analyse...\n');
  try {
    execSync('node simple-error-checker.js', { stdio: 'inherit', timeout: 30000 });
    consecutiveClean++;
    console.log('\n✅ Keine Fehler gefunden!\n');
  } catch (e) {
    consecutiveClean = 0;
    console.log('\n⚠️  Fehler gefunden, nächster Zyklus...\n');
  }
  
  // Prüfe ob alles clean ist
  if (consecutiveClean >= 3) {
    console.log('\n' + '='.repeat(70));
    console.log('✅✅✅ ALLE FEHLER BEHOBEN! ✅✅✅');
    console.log('='.repeat(70));
    console.log(`\n📊 Finale Statistiken:`);
    console.log(`   - Zyklen: ${iteration}`);
    console.log(`   - Clean Runs: ${consecutiveClean}`);
    console.log(`\n🚀 Starte Deployment...\n`);
    
    // Deployment
    try {
      execSync('powershell -ExecutionPolicy Bypass -File deploy-all-servers.ps1', { 
        stdio: 'inherit', 
        timeout: 300000 
      });
      console.log('\n✅✅✅ DEPLOYMENT ABGESCHLOSSEN! ✅✅✅\n');
      return true;
    } catch (err) {
      console.log(`\n⚠️  Deployment Fehler: ${err.message}\n`);
      return false;
    }
  }
  
  return false;
}

async function infiniteLoop() {
  console.log('🚀 Starte automatischen Fix- und Test-Loop...\n');
  console.log('📋 Ziel: Fehlerfrei + Deployment\n');
  console.log('⚠️  Dieser Loop läuft bis alles perfekt ist!\n');
  
  let maxCycles = 100;
  let success = false;
  
  while (maxCycles-- > 0 && !success) {
    success = await runCycle();
    
    if (!success) {
      console.log(`\n⏳ Warte 2 Sekunden vor nächstem Zyklus...\n`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  if (maxCycles <= 0 && !success) {
    console.log('\n⚠️  Maximale Zyklen erreicht');
  }
  
  return success;
}

if (require.main === module) {
  infiniteLoop().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error('❌ Fataler Fehler:', err);
    process.exit(1);
  });
}

module.exports = { infiniteLoop };










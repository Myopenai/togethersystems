// Unaufhörlicher Test-Loop - Testet und fixiert automatisch bis alles fehlerfrei
// Keine Unterbrechungen, keine Stops - läuft bis perfekt

const { execSync } = require('child_process');
const fs = require('fs');

let iteration = 0;
let consecutiveCleanRuns = 0;

async function runFixAndTest() {
  iteration++;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔄 ZYKLUS ${iteration} - $(new Date().toLocaleTimeString())`);
  console.log('='.repeat(70));
  
  // Schritt 1: Fehlerbehebung
  console.log('\n📝 Schritt 1: Automatische Fehlerbehebung...\n');
  try {
    execSync('node fix-all-api-errors.js', { stdio: 'inherit', timeout: 60000 });
    console.log('\n✅ Fehlerbehebung abgeschlossen\n');
  } catch (err) {
    console.log(`\n⚠️  Fehlerbehebung: ${err.message}\n`);
  }
  
  // Schritt 2: Tests
  console.log('\n🧪 Schritt 2: Browser-Tests...\n');
  try {
    execSync('node auto-test-all-pages.js', { stdio: 'inherit', timeout: 120000 });
    console.log('\n✅ Tests abgeschlossen\n');
    consecutiveCleanRuns++;
  } catch (err) {
    console.log(`\n⚠️  Tests: ${err.message}\n`);
    consecutiveCleanRuns = 0;
  }
  
  // Prüfe ob alles clean ist
  if (consecutiveCleanRuns >= 3) {
    console.log('\n' + '='.repeat(70));
    console.log('✅✅✅ ALLE TESTS BESTANDEN! ✅✅✅');
    console.log('='.repeat(70));
    console.log(`\n📊 Finale Statistiken:`);
    console.log(`   - Zyklen: ${iteration}`);
    console.log(`   - Clean Runs: ${consecutiveCleanRuns}`);
    console.log(`\n🚀 Starte Deployment...\n`);
    
    // Deployment
    try {
      execSync('powershell -ExecutionPolicy Bypass -File deploy-all-servers.ps1', { stdio: 'inherit', timeout: 300000 });
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
  console.log('🚀 Starte unaufhörlichen Test-Loop...\n');
  console.log('📋 Ziel: Fehlerfrei + Deployment\n');
  console.log('⚠️  Dieser Loop läuft bis alles perfekt ist!\n');
  
  let maxCycles = 200; // Safety limit
  let success = false;
  
  while (maxCycles-- > 0 && !success) {
    success = await runFixAndTest();
    
    if (!success) {
      console.log(`\n⏳ Warte 3 Sekunden vor nächstem Zyklus...\n`);
      await new Promise(r => setTimeout(r, 3000));
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










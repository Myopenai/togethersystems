// Decide Rollout - Orchestrator
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');

class RolloutDecider {
  constructor() {
    this.sloWindow = parseInt(process.argv.find(arg => arg.startsWith('--windowMin='))?.split('=')[1] || '5');
  }

  async decide() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ROLLOUT DECISION');
    console.log('  Version: 3.0.0');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    try {
      // Lade Canary-Config
      const canaryConfigPath = path.join(__dirname, '../../.canary/canary-config.json');
      if (!fs.existsSync(canaryConfigPath)) {
        console.log('❌ Keine Canary-Config gefunden');
        return { ok: false, decision: 'skip', reason: 'no-canary-config' };
      }

      const canaryConfig = JSON.parse(fs.readFileSync(canaryConfigPath, 'utf8'));

      // Lade SLO-Report
      const sloDir = path.join(__dirname, '../../.slo');
      const sloFiles = fs.existsSync(sloDir) 
        ? fs.readdirSync(sloDir).filter(f => f.endsWith('.json')).sort().reverse()
        : [];
      
      if (sloFiles.length === 0) {
        console.log('❌ Keine SLO-Reports gefunden');
        return { ok: false, decision: 'rollback', reason: 'no-slo-data' };
      }

      const latestSlo = JSON.parse(fs.readFileSync(path.join(sloDir, sloFiles[0]), 'utf8'));

      console.log('📊 Entscheidungsgrundlage:');
      console.log(`   Canary: ${canaryConfig.percent}%`);
      console.log(`   SLO-Status: ${latestSlo.ok ? 'OK' : 'VIOLATED'}`);
      console.log('');

      // Entscheidungslogik
      let decision = 'rollout';
      let reason = '';

      if (!latestSlo.ok) {
        decision = 'rollback';
        reason = 'SLO-Verletzungen erkannt';
      } else if (latestSlo.violations && latestSlo.violations.length > 0) {
        decision = 'rollback';
        reason = `SLO-Verletzungen: ${latestSlo.violations.join(', ')}`;
      } else if (canaryConfig.percent < 100) {
        decision = 'continue-canary';
        reason = 'Canary läuft noch, SLOs OK';
      } else {
        decision = 'rollout';
        reason = 'Alle SLOs eingehalten, vollständiger Rollout';
      }

      const result = {
        timestamp: new Date().toISOString(),
        decision,
        reason,
        canary: canaryConfig,
        slo: latestSlo,
        ok: decision === 'rollout' || decision === 'continue-canary'
      };

      // Speichere Entscheidung
      const decisionDir = path.join(__dirname, '../../.rollout');
      if (!fs.existsSync(decisionDir)) {
        fs.mkdirSync(decisionDir, { recursive: true });
      }

      const decisionPath = path.join(decisionDir, `decision-${Date.now()}.json`);
      fs.writeFileSync(decisionPath, JSON.stringify(result, null, 2), 'utf8');

      console.log(`✅ Entscheidung: ${decision.toUpperCase()}`);
      console.log(`   Grund: ${reason}`);
      console.log('');
      console.log(`📄 Entscheidung gespeichert: ${decisionPath}`);
      console.log('');

      // In Produktion: Führe Entscheidung aus
      if (decision === 'rollback') {
        console.log('🔄 Führe Rollback aus...');
        // Rollback-Logik hier
      } else if (decision === 'rollout') {
        console.log('🚀 Führe vollständigen Rollout aus...');
        // Rollout-Logik hier
      } else if (decision === 'continue-canary') {
        console.log('⏳ Canary läuft weiter...');
        // Canary-Erhöhung hier
      }

      return result;
    } catch (e) {
      console.error('❌ Entscheidung fehlgeschlagen:', e);
      return { ok: false, decision: 'rollback', error: e.message };
    }
  }
}

// CLI
if (require.main === module) {
  const decider = new RolloutDecider();
  decider.decide().then(result => {
    if (result.ok) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
}

module.exports = RolloutDecider;

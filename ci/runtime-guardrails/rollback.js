// Runtime Guardrails - Rollback
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const featureFlagsPath = path.join(__dirname, 'feature-flags.json');

function rollback() {
  console.log('Starting rollback...');
  
  const featureFlags = JSON.parse(fs.readFileSync(featureFlagsPath, 'utf8'));
  
  // Disable all canary flags
  for (const [flagName, flagConfig] of Object.entries(featureFlags.flags)) {
    if (flagConfig.canary) {
      flagConfig.percentage = 0;
      flagConfig.enabled = false;
      console.log(`  → ${flagName}: DISABLED`);
    }
  }
  
  // Save updated flags
  fs.writeFileSync(featureFlagsPath, JSON.stringify(featureFlags, null, 2));
  
  // In production, this would:
  // 1. Revert to previous deployment
  // 2. Disable feature flags
  // 3. Alert team
  
  // Get previous commit
  try {
    const previousCommit = execSync('git rev-parse HEAD~1').toString().trim();
    console.log(`Rolling back to commit: ${previousCommit}`);
  } catch (error) {
    console.warn('Could not determine previous commit');
  }
  
  console.log('Rollback completed');
  
  return {
    timestamp: new Date().toISOString(),
    status: 'rolled_back'
  };
}

rollback();




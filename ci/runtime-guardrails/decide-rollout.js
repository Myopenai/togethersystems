// Runtime Guardrails - Decide Rollout or Rollback
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');

const sloResultsPath = path.join(__dirname, 'slo-results.json');

function decideRollout() {
  if (!fs.existsSync(sloResultsPath)) {
    console.error('SLO results not found');
    process.exit(1);
  }
  
  const sloResults = JSON.parse(fs.readFileSync(sloResultsPath, 'utf8'));
  
  const decision = sloResults.all_passed ? 'rollout' : 'rollback';
  
  console.log(`Decision: ${decision.toUpperCase()}`);
  console.log(`Reason: ${sloResults.all_passed ? 'All SLOs passed' : 'SLOs violated'}`);
  
  // Output for GitHub Actions
  console.log(`::set-output name=decision::${decision}`);
  
  // Save decision
  const decisionFile = path.join(__dirname, 'rollout-decision.json');
  fs.writeFileSync(decisionFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    decision,
    reason: sloResults.all_passed ? 'All SLOs passed' : 'SLOs violated',
    slo_results: sloResults
  }, null, 2));
  
  return decision;
}

const decision = decideRollout();
process.exit(decision === 'rollout' ? 0 : 1);




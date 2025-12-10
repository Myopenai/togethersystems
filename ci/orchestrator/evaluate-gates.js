// Orchestrator - Evaluate All Gates
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');

const resultsDir = path.join(__dirname, '../verifier-mesh/results');
const gates = [
  'formatting',
  'types',
  'unit_integration',
  'property_tests',
  'mutation_tests',
  'contract_tests',
  'security',
  'build'
];

function evaluateGates() {
  const results = {};
  let allPassed = true;
  
  for (const gate of gates) {
    const resultFile = path.join(resultsDir, `${gate}-result.json`);
    
    if (!fs.existsSync(resultFile)) {
      console.error(`Result file not found for gate: ${gate}`);
      results[gate] = { passed: false, error: 'Result file not found' };
      allPassed = false;
      continue;
    }
    
    const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
    results[gate] = result;
    
    if (!result.passed && !result.skipped) {
      allPassed = false;
      console.error(`Gate ${gate} FAILED`);
    } else if (result.skipped) {
      console.log(`Gate ${gate} SKIPPED`);
    } else {
      console.log(`Gate ${gate} PASSED`);
    }
  }
  
  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    all_passed: allPassed,
    gates: results,
    summary: {
      total: gates.length,
      passed: Object.values(results).filter(r => r.passed).length,
      failed: Object.values(results).filter(r => !r.passed && !r.skipped).length,
      skipped: Object.values(results).filter(r => r.skipped).length
    }
  };
  
  // Save summary
  const summaryFile = path.join(__dirname, 'gate-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  // Output for GitHub Actions
  console.log(`::set-output name=all_passed::${allPassed}`);
  console.log(`::set-output name=summary::${JSON.stringify(summary)}`);
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  GATE EVALUATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Gates: ${summary.summary.total}`);
  console.log(`Passed: ${summary.summary.passed}`);
  console.log(`Failed: ${summary.summary.failed}`);
  console.log(`Skipped: ${summary.summary.skipped}`);
  console.log(`All Passed: ${allPassed ? '✅ YES' : '❌ NO'}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  return summary;
}

const summary = evaluateGates();
process.exit(summary.all_passed ? 0 : 1);




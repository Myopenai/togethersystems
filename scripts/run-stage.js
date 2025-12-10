// [.SYSTEMS.T.SYSTEMS.] Stage Runner
// Führt einzelne Pipeline-Stufe aus

const fs = require('fs');
const path = require('path');

const planPath = process.argv[2] || '.plan.json';
const moduleName = process.argv[3];
const stageName = process.argv[4];

if (!moduleName || !stageName) {
  console.error('Usage: node run-stage.js <plan.json> <module> <stage>');
  process.exit(1);
}

try {
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const module = plan.modules.find(m => m.name === moduleName);
  
  if (!module) {
    console.error(`[FABRIKAGE] Module nicht gefunden: ${moduleName}`);
    process.exit(1);
  }
  
  if (!module.pipeline.includes(stageName)) {
    console.error(`[FABRIKAGE] Stage nicht in Pipeline: ${stageName}`);
    process.exit(1);
  }
  
  console.log(`[FABRIKAGE] Führe aus: ${moduleName} → ${stageName}`);
  
  // Stage-spezifische Logik
  switch(stageName) {
    case 'generate':
      console.log('  → Code-Generierung (DSL→Code)');
      break;
    case 'build':
      console.log('  → Build (Artefakte + SBOM + Checksums)');
      break;
    case 'test':
      console.log('  → Tests (Unit→Integration→E2E)');
      break;
    case 'package':
      console.log('  → Package (ZIP/Archive)');
      break;
    case 'publish':
      console.log('  → Publish (Deploy)');
      break;
  }
  
  console.log(`[FABRIKAGE] ${moduleName} → ${stageName}: OK`);
} catch(e) {
  console.error(`[FABRIKAGE] Stage Runner Fehler:`, e);
  process.exit(1);
}

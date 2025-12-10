// Sync Mirror - Initialize/Update Mirror from Existing Files
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

const fs = require('fs');
const path = require('path');
const CodeMirror = require('./code-mirror');

const mirror = new CodeMirror();

function syncMirror() {
  console.log('🔄 Syncing Mirror from existing files...\n');

  // Get all code files
  const codeFiles = [
    // Modular-Fabrikage
    'modular-fabrikage/js/factory-engine.js',
    'modular-fabrikage/js/module-system.js',
    'modular-fabrikage/js/link-system.js',
    'modular-fabrikage/js/data-model.js',
    'modular-fabrikage/js/main.js',
    'modular-fabrikage/js/api-integration.js',
    
    // XXXXXXLS-Fabrikage
    'xxxxxxls-fabrikage/server.js',
    'xxxxxxls-fabrikage/package.json',
    
    // API Modules
    'js/api-error-handler.js',
    'js/api-config-loader.js',
    'js/error-fix-system.js',
    
    // CI/CD
    'ci/spec-mirror/code-mirror.js',
    'ci/verifier-mesh/run-gate.js',
    'ci/orchestrator/evaluate-gates.js',
    'ci/orchestrator/generate-evidence.js',
    
    // Specs
    'specs/api/openapi.yaml',
    'specs/module-contracts/fabrikage-modules.md',
    'specs/events/event-schemas.json'
  ];

  let synced = 0;
  let failed = 0;

  for (const filePath of codeFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Validate
      const validation = mirror.validateCode(content, filePath);
      
      if (validation.valid) {
        // Sync to mirror
        const result = mirror.syncMirror(filePath, content);
        if (result) {
          console.log(`✅ Synced: ${filePath}`);
          synced++;
        } else {
          console.log(`❌ Failed to sync: ${filePath}`);
          failed++;
        }
      } else {
        console.log(`❌ Validation failed for ${filePath}:`);
        validation.errors.forEach(err => console.log(`    - ${err}`));
        failed++;
      }
    } catch (error) {
      console.error(`❌ Error syncing ${filePath}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Sync Summary:`);
  console.log(`   ✅ Synced: ${synced}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Total: ${codeFiles.length}`);

  if (failed === 0) {
    console.log(`\n✅ Mirror sync completed successfully`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Mirror sync completed with errors`);
    process.exit(1);
  }
}

// Run sync
syncMirror();




// Universal Prompt-to-Program Engine
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { parsePrompt, Intent } from './prompt_parser';
import { buildPlan, Plan } from './formula_selector';
import { emitPython } from './codegen/python';
import { emitNode } from './codegen/node';
import { emitRust } from './codegen/rust';
import { emitGo } from './codegen/go';
import { emitWebPWA } from './ui_synth/web';
import * as fs from 'fs';
import * as path from 'path';

export type EngineResult = {
  intent: Intent;
  plan: Plan;
  generated: {
    python?: string;
    node?: string;
    rust?: string;
    go?: string;
    web?: { html: string; css: string; js: string; manifest: string };
  };
  outputDir: string;
};

export class UniversalEngine {
  private outputBaseDir: string;

  constructor(outputBaseDir: string = './generated-programs') {
    this.outputBaseDir = outputBaseDir;
  }

  async process(promptText: string, targets: string[] = ['python', 'web']): Promise<EngineResult> {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  UNIVERSAL PROMPT-TO-PROGRAM ENGINE');
    console.log('  Version: 3.0.0');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    // 1. Parse Prompt
    console.log('📝 Parse Prompt...');
    const intent = parsePrompt(promptText);
    console.log(`   Domains: ${intent.domains.join(', ')}`);
    console.log(`   Targets: ${intent.targets.join(', ')}`);
    console.log(`   Privacy: ${intent.privacy}`);
    console.log(`   Performance: ${intent.performance}`);
    console.log('');

    // 2. Build Plan
    console.log('🔧 Build Plan...');
    const plan = buildPlan(intent);
    console.log(`   Category: ${plan.category}`);
    console.log(`   Formulas: ${plan.nodes.length}`);
    console.log(`   Inputs: ${plan.inputs.length}`);
    console.log(`   Outputs: ${plan.outputs.length}`);
    console.log('');

    // 3. Generate Code
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(this.outputBaseDir, `program-${timestamp}`);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const generated: EngineResult['generated'] = {};

    // Python
    if (targets.includes('python')) {
      console.log('🐍 Generate Python...');
      const pythonPath = path.join(outputDir, 'main.py');
      generated.python = emitPython(plan, pythonPath);
      console.log(`   ✅ ${pythonPath}`);
    }

    // Node.js
    if (targets.includes('node') || targets.includes('javascript') || targets.includes('typescript')) {
      console.log('📦 Generate Node.js...');
      const nodePath = path.join(outputDir, 'server.ts');
      generated.node = emitNode(plan, nodePath);
      console.log(`   ✅ ${nodePath}`);
    }

    // Rust
    if (targets.includes('rust')) {
      console.log('🦀 Generate Rust...');
      const rustPath = path.join(outputDir, 'main.rs');
      generated.rust = emitRust(plan, rustPath);
      console.log(`   ✅ ${rustPath}`);
    }

    // Go
    if (targets.includes('go')) {
      console.log('🐹 Generate Go...');
      const goPath = path.join(outputDir, 'main.go');
      generated.go = emitGo(plan, goPath);
      console.log(`   ✅ ${goPath}`);
    }

    // Web UI
    if (targets.includes('web') || targets.includes('ui')) {
      console.log('🌐 Generate Web UI...');
      const webDir = path.join(outputDir, 'web');
      generated.web = emitWebPWA(plan, webDir);
      console.log(`   ✅ ${webDir}/index.html`);
    }

    console.log('');
    console.log('✅ Programm generiert!');
    console.log(`   Output: ${outputDir}`);
    console.log('');

    return {
      intent,
      plan,
      generated,
      outputDir
    };
  }
}

// CLI
if (require.main === module) {
  const promptText = process.argv.slice(2).join(' ') || 
    'Erstelle ein Haushaltsbuch mit Solar-Energie-Berechnung und Finanz-Analyse';
  
  const targets = process.argv
    .find(arg => arg.startsWith('--targets='))
    ?.split('=')[1]
    ?.split(',') || ['python', 'web'];

  const engine = new UniversalEngine();
  engine.process(promptText, targets).then(result => {
    console.log('📊 Ergebnis:');
    console.log(JSON.stringify({
      category: result.plan.category,
      formulas: result.plan.nodes.length,
      generated: Object.keys(result.generated)
    }, null, 2));
  }).catch(e => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  });
}



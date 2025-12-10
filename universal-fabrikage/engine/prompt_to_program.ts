// Universal Prompt-to-Program Engine
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { parsePrompt, Intent } from './prompt_parser';
import { buildPlan, Plan } from './formula_selector';
import { generateCode, Language } from './codegen';
import { emitWebPWA } from './ui_synth/web';
import * as fs from 'fs';
import * as path from 'path';

export type GenerationResult = {
  intent: Intent;
  plan: Plan;
  files: {
    language: Language;
    path: string;
    code: string;
  }[];
  ui?: {
    html: string;
    css: string;
    js: string;
    manifest: string;
  };
  metadata: {
    category: string;
    domains: string[];
    targets: string[];
    timestamp: string;
  };
};

export function promptToProgram(promptText: string, outputDir: string = './generated-program'): GenerationResult {
  // 1. Parse Prompt
  const intent = parsePrompt(promptText);
  console.log('📝 Intent parsed:', intent);

  // 2. Build Plan
  const plan = buildPlan(intent);
  console.log('📊 Plan built:', plan.category);

  // 3. Generate Code für alle Targets
  const languages: Language[] = [];
  if (intent.targets.includes('web')) {
    languages.push('python', 'javascript', 'typescript');
  }
  if (intent.targets.includes('mobile')) {
    languages.push('swift', 'kotlin');
  }
  if (intent.targets.includes('desktop')) {
    languages.push('java', 'cpp', 'csharp');
  }
  if (intent.targets.includes('cli')) {
    languages.push('rust', 'go');
  }
  if (languages.length === 0) {
    languages.push('python', 'javascript');
  }

  const files: GenerationResult['files'] = [];
  languages.forEach(lang => {
    try {
      const code = generateCode(plan, intent, lang);
      const ext = getExtension(lang);
      const filepath = path.join(outputDir, `program.${ext}`);
      
      files.push({
        language: lang,
        path: filepath,
        code
      });
    } catch (e) {
      console.error(`❌ Failed to generate ${lang}:`, e);
    }
  });

  // 4. Generate UI (wenn Web-Target)
  let ui: GenerationResult['ui'] | undefined;
  if (intent.targets.includes('web')) {
    ui = emitWebPWA(plan, intent);
  }

  // 5. Save Files
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  files.forEach(file => {
    fs.writeFileSync(file.path, file.code, 'utf8');
  });

  if (ui) {
    fs.writeFileSync(path.join(outputDir, 'index.html'), ui.html, 'utf8');
    fs.writeFileSync(path.join(outputDir, 'style.css'), ui.css, 'utf8');
    fs.writeFileSync(path.join(outputDir, 'app.js'), ui.js, 'utf8');
    fs.writeFileSync(path.join(outputDir, 'manifest.json'), ui.manifest, 'utf8');
  }

  // 6. Generate Metadata
  const metadata = {
    category: plan.category,
    domains: intent.domains,
    targets: intent.targets,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf8'
  );

  return {
    intent,
    plan,
    files,
    ui,
    metadata
  };
}

function getExtension(lang: Language): string {
  const extensions: Record<Language, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    rust: 'rs',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    swift: 'swift',
    kotlin: 'kt'
  };
  return extensions[lang] || 'txt';
}

// CLI
if (require.main === module) {
  const prompt = process.argv.slice(2).join(' ') || "Erstelle ein Haushaltsbuch mit Solar-Energie-Berechnung";
  const outputDir = process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1] || './generated-program';

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  UNIVERSAL PROMPT-TO-PROGRAM ENGINE');
  console.log('  Version: 3.0.0');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📝 Prompt: ${prompt}`);
  console.log(`📁 Output: ${outputDir}`);
  console.log('');

  const result = promptToProgram(prompt, outputDir);

  console.log('✅ Programm generiert!');
  console.log(`   Kategorie: ${result.metadata.category}`);
  console.log(`   Domains: ${result.metadata.domains.join(', ')}`);
  console.log(`   Targets: ${result.metadata.targets.join(', ')}`);
  console.log(`   Dateien: ${result.files.length}`);
  if (result.ui) {
    console.log(`   UI: index.html, style.css, app.js, manifest.json`);
  }
  console.log('');
}

module.exports = { promptToProgram, GenerationResult };



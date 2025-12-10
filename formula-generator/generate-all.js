// Generate All Languages - Generiert Code in allen Sprachen
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const CodeGenerator = require('./code-generator');
const UIGenerator = require('./ui-generator');
const fs = require('fs');
const path = require('path');

const formulaIds = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const outputDir = process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1] || './generated-all';

if (formulaIds.length === 0) {
  console.error('❌ Keine Formeln angegeben');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════════════');
console.log('  GENERATE ALL LANGUAGES');
console.log('  Version: 3.0.0');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

const languages = ['python', 'javascript', 'typescript', 'rust', 'go', 'java', 'cpp', 'csharp', 'swift', 'kotlin'];
const generator = new CodeGenerator();
const uiGenerator = new UIGenerator();

console.log(`📊 Formeln: ${formulaIds.join(', ')}`);
console.log(`📁 Output: ${outputDir}`);
console.log('');

// Generiere Code in allen Sprachen
const results = [];
languages.forEach(lang => {
  try {
    const result = generator.generate(formulaIds, lang, outputDir);
    results.push({ language: lang, ...result });
    console.log(`✅ ${lang}: ${result.filepath}`);
  } catch (e) {
    console.error(`❌ ${lang}: ${e.message}`);
  }
});

// Generiere UI
try {
  const uiResult = uiGenerator.generate(formulaIds, path.join(outputDir, 'ui'));
  console.log(`✅ UI: ${uiResult.files.join(', ')}`);
  results.push({ type: 'ui', ...uiResult });
} catch (e) {
  console.error(`❌ UI: ${e.message}`);
}

console.log('');
console.log(`✅ ${results.length} Dateien generiert`);
console.log('');

// Erstelle README
const readme = `# Auto-Generated Program

**Program Type:** ${results[0]?.programType || 'Unknown'}
**Generated:** ${new Date().toISOString()}
**Formulas:** ${formulaIds.join(', ')}

## Generated Files

${results.map(r => `- ${r.language || r.type}: ${r.filepath || r.files?.join(', ')}`).join('\n')}

## How to Run

### Python
\`\`\`bash
python generated_program.py
\`\`\`

### JavaScript
\`\`\`bash
node generated_program.js
\`\`\`

### TypeScript
\`\`\`bash
tsc generated_program.ts && node generated_program.js
\`\`\`

### Rust
\`\`\`bash
rustc generated_program.rs && ./generated_program
\`\`\`

### Go
\`\`\`bash
go run generated_program.go
\`\`\`

### Java
\`\`\`bash
javac GeneratedProgram.java && java GeneratedProgram
\`\`\`

### C++
\`\`\`bash
g++ generated_program.cpp -o generated_program && ./generated_program
\`\`\`

### C#
\`\`\`bash
csc GeneratedProgram.cs && GeneratedProgram.exe
\`\`\`

### Swift
\`\`\`bash
swift generated_program.swift
\`\`\`

### Kotlin
\`\`\`bash
kotlinc generated_program.kt -include-runtime -d generated_program.jar && java -jar generated_program.jar
\`\`\`

### UI (Web)
\`\`\`bash
cd ui && python -m http.server 8000
\`\`\`
Dann öffne: http://localhost:8000

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture
**VERSION:** 3.0.0
`;

const fs = require('fs');
const path = require('path');
fs.writeFileSync(path.join(outputDir, 'README.md'), readme, 'utf8');

console.log('📄 README.md erstellt');
console.log('');
console.log('BRANDING: .T. TogetherSystems - ModularFlux Architecture');
console.log('STANDARD: IBM STANDARD - PERMANENT AKTIV');



// Example Test - Demonstriert das System
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const CodeGenerator = require('./code-generator');
const UIGenerator = require('./ui-generator');
const FormulaGraph = require('./formula-graph');
const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log('  FORMULA PROGRAM GENERATOR - EXAMPLE TEST');
console.log('  Version: 3.0.0');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Test: Zinseszins + Solar + Zeitreihen
const formulaIds = ['F000001', 'F000002', 'F000003'];
const outputDir = './generated-example';

console.log('📊 Test-Formeln:');
formulaIds.forEach(id => console.log(`   - ${id}`));
console.log('');

// Lade Graph
const graph = new FormulaGraph();
graph.loadFormulas();
graph.buildGraph(formulaIds);

console.log('📊 Graph-Info:');
console.log(`   Knoten: ${graph.graph.nodes.length}`);
console.log(`   Kanten: ${graph.graph.edges.length}`);
console.log(`   Eingaben: ${graph.graph.inputs.length}`);
console.log(`   Ausgaben: ${graph.graph.outputs.length}`);
console.log('');

// Vorhersage
const programType = graph.predictProgramType();
console.log('🔮 Programm-Vorhersage:');
console.log(`   Typ: ${programType}`);
console.log('');

// Generiere Code in Python (Beispiel)
console.log('🔧 Generiere Python-Code...');
const generator = new CodeGenerator();
try {
  const result = generator.generate(formulaIds, 'python', outputDir);
  console.log(`✅ Python-Code generiert: ${result.filepath}`);
  console.log('');
  console.log('📄 Code (erste 20 Zeilen):');
  console.log('─'.repeat(60));
  const codeLines = result.code.split('\n').slice(0, 20);
  codeLines.forEach(line => console.log(line));
  console.log('─'.repeat(60));
  console.log('');
} catch (e) {
  console.error(`❌ Fehler: ${e.message}`);
}

// Generiere UI
console.log('🎨 Generiere Web-UI...');
const uiGenerator = new UIGenerator();
try {
  const uiResult = uiGenerator.generate(formulaIds, path.join(outputDir, 'ui'));
  console.log(`✅ UI generiert:`);
  uiResult.files.forEach(file => console.log(`   - ${file}`));
  console.log('');
} catch (e) {
  console.error(`❌ Fehler: ${e.message}`);
}

console.log('✅ Beispiel-Test abgeschlossen');
console.log('');
console.log('📝 Nächste Schritte:');
console.log('   1. Öffne generated-example/ui/index.html im Browser');
console.log('   2. Führe generated-example/generated_program.py aus');
console.log('   3. Teste andere Formel-Kombinationen');
console.log('');
console.log('BRANDING: .T. TogetherSystems - ModularFlux Architecture');
console.log('STANDARD: IBM STANDARD - PERMANENT AKTIV');



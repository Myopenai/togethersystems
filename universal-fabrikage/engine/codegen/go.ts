// Go Code Generator
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import * as fs from 'fs';
import * as path from 'path';

export function emitGo(plan: Plan, outputPath: string): string {
  let code = `// Auto-generated Program: ${plan.category}\n`;
  code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
  code += `// Generated: ${new Date().toISOString()}\n`;
  code += `// Reason: ${plan.reason}\n\n`;

  code += `package main\n\n`;
  code += `import (\n`;
  code += `    "fmt"\n`;
  code += `    "math"\n`;
  code += `)\n\n`;

  // Formel-Implementierungen
  code += `// ============================================\n`;
  code += `// FORMEL-IMPLEMENTIERUNGEN\n`;
  code += `// ============================================\n\n`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    code += `// ${formula.name} (${formula.id})\n`;
    
    if (formula.implementation?.go) {
      code += `${formula.implementation.go}\n\n`;
    } else {
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '');
      const params = formula.inputs.map(i => `${i.name.toLowerCase()} float64`).join(', ');
      code += `func ${funcName}(${params}) float64 {\n`;
      code += `    // TODO: Implementiere ${formula.name}\n`;
      code += `    return 0.0\n`;
      code += `}\n\n`;
    }
  });

  // Hauptfunktion
  code += `// ============================================\n`;
  code += `// HAUPTFUNKTION\n`;
  code += `// ============================================\n\n`;

  code += `func main() {\n`;
  code += `    fmt.Println(strings.Repeat("=", 60))\n`;
  code += `    fmt.Printf("  %s\\n", "${plan.category}")\n`;
  code += `    fmt.Println(strings.Repeat("=", 60))\n`;
  code += `    fmt.Println()\n\n`;

  // Eingaben
  code += `    // Eingaben\n`;
  plan.inputs.forEach(input => {
    const varName = input.toLowerCase();
    code += `    var ${varName} float64\n`;
    code += `    fmt.Printf("${input}: ")\n`;
    code += `    fmt.Scan(&${varName})\n`;
  });

  code += `\n    // Berechnungen\n`;
  
  const variables = new Map<string, string>();
  plan.inputs.forEach(input => {
    variables.set(input, input.toLowerCase());
  });

  plan.nodes.forEach(node => {
    const formula = node.formula;
    const funcName = formula.implementation?.go
      ? formula.implementation.go.match(/func\s+(\w+)/)?.[1]
      : formula.name.toLowerCase().replace(/\s+/g, '');
    
    if (!funcName) return;

    const args = formula.inputs.map(input => {
      const varName = variables.get(input.name) || input.name.toLowerCase();
      return varName;
    }).join(', ');

    const outputVar = formula.output.name.toLowerCase();
    code += `    ${outputVar} := ${funcName}(${args})\n`;
    code += `    fmt.Printf("${formula.output.name}: %f %s\\n", ${outputVar}, "${formula.output.dimension || formula.output.unit || ''}")\n`;
    
    variables.set(formula.output.name, outputVar);
  });

  code += `}\n`;

  // Speichere Code
  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, code, 'utf8');
  }

  return code;
}



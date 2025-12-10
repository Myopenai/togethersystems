// Rust Code Generator
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import * as fs from 'fs';
import * as path from 'path';

export function emitRust(plan: Plan, outputPath: string): string {
  let code = `// Auto-generated Program: ${plan.category}\n`;
  code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
  code += `// Generated: ${new Date().toISOString()}\n`;
  code += `// Reason: ${plan.reason}\n\n`;

  code += `use std::io;\n\n`;

  // Formel-Implementierungen
  code += `// ============================================\n`;
  code += `// FORMEL-IMPLEMENTIERUNGEN\n`;
  code += `// ============================================\n\n`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    code += `// ${formula.name} (${formula.id})\n`;
    
    if (formula.implementation?.rust) {
      code += `${formula.implementation.rust}\n\n`;
    } else {
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '_');
      const params = formula.inputs.map(i => `${i.name.toLowerCase()}: f64`).join(', ');
      code += `fn ${funcName}(${params}) -> f64 {\n`;
      code += `    // TODO: Implementiere ${formula.name}\n`;
      code += `    0.0\n`;
      code += `}\n\n`;
    }
  });

  // Hauptfunktion
  code += `// ============================================\n`;
  code += `// HAUPTFUNKTION\n`;
  code += `// ============================================\n\n`;

  code += `fn main() {\n`;
  code += `    println!("{}", "=".repeat(60));\n`;
  code += `    println!("  {}", "${plan.category}");\n`;
  code += `    println!("{}", "=".repeat(60));\n`;
  code += `    println!();\n\n`;

  // Eingaben
  code += `    // Eingaben\n`;
  plan.inputs.forEach(input => {
    const varName = input.toLowerCase();
    code += `    let mut ${varName} = String::new();\n`;
    code += `    println!("${input}: ");\n`;
    code += `    io::stdin().read_line(&mut ${varName}).expect("Failed to read");\n`;
    code += `    let ${varName}: f64 = ${varName}.trim().parse().expect("Invalid number");\n`;
  });

  code += `\n    // Berechnungen\n`;
  
  const variables = new Map<string, string>();
  plan.inputs.forEach(input => {
    variables.set(input, input.toLowerCase());
  });

  plan.nodes.forEach(node => {
    const formula = node.formula;
    const funcName = formula.implementation?.rust
      ? formula.implementation.rust.match(/fn\s+(\w+)/)?.[1]
      : formula.name.toLowerCase().replace(/\s+/g, '_');
    
    if (!funcName) return;

    const args = formula.inputs.map(input => {
      const varName = variables.get(input.name) || input.name.toLowerCase();
      return varName;
    }).join(', ');

    const outputVar = formula.output.name.toLowerCase();
    code += `    let ${outputVar} = ${funcName}(${args});\n`;
    code += `    println!("{}: {} {}", "${formula.output.name}", ${outputVar}, "${formula.output.dimension || formula.output.unit || ''}");\n`;
    
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



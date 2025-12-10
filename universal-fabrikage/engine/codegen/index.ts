// Code Generator Index - Multi-Language Support
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import { Intent } from '../prompt_parser';
import { emitPython } from './python';
import { emitNode } from './node';

export type Language = 'python' | 'javascript' | 'typescript' | 'rust' | 'go' | 'java' | 'cpp' | 'csharp' | 'swift' | 'kotlin';

export function generateCode(plan: Plan, intent: Intent, language: Language): string {
  switch (language) {
    case 'python':
      return emitPython(plan, intent);
    case 'javascript':
    case 'typescript':
      return emitNode(plan, intent);
    case 'rust':
      return emitRust(plan, intent);
    case 'go':
      return emitGo(plan, intent);
    case 'java':
      return emitJava(plan, intent);
    case 'cpp':
      return emitCpp(plan, intent);
    case 'csharp':
      return emitCSharp(plan, intent);
    case 'swift':
      return emitSwift(plan, intent);
    case 'kotlin':
      return emitKotlin(plan, intent);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

// Vollständige Implementierungen für alle Sprachen
function emitRust(plan: Plan, intent: Intent): string {
  let code = `// Auto-generated Program: ${plan.category}\n`;
  code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
  code += `// Generated: ${new Date().toISOString()}\n\n`;
  code += `use std::io;\n\n`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    if (formula.implementation?.rust) {
      code += `${formula.implementation.rust}\n\n`;
    } else {
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '_');
      code += `fn ${funcName}(${formula.inputs.map(i => `${i.name.toLowerCase()}: f64`).join(', ')}) -> f64 {\n`;
      code += `    // ${formula.name}\n`;
      code += `    0.0\n`;
      code += `}\n\n`;
    }
  });

  code += `fn main() {\n`;
  plan.inputs.forEach(input => {
    code += `    let mut ${input.toLowerCase()} = String::new();\n`;
    code += `    println!("${input}: ");\n`;
    code += `    io::stdin().read_line(&mut ${input.toLowerCase()}).expect("Failed");\n`;
    code += `    let ${input.toLowerCase()}: f64 = ${input.toLowerCase()}.trim().parse().expect("Invalid");\n`;
  });
  code += `\n    // Berechnungen\n`;
  const variables = new Map<string, string>();
  plan.nodes.forEach(node => {
    const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '_');
    const args = node.formula.inputs.map(i => variables.get(i.name) || i.name.toLowerCase()).join(', ');
    const outputVar = node.formula.output.name.toLowerCase();
    code += `    let ${outputVar} = ${funcName}(${args});\n`;
    code += `    println!("${node.formula.output.name}: {} ${node.formula.output.dimension || ''}", ${outputVar});\n`;
    variables.set(node.formula.output.name, outputVar);
  });
  code += `}\n`;
  return code;
}

function emitGo(plan: Plan, intent: Intent): string {
  let code = `// Auto-generated Program: ${plan.category}\n`;
  code += `package main\n\n`;
  code += `import (\n    "fmt"\n    "math"\n)\n\n`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    if (formula.implementation?.go) {
      code += `${formula.implementation.go}\n\n`;
    } else {
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '');
      code += `func ${funcName}(${formula.inputs.map(i => `${i.name.toLowerCase()} float64`).join(', ')}) float64 {\n`;
      code += `    // ${formula.name}\n`;
      code += `    return 0.0\n`;
      code += `}\n\n`;
    }
  });

  code += `func main() {\n`;
  plan.inputs.forEach(input => {
    code += `    var ${input.toLowerCase()} float64\n`;
    code += `    fmt.Printf("${input}: ")\n`;
    code += `    fmt.Scan(&${input.toLowerCase()})\n`;
  });
  code += `\n    // Berechnungen\n`;
  const variables = new Map<string, string>();
  plan.nodes.forEach(node => {
    const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '');
    const args = node.formula.inputs.map(i => variables.get(i.name) || i.name.toLowerCase()).join(', ');
    const outputVar = node.formula.output.name.toLowerCase();
    code += `    ${outputVar} := ${funcName}(${args})\n`;
    code += `    fmt.Printf("${node.formula.output.name}: %f %s\\n", ${outputVar}, "${node.formula.output.dimension || ''}")\n`;
    variables.set(node.formula.output.name, outputVar);
  });
  code += `}\n`;
  return code;
}

function emitJava(plan: Plan, intent: Intent): string {
  let code = `// Auto-generated Program: ${plan.category}\n`;
  code += `import java.util.Scanner;\n\n`;
  code += `public class GeneratedProgram {\n\n`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    if (formula.implementation?.java) {
      code += `    ${formula.implementation.java}\n\n`;
    } else {
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '');
      code += `    public static double ${funcName}(${formula.inputs.map(i => `double ${i.name.toLowerCase()}`).join(', ')}) {\n`;
      code += `        // ${formula.name}\n`;
      code += `        return 0.0;\n`;
      code += `    }\n\n`;
    }
  });

  code += `    public static void main(String[] args) {\n`;
  code += `        Scanner scanner = new Scanner(System.in);\n`;
  plan.inputs.forEach(input => {
    code += `        System.out.print("${input}: ");\n`;
    code += `        double ${input.toLowerCase()} = scanner.nextDouble();\n`;
  });
  code += `\n        // Berechnungen\n`;
  const variables = new Map<string, string>();
  plan.nodes.forEach(node => {
    const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '');
    const args = node.formula.inputs.map(i => variables.get(i.name) || i.name.toLowerCase()).join(', ');
    const outputVar = node.formula.output.name.toLowerCase();
    code += `        double ${outputVar} = ${funcName}(${args});\n`;
    code += `        System.out.println("${node.formula.output.name}: " + ${outputVar} + " ${node.formula.output.dimension || ''}");\n`;
    variables.set(node.formula.output.name, outputVar);
  });
  code += `    }\n`;
  code += `}\n`;
  return code;
}

function emitCpp(plan: Plan, intent: Intent): string {
  let code = `// Auto-generated Program: ${plan.category}\n`;
  code += `#include <iostream>\n#include <cmath>\nusing namespace std;\n\n`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    if (formula.implementation?.cpp) {
      code += `${formula.implementation.cpp}\n\n`;
    } else {
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '');
      code += `double ${funcName}(${formula.inputs.map(i => `double ${i.name.toLowerCase()}`).join(', ')}) {\n`;
      code += `    // ${formula.name}\n`;
      code += `    return 0.0;\n`;
      code += `}\n\n`;
    }
  });

  code += `int main() {\n`;
  plan.inputs.forEach(input => {
    code += `    double ${input.toLowerCase()};\n`;
    code += `    cout << "${input}: ";\n`;
    code += `    cin >> ${input.toLowerCase()};\n`;
  });
  code += `\n    // Berechnungen\n`;
  const variables = new Map<string, string>();
  plan.nodes.forEach(node => {
    const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '');
    const args = node.formula.inputs.map(i => variables.get(i.name) || i.name.toLowerCase()).join(', ');
    const outputVar = node.formula.output.name.toLowerCase();
    code += `    double ${outputVar} = ${funcName}(${args});\n`;
    code += `    cout << "${node.formula.output.name}: " << ${outputVar} << " ${node.formula.output.dimension || ''}" << endl;\n`;
    variables.set(node.formula.output.name, outputVar);
  });
  code += `    return 0;\n`;
  code += `}\n`;
  return code;
}

function emitCSharp(plan: Plan, intent: Intent): string {
  let code = `// Auto-generated Program: ${plan.category}\n`;
  code += `using System;\n\n`;
  code += `class GeneratedProgram {\n\n`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    if (formula.implementation?.csharp) {
      code += `    ${formula.implementation.csharp}\n\n`;
    } else {
      const funcName = formula.name.charAt(0).toUpperCase() + formula.name.slice(1).toLowerCase().replace(/\s+/g, '');
      code += `    public static double ${funcName}(${formula.inputs.map(i => `double ${i.name.toLowerCase()}`).join(', ')}) {\n`;
      code += `        // ${formula.name}\n`;
      code += `        return 0.0;\n`;
      code += `    }\n\n`;
    }
  });

  code += `    static void Main() {\n`;
  plan.inputs.forEach(input => {
    code += `        Console.Write("${input}: ");\n`;
    code += `        double ${input.toLowerCase()} = Convert.ToDouble(Console.ReadLine());\n`;
  });
  code += `\n        // Berechnungen\n`;
  const variables = new Map<string, string>();
  plan.nodes.forEach(node => {
    const funcName = node.formula.name.charAt(0).toUpperCase() + node.formula.name.slice(1).toLowerCase().replace(/\s+/g, '');
    const args = node.formula.inputs.map(i => variables.get(i.name) || i.name.toLowerCase()).join(', ');
    const outputVar = node.formula.output.name.toLowerCase();
    code += `        double ${outputVar} = ${funcName}(${args});\n`;
    code += `        Console.WriteLine("${node.formula.output.name}: " + ${outputVar} + " ${node.formula.output.dimension || ''}");\n`;
    variables.set(node.formula.output.name, outputVar);
  });
  code += `    }\n`;
  code += `}\n`;
  return code;
}

function emitSwift(plan: Plan, intent: Intent): string {
  let code = `// Auto-generated Program: ${plan.category}\n`;
  code += `import Foundation\n\n`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    if (formula.implementation?.swift) {
      code += `${formula.implementation.swift}\n\n`;
    } else {
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '');
      code += `func ${funcName}(${formula.inputs.map(i => `${i.name.toLowerCase()}: Double`).join(', ')}) -> Double {\n`;
      code += `    // ${formula.name}\n`;
      code += `    return 0.0\n`;
      code += `}\n\n`;
    }
  });

  code += `func main() {\n`;
  plan.inputs.forEach(input => {
    code += `    print("${input}: ", terminator: "")\n`;
    code += `    let ${input.toLowerCase()} = Double(readLine() ?? "0") ?? 0\n`;
  });
  code += `\n    // Berechnungen\n`;
  const variables = new Map<string, string>();
  plan.nodes.forEach(node => {
    const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '');
    const args = node.formula.inputs.map(i => `${i.name.toLowerCase()}: ${variables.get(i.name) || i.name.toLowerCase()}`).join(', ');
    const outputVar = node.formula.output.name.toLowerCase();
    code += `    let ${outputVar} = ${funcName}(${args})\n`;
    code += `    print("${node.formula.output.name}: \\(${outputVar}) ${node.formula.output.dimension || ''}")\n`;
    variables.set(node.formula.output.name, outputVar);
  });
  code += `}\n\n`;
  code += `main()\n`;
  return code;
}

function emitKotlin(plan: Plan, intent: Intent): string {
  let code = `// Auto-generated Program: ${plan.category}\n\n`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    if (formula.implementation?.kotlin) {
      code += `${formula.implementation.kotlin}\n\n`;
    } else {
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '');
      code += `fun ${funcName}(${formula.inputs.map(i => `${i.name.toLowerCase()}: Double`).join(', ')}): Double {\n`;
      code += `    // ${formula.name}\n`;
      code += `    return 0.0\n`;
      code += `}\n\n`;
    }
  });

  code += `fun main() {\n`;
  plan.inputs.forEach(input => {
    code += `    print("${input}: ")\n`;
    code += `    val ${input.toLowerCase()} = readLine()?.toDouble() ?: 0.0\n`;
  });
  code += `\n    // Berechnungen\n`;
  const variables = new Map<string, string>();
  plan.nodes.forEach(node => {
    const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '');
    const args = node.formula.inputs.map(i => variables.get(i.name) || i.name.toLowerCase()).join(', ');
    const outputVar = node.formula.output.name.toLowerCase();
    code += `    val ${outputVar} = ${funcName}(${args})\n`;
    code += `    println("${node.formula.output.name}: $${outputVar} ${node.formula.output.dimension || ''}")\n`;
    variables.set(node.formula.output.name, outputVar);
  });
  code += `}\n`;
  return code;
}

module.exports = { generateCode, Language };



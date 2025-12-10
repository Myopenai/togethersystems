// Code Generator - Generiert Code aus Formel-Graph
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');
const FormulaGraph = require('./formula-graph');

class CodeGenerator {
  constructor() {
    this.supportedLanguages = [
      'python', 'javascript', 'typescript', 'rust', 'go', 
      'java', 'cpp', 'csharp', 'swift', 'kotlin'
    ];
  }

  generate(formulaIds, language = 'python', outputDir = './generated') {
    const graph = new FormulaGraph();
    graph.loadFormulas();
    graph.buildGraph(formulaIds);
    
    const programType = graph.predictProgramType();
    const executionOrder = graph.getExecutionOrder();

    if (!this.supportedLanguages.includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const code = this.generateCode(graph, executionOrder, language, programType);
    
    // Speichere generierten Code
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = this.getFilename(language);
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, code, 'utf8');

    return {
      language,
      programType,
      filepath,
      code
    };
  }

  generateCode(graph, executionOrder, language, programType) {
    const templates = {
      python: this.generatePython,
      javascript: this.generateJavaScript,
      typescript: this.generateTypeScript,
      rust: this.generateRust,
      go: this.generateGo,
      java: this.generateJava,
      cpp: this.generateCpp,
      csharp: this.generateCSharp,
      swift: this.generateSwift,
      kotlin: this.generateKotlin
    };

    return templates[language].call(this, graph, executionOrder, programType);
  }

  generatePython(graph, executionOrder, programType) {
    let code = `# Auto-generated Program: ${programType}\n`;
    code += `# BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `# Generated: ${new Date().toISOString()}\n\n`;

    // Importiere Formeln
    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.python) {
        code += `${formula.implementation.python}\n\n`;
      }
    });

    // Hauptfunktion
    code += `def main():\n`;
    code += `    # Eingaben\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `    ${inputNode.name} = float(input("${inputNode.name} (${inputNode.dimension || ''}): "))\n`;
      }
    });

    code += `\n    # Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach((node, index) => {
      const formula = node.formula;
      const funcName = formula.implementation.python.match(/def\s+(\w+)/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return varName;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `    ${outputVar} = ${funcName}(${args})\n`;
      code += `    print(f"${formula.output.name}: {${outputVar}} ${formula.output.dimension || ''}")\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `\n    # Ausgaben\n`;
    graph.graph.outputs.forEach(outputId => {
      const outputNode = graph.graph.nodes.find(n => n.id === outputId);
      if (outputNode) {
        const varName = outputNode.name.toLowerCase();
        code += `    print(f"Final ${outputNode.name}: {${varName}}")\n`;
      }
    });

    code += `\n\nif __name__ == "__main__":\n`;
    code += `    main()\n`;

    return code;
  }

  generateJavaScript(graph, executionOrder, programType) {
    let code = `// Auto-generated Program: ${programType}\n`;
    code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `// Generated: ${new Date().toISOString()}\n\n`;

    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.javascript) {
        code += `${formula.implementation.javascript}\n\n`;
      }
    });

    code += `function main() {\n`;
    code += `    // Eingaben (vereinfacht)\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `    const ${inputNode.name.toLowerCase()} = parseFloat(prompt("${inputNode.name} (${inputNode.dimension || ''}): "));\n`;
      }
    });

    code += `\n    // Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach(node => {
      const formula = node.formula;
      const funcName = formula.implementation.javascript.match(/function\s+(\w+)/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return varName;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `    const ${outputVar} = ${funcName}(${args});\n`;
      code += `    console.log("${formula.output.name}:", ${outputVar}, "${formula.output.dimension || ''}");\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `}\n\n`;
    code += `main();\n`;

    return code;
  }

  generateTypeScript(graph, executionOrder, programType) {
    let code = `// Auto-generated Program: ${programType}\n`;
    code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `// Generated: ${new Date().toISOString()}\n\n`;

    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.typescript) {
        code += `${formula.implementation.typescript}\n\n`;
      }
    });

    code += `function main(): void {\n`;
    code += `    // Eingaben\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `    const ${inputNode.name.toLowerCase()}: number = parseFloat(prompt("${inputNode.name} (${inputNode.dimension || ''}): ") || "0");\n`;
      }
    });

    code += `\n    // Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach(node => {
      const formula = node.formula;
      const funcName = formula.implementation.typescript.match(/function\s+(\w+)/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return varName;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `    const ${outputVar}: number = ${funcName}(${args});\n`;
      code += `    console.log("${formula.output.name}:", ${outputVar}, "${formula.output.dimension || ''}");\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `}\n\n`;
    code += `main();\n`;

    return code;
  }

  generateRust(graph, executionOrder, programType) {
    let code = `// Auto-generated Program: ${programType}\n`;
    code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `// Generated: ${new Date().toISOString()}\n\n`;
    code += `use std::io;\n\n`;

    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.rust) {
        code += `${formula.implementation.rust}\n\n`;
      }
    });

    code += `fn main() {\n`;
    code += `    // Eingaben\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `    let mut ${inputNode.name.toLowerCase()} = String::new();\n`;
        code += `    println!("${inputNode.name} (${inputNode.dimension || ''}): ");\n`;
        code += `    io::stdin().read_line(&mut ${inputNode.name.toLowerCase()}).expect("Failed to read");\n`;
        code += `    let ${inputNode.name.toLowerCase()}: f64 = ${inputNode.name.toLowerCase()}.trim().parse().expect("Invalid number");\n`;
      }
    });

    code += `\n    // Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach(node => {
      const formula = node.formula;
      const funcName = formula.implementation.rust.match(/fn\s+(\w+)/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return varName;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `    let ${outputVar} = ${funcName}(${args});\n`;
      code += `    println!("${formula.output.name}: {} ${formula.output.dimension || ''}", ${outputVar});\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `}\n`;

    return code;
  }

  generateGo(graph, executionOrder, programType) {
    let code = `// Auto-generated Program: ${programType}\n`;
    code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `// Generated: ${new Date().toISOString()}\n\n`;
    code += `package main\n\n`;
    code += `import (\n`;
    code += `    "fmt"\n`;
    code += `    "math"\n`;
    code += `)\n\n`;

    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.go) {
        code += `${formula.implementation.go}\n\n`;
      }
    });

    code += `func main() {\n`;
    code += `    // Eingaben (vereinfacht)\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `    var ${inputNode.name.toLowerCase()} float64\n`;
        code += `    fmt.Printf("${inputNode.name} (${inputNode.dimension || ''}): ")\n`;
        code += `    fmt.Scan(&${inputNode.name.toLowerCase()})\n`;
      }
    });

    code += `\n    // Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach(node => {
      const formula = node.formula;
      const funcName = formula.implementation.go.match(/func\s+(\w+)/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return varName;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `    ${outputVar} := ${funcName}(${args})\n`;
      code += `    fmt.Printf("${formula.output.name}: %f %s\\n", ${outputVar}, "${formula.output.dimension || ''}")\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `}\n`;

    return code;
  }

  generateJava(graph, executionOrder, programType) {
    let code = `// Auto-generated Program: ${programType}\n`;
    code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `// Generated: ${new Date().toISOString()}\n\n`;
    code += `import java.util.Scanner;\n\n`;
    code += `public class GeneratedProgram {\n\n`;

    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.java) {
        code += `    ${formula.implementation.java}\n\n`;
      }
    });

    code += `    public static void main(String[] args) {\n`;
    code += `        Scanner scanner = new Scanner(System.in);\n`;
    code += `        // Eingaben\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `        System.out.print("${inputNode.name} (${inputNode.dimension || ''}): ");\n`;
        code += `        double ${inputNode.name.toLowerCase()} = scanner.nextDouble();\n`;
      }
    });

    code += `\n        // Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach(node => {
      const formula = node.formula;
      const funcName = formula.implementation.java.match(/public static double (\w+)/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return varName;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `        double ${outputVar} = ${funcName}(${args});\n`;
      code += `        System.out.println("${formula.output.name}: " + ${outputVar} + " ${formula.output.dimension || ''}");\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `    }\n`;
    code += `}\n`;

    return code;
  }

  generateCpp(graph, executionOrder, programType) {
    let code = `// Auto-generated Program: ${programType}\n`;
    code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `// Generated: ${new Date().toISOString()}\n\n`;
    code += `#include <iostream>\n`;
    code += `#include <vector>\n`;
    code += `#include <cmath>\n`;
    code += `#include <numeric>\n`;
    code += `using namespace std;\n\n`;

    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.cpp) {
        code += `${formula.implementation.cpp}\n\n`;
      }
    });

    code += `int main() {\n`;
    code += `    // Eingaben\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `    double ${inputNode.name.toLowerCase()};\n`;
        code += `    cout << "${inputNode.name} (${inputNode.dimension || ''}): ";\n`;
        code += `    cin >> ${inputNode.name.toLowerCase()};\n`;
      }
    });

    code += `\n    // Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach(node => {
      const formula = node.formula;
      const funcName = formula.implementation.cpp.match(/(\w+)\s*\(/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return varName;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `    double ${outputVar} = ${funcName}(${args});\n`;
      code += `    cout << "${formula.output.name}: " << ${outputVar} << " ${formula.output.dimension || ''}" << endl;\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `    return 0;\n`;
    code += `}\n`;

    return code;
  }

  generateCSharp(graph, executionOrder, programType) {
    let code = `// Auto-generated Program: ${programType}\n`;
    code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `// Generated: ${new Date().toISOString()}\n\n`;
    code += `using System;\n\n`;
    code += `class GeneratedProgram {\n\n`;

    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.csharp) {
        code += `    ${formula.implementation.csharp}\n\n`;
      }
    });

    code += `    static void Main() {\n`;
    code += `        // Eingaben\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `        Console.Write("${inputNode.name} (${inputNode.dimension || ''}): ");\n`;
        code += `        double ${inputNode.name.toLowerCase()} = Convert.ToDouble(Console.ReadLine());\n`;
      }
    });

    code += `\n        // Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach(node => {
      const formula = node.formula;
      const funcName = formula.implementation.csharp.match(/public static double (\w+)/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return varName;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `        double ${outputVar} = ${funcName}(${args});\n`;
      code += `        Console.WriteLine("${formula.output.name}: " + ${outputVar} + " ${formula.output.dimension || ''}");\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `    }\n`;
    code += `}\n`;

    return code;
  }

  generateSwift(graph, executionOrder, programType) {
    let code = `// Auto-generated Program: ${programType}\n`;
    code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `// Generated: ${new Date().toISOString()}\n\n`;
    code += `import Foundation\n\n`;

    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.swift) {
        code += `${formula.implementation.swift}\n\n`;
      }
    });

    code += `func main() {\n`;
    code += `    // Eingaben\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `    print("${inputNode.name} (${inputNode.dimension || ''}): ")\n`;
        code += `    let ${inputNode.name.toLowerCase()} = Double(readLine() ?? "0") ?? 0\n`;
      }
    });

    code += `\n    // Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach(node => {
      const formula = node.formula;
      const funcName = formula.implementation.swift.match(/func\s+(\w+)/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return `${varName}: ${varName}`;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `    let ${outputVar} = ${funcName}(${args})\n`;
      code += `    print("${formula.output.name}: \\(${outputVar}) ${formula.output.dimension || ''}")\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `}\n\n`;
    code += `main()\n`;

    return code;
  }

  generateKotlin(graph, executionOrder, programType) {
    let code = `// Auto-generated Program: ${programType}\n`;
    code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
    code += `// Generated: ${new Date().toISOString()}\n\n`;

    executionOrder.forEach(node => {
      const formula = node.formula;
      if (formula.implementation.kotlin) {
        code += `${formula.implementation.kotlin}\n\n`;
      }
    });

    code += `fun main() {\n`;
    code += `    // Eingaben\n`;
    
    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        code += `    print("${inputNode.name} (${inputNode.dimension || ''}): ")\n`;
        code += `    val ${inputNode.name.toLowerCase()} = readLine()?.toDouble() ?: 0.0\n`;
      }
    });

    code += `\n    // Berechnungen\n`;
    
    const variables = new Map();
    executionOrder.forEach(node => {
      const formula = node.formula;
      const funcName = formula.implementation.kotlin.match(/fun\s+(\w+)/)?.[1] || `formula_${formula.id}`;
      
      const args = formula.inputs.map(input => {
        const varName = variables.get(input.name) || input.name.toLowerCase();
        return varName;
      }).join(', ');

      const outputVar = formula.output.name.toLowerCase();
      code += `    val ${outputVar} = ${funcName}(${args})\n`;
      code += `    println("${formula.output.name}: $${outputVar} ${formula.output.dimension || ''}")\n`;
      
      variables.set(formula.output.name, outputVar);
    });

    code += `}\n`;

    return code;
  }

  getFilename(language) {
    const extensions = {
      python: 'generated_program.py',
      javascript: 'generated_program.js',
      typescript: 'generated_program.ts',
      rust: 'generated_program.rs',
      go: 'generated_program.go',
      java: 'GeneratedProgram.java',
      cpp: 'generated_program.cpp',
      csharp: 'GeneratedProgram.cs',
      swift: 'generated_program.swift',
      kotlin: 'generated_program.kt'
    };
    return extensions[language] || 'generated_program.txt';
  }
}

module.exports = CodeGenerator;



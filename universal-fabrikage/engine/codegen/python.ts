// Python Code Generator
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import { Intent } from '../prompt_parser';

export function emitPython(plan: Plan, intent: Intent): string {
  let code = `# Auto-generated Program: ${plan.category}\n`;
  code += `# BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
  code += `# Generated: ${new Date().toISOString()}\n`;
  code += `# Intent: ${intent.text}\n\n`;

  // Imports
  code += `import json\n`;
  code += `from typing import Dict, List, Optional\n`;
  if (intent.outputs.includes('dashboard') || intent.outputs.includes('report')) {
    code += `import pandas as pd\n`;
    code += `import matplotlib.pyplot as plt\n`;
  }
  if (intent.performance === 'high') {
    code += `import numpy as np\n`;
  }
  code += `\n`;

  // Formel-Implementierungen
  plan.nodes.forEach(node => {
    const formula = node.formula;
    if (formula.implementation?.python) {
      code += `${formula.implementation.python}\n\n`;
    } else {
      // Fallback-Implementation
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '_');
      const params = formula.inputs.map(i => i.name.toLowerCase()).join(', ');
      code += `def ${funcName}(${params}):\n`;
      code += `    """${formula.name} - ${formula.domain}"""\n`;
      code += `    # TODO: Implement ${formula.name}\n`;
      code += `    return 0.0\n\n`;
    }
  });

  // API (FastAPI wenn API gewünscht)
  if (intent.outputs.includes('api')) {
    code += `from fastapi import FastAPI\n`;
    code += `from pydantic import BaseModel\n\n`;
    code += `app = FastAPI(title="${plan.category}")\n\n`;
    
    plan.inputs.forEach(input => {
      code += `class ${input}Input(BaseModel):\n`;
      code += `    value: float\n\n`;
    });
    
    code += `@app.get("/meta")\n`;
    code += `def meta():\n`;
    code += `    return {"category": "${plan.category}", "domains": ${JSON.stringify(intent.domains)}}\n\n`;
    
    code += `@app.post("/calculate")\n`;
    code += `def calculate(inputs: Dict):\n`;
    code += `    # Berechnungen\n`;
    plan.nodes.forEach(node => {
      const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '_');
      const args = node.formula.inputs.map(i => `inputs.get("${i.name.toLowerCase()}", 0)`).join(', ');
      code += `    ${node.formula.output.name.toLowerCase()} = ${funcName}(${args})\n`;
    });
    code += `    return {"results": {}}\n\n`;
  }

  // Main
  code += `def main():\n`;
  code += `    print("Category:", "${plan.category}")\n`;
  code += `    print("Domains:", ${JSON.stringify(intent.domains)})\n\n`;
  
  code += `    # Eingaben\n`;
  plan.inputs.forEach(input => {
    code += `    ${input.toLowerCase()} = float(input("${input}: "))\n`;
  });

  code += `\n    # Berechnungen\n`;
  const variables = new Map<string, string>();
  plan.nodes.forEach(node => {
    const formula = node.formula;
    const funcName = formula.name.toLowerCase().replace(/\s+/g, '_');
    const args = formula.inputs.map(input => {
      return variables.get(input.name) || input.name.toLowerCase();
    }).join(', ');

    const outputVar = formula.output.name.toLowerCase();
    code += `    ${outputVar} = ${funcName}(${args})\n`;
    code += `    print(f"${formula.output.name}: {${outputVar}} ${formula.output.dimension || ''}")\n`;
    
    variables.set(formula.output.name, outputVar);
  });

  code += `\n    # Ausgaben\n`;
  if (intent.outputs.includes('report')) {
    code += `    print("\\n=== Report ===")\n`;
    plan.outputs.forEach(output => {
      code += `    print(f"${output}: {${variables.get(output) || 'N/A'}}")\n`;
    });
  }

  code += `\n\nif __name__ == "__main__":\n`;
  if (intent.outputs.includes('api')) {
    code += `    import uvicorn\n`;
    code += `    uvicorn.run(app, host="0.0.0.0", port=8080)\n`;
  } else {
    code += `    main()\n`;
  }

  return code;
}

module.exports = { emitPython };



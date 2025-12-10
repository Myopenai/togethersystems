// Node.js/Express Code Generator
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import { Intent } from '../prompt_parser';

export function emitNode(plan: Plan, intent: Intent): string {
  let code = `// Auto-generated Program: ${plan.category}\n`;
  code += `// BRANDING: .T. TogetherSystems - ModularFlux Architecture\n`;
  code += `// Generated: ${new Date().toISOString()}\n`;
  code += `// Intent: ${intent.text}\n\n`;

  // Imports
  code += `import express from 'express';\n`;
  code += `import cors from 'cors';\n`;
  if (intent.constraints?.encryption) {
    code += `import crypto from 'crypto';\n`;
  }
  code += `\n`;

  const app = intent.outputs.includes('api') ? 'app' : 'const app = express()';

  // Formel-Implementierungen
  plan.nodes.forEach(node => {
    const formula = node.formula;
    if (formula.implementation?.javascript || formula.implementation?.typescript) {
      const impl = formula.implementation.typescript || formula.implementation.javascript;
      code += `${impl}\n\n`;
    } else {
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '');
      const params = formula.inputs.map(i => `${i.name.toLowerCase()}: number`).join(', ');
      code += `function ${funcName}(${params}): number {\n`;
      code += `    // ${formula.name} - ${formula.domain}\n`;
      code += `    return 0.0;\n`;
      code += `}\n\n`;
    }
  });

  // Express App
  code += `const app = express();\n`;
  code += `app.use(cors());\n`;
  code += `app.use(express.json());\n\n`;

  // Endpoints
  code += `app.get('/meta', (_req, res) => {\n`;
  code += `    res.json({\n`;
  code += `        category: "${plan.category}",\n`;
  code += `        domains: ${JSON.stringify(intent.domains)},\n`;
  code += `        targets: ${JSON.stringify(intent.targets)},\n`;
  code += `        privacy: "${intent.privacy}",\n`;
  code += `        performance: "${intent.performance}"\n`;
  code += `    });\n`;
  code += `});\n\n`;

  code += `app.post('/calculate', (req, res) => {\n`;
  code += `    const inputs = req.body;\n`;
  code += `    const results: any = {};\n\n`;
  
  const variables = new Map<string, string>();
  plan.nodes.forEach(node => {
    const formula = node.formula;
    const funcName = formula.name.toLowerCase().replace(/\s+/g, '');
    const args = formula.inputs.map(input => {
      return `inputs.${input.name.toLowerCase()}`;
    }).join(', ');

    const outputVar = formula.output.name.toLowerCase();
    code += `    const ${outputVar} = ${funcName}(${args});\n`;
    code += `    results.${outputVar} = ${outputVar};\n`;
    
    variables.set(formula.output.name, outputVar);
  });

  code += `    res.json({ results });\n`;
  code += `});\n\n`;

  code += `const PORT = process.env.PORT || 8080;\n`;
  code += `app.listen(PORT, () => {\n`;
  code += `    console.log(\`✅ ${plan.category} läuft auf Port \${PORT}\`);\n`;
  code += `});\n`;

  return code;
}

module.exports = { emitNode };



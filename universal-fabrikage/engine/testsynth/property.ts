// Property Test Synthesizer
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';

export function generatePropertyTests(plan: Plan): string {
  let code = `// Auto-generated Property Tests for ${plan.category}
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

import fc from 'fast-check';

`;

  plan.nodes.forEach(node => {
    const formula = node.formula;
    const funcName = formula.name.toLowerCase().replace(/\s+/g, '_');
    
    code += `// Property: ${formula.name}\n`;
    code += `test('${funcName} should handle valid inputs', () => {\n`;
    code += `  fc.assert(fc.property(\n`;
    code += `    ${formula.inputs.map(i => {
      if (i.constraints?.min !== undefined && i.constraints?.max !== undefined) {
        return `fc.float({ min: ${i.constraints.min}, max: ${i.constraints.max} })`;
      } else if (i.constraints?.min !== undefined) {
        return `fc.float({ min: ${i.constraints.min} })`;
      }
      return 'fc.float()';
    }).join(',\n    ')},\n`;
    code += `    (${formula.inputs.map(i => i.name.toLowerCase()).join(', ')}) => {\n`;
    code += `      const result = ${funcName}(${formula.inputs.map(i => i.name.toLowerCase()).join(', ')});\n`;
    code += `      expect(typeof result).toBe('number');\n`;
    if (formula.output.constraints?.min !== undefined) {
      code += `      expect(result).toBeGreaterThanOrEqual(${formula.output.constraints.min});\n`;
    }
    code += `    }\n`;
    code += `  ));\n`;
    code += `});\n\n`;
  });

  return code;
}

module.exports = { generatePropertyTests };



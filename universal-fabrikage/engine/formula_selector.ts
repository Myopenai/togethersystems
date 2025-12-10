// Formula Selector - Graph Planning
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import * as fs from 'fs';
import * as path from 'path';
import { Intent } from './prompt_parser';

export type Formula = {
  id: string;
  name: string;
  domain: string;
  inputs: { name: string; type: string; unit?: string; dimension?: string }[];
  output: { name: string; type: string; unit?: string; dimension?: string };
  codeRef: string; // pointer to implementation
  implementation?: any;
  dependencies?: string[];
};

export type PlanNode = {
  formula: Formula;
  dependsOn: string[];
  executionOrder: number;
};

export type Plan = {
  nodes: PlanNode[];
  category: string;
  reason: string;
  inputs: string[];
  outputs: string[];
  graph: {
    nodes: any[];
    edges: any[];
  };
};

export function loadFormulas(): Formula[] {
  const formulas: Formula[] = [];
  
  // Lade aus formula-database
  const formulaDir = path.join(__dirname, '../../formula-database/formulas');
  if (fs.existsSync(formulaDir)) {
    const files = fs.readdirSync(formulaDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(formulaDir, file), 'utf8');
        const formula = JSON.parse(content);
        formulas.push({
          id: formula.id,
          name: formula.name,
          domain: formula.domain?.[0] || 'Unknown',
          inputs: formula.inputs || [],
          output: formula.output || { name: 'result', type: 'number' },
          codeRef: file,
          implementation: formula.implementation,
          dependencies: formula.dependencies || []
        });
      } catch (e) {
        // Ignore errors
      }
    });
  }

  // Lade aus specs/domain (Schemas)
  const specsDir = path.join(__dirname, '../../specs/domain');
  if (fs.existsSync(specsDir)) {
    const files = fs.readdirSync(specsDir).filter(f => f.endsWith('.schema.json'));
    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(specsDir, file), 'utf8');
        const schema = JSON.parse(content);
        const domain = file.replace('_schema.json', '').replace('.schema.json', '');
        formulas.push({
          id: `SCHEMA-${domain}`,
          name: schema.title || domain,
          domain: domain,
          inputs: schema.required || [],
          output: { name: 'result', type: 'object' },
          codeRef: file,
          dependencies: []
        });
      } catch (e) {
        // Ignore errors
      }
    });
  }

  return formulas;
}

export function buildPlan(intent: Intent): Plan {
  const allFormulas = loadFormulas();
  
  // Filter nach Domains
  const domainFormulas = allFormulas.filter(f => 
    intent.domains.some(d => 
      f.domain.toLowerCase().includes(d.toLowerCase()) ||
      d.toLowerCase().includes(f.domain.toLowerCase())
    )
  );

  // Wenn keine Formeln gefunden, verwende alle
  const formulas = domainFormulas.length > 0 ? domainFormulas : allFormulas.slice(0, 3);

  // Baue Graph
  const nodes: PlanNode[] = [];
  const graph = {
    nodes: [],
    edges: []
  };

  formulas.forEach((formula, index) => {
    const dependsOn = formula.inputs.map(i => i.type || i.name);
    nodes.push({
      formula,
      dependsOn,
      executionOrder: index
    });

    graph.nodes.push({
      id: formula.id,
      label: formula.name,
      type: 'formula'
    });

    formula.inputs.forEach(input => {
      const inputId = `input_${formula.id}_${input.name}`;
      graph.nodes.push({
        id: inputId,
        label: input.name,
        type: 'input'
      });
      graph.edges.push({
        from: inputId,
        to: formula.id,
        label: input.name
      });
    });

    const outputId = `output_${formula.id}_${formula.output.name}`;
    graph.nodes.push({
      id: outputId,
      label: formula.output.name,
      type: 'output'
    });
    graph.edges.push({
      from: formula.id,
      to: outputId,
      label: formula.output.name
    });
  });

  // Topologisches Sortieren
  const sorted = topologicalSort(nodes);
  sorted.forEach((node, index) => {
    node.executionOrder = index;
  });

  const category = classify(intent.domains);
  const inputs = formulas.flatMap(f => f.inputs.map(i => i.name));
  const outputs = formulas.map(f => f.output.name);

  return {
    nodes: sorted,
    category,
    reason: `domains=${intent.domains.join(',')}, targets=${intent.targets.join(',')}`,
    inputs: [...new Set(inputs)],
    outputs: [...new Set(outputs)],
    graph
  };
}

function topologicalSort(nodes: PlanNode[]): PlanNode[] {
  const visited = new Set<string>();
  const result: PlanNode[] = [];

  const visit = (node: PlanNode) => {
    if (visited.has(node.formula.id)) return;
    
    // Besuche zuerst Abhängigkeiten
    node.dependsOn.forEach(dep => {
      const depNode = nodes.find(n => 
        n.formula.output.name === dep || 
        n.formula.output.type === dep
      );
      if (depNode) visit(depNode);
    });

    visited.add(node.formula.id);
    result.push(node);
  };

  nodes.forEach(visit);
  return result;
}

function classify(domains: string[]): string {
  const domainStr = domains.join(',').toLowerCase();
  
  if (domainStr.includes('finanz') && domainStr.includes('energie') && domainStr.includes('statistik')) {
    return 'Haushalts-Finanz-Energie-Simulator';
  }
  if (domainStr.includes('notar') || domainStr.includes('manifest')) {
    return 'Digitales Manifest-Portal';
  }
  if (domainStr.includes('finanz') && domainStr.includes('haushalt')) {
    return 'Haushalts-Finanz-Manager';
  }
  if (domainStr.includes('energie') && domainStr.includes('statistik')) {
    return 'Energieprognose-Tool';
  }
  if (domainStr.includes('finanz')) {
    return 'Finanz-Analyse-Programm';
  }
  if (domainStr.includes('energie')) {
    return 'Energie-Berechnungs-Tool';
  }
  if (domainStr.includes('statistik')) {
    return 'Statistik-Analyse-Tool';
  }
  
  return 'Generic Analytical App';
}

// CLI
if (require.main === module) {
  const { parsePrompt } = require('./prompt_parser');
  const text = process.argv.slice(2).join(' ') || "Erstelle ein Haushaltsbuch mit Solar-Energie";
  const intent = parsePrompt(text);
  const plan = buildPlan(intent);
  console.log(JSON.stringify(plan, null, 2));
}

module.exports = { buildPlan, loadFormulas, Plan, Formula, PlanNode };



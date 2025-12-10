// Formula Graph Generator - DAG aus Formeln
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');

class FormulaGraph {
  constructor() {
    this.formulas = [];
    this.graph = {
      nodes: [],
      edges: []
    };
  }

  loadFormulas(formulaDir) {
    const dir = path.join(__dirname, '..', 'formula-database', 'formulas');
    if (!fs.existsSync(dir)) {
      return [];
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    this.formulas = files.map(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      return JSON.parse(content);
    });

    return this.formulas;
  }

  buildGraph(formulaIds) {
    const selectedFormulas = this.formulas.filter(f => formulaIds.includes(f.id));
    
    this.graph = {
      nodes: [],
      edges: [],
      inputs: [],
      outputs: []
    };

    // Erstelle Knoten für jede Formel
    selectedFormulas.forEach((formula, index) => {
      this.graph.nodes.push({
        id: formula.id,
        type: 'formula',
        formula: formula,
        index: index
      });

      // Input-Knoten
      formula.inputs.forEach(input => {
        const inputId = `input_${formula.id}_${input.name}`;
        if (!this.graph.nodes.find(n => n.id === inputId)) {
          this.graph.nodes.push({
            id: inputId,
            type: 'input',
            name: input.name,
            dataType: input.type,
            dimension: input.dimension
          });
          this.graph.inputs.push(inputId);
        }

        // Kante: Input → Formula
        this.graph.edges.push({
          from: inputId,
          to: formula.id,
          label: input.name
        });
      });

      // Output-Knoten
      const outputId = `output_${formula.id}_${formula.output.name}`;
      this.graph.nodes.push({
        id: outputId,
        type: 'output',
        name: formula.output.name,
        dataType: formula.output.type,
        dimension: formula.output.dimension
      });
      this.graph.outputs.push(outputId);

      // Kante: Formula → Output
      this.graph.edges.push({
        from: formula.id,
        to: outputId,
        label: formula.output.name
      });
    });

    // Verbinde Formeln (wenn Output einer Formel Input einer anderen ist)
    selectedFormulas.forEach(formula1 => {
      selectedFormulas.forEach(formula2 => {
        if (formula1.id === formula2.id) return;

        const output1 = formula1.output.name.toLowerCase();
        formula2.inputs.forEach(input2 => {
          if (input2.name.toLowerCase() === output1 || 
              input2.name.toLowerCase().includes(output1) ||
              output1.includes(input2.name.toLowerCase())) {
            const outputId1 = `output_${formula1.id}_${formula1.output.name}`;
            const inputId2 = `input_${formula2.id}_${input2.name}`;
            
            this.graph.edges.push({
              from: outputId1,
              to: inputId2,
              label: `${formula1.output.name} → ${input2.name}`
            });
          }
        });
      });
    });

    return this.graph;
  }

  predictProgramType() {
    const domains = new Set();
    this.graph.nodes
      .filter(n => n.type === 'formula')
      .forEach(n => {
        n.formula.domain.forEach(d => domains.add(d));
      });

    const domainArray = Array.from(domains);
    
    // Heuristik-basierte Vorhersage
    if (domainArray.includes('Finanz') && domainArray.includes('Energie') && domainArray.includes('Statistik')) {
      return 'Haushalts-Finanz-Energie-Simulator';
    } else if (domainArray.includes('Finanz') && domainArray.length === 1) {
      return 'Finanz-Analyse-Programm';
    } else if (domainArray.includes('Energie') && domainArray.includes('Statistik')) {
      return 'Energieprognose-Tool';
    } else if (domainArray.includes('Statistik')) {
      return 'Statistik-Analyse-Tool';
    } else if (domainArray.includes('Energie')) {
      return 'Energie-Berechnungs-Tool';
    } else {
      return 'Multi-Domain-Berechnungs-Programm';
    }
  }

  getExecutionOrder() {
    // Topologisches Sortieren für Ausführungsreihenfolge
    const visited = new Set();
    const order = [];

    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      
      const node = this.graph.nodes.find(n => n.id === nodeId);
      if (!node) return;

      // Besuche zuerst alle Abhängigkeiten
      this.graph.edges
        .filter(e => e.to === nodeId)
        .forEach(e => visit(e.from));

      visited.add(nodeId);
      if (node.type === 'formula') {
        order.push(node);
      }
    };

    this.graph.nodes
      .filter(n => n.type === 'formula')
      .forEach(n => visit(n.id));

    return order;
  }
}

module.exports = FormulaGraph;



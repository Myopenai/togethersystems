// UI Generator - Generiert Dashboard/Web-UI aus Formeln
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');
const FormulaGraph = require('./formula-graph');

class UIGenerator {
  generate(formulaIds, outputDir = './generated-ui') {
    const graph = new FormulaGraph();
    graph.loadFormulas();
    graph.buildGraph(formulaIds);
    
    const programType = graph.predictProgramType();
    const html = this.generateHTML(graph, programType);
    const css = this.generateCSS();
    const js = this.generateJavaScript(graph);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
    fs.writeFileSync(path.join(outputDir, 'style.css'), css, 'utf8');
    fs.writeFileSync(path.join(outputDir, 'app.js'), js, 'utf8');

    return {
      programType,
      files: [
        path.join(outputDir, 'index.html'),
        path.join(outputDir, 'style.css'),
        path.join(outputDir, 'app.js')
      ]
    };
  }

  generateHTML(graph, programType) {
    let html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${programType} - Auto-Generated</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>${programType}</h1>
            <p class="subtitle">Auto-generated Dashboard</p>
            <p class="branding">.T. TogetherSystems - ModularFlux Architecture</p>
        </header>

        <div class="main-content">
            <div class="input-panel">
                <h2>📥 Eingaben</h2>
                <form id="inputForm">`;

    graph.graph.inputs.forEach(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      if (inputNode) {
        html += `
                    <div class="input-group">
                        <label for="${inputNode.name.toLowerCase()}">${inputNode.name} (${inputNode.dimension || ''})</label>
                        <input type="number" id="${inputNode.name.toLowerCase()}" name="${inputNode.name.toLowerCase()}" step="0.01" required>
                    </div>`;
      }
    });

    html += `
                    <button type="submit" class="btn-calculate">🧮 Berechnen</button>
                </form>
            </div>

            <div class="results-panel">
                <h2>📊 Ergebnisse</h2>
                <div id="results"></div>
            </div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>`;

    return html;
  }

  generateCSS() {
    return `* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: system-ui, -apple-system, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

header {
    text-align: center;
    color: white;
    margin-bottom: 30px;
}

header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
}

.subtitle {
    font-size: 1.2em;
    opacity: 0.9;
    margin-bottom: 5px;
}

.branding {
    font-size: 0.9em;
    opacity: 0.7;
}

.main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.input-panel, .results-panel {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.input-panel h2, .results-panel h2 {
    margin-bottom: 20px;
    color: #333;
}

.input-group {
    margin-bottom: 15px;
}

.input-group label {
    display: block;
    margin-bottom: 5px;
    color: #555;
    font-weight: 500;
}

.input-group input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.input-group input:focus {
    outline: none;
    border-color: #667eea;
}

.btn-calculate {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
    margin-top: 10px;
}

.btn-calculate:hover {
    transform: translateY(-2px);
}

.btn-calculate:active {
    transform: translateY(0);
}

#results {
    min-height: 200px;
}

.result-item {
    padding: 15px;
    margin-bottom: 10px;
    background: #f5f5f5;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.result-item h3 {
    color: #333;
    margin-bottom: 5px;
}

.result-item .value {
    font-size: 1.5em;
    font-weight: 600;
    color: #667eea;
}

.result-item .unit {
    color: #888;
    font-size: 0.9em;
}

@media (max-width: 768px) {
    .main-content {
        grid-template-columns: 1fr;
    }
}`;
  }

  generateJavaScript(graph) {
    let js = `// Auto-generated JavaScript for UI
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

`;

    // Formel-Funktionen
    graph.graph.nodes
      .filter(n => n.type === 'formula')
      .forEach(node => {
        const formula = node.formula;
        if (formula.implementation.javascript) {
          js += `${formula.implementation.javascript}\n\n`;
        }
      });

    js += `
const executionOrder = ${JSON.stringify(graph.getExecutionOrder().map(n => n.formula.id), null, 2)};

document.getElementById('inputForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const inputs = {};
    ${graph.graph.inputs.map(inputId => {
      const inputNode = graph.graph.nodes.find(n => n.id === inputId);
      return `    inputs['${inputNode.name.toLowerCase()}'] = parseFloat(document.getElementById('${inputNode.name.toLowerCase()}').value);`;
    }).join('\n')}
    
    const results = calculate(inputs);
    displayResults(results);
});

function calculate(inputs) {
    const results = {};
    const variables = { ...inputs };
    
    ${graph.getExecutionOrder().map((node, index) => {
      const formula = node.formula;
      const funcName = formula.implementation.javascript.match(/function\s+(\w+)/)?.[1] || `formula_${formula.id}`;
      const args = formula.inputs.map(input => {
        return `variables['${input.name.toLowerCase()}']`;
      }).join(', ');
      const outputVar = formula.output.name.toLowerCase();
      return `    const ${outputVar} = ${funcName}(${args});
    variables['${outputVar}'] = ${outputVar};
    results['${formula.output.name}'] = { value: ${outputVar}, unit: '${formula.output.dimension || ''}' };`;
    }).join('\n    \n')}
    
    return results;
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    Object.entries(results).forEach(([name, data]) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = \`
            <h3>\${name}</h3>
            <div class="value">\${data.value.toFixed(2)}</div>
            <div class="unit">\${data.unit}</div>
        \`;
        resultsDiv.appendChild(div);
    });
}`;

    return js;
  }
}

module.exports = UIGenerator;



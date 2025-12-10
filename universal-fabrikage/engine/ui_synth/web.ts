// Web PWA UI Synthesizer
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import { Intent } from '../prompt_parser';

export function emitWebPWA(plan: Plan, intent: Intent): { html: string; css: string; js: string; manifest: string } {
  const html = generateHTML(plan, intent);
  const css = generateCSS();
  const js = generateJavaScript(plan, intent);
  const manifest = generateManifest(plan, intent);

  return { html, css, js, manifest };
}

function generateHTML(plan: Plan, intent: Intent): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${plan.category} - Auto-generated">
    <title>${plan.category}</title>
    <link rel="manifest" href="/manifest.json">
    <link rel="stylesheet" href="style.css">
    <script src="app.js" defer></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>${plan.category}</h1>
            <p class="subtitle">Auto-generated Dashboard</p>
            <p class="branding">.T. TogetherSystems - ModularFlux Architecture</p>
        </header>

        <div class="main-content">
            <div class="input-panel">
                <h2>📥 Eingaben</h2>
                <form id="inputForm">
${plan.inputs.map(input => `
                    <div class="input-group">
                        <label for="${input.toLowerCase()}">${input}</label>
                        <input type="number" id="${input.toLowerCase()}" name="${input.toLowerCase()}" step="0.01" required>
                    </div>`).join('')}
                    <button type="submit" class="btn-calculate">🧮 Berechnen</button>
                </form>
            </div>

            <div class="results-panel">
                <h2>📊 Ergebnisse</h2>
                <div id="results"></div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function generateCSS(): string {
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
    margin-top: 10px;
}

.result-item {
    padding: 15px;
    margin-bottom: 10px;
    background: #f5f5f5;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

@media (max-width: 768px) {
    .main-content {
        grid-template-columns: 1fr;
    }
}`;
}

function generateJavaScript(plan: Plan, intent: Intent): string {
  return `// Auto-generated JavaScript
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

${plan.nodes.map(node => {
  const formula = node.formula;
  if (formula.implementation?.javascript) {
    return formula.implementation.javascript;
  }
  return `function ${formula.name.toLowerCase().replace(/\s+/g, '')}(...args) { return 0; }`;
}).join('\n\n')}

document.getElementById('inputForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const inputs = {};
    ${plan.inputs.map(input => `inputs['${input.toLowerCase()}'] = parseFloat(document.getElementById('${input.toLowerCase()}').value);`).join('\n    ')}
    
    const results = calculate(inputs);
    displayResults(results);
});

function calculate(inputs) {
    const results = {};
    const variables = { ...inputs };
    
    ${plan.nodes.map(node => {
      const formula = node.formula;
      const funcName = formula.name.toLowerCase().replace(/\s+/g, '');
      const args = formula.inputs.map(i => `variables['${i.name.toLowerCase()}']`).join(', ');
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
}

function generateManifest(plan: Plan, intent: Intent): string {
  return JSON.stringify({
    name: plan.category,
    short_name: plan.category.split(' ')[0],
    description: `Auto-generated: ${plan.category}`,
    start_url: '/',
    display: 'standalone',
    background_color: '#667eea',
    theme_color: '#764ba2',
    icons: []
  }, null, 2);
}

module.exports = { emitWebPWA };



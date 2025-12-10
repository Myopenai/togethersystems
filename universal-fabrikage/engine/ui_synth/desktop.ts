// Desktop UI Synthesizer (Electron / Tauri)
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import { Intent } from '../prompt_parser';

export function emitDesktop(plan: Plan, intent: Intent, framework: 'electron' | 'tauri' = 'electron'): { files: { path: string; content: string }[] } {
  if (framework === 'electron') {
    return emitElectron(plan, intent);
  } else {
    return emitTauri(plan, intent);
  }
}

function emitElectron(plan: Plan, intent: Intent): { files: { path: string; content: string }[] } {
  const mainJs = `// Auto-generated Electron App: ${plan.category}
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});`;

  const packageJson = JSON.stringify({
    name: plan.category.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    main: 'main.js',
    scripts: {
      start: 'electron .'
    },
    dependencies: {
      electron: '^27.0.0'
    }
  }, null, 2);

  const indexHtml = `<!DOCTYPE html>
<html>
<head>
    <title>${plan.category}</title>
    <style>
        body { font-family: system-ui; padding: 20px; }
        .input-group { margin: 10px 0; }
        input { padding: 8px; width: 200px; }
        button { padding: 10px 20px; cursor: pointer; }
        .result { margin-top: 20px; padding: 10px; background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>${plan.category}</h1>
    <form id="calcForm">
        ${plan.inputs.map(input => `
        <div class="input-group">
            <label>${input}:</label>
            <input type="number" id="${input.toLowerCase()}" required>
        </div>`).join('')}
        <button type="submit">Berechnen</button>
    </form>
    <div id="results" class="result"></div>
    <script src="renderer.js"></script>
</body>
</html>`;

  const rendererJs = `// Renderer Process
document.getElementById('calcForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = {};
    ${plan.inputs.map(input => `inputs['${input.toLowerCase()}'] = parseFloat(document.getElementById('${input.toLowerCase()}').value);`).join('\n    ')}
    
    const results = {};
    ${plan.nodes.map(node => {
      const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '');
      const args = node.formula.inputs.map(i => `inputs['${i.name.toLowerCase()}']`).join(', ');
      const outputVar = node.formula.output.name.toLowerCase();
      return `    results['${outputVar}'] = ${funcName}(${args});`;
    }).join('\n    ')}
    
    document.getElementById('results').innerHTML = Object.entries(results)
      .map(([k, v]) => \`<p>\${k}: \${v}</p>\`)
      .join('');
});`;

  return {
    files: [
      { path: 'main.js', content: mainJs },
      { path: 'package.json', content: packageJson },
      { path: 'index.html', content: indexHtml },
      { path: 'renderer.js', content: rendererJs }
    ]
  };
}

function emitTauri(plan: Plan, intent: Intent): { files: { path: string; content: string }[] } {
  const mainRs = `// Auto-generated Tauri App: ${plan.category}
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}`;

  const tauriConf = JSON.stringify({
    build: {
      beforeDevCommand: 'npm run dev',
      beforeBuildCommand: 'npm run build',
      devPath: '../dist',
      distPath: '../dist'
    },
    package: {
      productName: plan.category
    }
  }, null, 2);

  return {
    files: [
      { path: 'src-tauri/main.rs', content: mainRs },
      { path: 'src-tauri/tauri.conf.json', content: tauriConf }
    ]
  };
}

module.exports = { emitDesktop };



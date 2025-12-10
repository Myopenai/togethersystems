const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

// Static file serving - Root level (serves all files from root directory)
app.use(express.static(path.join(__dirname, '..')));

// Specific static directories
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/apps', express.static(path.join(__dirname, 'public/apps')));
app.use('/downloads', express.static(path.join(__dirname, 'public/downloads')));

// Modular Fabrikage - explicit route
app.use('/modular-fabrikage', express.static(path.join(__dirname, '..', 'modular-fabrikage'), {
  index: 'index.html',
  extensions: ['html', 'js', 'css', 'json']
}));

// Scripts Dashboard Route
app.get('/scripts-dashboard', (_, res) => {
  const dashboardPath = path.join(__dirname, '..', 'fabrikage-scripts-dashboard.html');
  if (fs.existsSync(dashboardPath)) {
    res.sendFile(dashboardPath);
  } else {
    res.status(404).send('Scripts Dashboard nicht gefunden');
  }
});

// Root route - serve portal or index
app.get('/', (_, res) => {
  const portalPath = path.join(__dirname, '..', 'portal-start-nebula.html');
  const indexPath = path.join(__dirname, 'public/index.html');
  
  if (fs.existsSync(portalPath)) {
    res.sendFile(portalPath);
  } else if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      ok: true,
      message: 'XXXXXXLS Fabrikage System',
      version: '3.0.0',
      endpoints: {
        portal: '/portal-start-nebula.html',
        dashboard: '/scripts-dashboard',
        modular: '/modular-fabrikage/index.html',
        api: '/api/health'
      }
    });
  }
});

// Mock APIs: nodes, links, events, energy ledger, audit, universal layers
app.get('/api/nodes', (_, res) => res.json([
  { id: "N-CORE", level: "META", ports: ["material", "energy", "info"], holoState: "global-vector" },
  { id: "N-BUBBLE-MEM", level: "UNIVERSAL", ports: ["energy", "info"], holoState: "rim" },
  { id: "N-PLANT-A", level: "PLANET_SPHERE", ports: ["material", "energy", "info"], holoState: "cluster-west" },
  { id: "N-NANO-001", level: "NANO", ports: ["material", "energy"], holoState: "fractal-seed" },
  { id: "N-GALACTIC-ALPHA", level: "GALACTIC", ports: ["material", "energy", "info"], holoState: "spiral-arm" },
  { id: "N-TRANS-META", level: "TRANSUNIVERSAL_META", ports: ["info", "meta"], holoState: "exterior-vector" }
]));

app.get('/api/links', (_, res) => res.json([
  { id: "L-01", from: "N-CORE", to: "N-BUBBLE-MEM", type: "INFORMATION", capacity: "∞", latencyRange: "polychron", protocol: "semantic" },
  { id: "L-02", from: "N-CORE", to: "N-PLANT-A", type: "ENERGY", capacity: "meta-bus", latencyRange: "low", protocol: "harmonic" },
  { id: "L-03", from: "N-PLANT-A", to: "N-NANO-001", type: "MATERIAL", capacity: "∞", latencyRange: "instant", protocol: "quantum" },
  { id: "L-04", from: "N-GALACTIC-ALPHA", to: "N-CORE", type: "ENERGY", capacity: "∞", latencyRange: "lightyear", protocol: "hyperwave" },
  { id: "L-05", from: "N-TRANS-META", to: "N-CORE", type: "META", capacity: "∞", latencyRange: "transcendent", protocol: "emergent" }
]));

app.get('/api/events', (_, res) => res.json([
  { id: "E-EDGE-TOUCH", stage: "sense", message: "Boundary touch mapped to core", signature: "ok", timestamp: new Date().toISOString() },
  { id: "E-COMMIT", stage: "commit", message: "Deterministic window T+00:15", signature: "ok", timestamp: new Date().toISOString() },
  { id: "E-MORPH", stage: "transform", message: "Module N-PLANT-A morphed to assembly unit", signature: "ok", timestamp: new Date().toISOString() },
  { id: "E-EMERGE", stage: "emerge", message: "New production principle discovered", signature: "ok", timestamp: new Date().toISOString() }
]));

app.get('/api/energy-ledger', (_, res) => res.json({
  sources: [
    { name: "Orbital Solar", mw: 6400, level: "PLANET_SPHERE" },
    { name: "Fusion Meta", mw: 12000, level: "GALACTIC" },
    { name: "Zero-Point Field", mw: 999999, level: "TRANSUNIVERSAL_META" },
    { name: "Quantum Fluctuation", mw: 500, level: "NANO" }
  ],
  sinks: [
    { name: "Universal Bubble Field", mw: 9800, level: "UNIVERSAL" },
    { name: "Planetary Cluster West", mw: 2600, level: "PLANET_SPHERE" },
    { name: "Nano-Fractal Network", mw: 1200, level: "NANO" },
    { name: "Meta-Research Continuum", mw: 5000, level: "META" }
  ],
  balance: 999999 - (9800 + 2600 + 1200 + 5000),
  efficiency: 0.98
}));

app.get('/api/universal/layers', (_, res) => res.json({
  layers: [
    "NANO",
    "MESO",
    "PLANET_SPHERE",
    "SOLAR_SPHERE",
    "GALACTIC",
    "SUPERCLUSTER",
    "UNIVERSAL",
    "TRANSUNIVERSAL_META",
    "CONTINUUM_FIELD"
  ],
  active: ["NANO", "PLANET_SPHERE", "GALACTIC", "UNIVERSAL", "TRANSUNIVERSAL_META"],
  current: "UNIVERSAL"
}));

app.post('/api/morph', (req, res) => {
  const { action = "replicate", target = "N-PLANT-A", morphType = "assembly" } = req.body || {};
  res.json({
    ok: true,
    action,
    target,
    morphType,
    result: "morphed",
    commitWindow: "T+01:00",
    timestamp: new Date().toISOString(),
    newState: `${target} transformed to ${morphType} unit`
  });
});

app.post('/api/nodes', (req, res) => {
  const { id, level, ports, holoState } = req.body || {};
  res.json({
    ok: true,
    node: {
      id: id || `N-${Date.now()}`,
      level: level || "META",
      ports: ports || ["material", "energy", "info"],
      holoState: holoState || "new-vector"
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (_, res) => res.json({
  ok: true,
  status: "operational",
  version: "3.0.0",
  system: "XXXXXXLS-Fabrikage",
  timestamp: new Date().toISOString()
}));

// ============================================
// SCRIPTS DASHBOARD API
// ============================================

// Liste aller FABRIKAGE-*.ps1 Skripte
app.get('/api/scripts/list', (req, res) => {
  try {
    const rootDir = path.join(__dirname, '..');
    const files = fs.readdirSync(rootDir);
    const scripts = files
      .filter(file => file.startsWith('FABRIKAGE-') && file.endsWith('.ps1'))
      .sort();
    
    res.json({
      ok: true,
      scripts,
      count: scripts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Führe PowerShell-Skript aus
app.post('/api/scripts/run', (req, res) => {
  const { script } = req.body;
  
  if (!script || !script.endsWith('.ps1')) {
    return res.status(400).json({
      ok: false,
      error: 'Ungültiger Skript-Name',
      timestamp: new Date().toISOString()
    });
  }

  const rootDir = path.join(__dirname, '..');
  const scriptPath = path.join(rootDir, script);

  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({
      ok: false,
      error: `Skript nicht gefunden: ${script}`,
      timestamp: new Date().toISOString()
    });
  }

  // PowerShell-Befehl
  const powershellCommand = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}"`;
  
  // Führe Skript aus
  exec(powershellCommand, { 
    cwd: rootDir,
    maxBuffer: 10 * 1024 * 1024 // 10MB Buffer
  }, (error, stdout, stderr) => {
    if (error) {
      return res.json({
        ok: false,
        success: false,
        error: error.message,
        output: stderr || stdout,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      ok: true,
      success: true,
      message: 'Skript erfolgreich ausgeführt',
      output: stdout,
      timestamp: new Date().toISOString()
    });
  });
});

// Hole Skript-Informationen
app.get('/api/scripts/info/:script', (req, res) => {
  const { script } = req.params;
  const rootDir = path.join(__dirname, '..');
  const scriptPath = path.join(rootDir, script);

  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({
      ok: false,
      error: `Skript nicht gefunden: ${script}`,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const content = fs.readFileSync(scriptPath, 'utf8');
    const stats = fs.statSync(scriptPath);
    
    // Extrahiere Beschreibung aus Kommentaren
    const descriptionMatch = content.match(/#\s*(.+?)(?:\n|$)/);
    const description = descriptionMatch ? descriptionMatch[1] : 'Keine Beschreibung verfügbar';

    res.json({
      ok: true,
      script,
      description,
      size: stats.size,
      modified: stats.mtime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error Handler Middleware - Fabrikage Standard
app.use((err, req, res, next) => {
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 5173;
app.listen(port, () => {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  XXXXXXLS Fabrikage System`);
  console.log(`  Running on http://localhost:${port}`);
  console.log(`  Version: 3.0.0`);
  console.log(`  BRANDING: .T. TogetherSystems - ModularFlux Architecture`);
  console.log(`═══════════════════════════════════════════════════════════`);
});




#!/usr/bin/env bash
# install_fabrikage_cursor.sh — One-click setup for Cursor as Produktionskomponente der Fabrikage

set -euo pipefail

say(){ printf "[%s] %s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }

# 1) Prepare folders
mkdir -p Settings artifacts logs .cursor

# 2) Settings manifests (single source of truth)
cat > Settings/settings-manifest.json <<'JSON'
{
  "name": "Fabrikage-Settings",
  "requiredHeader": "//HEADER",
  "policies": {
    "forbidEvalExec": true,
    "forbidChars": ["$"]
  },
  "architecture": {
    "chainOrder": ["Settings", "ConsoleMonitoring", "PreCodeVerification", "Generate", "PostCodeVerification", "CharacterByCharacter", "Finalize"]
  }
}
JSON

cat > Settings/CONSOLE-MONITORING-SYSTEM.json <<'JSON'
{
  "name": "Console-Monitoring",
  "enabled": true,
  "events": ["Startup", "Prompt", "PreVerify", "Generate", "PostVerify", "CharacterCheck", "FinalOutput", "Error"],
  "persistLogs": true
}
JSON

cat > Settings/PRE-CODE-VERIFICATION-SYSTEM.json <<'JSON'
{
  "name": "Pre-Code-Verification",
  "rules": {
    "noEvalExec": true,
    "requireHeader": true
  }
}
JSON

cat > Settings/MCP-ULTIMATE-EXTENDED.json <<'JSON'
{
  "name": "MCP-Ultimate-Extended",
  "enabled": true,
  "modes": ["stability", "parity", "performance"],
  "notes": "Acts as a configuration layer; actual logic enforced via verify and chain runner."
}
JSON

# 3) Cursor auto-load scaffolding (optional use by tools)
cat > .cursor/auto-load.js <<'JS'
const fs = require('fs');
const path = require('path');
function read(p){ return JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8')); }
global.FABRIKAGE = {
  settings: read('Settings/settings-manifest.json'),
  consoleMonitoring: read('Settings/CONSOLE-MONITORING-SYSTEM.json'),
  preCodeVerification: read('Settings/PRE-CODE-VERIFICATION-SYSTEM.json'),
  mcp: read('Settings/MCP-ULTIMATE-EXTENDED.json'),
  initialized: true,
  logs: []
};
console.log('[FABRIKAGE] Auto-load OK');
JS

# 4) Node.js modules (sealed core orchestration, open policies via Settings)
cat > bootstrap.js <<'JS'
const fs = require('fs'); const path = require('path');
function readJSON(rel){ return JSON.parse(fs.readFileSync(path.join(__dirname, rel), 'utf8')); }
function bootstrap() {
  const settings = readJSON('./Settings/settings-manifest.json');
  const monitoring = readJSON('./Settings/CONSOLE-MONITORING-SYSTEM.json');
  const preVerification = readJSON('./Settings/PRE-CODE-VERIFICATION-SYSTEM.json');
  const mcp = readJSON('./Settings/MCP-ULTIMATE-EXTENDED.json');
  global.FABRIKAGE = { settings, monitoring, preVerification, mcp, initialized: true, logs: [] };
  console.log('[FABRIKAGE] Startup-Sequenz abgeschlossen');
}
module.exports = { bootstrap };
JS

cat > monitor.js <<'JS'
function logEvent(event, detail) {
  const entry = { time: new Date().toISOString(), event, detail };
  if (!global.FABRIKAGE || !global.FABRIKAGE.logs) global.FABRIKAGE = { logs: [] };
  global.FABRIKAGE.logs.push(entry);
  if (global.FABRIKAGE.consoleMonitoring && global.FABRIKAGE.consoleMonitoring.enabled) {
    console.log(`[MONITOR] ${event}: ${detail}`);
  }
}
module.exports = { logEvent };
JS

cat > verify.js <<'JS'
const { logEvent } = require('./monitor');
function preVerify(input) {
  logEvent('PreVerify', 'checking input and policies');
  const pol = (global.FABRIKAGE.preVerification && global.FABRIKAGE.preVerification.rules) || {};
  const forbidEvalExec = pol.noEvalExec !== false && global.FABRIKAGE.settings.policies.forbidEvalExec;
  if (forbidEvalExec && /eval\(|exec\(/.test(input)) {
    logEvent('Error', 'Pre-Verification failed: eval/exec detected');
    throw new Error('Pre-Verification: Unsichere Technik (eval/exec)');
  }
  return true;
}
function postVerify(output) {
  logEvent('PostVerify', 'checking output consistency');
  const requireHeader = (global.FABRIKAGE.preVerification && global.FABRIKAGE.preVerification.rules.requireHeader) !== false;
  if (requireHeader && !String(output).includes(global.FABRIKAGE.settings.requiredHeader)) {
    logEvent('Error', 'Post-Verification failed: required header missing');
    throw new Error('Post-Verification: Required Header fehlt');
  }
  return true;
}
function verifyWrapper(generateFn) {
  return function(prompt) {
    preVerify(prompt);
    logEvent('Generate', 'running generator function');
    const output = generateFn(prompt);
    postVerify(output);
    return output;
  };
}
module.exports = { verifyWrapper, preVerify, postVerify };
JS

cat > streamInterceptor.js <<'JS'
const { logEvent } = require('./monitor');
function characterByCharacter(output) {
  const forbidChars = (global.FABRIKAGE.settings && global.FABRIKAGE.settings.policies.forbidChars) || [];
  let verified = '';
  for (const ch of String(output)) {
    if (forbidChars.includes(ch)) {
      logEvent('Error', `Character-Verification: forbidden char "${ch}"`);
      throw new Error(`Character-Verification: Verbotenes Zeichen "${ch}"`);
    }
    verified += ch;
  }
  logEvent('CharacterCheck', 'all characters verified');
  return verified;
}
module.exports = { characterByCharacter };
JS

cat > chainRunner.js <<'JS'
const { bootstrap } = require('./bootstrap');
const { verifyWrapper } = require('./verify');
const { characterByCharacter } = require('./streamInterceptor');
const { logEvent } = require('./monitor');
const fs = require('fs');

function writeReport() {
  const artifacts = 'artifacts';
  if (!fs.existsSync(artifacts)) fs.mkdirSync(artifacts);
  const out = `${artifacts}/fabrikage-cursor-report-${new Date().toISOString().replace(/[:.]/g,'')}.json`;
  const data = {
    timestamp: new Date().toISOString(),
    initialized: !!(global.FABRIKAGE && global.FABRIKAGE.initialized),
    chainOrder: global.FABRIKAGE?.settings?.architecture?.chainOrder || [],
    logs: global.FABRIKAGE?.logs || []
  };
  fs.writeFileSync(out, JSON.stringify(data, null, 2), 'utf8');
  console.log('[REPORT] Written:', out);
}

function runChain(prompt, generatorFn) {
  bootstrap();
  logEvent('Startup', 'System initialisiert');
  logEvent('Prompt', prompt);
  const wrapped = verifyWrapper(generatorFn);
  const raw = wrapped(prompt);
  const finalOutput = characterByCharacter(raw);
  logEvent('FinalOutput', finalOutput);
  writeReport();
  return finalOutput;
}

module.exports = { runChain };
JS

cat > main.js <<'JS'
const { runChain } = require('./chainRunner');
function dummyGenerator(prompt) {
  return `//HEADER\n// Intent: ${prompt}\nfunction add(a,b){ return a+b; }`;
}
(async () => {
  try {
    const result = runChain('Erzeuge eine Funktion add()', dummyGenerator);
    console.log('\n=== Verifizierter Output ===\n' + result);
  } catch (err) {
    console.error('\n[FAIL]', err.message);
    process.exitCode = 1;
  }
})();
JS

# 5) Minimal package descriptor (optional)
cat > package.json <<'JSON'
{
  "name": "fabrikage-cursor-integration",
  "version": "1.0.0",
  "description": "Cursor as Produktionskomponente der Fabrikage: bootstrap, monitor, pre/post verification, character-by-character, chain runner.",
  "main": "main.js",
  "scripts": {
    "start": "node main.js"
  },
  "license": "UNLICENSED"
}
JSON

# 6) One-click runner (no external dependencies beyond Node runtime)
if ! command -v node >/dev/null 2>&1; then
  say "Node.js runtime not found. Please install Node.js (LTS) and rerun."
  exit 1
fi

say "Starting Fabrikage–Cursor chain (bootstrap → verify → generate → post-verify → char-check → report)"
node main.js || true

say "Done. Reports in ./artifacts, logs serialized in report. All modules and Settings generated."


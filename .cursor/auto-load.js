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
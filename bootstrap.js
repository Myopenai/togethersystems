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
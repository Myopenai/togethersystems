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
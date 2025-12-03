function logEvent(event, detail) {
  const entry = { time: new Date().toISOString(), event, detail };
  if (!global.FABRIKAGE || !global.FABRIKAGE.logs) global.FABRIKAGE = { logs: [] };
  global.FABRIKAGE.logs.push(entry);
  if (global.FABRIKAGE.consoleMonitoring && global.FABRIKAGE.consoleMonitoring.enabled) {
    console.log(`[MONITOR] ${event}: ${detail}`);
  }
}
module.exports = { logEvent };
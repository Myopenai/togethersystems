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
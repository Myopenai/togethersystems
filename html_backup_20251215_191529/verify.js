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
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
#!/usr/bin/env node
/**
 * IBM Standard Test Suite
 * Testet alle Tech-Giganten-Practices und Industrial Fabrication Routine
 * 
 * Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
 */

const fs = require('fs');
const path = require('path');

const SETTINGS_ROOT = path.join(__dirname, 'Settings');
const IBM_STANDARD_FILE = path.join(SETTINGS_ROOT, 'IBM-STANDARD.json');
const INDUSTRIAL_ROUTINE_FILE = path.join(SETTINGS_ROOT, 'INDUSTRIAL-FABRICATION-ROUTINE.json');
const PRE_CODE_VERIFICATION_FILE = path.join(SETTINGS_ROOT, 'PRE-CODE-VERIFICATION-SYSTEM.json');
const CEOC_SYSTEM_FILE = path.join(SETTINGS_ROOT, 'CEOC-SYSTEM.json');
const JJC_SYSTEM_FILE = path.join(SETTINGS_ROOT, 'JJC-SYSTEM.json');
const RAUMKONTINUUM_FILE = path.join(SETTINGS_ROOT, 'RAUMKONTINUUM-SYSTEM.json');

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function test(name, fn) {
  try {
    fn();
    testResults.passed++;
    console.log(`✅ ${name}`);
  } catch (e) {
    testResults.failed++;
    testResults.errors.push({ test: name, error: e.message });
    console.error(`❌ ${name}: ${e.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('🏭 IBM STANDARD TEST SUITE - START\n');

// Test 1: IBM-STANDARD.json existiert und ist valide
test('IBM-STANDARD.json existiert', () => {
  assert(fs.existsSync(IBM_STANDARD_FILE), 'IBM-STANDARD.json fehlt');
  const data = JSON.parse(fs.readFileSync(IBM_STANDARD_FILE, 'utf8'));
  assert(data.id === 'IBM-STANDARD', 'Falsche ID');
  assert(data.status === 'PERMANENT-ACTIVE', 'Status nicht PERMANENT-ACTIVE');
  assert(data.mandatory === true, 'Nicht mandatory');
  assert(data.hardCoded === true, 'Nicht hardCoded');
});

// Test 2: Tech-Giganten-Practices vorhanden
test('Tech-Giganten-Practices vorhanden', () => {
  const data = JSON.parse(fs.readFileSync(IBM_STANDARD_FILE, 'utf8'));
  assert(data.techGiants, 'techGiants fehlt');
  assert(data.techGiants.google, 'Google fehlt');
  assert(data.techGiants.microsoft, 'Microsoft fehlt');
  assert(data.techGiants.amazon, 'Amazon fehlt');
  assert(data.techGiants.apple, 'Apple fehlt');
  assert(data.techGiants.meta, 'Meta fehlt');
  assert(data.techGiants.google.practices.length > 0, 'Google practices leer');
});

// Test 3: Scientific Institutions vorhanden
test('Scientific Institutions vorhanden', () => {
  const data = JSON.parse(fs.readFileSync(IBM_STANDARD_FILE, 'utf8'));
  assert(data.scientificInstitutions, 'scientificInstitutions fehlt');
  assert(data.scientificInstitutions.nasa, 'NASA fehlt');
  assert(data.scientificInstitutions.mit, 'MIT fehlt');
  assert(data.scientificInstitutions.stanford, 'Stanford fehlt');
  assert(data.scientificInstitutions.harvard, 'Harvard fehlt');
});

// Test 4: Zero-Defect-Principles vorhanden
test('Zero-Defect-Principles vorhanden', () => {
  const data = JSON.parse(fs.readFileSync(IBM_STANDARD_FILE, 'utf8'));
  assert(data.expansion.zeroDefectPrinciples, 'zeroDefectPrinciples fehlt');
  assert(data.expansion.zeroDefectPrinciples.formalVerification === true, 'formalVerification nicht aktiv');
  assert(data.expansion.zeroDefectPrinciples.comprehensiveTesting === true, 'comprehensiveTesting nicht aktiv');
});

// Test 5: Industrial Fabrication Routine vorhanden
test('Industrial Fabrication Routine vorhanden', () => {
  assert(fs.existsSync(INDUSTRIAL_ROUTINE_FILE), 'INDUSTRIAL-FABRICATION-ROUTINE.json fehlt');
  const data = JSON.parse(fs.readFileSync(INDUSTRIAL_ROUTINE_FILE, 'utf8'));
  assert(data.id === 'INDUSTRIAL-FABRICATION-ROUTINE', 'Falsche ID');
  assert(data.status === 'PERMANENT-ACTIVE', 'Status nicht PERMANENT-ACTIVE');
  assert(data.mandatory === true, 'Nicht mandatory');
  assert(data.workflow, 'workflow fehlt');
  assert(data.workflow.pre, 'workflow.pre fehlt');
  assert(data.workflow.during, 'workflow.during fehlt');
  assert(data.workflow.post, 'workflow.post fehlt');
});

// Test 6: Pre-Code-Verification vorhanden
test('Pre-Code-Verification vorhanden', () => {
  assert(fs.existsSync(PRE_CODE_VERIFICATION_FILE), 'PRE-CODE-VERIFICATION-SYSTEM.json fehlt');
  const data = JSON.parse(fs.readFileSync(PRE_CODE_VERIFICATION_FILE, 'utf8'));
  assert(data.characterByCharacter.enabled === true, 'characterByCharacter nicht aktiv');
  assert(data.verificationLayers.length > 0, 'verificationLayers leer');
});

// Test 7: CEOC-System vorhanden
test('CEOC-System vorhanden', () => {
  assert(fs.existsSync(CEOC_SYSTEM_FILE), 'CEOC-SYSTEM.json fehlt');
  const data = JSON.parse(fs.readFileSync(CEOC_SYSTEM_FILE, 'utf8'));
  assert(data.id === 'CEOC-SYSTEM', 'Falsche ID');
  assert(data.dataStructure.ceoc, 'ceoc dataStructure fehlt');
});

// Test 8: JJC-System vorhanden
test('JJC-System vorhanden', () => {
  assert(fs.existsSync(JJC_SYSTEM_FILE), 'JJC-SYSTEM.json fehlt');
  const data = JSON.parse(fs.readFileSync(JJC_SYSTEM_FILE, 'utf8'));
  assert(data.id === 'JJC-SYSTEM', 'Falsche ID');
  assert(data.dataStructure.jjc, 'jjc dataStructure fehlt');
});

// Test 9: Raumkontinuum-System vorhanden
test('Raumkontinuum-System vorhanden', () => {
  assert(fs.existsSync(RAUMKONTINUUM_FILE), 'RAUMKONTINUUM-SYSTEM.json fehlt');
  const data = JSON.parse(fs.readFileSync(RAUMKONTINUUM_FILE, 'utf8'));
  assert(data.id === 'RAUMKONTINUUM-SYSTEM', 'Falsche ID');
  assert(data.coordinateSystem, 'coordinateSystem fehlt');
});

// Test 10: Workflow-Integrität
test('Workflow-Integrität', () => {
  const data = JSON.parse(fs.readFileSync(INDUSTRIAL_ROUTINE_FILE, 'utf8'));
  assert(Array.isArray(data.workflow.pre), 'workflow.pre muss Array sein');
  assert(Array.isArray(data.workflow.during), 'workflow.during muss Array sein');
  assert(Array.isArray(data.workflow.post), 'workflow.post muss Array sein');
  assert(data.workflow.pre.length > 0, 'workflow.pre leer');
  assert(data.workflow.during.length > 0, 'workflow.during leer');
  assert(data.workflow.post.length > 0, 'workflow.post leer');
});

// Test 11: Error-Prevention vorhanden
test('Error-Prevention vorhanden', () => {
  const data = JSON.parse(fs.readFileSync(INDUSTRIAL_ROUTINE_FILE, 'utf8'));
  assert(data.errorPrevention, 'errorPrevention fehlt');
  assert(data.errorPrevention.patternStorePath, 'patternStorePath fehlt');
  assert(data.errorPrevention.neverAgainMarker, 'neverAgainMarker fehlt');
});

// Test 12: MCP-Integration vorhanden
test('MCP-Integration vorhanden', () => {
  const data = JSON.parse(fs.readFileSync(INDUSTRIAL_ROUTINE_FILE, 'utf8'));
  assert(data.mcp, 'mcp fehlt');
  assert(data.mcp.playwright, 'playwright fehlt');
  assert(data.mcp.codebaseSearch, 'codebaseSearch fehlt');
  assert(data.mcp.fileOperations, 'fileOperations fehlt');
  assert(data.mcp.terminal, 'terminal fehlt');
  assert(data.mcp.webSearch, 'webSearch fehlt');
});

// Test 13: Console-Heart vorhanden
test('Console-Heart vorhanden', () => {
  const data = JSON.parse(fs.readFileSync(INDUSTRIAL_ROUTINE_FILE, 'utf8'));
  assert(data.consoleHeart, 'consoleHeart fehlt');
  assert(data.consoleHeart.enabled === true, 'consoleHeart nicht aktiv');
});

// Test 14: Constraints vorhanden
test('Constraints vorhanden', () => {
  const data = JSON.parse(fs.readFileSync(INDUSTRIAL_ROUTINE_FILE, 'utf8'));
  assert(data.constraints, 'constraints fehlt');
  assert(data.constraints.forbidGuardDeactivation === true, 'forbidGuardDeactivation nicht aktiv');
  assert(data.constraints.forbidDirectRoutineModification === true, 'forbidDirectRoutineModification nicht aktiv');
});

// Test 15: TTT-Versiegelung vorhanden
test('TTT-Versiegelung vorhanden', () => {
  const data = JSON.parse(fs.readFileSync(IBM_STANDARD_FILE, 'utf8'));
  assert(data.ttt, 'ttt fehlt');
  assert(data.ttt.sealed === true, 'ttt.sealed nicht true');
  assert(data.ttt.horizontalBarInfinity === true, 'horizontalBarInfinity nicht true');
  assert(data.ttt.permanent === true, 'permanent nicht true');
  assert(data.ttt.hardCoded === true, 'hardCoded nicht true');
});

console.log('\n📊 TEST ERGEBNISSE:');
console.log(`✅ Bestanden: ${testResults.passed}`);
console.log(`❌ Fehlgeschlagen: ${testResults.failed}`);

if (testResults.errors.length > 0) {
  console.log('\n❌ FEHLER:');
  testResults.errors.forEach(e => {
    console.log(`  - ${e.test}: ${e.error}`);
  });
}

if (testResults.failed === 0) {
  console.log('\n🎉 ALLE TESTS BESTANDEN - IBM STANDARD VOLLSTÄNDIG');
  process.exit(0);
} else {
  console.log('\n⚠️  EINIGE TESTS FEHLGESCHLAGEN');
  process.exit(1);
}


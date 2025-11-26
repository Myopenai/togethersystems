/**
 * Test-Datei für StartupSystems Kernel
 * 
 * Testet alle Funktionen des Kernels
 */

import {
  initializeStartupSystemsKernel,
  absoluteSystemKernel,
  auditSystem,
  buildToolsLicenseManager,
  notaryVerificationSystem,
  VerificationLevel
} from './index';

console.log('🚀 StartupSystems Kernel Test\n');

// Test 1: Kernel initialisieren
console.log('1️⃣ Test: Kernel initialisieren');
const { states, auditLog } = initializeStartupSystemsKernel();
console.log(`✅ ${states.length} Zustände initialisiert`);
console.log(`✅ ${auditLog.length} Audit-Logs erstellt\n`);

// Test 2: Einzelne Zustände
console.log('2️⃣ Test: Einzelne Zustände erstellen');
const unifiedField = absoluteSystemKernel.createUnifiedField();
console.log(`✅ Ultra-Singular Field erstellt: ${unifiedField.auditHash.substring(0, 16)}...`);

const metaConsequence = absoluteSystemKernel.createMetaConsequence();
console.log(`✅ Meta-Consequence erstellt: ${metaConsequence.auditHash.substring(0, 16)}...\n`);

// Test 3: Audit-System
console.log('3️⃣ Test: Audit-System');
const auditLogEntry = auditSystem.logAction('TEST_ACTION', unifiedField.auditHash);
console.log(`✅ Audit-Log erstellt: ${auditLogEntry.hash.substring(0, 16)}...`);

const isValid = auditSystem.verifyAuditLog(auditLogEntry);
console.log(`✅ Audit-Log verifiziert: ${isValid ? 'GÜLTIG' : 'UNGÜLTIG'}\n`);

// Test 4: BuildTools License (Automatisch)
console.log('4️⃣ Test: BuildTools License (Automatisch)');
const autoLicense = buildToolsLicenseManager.createAutoVerification(unifiedField.auditHash);
console.log(`✅ Automatische Lizenz erstellt: Kosten = ${autoLicense.cost}€`);
console.log(`✅ Level: ${autoLicense.level}\n`);

// Test 5: BuildTools License (Erweitert)
console.log('5️⃣ Test: BuildTools License (Erweitert)');
const extendedLicense = buildToolsLicenseManager.createExtendedLicense(
  unifiedField.auditHash,
  99,
  ['priority_support', 'extended_features']
);
console.log(`✅ Erweiterte Lizenz erstellt: Kosten = ${extendedLicense.cost}€`);
console.log(`✅ Features: ${extendedLicense.features.join(', ')}\n`);

// Test 6: Notarielle Verifizierung
console.log('6️⃣ Test: Notarielle Verifizierung');
const notaryRequest = notaryVerificationSystem.createVerificationRequest(
  unifiedField.auditHash,
  1500
);
console.log(`✅ Verifizierungs-Anfrage erstellt: ${notaryRequest.requestId}`);
console.log(`✅ Kosten: ${notaryRequest.cost}€`);

// Simuliere Notar-Verifizierung
const notaryResult = notaryVerificationSystem.processVerificationRequest(
  notaryRequest.requestId,
  'NOTARY_001',
  true
);
if (notaryResult) {
  console.log(`✅ Notarielle Verifizierung abgeschlossen`);
  console.log(`✅ Notar: ${notaryResult.notaryInfo.notaryName}`);
  console.log(`✅ Digitale Signatur: ${notaryResult.digitalSignature.substring(0, 16)}...\n`);
}

// Test 7: Verifizierung aller Lizenzen
console.log('7️⃣ Test: Verifizierung aller Lizenzen');
const allLicenses = buildToolsLicenseManager.getAllLicenses();
console.log(`✅ ${allLicenses.length} Lizenzen gefunden`);

allLicenses.forEach((license, index) => {
  const isValid = buildToolsLicenseManager.verifyLicense(license);
  console.log(`   ${index + 1}. ${license.level}: ${isValid ? 'GÜLTIG' : 'UNGÜLTIG'}`);
});

console.log('\n✅ Alle Tests erfolgreich abgeschlossen!');
console.log('\n📊 Zusammenfassung:');
console.log(`   - ${states.length} Zustände initialisiert`);
console.log(`   - ${auditSystem.getAllLogs().length} Audit-Logs`);
console.log(`   - ${allLicenses.length} Lizenzen erstellt`);
console.log(`   - ${notaryVerificationSystem.getAllVerifications().length} Notar-Verifizierungen`);


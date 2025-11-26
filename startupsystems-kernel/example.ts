/**
 * Beispiel: Verwendung des StartupSystems Kernels
 * 
 * Zeigt die grundlegende Verwendung des Kernels
 */

import {
  initializeStartupSystemsKernel,
  absoluteSystemKernel,
  auditSystem,
  buildToolsLicenseManager,
  VerificationLevel
} from './src/index';

async function example() {
  console.log('🚀 StartupSystems Kernel Beispiel\n');

  // 1. Kernel initialisieren
  console.log('📦 Initialisiere Kernel...');
  const { states } = initializeStartupSystemsKernel();
  console.log(`✅ ${states.length} Zustände initialisiert\n`);

  // 2. Kernel-Hash für BuildTools
  const kernelHash = states[0].auditHash;
  console.log(`🔑 Kernel-Hash: ${kernelHash.substring(0, 32)}...\n`);

  // 3. Automatische Verifizierung (kostenlos)
  console.log('🔐 Erstelle automatische Verifizierung (kostenlos)...');
  const autoLicense = await buildToolsLicenseManager.createLicense(
    VerificationLevel.AUTO,
    kernelHash
  );
  console.log(`✅ Automatische Lizenz erstellt`);
  console.log(`   Kosten: ${autoLicense.cost}€`);
  console.log(`   Level: ${autoLicense.level}\n`);

  // 4. Erweiterte Lizenz (kostenpflichtig)
  console.log('💎 Erstelle erweiterte Lizenz (kostenpflichtig)...');
  const extendedLicense = await buildToolsLicenseManager.createLicense(
    VerificationLevel.EXTENDED,
    kernelHash,
    {
      cost: 99,
      features: ['priority_support', 'extended_audit_logs']
    }
  );
  console.log(`✅ Erweiterte Lizenz erstellt`);
  console.log(`   Kosten: ${extendedLicense.cost}€`);
  console.log(`   Features: ${extendedLicense.features?.join(', ')}\n`);

  // 5. Audit-Logs exportieren
  console.log('📋 Exportiere Audit-Logs...');
  const auditLogs = auditSystem.exportLogs();
  console.log(`✅ Audit-Logs exportiert (${auditLogs.length} Zeichen)`);
  console.log(`   Garantie: NO_USER_DATA\n`);

  // 6. Verifizierung
  console.log('✅ Verifiziere Lizenzen...');
  const autoValid = buildToolsLicenseManager.verifyLicense(autoLicense);
  const extendedValid = buildToolsLicenseManager.verifyLicense(extendedLicense);
  
  console.log(`   Automatische Lizenz: ${autoValid ? 'GÜLTIG' : 'UNGÜLTIG'}`);
  console.log(`   Erweiterte Lizenz: ${extendedValid ? 'GÜLTIG' : 'UNGÜLTIG'}\n`);

  console.log('✅ Beispiel erfolgreich abgeschlossen!');
}

// Führe Beispiel aus
example().catch(console.error);


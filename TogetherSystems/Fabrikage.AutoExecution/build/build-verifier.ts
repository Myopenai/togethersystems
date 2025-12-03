/**
 * ============================================================================
 * BUILD VERIFIER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Build Verifier - Verifiziert Builds automatisch
 * ============================================================================
 */

import { BuildManager, BuildInfo } from './build-manager';

export interface VerificationResult {
  status: 'successful' | 'incomplete' | 'research';
  testResults: BuildInfo['testResults'];
  autoFixAttempts: number;
  errors: string[];
  timestamp: string;
}

export class BuildVerifier {
  private buildManager: BuildManager;

  constructor() {
    this.buildManager = new BuildManager();
  }

  /**
   * Verifiziert Build automatisch
   */
  async verifyBuild(buildPath: string): Promise<VerificationResult> {
    console.log('T,. Build Verifier: Verifiziere Build...');

    // Führe Tests aus (Mock - in Produktion würde hier die tatsächlichen Tests stattfinden)
    const testResults = await this.runTests(buildPath);

    // Prüfe Auto-Fix-Versuche
    const autoFixAttempts = await this.getAutoFixAttempts(buildPath);

    // Bestimme Status
    const status = this.determineStatus(testResults, autoFixAttempts);

    // Sammle Fehler (falls vorhanden)
    const errors = this.collectErrors(testResults, status);

    const result: VerificationResult = {
      status,
      testResults,
      autoFixAttempts,
      errors,
      timestamp: new Date().toISOString(),
    };

    // Verarbeite Build
    await this.buildManager.processBuild(buildPath, testResults, autoFixAttempts);

    console.log(`T,. Build Verifier: Build verifiziert → ${status} ✓`);
    return result;
  }

  /**
   * Führt Tests aus (Mock)
   */
  private async runTests(buildPath: string): Promise<BuildInfo['testResults']> {
    // In Produktion würde hier die tatsächlichen Tests stattfinden
    // z.B. über Playwright, Jest, etc.
    
    // Mock: Simuliere Test-Ergebnisse
    return {
      phase1: 100, // Initialisierung
      phase2: 100, // Code-Generierung
      phase3: 100, // Build & Pipeline
      phase4: 100, // Runtime & Self-Healing
      phase5: 100, // UI & Playwright
      phase6: 100, // Produktprüfung
      phase7: 100, // Nachtest
      overall: 100,
    };
  }

  /**
   * Gibt Auto-Fix-Versuche zurück
   */
  private async getAutoFixAttempts(buildPath: string): Promise<number> {
    // In Produktion würde hier die tatsächliche Anzahl aus Logs gelesen
    return 0; // Mock
  }

  /**
   * Bestimmt Status
   */
  private determineStatus(
    testResults: BuildInfo['testResults'],
    autoFixAttempts: number
  ): 'successful' | 'incomplete' | 'research' {
    // Erfolgreich: 100% in allen Phasen
    if (testResults.overall === 100) {
      return 'successful';
    }

    // Research: > 10 fehlgeschlagene Versuche
    if (autoFixAttempts > 10) {
      return 'research';
    }

    // Incomplete: Alles andere
    return 'incomplete';
  }

  /**
   * Sammelt Fehler
   */
  private collectErrors(
    testResults: BuildInfo['testResults'],
    status: VerificationResult['status']
  ): string[] {
    const errors: string[] = [];

    if (testResults.phase1 < 100) errors.push('Phase 1 (Initialisierung) nicht 100%');
    if (testResults.phase2 < 100) errors.push('Phase 2 (Code-Generierung) nicht 100%');
    if (testResults.phase3 < 100) errors.push('Phase 3 (Build & Pipeline) nicht 100%');
    if (testResults.phase4 < 100) errors.push('Phase 4 (Runtime & Self-Healing) nicht 100%');
    if (testResults.phase5 < 100) errors.push('Phase 5 (UI & Playwright) nicht 100%');
    if (testResults.phase6 < 100) errors.push('Phase 6 (Produktprüfung) nicht 100%');
    if (testResults.phase7 < 100) errors.push('Phase 7 (Nachtest) nicht 100%');

    return errors;
  }
}


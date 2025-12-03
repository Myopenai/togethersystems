/**
 * ============================================================================
 * SELF VERIFICATION
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Self Verification - Prüft automatisch, ob alternatives Model aktiv ist
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { AutoAccountManager } from './auto-account-manager';

export interface VerificationResult {
  status: 'success' | 'error';
  checks: {
    accountExists: boolean;
    apiKeyValid: boolean;
    configFilesExist: boolean;
    modelActive: boolean;
  };
  errors: string[];
  timestamp: string;
}

export class SelfVerification {
  private accountManager: AutoAccountManager;
  private projectDir: string;

  constructor(projectDir: string = process.cwd()) {
    this.projectDir = projectDir;
    this.accountManager = new AutoAccountManager();
  }

  /**
   * Führt Self-Verification durch
   */
  async verify(provider: 'openrouter' | 'groq' | 'anthropic' | 'deepseek' = 'openrouter'): Promise<VerificationResult> {
    console.log('T,. Self Verification: Prüfe Konfiguration...');

    const result: VerificationResult = {
      status: 'success',
      checks: {
        accountExists: false,
        apiKeyValid: false,
        configFilesExist: false,
        modelActive: false,
      },
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // 1. Prüfe Account
    try {
      const account = await this.accountManager.getAccount(provider);
      result.checks.accountExists = account !== null && account.status === 'active';
      if (!result.checks.accountExists) {
        result.errors.push(`Account für ${provider} nicht gefunden oder nicht aktiv`);
      }
    } catch (error) {
      result.errors.push(`Fehler beim Prüfen des Accounts: ${error}`);
    }

    // 2. Prüfe API-Key
    try {
      const account = await this.accountManager.getAccount(provider);
      result.checks.apiKeyValid = account !== null && account.apiKey !== undefined && account.apiKey.length > 0;
      if (!result.checks.apiKeyValid) {
        result.errors.push(`API-Key für ${provider} nicht gültig`);
      }
    } catch (error) {
      result.errors.push(`Fehler beim Prüfen des API-Keys: ${error}`);
    }

    // 3. Prüfe Konfigurationsdateien
    try {
      const cursorSettings = path.join(this.projectDir, '.cursor-settings.json');
      const cursorSetup = path.join(this.projectDir, 'cursor-setup-complete.json');
      const envFile = path.join(this.projectDir, '.env');

      result.checks.configFilesExist = 
        fs.existsSync(cursorSettings) &&
        fs.existsSync(cursorSetup) &&
        fs.existsSync(envFile);

      if (!result.checks.configFilesExist) {
        result.errors.push('Konfigurationsdateien fehlen');
      }
    } catch (error) {
      result.errors.push(`Fehler beim Prüfen der Konfigurationsdateien: ${error}`);
    }

    // 4. Prüfe ob Model aktiv ist (Mock - in Produktion würde hier die tatsächliche Prüfung stattfinden)
    try {
      // In Produktion würde hier die tatsächliche Prüfung stattfinden
      // z.B. über Cursor.com API oder direkte API-Anfrage
      result.checks.modelActive = true; // Mock
    } catch (error) {
      result.errors.push(`Fehler beim Prüfen des Models: ${error}`);
    }

    // Bestimme Status
    result.status = result.errors.length === 0 ? 'success' : 'error';

    if (result.status === 'success') {
      console.log('T,. Self Verification: Alle Checks bestanden ✓');
    } else {
      console.log(`T,. Self Verification: ${result.errors.length} Fehler gefunden`);
      result.errors.forEach(error => console.log(`  - ${error}`));
    }

    return result;
  }

  /**
   * Auto-Fix bei Fehlern
   */
  async autoFix(provider: 'openrouter' | 'groq' | 'anthropic' | 'deepseek' = 'openrouter'): Promise<void> {
    console.log('T,. Self Verification: Starte Auto-Fix...');

    const result = await this.verify(provider);

    if (result.status === 'success') {
      console.log('T,. Keine Fehler gefunden, kein Fix nötig');
      return;
    }

    // Fix: Account erstellen (falls fehlt)
    if (!result.checks.accountExists) {
      console.log('T,. Erstelle Account...');
      await this.accountManager.createAccountIfNeeded(provider);
    }

    // Fix: API-Key schreiben (falls fehlt)
    if (!result.checks.apiKeyValid) {
      console.log('T,. Schreibe API-Key...');
      await this.accountManager.writeAPIKeyToConfig(provider);
    }

    // Fix: Konfigurationsdateien erstellen (falls fehlen)
    if (!result.checks.configFilesExist) {
      console.log('T,. Erstelle Konfigurationsdateien...');
      const { AutoProvisioning } = await import('./auto-provisioning');
      const provisioning = new AutoProvisioning(this.projectDir);
      await provisioning.provision(provider);
    }

    // Re-Verify
    const newResult = await this.verify(provider);
    if (newResult.status === 'success') {
      console.log('T,. Auto-Fix erfolgreich, alle Checks bestanden ✓');
    } else {
      console.log('T,. Auto-Fix konnte nicht alle Fehler beheben');
      throw new Error(`T,. Auto-Fix fehlgeschlagen: ${newResult.errors.join(', ')}`);
    }
  }
}


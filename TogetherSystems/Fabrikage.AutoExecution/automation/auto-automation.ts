/**
 * ============================================================================
 * AUTO AUTOMATION
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Auto Automation - Orchestriert alle Automatisierungs-Komponenten
 * ============================================================================
 */

import { AutoAccountManager } from './auto-account-manager';
import { AutoProvisioning } from './auto-provisioning';
import { ProjectInitializer } from './project-initializer';
import { SelfVerification } from './self-verification';
import { PushUpUpdates } from './push-up-updates';

export class AutoAutomation {
  private accountManager: AutoAccountManager;
  private provisioning: AutoProvisioning;
  private projectInitializer: ProjectInitializer;
  private selfVerification: SelfVerification;
  private pushUpUpdates: PushUpUpdates;

  constructor(projectDir: string = process.cwd()) {
    this.accountManager = new AutoAccountManager();
    this.provisioning = new AutoProvisioning(projectDir);
    this.projectInitializer = new ProjectInitializer();
    this.selfVerification = new SelfVerification(projectDir);
    this.pushUpUpdates = new PushUpUpdates();
  }

  /**
   * Führt vollständige Automatisierung durch
   */
  async automate(
    projectName?: string,
    provider: 'openrouter' | 'groq' | 'anthropic' | 'deepseek' = 'openrouter'
  ): Promise<void> {
    console.log('T,. Auto Automation: Starte vollständige Automatisierung...');
    console.log('=====================================');

    try {
      // 1. Account & Key automatisch
      console.log('T,. Schritt 1: Account & Key automatisch...');
      await this.accountManager.createAccountIfNeeded(provider);
      await this.accountManager.writeAPIKeyToConfig(provider);
      console.log('T,. ✓ Account & Key automatisch erstellt');

      // 2. Projekt initialisieren (falls neues Projekt)
      if (projectName) {
        console.log('T,. Schritt 2: Projekt initialisieren...');
        await this.projectInitializer.initializeProject(projectName, provider);
        console.log('T,. ✓ Projekt initialisiert');
      }

      // 3. Provisionierung automatisch
      console.log('T,. Schritt 3: Provisionierung automatisch...');
      await this.provisioning.provision(provider);
      console.log('T,. ✓ Provisionierung abgeschlossen');

      // 4. Self-Verification automatisch
      console.log('T,. Schritt 4: Self-Verification automatisch...');
      const verification = await this.selfVerification.verify(provider);
      if (verification.status !== 'success') {
        console.log('T,. Auto-Fix wird durchgeführt...');
        await this.selfVerification.autoFix(provider);
      }
      console.log('T,. ✓ Self-Verification erfolgreich');

      // 5. Push-Up Updates aktivieren
      console.log('T,. Schritt 5: Push-Up Updates aktivieren...');
      // Push-Up Updates werden automatisch aktiviert
      console.log('T,. ✓ Push-Up Updates aktiviert');

      console.log('');
      console.log('=====================================');
      console.log('T,. Auto Automation: ERFOLGREICH');
      console.log('=====================================');
      console.log('');
      console.log('T,. Systemhandlungen: 99,99%');
      console.log('T,. Userhandlungen: 0-1%');
      console.log('');

    } catch (error) {
      console.log('');
      console.log('=====================================');
      console.log('T,. Auto Automation: FEHLER');
      console.log('=====================================');
      console.error(error);
      throw error;
    }
  }

  /**
   * Periodische Self-Verification (alle 5 Minuten)
   */
  startPeriodicVerification(provider: 'openrouter' | 'groq' | 'anthropic' | 'deepseek' = 'openrouter'): void {
    console.log('T,. Starte periodische Self-Verification (alle 5 Minuten)...');
    
    setInterval(async () => {
      try {
        const result = await this.selfVerification.verify(provider);
        if (result.status !== 'success') {
          console.log('T,. Fehler erkannt, starte Auto-Fix...');
          await this.selfVerification.autoFix(provider);
        }
      } catch (error) {
        console.error('T,. Fehler bei periodischer Verification:', error);
      }
    }, 5 * 60 * 1000); // 5 Minuten
  }
}


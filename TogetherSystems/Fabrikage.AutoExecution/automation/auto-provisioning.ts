/**
 * ============================================================================
 * AUTO PROVISIONING
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Auto Provisioning - Erstellt alle Konfigurationsdateien automatisch
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { AutoAccountManager } from './auto-account-manager';

export class AutoProvisioning {
  private accountManager: AutoAccountManager;
  private projectDir: string;

  constructor(projectDir: string = process.cwd()) {
    this.projectDir = projectDir;
    this.accountManager = new AutoAccountManager();
  }

  /**
   * Provisioniert Projekt automatisch
   */
  async provision(provider: 'openrouter' | 'groq' | 'anthropic' | 'deepseek' = 'openrouter'): Promise<void> {
    console.log('T,. Auto Provisioning: Starte automatische Provisionierung...');

    // 1. Erstelle Account (falls nötig)
    await this.accountManager.createAccountIfNeeded(provider);

    // 2. Schreibe API-Key in Konfiguration
    await this.accountManager.writeAPIKeyToConfig(provider);

    // 3. Erstelle .cursor-settings.json
    await this.createCursorSettings(provider);

    // 4. Erstelle cursor-setup-complete.json
    await this.createCursorSetupComplete(provider);

    // 5. Erstelle .env (falls nicht vorhanden)
    await this.createEnvFile(provider);

    console.log('T,. Auto Provisioning: Provisionierung abgeschlossen ✓');
  }

  /**
   * Erstellt .cursor-settings.json
   */
  private async createCursorSettings(provider: string): Promise<void> {
    const account = await this.accountManager.getAccount(provider as any);
    if (!account) {
      throw new Error(`T,. Kein Account für ${provider} gefunden`);
    }

    const model = this.getDefaultModel(provider);
    
    const settings = {
      model: {
        provider: provider,
        apiKey: "${CURSOR_API_KEY}",
        model: model,
        temperature: 0.2,
        maxTokens: 4000,
      },
      features: {
        autocomplete: true,
        chat: true,
        composer: true,
      },
    };

    const filePath = path.join(this.projectDir, '.cursor-settings.json');
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
    
    console.log('T,. .cursor-settings.json erstellt ✓');
  }

  /**
   * Erstellt cursor-setup-complete.json
   */
  private async createCursorSetupComplete(provider: string): Promise<void> {
    const account = await this.accountManager.getAccount(provider as any);
    if (!account) {
      throw new Error(`T,. Kein Account für ${provider} gefunden`);
    }

    const model = this.getDefaultModel(provider);
    
    const setup = {
      cursor: {
        version: "1.0.0",
        provider: provider,
        apiKey: "${CURSOR_API_KEY}",
        models: {
          default: model,
          autocomplete: model,
          chat: model,
          composer: model,
        },
        settings: {
          temperature: 0.2,
          maxTokens: 4000,
          topP: 0.95,
        },
      },
      instructions: {
        step1: "Account automatisch erstellt",
        step2: "API-Key automatisch generiert",
        step3: "Konfigurationsdateien automatisch erstellt",
        step4: "Bereit für Verwendung!",
      },
    };

    const filePath = path.join(this.projectDir, 'cursor-setup-complete.json');
    fs.writeFileSync(filePath, JSON.stringify(setup, null, 2), 'utf8');
    
    console.log('T,. cursor-setup-complete.json erstellt ✓');
  }

  /**
   * Erstellt .env-Datei
   */
  private async createEnvFile(provider: string): Promise<void> {
    const account = await this.accountManager.getAccount(provider as any);
    if (!account || !account.apiKey) {
      throw new Error(`T,. Kein API-Key für ${provider} gefunden`);
    }

    const envFile = path.join(this.projectDir, '.env');
    
    // Prüfe ob .env bereits existiert
    if (fs.existsSync(envFile)) {
      let envContent = fs.readFileSync(envFile, 'utf8');
      
      // Entferne alte CURSOR_API_KEY Einträge
      envContent = envContent.replace(new RegExp(`CURSOR_API_KEY.*`, 'g'), '');
      
      // Füge neuen Key hinzu
      envContent += `\nCURSOR_API_KEY=${account.apiKey}\n`;
      
      fs.writeFileSync(envFile, envContent, 'utf8');
    } else {
      // Erstelle neue .env
      fs.writeFileSync(envFile, `CURSOR_API_KEY=${account.apiKey}\n`, 'utf8');
    }
    
    console.log('T,. .env-Datei erstellt/aktualisiert ✓');
  }

  /**
   * Gibt Standard-Model für Provider zurück
   */
  private getDefaultModel(provider: string): string {
    switch (provider) {
      case 'openrouter':
        return 'deepseek/deepseek-coder';
      case 'groq':
        return 'llama-3.1-70b-versatile';
      case 'anthropic':
        return 'claude-3-5-sonnet-20241022';
      case 'deepseek':
        return 'deepseek-coder';
      default:
        return 'deepseek/deepseek-coder';
    }
  }
}


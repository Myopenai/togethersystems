/**
 * Application Generator - Versionsbezogener Generator
 * 
 * Formel: {O}({O})=t
 * SPEICHERPLATZ FÜR =PROGRAM ({T})T=USER VERSION
 * 
 * User kann mittels Application Generator versionsbezogen seine Version wieder entschlüsseln
 */

import { getVersioningSealManager } from './ttt-versioning-seal.js';
import { restoreKeyGenerator } from './restore-key-generator.js';

/**
 * Application Generator
 */
export class ApplicationGenerator {
  constructor(settingsPath) {
    this.settingsPath = settingsPath;
    this.versioningManager = getVersioningSealManager(settingsPath);
  }

  /**
   * Generiert Application für User-Version
   * 
   * Formel: {O}({O})=t
   * O = Original
   * t = T (Nagel)
   */
  async generateApplication(userVersion, chatHistory = [], originalThoughts = '') {
    // Generiere Wiederherstellungsschlüssel aus Chat
    const restoreKey = restoreKeyGenerator.generateRestoreKeyFromChat(
      chatHistory,
      userVersion,
      originalThoughts
    );

    // Lade Settings
    const settings = await this.loadSettings();

    // Versiegele Version
    const sealed = await this.versioningManager.sealVersion(
      settings,
      userVersion,
      {
        chatHistory,
        originalThoughts,
        restoreKey
      }
    );

    // Generiere Application
    const application = {
      userVersion,
      formula: '{O}({O})=t',
      storage: `PROGRAM({T})T=${userVersion}`,
      restoreKey: sealed.restoreKey,
      nail: sealed.nail,
      versionId: sealed.versionId,
      instructions: [
        '1. Verwende T (Nagel) als Schlüssel',
        '2. Kombiniere mit Wiederherstellungsschlüssel',
        '3. Dekodiere mit ABSOLUTES ALPHABET (umgekehrt)',
        '4. Entferne Versiegelung',
        '5. Wiederherstelle Original-Daten'
      ],
      branding: 'DER NAGEL | OHNE HORIZONT WAGERECHTE UPERSITE STANDING EVER LASTING LAW T,.&T,.T,,,.(C)(R)TEL1.NL-0031613803782-VERWENDET-ALLES-FACTUEELE-MATERIAL',
      endOfLine: 'T.END OF LINE',
      generatedAt: new Date().toISOString()
    };

    return application;
  }

  /**
   * Wiederherstellung durch User
   */
  async restoreUserVersion(versionId, userVersion, restoreKey) {
    // Lade Private Key
    const privateKeyPath = path.join(
      this.settingsPath,
      'versions',
      `${versionId}.private.key`
    );

    if (!fs.existsSync(privateKeyPath)) {
      throw new Error('Private Key nicht gefunden');
    }

    const privateKeySealed = JSON.parse(fs.readFileSync(privateKeyPath, 'utf-8'));

    // Entsiegel Private Key
    const versionPath = path.join(
      this.settingsPath,
      'versions',
      `${versionId}.json`
    );
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));

    const privateKey = this.versioningManager.unsealPrivateKey(
      privateKeySealed,
      version.nail
    );

    // Wiederherstelle Version
    const restored = await this.versioningManager.restoreVersion(
      versionId,
      restoreKey,
      privateKey
    );

    return restored;
  }

  /**
   * Lädt Settings
   */
  async loadSettings() {
    // Lade alle Settings
    const configs = {};
    const configFiles = [
      'mcp-config.json',
      'playwright-config.json',
      'autofix-config.json',
      'deployment-config.json',
      'neural-network-config.json',
      'encryption-config.json',
      'versioning-config.json'
    ];

    for (const file of configFiles) {
      try {
        const configPath = path.join(this.settingsPath, 'config', file);
        if (fs.existsSync(configPath)) {
          configs[file.replace('.json', '')] = JSON.parse(
            fs.readFileSync(configPath, 'utf-8')
          );
        }
      } catch (error) {
        console.warn(`Could not load ${file}:`, error.message);
      }
    }

    return configs;
  }

  /**
   * Listet alle User-Versionen
   */
  listUserVersions() {
    return this.versioningManager.listVersions();
  }
}

/**
 * Singleton-Instanz
 */
let applicationGenerator = null;

export function getApplicationGenerator(settingsPath) {
  if (!applicationGenerator) {
    applicationGenerator = new ApplicationGenerator(settingsPath);
  }
  return applicationGenerator;
}


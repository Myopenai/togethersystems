/**
 * ============================================================================
 * BUILD MANAGER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Build Manager - Verwaltet Builds automatisch
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export interface BuildInfo {
  name: string;
  version: string;
  application: string;
  status: 'successful' | 'incomplete' | 'research';
  testResults: {
    phase1: number; // %
    phase2: number;
    phase3: number;
    phase4: number;
    phase5: number;
    phase6: number;
    phase7: number;
    overall: number;
  };
  autoFixAttempts: number;
  timestamp: string;
  hash: string;
  signature?: string;
}

export class BuildManager {
  private productionDir: string;
  private successfulDir: string;
  private incompleteDir: string;
  private researchDir: string;

  constructor(productionDir: string = './production') {
    this.productionDir = productionDir;
    this.successfulDir = path.join(productionDir, 'successful');
    this.incompleteDir = path.join(productionDir, 'incomplete');
    this.researchDir = path.join(productionDir, 'research');

    // Erstelle Verzeichnisse
    [this.productionDir, this.successfulDir, this.incompleteDir, this.researchDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Verarbeitet Build automatisch
   */
  async processBuild(
    buildPath: string,
    testResults: BuildInfo['testResults'],
    autoFixAttempts: number = 0
  ): Promise<BuildInfo> {
    console.log('T,. Build Manager: Verarbeite Build...');

    // Lade Build-Info
    const buildInfo = await this.loadBuildInfo(buildPath);
    if (!buildInfo) {
      throw new Error('T,. Build-Info nicht gefunden');
    }

    // Aktualisiere Test-Ergebnisse
    buildInfo.testResults = testResults;
    buildInfo.autoFixAttempts = autoFixAttempts;

    // Bestimme Status
    const status = this.determineStatus(testResults, autoFixAttempts);
    buildInfo.status = status;

    // Verschiebe Build in richtigen Ordner
    await this.moveBuild(buildPath, buildInfo, status);

    // Erstelle Dokumentation
    await this.createDocumentation(buildInfo, status);

    console.log(`T,. Build Manager: Build verarbeitet → ${status} ✓`);
    return buildInfo;
  }

  /**
   * Bestimmt Status basierend auf Test-Ergebnissen
   */
  private determineStatus(
    testResults: BuildInfo['testResults'],
    autoFixAttempts: number
  ): 'successful' | 'incomplete' | 'research' {
    // Erfolgreich: 100% in allen Phasen
    if (testResults.overall === 100 && 
        testResults.phase1 === 100 &&
        testResults.phase2 === 100 &&
        testResults.phase3 === 100 &&
        testResults.phase4 === 100 &&
        testResults.phase5 === 100 &&
        testResults.phase6 === 100 &&
        testResults.phase7 === 100) {
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
   * Verschiebt Build in richtigen Ordner
   */
  private async moveBuild(
    buildPath: string,
    buildInfo: BuildInfo,
    status: BuildInfo['status']
  ): Promise<void> {
    const targetDir = this.getTargetDir(status);
    const buildName = this.generateBuildName(buildInfo, status);
    const targetPath = path.join(targetDir, buildName);

    // Verschiebe Build
    if (fs.existsSync(buildPath)) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      // Kopiere alle Dateien
      const files = fs.readdirSync(buildPath);
      files.forEach(file => {
        const sourceFile = path.join(buildPath, file);
        const targetFile = path.join(targetPath, file);
        fs.copyFileSync(sourceFile, targetFile);
      });

      console.log(`T,. Build verschoben: ${buildPath} → ${targetPath}`);
    }
  }

  /**
   * Gibt Ziel-Ordner zurück
   */
  private getTargetDir(status: BuildInfo['status']): string {
    switch (status) {
      case 'successful':
        return this.successfulDir;
      case 'incomplete':
        return this.incompleteDir;
      case 'research':
        return this.researchDir;
    }
  }

  /**
   * Generiert Build-Namen
   */
  private generateBuildName(buildInfo: BuildInfo, status: BuildInfo['status']): string {
    const suffix = status === 'successful' ? '' : `-${status}`;
    return `${buildInfo.name}-${buildInfo.version}-${buildInfo.application}${suffix}`;
  }

  /**
   * Lädt Build-Info
   */
  private async loadBuildInfo(buildPath: string): Promise<BuildInfo | null> {
    const infoFile = path.join(buildPath, 'build-info.json');
    if (!fs.existsSync(infoFile)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(infoFile, 'utf8'));
  }

  /**
   * Erstellt Dokumentation
   */
  private async createDocumentation(buildInfo: BuildInfo, status: BuildInfo['status']): Promise<void> {
    const targetDir = this.getTargetDir(status);
    const buildName = this.generateBuildName(buildInfo, status);
    const docPath = path.join(targetDir, buildName, 'BUILD-REPORT.md');

    let doc = `# T,. Build Report: ${buildInfo.name}

**Version:** ${buildInfo.version}  
**Application:** ${buildInfo.application}  
**Status:** ${status}  
**Timestamp:** ${buildInfo.timestamp}

---

## Test-Ergebnisse

- **Phase 1 (Initialisierung):** ${buildInfo.testResults.phase1}%
- **Phase 2 (Code-Generierung):** ${buildInfo.testResults.phase2}%
- **Phase 3 (Build & Pipeline):** ${buildInfo.testResults.phase3}%
- **Phase 4 (Runtime & Self-Healing):** ${buildInfo.testResults.phase4}%
- **Phase 5 (UI & Playwright):** ${buildInfo.testResults.phase5}%
- **Phase 6 (Produktprüfung):** ${buildInfo.testResults.phase6}%
- **Phase 7 (Nachtest):** ${buildInfo.testResults.phase7}%
- **Gesamt:** ${buildInfo.testResults.overall}%

---

## Auto-Fix Versuche

- **Anzahl:** ${buildInfo.autoFixAttempts}

---

`;

    if (status === 'incomplete') {
      doc += `## Fehlerliste

Build konnte nicht vollständig erfolgreich abgeschlossen werden.  
Auto-Fixer hat ${buildInfo.autoFixAttempts} Versuche durchgeführt.

---

`;
    }

    if (status === 'research') {
      doc += `## Forschungs-Status

Build konnte auch nach ${buildInfo.autoFixAttempts} Auto-Fix-Versuchen nicht erfolgreich abgeschlossen werden.  
Benötigt menschliche Intervention oder weitere Forschung.

---

## Fehleranalyse

- **Langfristig nicht erfolgreich**
- **Auto-Fix konnte nicht alle Fehler beheben**
- **Benötigt Kollaboration**

---

`;
    }

    doc += `**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems
`;

    fs.writeFileSync(docPath, doc, 'utf8');
    console.log(`T,. Dokumentation erstellt: ${docPath}`);
  }

  /**
   * Gibt Build-Statistiken zurück
   */
  async getStatistics(): Promise<{
    successful: number;
    incomplete: number;
    research: number;
    total: number;
    successRate: number;
  }> {
    const successful = fs.existsSync(this.successfulDir) 
      ? fs.readdirSync(this.successfulDir).filter(f => fs.statSync(path.join(this.successfulDir, f)).isDirectory()).length 
      : 0;
    
    const incomplete = fs.existsSync(this.incompleteDir)
      ? fs.readdirSync(this.incompleteDir).filter(f => fs.statSync(path.join(this.incompleteDir, f)).isDirectory()).length
      : 0;
    
    const research = fs.existsSync(this.researchDir)
      ? fs.readdirSync(this.researchDir).filter(f => fs.statSync(path.join(this.researchDir, f)).isDirectory()).length
      : 0;

    const total = successful + incomplete + research;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      successful,
      incomplete,
      research,
      total,
      successRate,
    };
  }
}


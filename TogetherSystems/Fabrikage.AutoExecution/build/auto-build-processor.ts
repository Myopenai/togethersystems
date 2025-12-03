/**
 * ============================================================================
 * AUTO BUILD PROCESSOR
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Auto Build Processor - Verarbeitet Builds vollautomatisch
 * ============================================================================
 */

import { BuildManager } from './build-manager';
import { BuildVerifier } from './build-verifier';
import * as fs from 'fs';
import * as path from 'path';

export class AutoBuildProcessor {
  private buildManager: BuildManager;
  private buildVerifier: BuildVerifier;
  private watchDir: string;

  constructor(watchDir: string = './builds') {
    this.watchDir = watchDir;
    this.buildManager = new BuildManager();
    this.buildVerifier = new BuildVerifier();

    // Erstelle Watch-Verzeichnis
    if (!fs.existsSync(watchDir)) {
      fs.mkdirSync(watchDir, { recursive: true });
    }
  }

  /**
   * Startet automatische Build-Verarbeitung
   */
  async start(): Promise<void> {
    console.log('T,. Auto Build Processor: Starte automatische Build-Verarbeitung...');

    // Überwache Build-Verzeichnis
    this.watchBuilds();

    // Verarbeite vorhandene Builds
    await this.processExistingBuilds();

    console.log('T,. Auto Build Processor: Läuft...');
  }

  /**
   * Überwacht Build-Verzeichnis
   */
  private watchBuilds(): void {
    // In Produktion würde hier ein File-Watcher verwendet
    // z.B. chokidar, fs.watch, etc.
    console.log('T,. Überwache Build-Verzeichnis...');
  }

  /**
   * Verarbeitet vorhandene Builds
   */
  private async processExistingBuilds(): Promise<void> {
    if (!fs.existsSync(this.watchDir)) {
      return;
    }

    const builds = fs.readdirSync(this.watchDir).filter(f => {
      const fullPath = path.join(this.watchDir, f);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const build of builds) {
      const buildPath = path.join(this.watchDir, build);
      try {
        await this.buildVerifier.verifyBuild(buildPath);
      } catch (error) {
        console.error(`T,. Fehler beim Verarbeiten von ${build}:`, error);
      }
    }
  }

  /**
   * Verarbeitet neuen Build
   */
  async processBuild(buildPath: string): Promise<void> {
    console.log(`T,. Verarbeite Build: ${buildPath}`);
    await this.buildVerifier.verifyBuild(buildPath);
  }

  /**
   * Gibt Statistiken zurück
   */
  async getStatistics(): Promise<any> {
    return await this.buildManager.getStatistics();
  }
}


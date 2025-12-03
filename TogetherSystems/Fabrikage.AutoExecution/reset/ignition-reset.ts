/**
 * ============================================================================
 * IGNITION RESET
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Ignition Reset: Echter Neustart statt Fake-Recovery
 * ============================================================================
 */

import { AntiStallSystem } from '../../Fabrikage.ObservabilityAtlas/anti-stall/anti-stall-system';
import { StatusManager } from '../../Fabrikage.ObservabilityAtlas/status/status-manager';
import { HeartbeatManager } from '../../Fabrikage.ObservabilityAtlas/heartbeat/heartbeat-manager';
import { WatchdogSystem } from '../../Fabrikage.ObservabilityAtlas/watchdog/watchdog-system';

export interface ResetResult {
  success: boolean;
  clearedStates: string[];
  reloadedModules: string[];
  retested: boolean;
  failures: string[];
  timestamp: number;
}

/**
 * T,. Ignition Reset: Echter Neustart
 */
export class IgnitionReset {
  private antiStallSystem: AntiStallSystem | null = null;
  private statusManager: StatusManager | null = null;
  private heartbeatManager: HeartbeatManager | null = null;
  private watchdogSystem: WatchdogSystem | null = null;

  /**
   * T,. Setzt System zurück
   */
  async reset(options: {
    clearStates?: boolean;
    reloadDisplay?: boolean;
    retestAll?: boolean;
    reportFailures?: boolean;
  } = {}): Promise<ResetResult> {
    const {
      clearStates = true,
      reloadDisplay = true,
      retestAll = true,
      reportFailures = true
    } = options;

    console.log("T,. Ignition Reset: Starte System-Neustart...");

    const clearedStates: string[] = [];
    const reloadedModules: string[] = [];
    const failures: string[] = [];

    try {
      // 1. States löschen
      if (clearStates) {
        console.log("T,. Ignition Reset: Lösche States...");
        
        if (this.statusManager) {
          this.statusManager.clearAll();
          clearedStates.push('StatusManager');
        }

        if (this.heartbeatManager) {
          // Stoppe Heartbeat-Manager
          this.heartbeatManager.stop();
          clearedStates.push('HeartbeatManager');
        }

        if (this.watchdogSystem) {
          // Stoppe Watchdog
          this.watchdogSystem.stop();
          clearedStates.push('WatchdogSystem');
        }

        console.log(`T,. Ignition Reset: ${clearedStates.length} States gelöscht`);
      }

      // 2. Display-System neu laden
      if (reloadDisplay) {
        console.log("T,. Ignition Reset: Lade Display-System neu...");
        
        try {
          // Dashboard neu generieren
          const { generateDashboard } = await import('../../Fabrikage.ObservabilityAtlas/dashboard/dashboard-integration');
          await generateDashboard();
          reloadedModules.push('Dashboard');
        } catch (error) {
          const err = error instanceof Error ? error.message : String(error);
          failures.push(`Display-Reload fehlgeschlagen: ${err}`);
          if (reportFailures) {
            console.error(`T,. Ignition Reset: FEHLER - ${err}`);
          }
        }
      }

      // 3. Alle Tests erneut ausführen
      if (retestAll) {
        console.log("T,. Ignition Reset: Führe Tests erneut aus...");
        
        try {
          // TypeScript-Kompilierung prüfen
          const { execSync } = require('child_process');
          execSync('npx tsc --noEmit', { stdio: 'pipe' });
          reloadedModules.push('TypeScript-Compilation');
        } catch (error) {
          const err = error instanceof Error ? error.message : String(error);
          failures.push(`TypeScript-Compilation fehlgeschlagen: ${err}`);
          if (reportFailures) {
            console.error(`T,. Ignition Reset: FEHLER - ${err}`);
          }
        }
      }

      // 4. System neu initialisieren
      console.log("T,. Ignition Reset: Initialisiere System neu...");
      
      if (this.antiStallSystem) {
        this.antiStallSystem.shutdown();
      }

      // Neu initialisieren
      const { initializeAntiStallSystem } = await import('../bootstrap/anti-stall-integration');
      this.antiStallSystem = initializeAntiStallSystem();
      reloadedModules.push('AntiStallSystem');

      console.log("T,. Ignition Reset: System neu initialisiert");

      return {
        success: failures.length === 0,
        clearedStates,
        reloadedModules,
        retested: retestAll,
        failures,
        timestamp: Date.now()
      };

    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      failures.push(`Reset fehlgeschlagen: ${err}`);
      
      if (reportFailures) {
        console.error(`T,. Ignition Reset: KRITISCHER FEHLER - ${err}`);
      }

      return {
        success: false,
        clearedStates,
        reloadedModules,
        retested: retestAll,
        failures,
        timestamp: Date.now()
      };
    }
  }

  /**
   * T,. Setzt Referenzen
   */
  setReferences(
    antiStallSystem: AntiStallSystem | null,
    statusManager: StatusManager | null,
    heartbeatManager: HeartbeatManager | null,
    watchdogSystem: WatchdogSystem | null
  ): void {
    this.antiStallSystem = antiStallSystem;
    this.statusManager = statusManager;
    this.heartbeatManager = heartbeatManager;
    this.watchdogSystem = watchdogSystem;
  }
}


/**
 * ============================================================================
 * DASHBOARD INTEGRATION
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Dashboard Integration: Integriert Dashboard in Anti-Stall-System
 * ============================================================================
 */

import { DashboardGenerator } from './dashboard-generator';
import { StatusManager } from '../status/status-manager';
import { HeartbeatManager } from '../heartbeat/heartbeat-manager';

let dashboardGenerator: DashboardGenerator | null = null;

/**
 * T,. Initialisiert Dashboard-Generator
 */
export function initializeDashboard(
  statusManager: StatusManager,
  heartbeatManager: HeartbeatManager,
  outputDir?: string
): DashboardGenerator {
  if (!dashboardGenerator) {
    dashboardGenerator = new DashboardGenerator(statusManager, heartbeatManager, outputDir);
    console.log("T,. Dashboard: Generator initialisiert");
  }
  return dashboardGenerator;
}

/**
 * T,. Gibt Dashboard-Generator zurück
 */
export function getDashboardGenerator(): DashboardGenerator | null {
  return dashboardGenerator;
}

/**
 * T,. Generiert Dashboard
 */
export async function generateDashboard(): Promise<string> {
  const generator = getDashboardGenerator();
  if (!generator) {
    throw new Error('Dashboard Generator nicht initialisiert');
  }
  return await generator.saveDashboard();
}

/**
 * T,. Startet automatische Dashboard-Updates
 */
let updateInterval: NodeJS.Timeout | null = null;

export function startDashboardUpdates(intervalMs: number = 5000): void {
  const generator = getDashboardGenerator();
  if (!generator) {
    throw new Error('Dashboard Generator nicht initialisiert');
  }

  // Stoppe vorherige Updates falls vorhanden
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  // Starte Updates nur wenn Status-Updates vorhanden sind
  let lastUpdateCount = 0;
  updateInterval = setInterval(async () => {
    try {
      const generator = getDashboardGenerator();
      if (!generator) {
        return;
      }

      // Prüfe ob neue Updates vorhanden sind
      const statusManager = (generator as any).statusManager;
      if (statusManager) {
        const currentStatuses = statusManager.getAllStatuses();
        if (currentStatuses.length === lastUpdateCount && currentStatuses.length > 0) {
          // Keine neuen Updates - prüfe ob alle Prozesse abgeschlossen sind
          const allCompleted = currentStatuses.every((s: any) => s.phase === 'completed' || s.phase === 'idle');
          if (allCompleted) {
            // Alle abgeschlossen - stoppe Updates
            if (updateInterval) {
              clearInterval(updateInterval);
              updateInterval = null;
            }
            console.log("T,. Dashboard: Alle Prozesse abgeschlossen, Updates gestoppt");
            return;
          }
        }
        lastUpdateCount = currentStatuses.length;
      }

      await generator.saveDashboard();
    } catch (error) {
      console.error('T,. Dashboard: Fehler beim Update:', error);
    }
  }, intervalMs);
}

/**
 * T,. Stoppt automatische Dashboard-Updates
 */
export function stopDashboardUpdates(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    console.log("T,. Dashboard: Automatische Updates gestoppt");
  }
}


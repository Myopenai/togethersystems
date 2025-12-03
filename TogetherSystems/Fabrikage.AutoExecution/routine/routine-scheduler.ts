/**
 * ============================================================================
 * ROUTINE SCHEDULER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Routine Scheduler - Plant Routine-Updates automatisch
 * ============================================================================
 */

import { RoutineUpdateEngine } from './routine-update-engine';

export class RoutineScheduler {
  private updateEngine: RoutineUpdateEngine;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.updateEngine = new RoutineUpdateEngine();
  }

  /**
   * Startet Routine-Updates (automatisch, periodisch)
   */
  start(intervalMinutes: number = 60): void {
    console.log(`T,. Routine Scheduler: Starte Routine-Updates (alle ${intervalMinutes} Minuten)...`);

    // Führe sofort aus
    this.updateEngine.executeRoutineUpdate().catch(console.error);

    // Dann periodisch
    this.interval = setInterval(() => {
      this.updateEngine.executeRoutineUpdate().catch(console.error);
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stoppt Routine-Updates
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('T,. Routine Scheduler: Gestoppt');
    }
  }

  /**
   * Führt einmaligen Routine-Update durch
   */
  async runOnce(): Promise<void> {
    await this.updateEngine.executeRoutineUpdate();
  }
}


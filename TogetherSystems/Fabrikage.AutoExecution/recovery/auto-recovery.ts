/**
 * ============================================================================
 * AUTO-RECOVERY SYSTEM
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Auto-Recovery: Automatische Wiederherstellung hängender Module
 * ============================================================================
 */

import { WatchdogSystem, WatchdogProcess } from '../../Fabrikage.ObservabilityAtlas/watchdog/watchdog-system';

export interface RecoveryStrategy {
  type: 'restart' | 'failover' | 'skip' | 'circuit-breaker';
  maxAttempts: number;
  backoffMs: number;
  preserveState: boolean;
}

export interface RecoveryResult {
  success: boolean;
  processId: string;
  attempt: number;
  error?: Error;
  metadata?: any;
}

/**
 * T,. Auto-Recovery System: Wiederherstellung hängender Module
 */
export class AutoRecovery {
  private watchdog: WatchdogSystem;
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private statePreservers: Map<string, () => Promise<any>> = new Map();
  private stateRestorers: Map<string, (state: any) => Promise<void>> = new Map();

  constructor(watchdog: WatchdogSystem) {
    this.watchdog = watchdog;
  }

  /**
   * T,. Registriert einen Prozess für Auto-Recovery
   */
  register(
    processId: string,
    process: WatchdogProcess,
    strategy: RecoveryStrategy,
    recoveryCallback: () => Promise<void>,
    statePreserver?: () => Promise<any>,
    stateRestorer?: (state: any) => Promise<void>
  ): void {
    this.recoveryStrategies.set(processId, strategy);
    
    if (statePreserver) {
      this.statePreservers.set(processId, statePreserver);
    }
    
    if (stateRestorer) {
      this.stateRestorers.set(processId, stateRestorer);
    }

    // Register beim Watchdog mit Recovery-Callback
    this.watchdog.register(process, async () => {
      await this.recover(processId, strategy, recoveryCallback, statePreserver, stateRestorer);
    });
  }

  /**
   * T,. Führt Recovery für einen Prozess durch
   */
  private async recover(
    processId: string,
    strategy: RecoveryStrategy,
    recoveryCallback: () => Promise<void>,
    statePreserver?: () => Promise<any>,
    stateRestorer?: (state: any) => Promise<void>
  ): Promise<RecoveryResult> {
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt < strategy.maxAttempts) {
      attempt++;

      try {
        console.log(`T,. Auto-Recovery: Versuch ${attempt}/${strategy.maxAttempts} für ${processId}...`);

        // State Preservation
        let preservedState: any = null;
        if (strategy.preserveState && statePreserver) {
          try {
            preservedState = await statePreserver();
            console.log(`T,. Auto-Recovery: State erhalten für ${processId}`);
          } catch (error) {
            console.warn(`T,. Auto-Recovery: State-Preservation fehlgeschlagen für ${processId}:`, error);
          }
        }

        // Recovery durchführen
        switch (strategy.type) {
          case 'restart':
            await this.restart(processId, recoveryCallback);
            break;
          case 'failover':
            await this.failover(processId, recoveryCallback);
            break;
          case 'circuit-breaker':
            await this.circuitBreaker(processId, recoveryCallback);
            break;
          case 'skip':
            console.log(`T,. Auto-Recovery: Skip für ${processId}`);
            return { success: false, processId, attempt };
        }

        // State Restoration
        if (strategy.preserveState && preservedState && stateRestorer) {
          try {
            await stateRestorer(preservedState);
            console.log(`T,. Auto-Recovery: State wiederhergestellt für ${processId}`);
          } catch (error) {
            console.warn(`T,. Auto-Recovery: State-Restoration fehlgeschlagen für ${processId}:`, error);
          }
        }

        // Heartbeat senden nach erfolgreicher Recovery
        this.watchdog.heartbeat(processId, {
          recovered: true,
          attempt,
          strategy: strategy.type
        });

        return {
          success: true,
          processId,
          attempt,
          metadata: { preservedState: !!preservedState }
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`T,. Auto-Recovery: Versuch ${attempt} fehlgeschlagen für ${processId}:`, lastError);

        // Backoff vor nächstem Versuch
        if (attempt < strategy.maxAttempts) {
          const backoffMs = strategy.backoffMs * Math.pow(2, attempt - 1); // Exponential Backoff
          console.log(`T,. Auto-Recovery: Warte ${backoffMs}ms vor nächstem Versuch...`);
          await this.sleep(backoffMs);
        }
      }
    }

    // Alle Versuche fehlgeschlagen
    console.error(`T,. Auto-Recovery: FEHLER - Alle Versuche fehlgeschlagen für ${processId}`);
    return {
      success: false,
      processId,
      attempt,
      error: lastError
    };
  }

  /**
   * T,. Startet einen Prozess neu
   */
  private async restart(processId: string, recoveryCallback: () => Promise<void>): Promise<void> {
    console.log(`T,. Auto-Recovery: Restart für ${processId}...`);
    await recoveryCallback();
  }

  /**
   * T,. Führt Failover für einen Prozess durch
   */
  private async failover(processId: string, recoveryCallback: () => Promise<void>): Promise<void> {
    console.log(`T,. Auto-Recovery: Failover für ${processId}...`);
    await recoveryCallback();
  }

  /**
   * T,. Aktiviert Circuit-Breaker für einen Prozess
   */
  private async circuitBreaker(processId: string, recoveryCallback: () => Promise<void>): Promise<void> {
    console.log(`T,. Auto-Recovery: Circuit-Breaker für ${processId}...`);
    // Circuit-Breaker-Logik: Prozess wird vorübergehend deaktiviert
    // Nach Cooldown wird Recovery versucht
    await this.sleep(5000); // Cooldown
    await recoveryCallback();
  }

  /**
   * T,. Sleep-Helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * T,. Entfernt einen Prozess aus der Auto-Recovery-Überwachung
   */
  unregister(processId: string): void {
    this.recoveryStrategies.delete(processId);
    this.statePreservers.delete(processId);
    this.stateRestorers.delete(processId);
    this.watchdog.unregister(processId);
    console.log(`T,. Auto-Recovery: Prozess entfernt: ${processId}`);
  }

  /**
   * T,. Gibt Recovery-Strategie für einen Prozess zurück
   */
  getStrategy(processId: string): RecoveryStrategy | null {
    return this.recoveryStrategies.get(processId) || null;
  }
}


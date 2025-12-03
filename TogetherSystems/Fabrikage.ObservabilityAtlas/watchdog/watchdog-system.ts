/**
 * ============================================================================
 * WATCHDOG SYSTEM
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Watchdog: Überwacht kritische Prozesse, erkennt Timeouts und Deadlocks
 * ============================================================================
 */

import { HeartbeatManager, HeartbeatEvent } from '../heartbeat/heartbeat-manager';

export interface WatchdogConfig {
  heartbeatInterval: number;
  heartbeatTimeout: number;
  maxMissedHeartbeats: number;
  recoveryTimeout: number;
  maxRecoveryAttempts: number;
}

export interface WatchdogProcess {
  id: string;
  name: string;
  critical: boolean; // Kritische Prozesse werden sofort neu gestartet
  recoveryStrategy: 'restart' | 'failover' | 'skip';
  metadata?: any;
}

/**
 * T,. Watchdog System: Überwacht alle kritischen Prozesse
 */
export class WatchdogSystem {
  private heartbeatManager: HeartbeatManager;
  private processes: Map<string, WatchdogProcess> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();
  private config: WatchdogConfig;
  private recoveryCallbacks: Map<string, () => Promise<void>> = new Map();

  constructor(config: WatchdogConfig = {
    heartbeatInterval: 10000,
    heartbeatTimeout: 30000,
    maxMissedHeartbeats: 3,
    recoveryTimeout: 60000,
    maxRecoveryAttempts: 3
  }) {
    this.config = config;
    this.heartbeatManager = new HeartbeatManager({
      interval: config.heartbeatInterval,
      timeout: config.heartbeatTimeout,
      maxMissed: config.maxMissedHeartbeats
    });

    // Event-Listener für Heartbeat-Events
    this.heartbeatManager.on('stalled', (event) => this.handleStalled(event));
    this.heartbeatManager.on('dead', (event) => this.handleDead(event));
  }

  /**
   * T,. Startet das Watchdog-System
   */
  start(): void {
    console.log("T,. Watchdog System: Starte Überwachung...");
    this.heartbeatManager.start();
    console.log("T,. Watchdog System: Überwachung aktiv");
  }

  /**
   * T,. Stoppt das Watchdog-System
   */
  stop(): void {
    console.log("T,. Watchdog System: Stoppe Überwachung...");
    this.heartbeatManager.stop();
    this.processes.clear();
    this.recoveryAttempts.clear();
    console.log("T,. Watchdog System: Überwachung gestoppt");
  }

  /**
   * T,. Registriert einen Prozess für Watchdog-Überwachung
   */
  register(process: WatchdogProcess, recoveryCallback?: () => Promise<void>): void {
    this.processes.set(process.id, process);
    this.recoveryAttempts.set(process.id, 0);
    
    if (recoveryCallback) {
      this.recoveryCallbacks.set(process.id, recoveryCallback);
    }

    this.heartbeatManager.register(process.id, {
      name: process.name,
      critical: process.critical,
      recoveryStrategy: process.recoveryStrategy,
      ...process.metadata
    });

    console.log(`T,. Watchdog System: Prozess registriert - ${process.name} (${process.id}) - Kritisch: ${process.critical}`);
  }

  /**
   * T,. Empfängt einen Heartbeat von einem Prozess
   */
  heartbeat(processId: string, metadata?: any): void {
    this.heartbeatManager.heartbeat(processId, metadata);
  }

  /**
   * T,. Entfernt einen Prozess aus der Überwachung
   */
  unregister(processId: string): void {
    this.processes.delete(processId);
    this.recoveryAttempts.delete(processId);
    this.recoveryCallbacks.delete(processId);
    this.heartbeatManager.unregister(processId);
    console.log(`T,. Watchdog System: Prozess entfernt: ${processId}`);
  }

  /**
   * T,. Behandelt hängende Prozesse
   */
  private async handleStalled(event: HeartbeatEvent): Promise<void> {
    const process = this.processes.get(event.processId);
    if (!process) {
      return;
    }

    console.warn(`T,. Watchdog System: WARNUNG - Prozess hängt: ${process.name} (${event.processId})`);

    if (process.critical) {
      // Kritische Prozesse sofort neu starten
      await this.recover(process, event);
    } else {
      // Nicht-kritische Prozesse: Logging, aber keine sofortige Recovery
      console.log(`T,. Watchdog System: Nicht-kritischer Prozess hängt: ${process.name}`);
    }
  }

  /**
   * T,. Behandelt tote Prozesse
   */
  private async handleDead(event: HeartbeatEvent): Promise<void> {
    const process = this.processes.get(event.processId);
    if (!process) {
      return;
    }

    // Prüfe ob Prozess absichtlich beendet wurde (completed)
    const attempts = this.recoveryAttempts.get(event.processId) || 0;
    if (attempts >= this.config.maxRecoveryAttempts) {
      // Maximale Versuche erreicht - nicht mehr versuchen
      console.log(`T,. Watchdog System: Prozess ${process.name} hat maximale Recovery-Versuche erreicht, stoppe`);
      return;
    }

    // Prüfe ob Prozess als "completed" markiert wurde
    if (event.metadata?.completed === true || event.metadata?.phase === 'completed') {
      console.log(`T,. Watchdog System: Prozess ${process.name} wurde absichtlich beendet, keine Recovery nötig`);
      this.unregister(event.processId);
      return;
    }

    console.error(`T,. Watchdog System: FEHLER - Prozess tot: ${process.name} (${event.processId})`);

    // Nur Recovery versuchen wenn nicht absichtlich beendet
    await this.recover(process, event);
  }

  /**
   * T,. Versucht, einen Prozess wiederherzustellen
   */
  private async recover(process: WatchdogProcess, event: HeartbeatEvent): Promise<void> {
    const attempts = this.recoveryAttempts.get(process.id) || 0;

    if (attempts >= this.config.maxRecoveryAttempts) {
      console.error(`T,. Watchdog System: FEHLER - Maximale Recovery-Versuche erreicht für ${process.name} (${process.id})`);
      // Prozess wird nicht mehr automatisch wiederhergestellt
      // Eventuell in Forschungsordner verschieben
      return;
    }

    this.recoveryAttempts.set(process.id, attempts + 1);

    console.log(`T,. Watchdog System: Starte Recovery für ${process.name} (Versuch ${attempts + 1}/${this.config.maxRecoveryAttempts})...`);

    try {
      switch (process.recoveryStrategy) {
        case 'restart':
          await this.restartProcess(process);
          break;
        case 'failover':
          await this.failoverProcess(process);
          break;
        case 'skip':
          console.log(`T,. Watchdog System: Skip-Strategy für ${process.name} - Prozess wird übersprungen`);
          break;
      }

      // Reset Recovery-Versuche nach erfolgreicher Recovery
      this.recoveryAttempts.set(process.id, 0);
      console.log(`T,. Watchdog System: Recovery erfolgreich für ${process.name}`);
    } catch (error) {
      console.error(`T,. Watchdog System: Recovery fehlgeschlagen für ${process.name}:`, error);
      // Nächster Versuch wird beim nächsten Heartbeat-Check versucht
    }
  }

  /**
   * T,. Startet einen Prozess neu
   */
  private async restartProcess(process: WatchdogProcess): Promise<void> {
    const callback = this.recoveryCallbacks.get(process.id);
    if (callback) {
      await callback();
    } else {
      console.warn(`T,. Watchdog System: Kein Recovery-Callback für ${process.name}`);
    }

    // Reset Heartbeat nach Restart
    this.heartbeatManager.heartbeat(process.id, {
      restarted: true,
      timestamp: Date.now()
    });
  }

  /**
   * T,. Führt Failover für einen Prozess durch
   */
  private async failoverProcess(process: WatchdogProcess): Promise<void> {
    // Failover-Logik (z.B. zu Sekundärmodell wechseln)
    console.log(`T,. Watchdog System: Failover für ${process.name}...`);
    
    const callback = this.recoveryCallbacks.get(process.id);
    if (callback) {
      await callback();
    }

    // Reset Heartbeat nach Failover
    this.heartbeatManager.heartbeat(process.id, {
      failedOver: true,
      timestamp: Date.now()
    });
  }

  /**
   * T,. Gibt den Status aller überwachten Prozesse zurück
   */
  getStatus(): Array<WatchdogProcess & { status: string; lastHeartbeat: number; recoveryAttempts: number }> {
    const statuses = this.heartbeatManager.getStatus();
    
    return statuses.map(status => {
      const process = this.processes.get(status.processId);
      if (!process) {
        return null;
      }

      return {
        ...process,
        status: status.status,
        lastHeartbeat: status.lastHeartbeat,
        recoveryAttempts: this.recoveryAttempts.get(status.processId) || 0
      };
    }).filter(Boolean) as any[];
  }
}


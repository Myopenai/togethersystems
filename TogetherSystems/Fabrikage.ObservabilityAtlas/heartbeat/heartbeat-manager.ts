/**
 * ============================================================================
 * HEARTBEAT MANAGER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Heartbeat-Mechanismus: Überwacht alle Prozesse, erkennt Stillstände
 * ============================================================================
 */

export interface HeartbeatConfig {
  interval: number; // Heartbeat-Intervall in Millisekunden
  timeout: number; // Timeout in Millisekunden
  maxMissed: number; // Maximale Anzahl verpasster Heartbeats vor Alarm
}

export interface HeartbeatEvent {
  processId: string;
  timestamp: number;
  status: 'alive' | 'stalled' | 'dead';
  metadata?: any;
}

export interface ProcessStatus {
  processId: string;
  lastHeartbeat: number;
  missedHeartbeats: number;
  status: 'running' | 'stalled' | 'dead';
  metadata?: any;
}

/**
 * T,. Heartbeat Manager: Überwacht alle Prozesse auf Stillstände
 */
export class HeartbeatManager {
  private processes: Map<string, ProcessStatus> = new Map();
  private config: HeartbeatConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Map<string, (event: HeartbeatEvent) => void> = new Map();

  constructor(config: HeartbeatConfig = {
    interval: 10000, // 10 Sekunden
    timeout: 30000, // 30 Sekunden
    maxMissed: 3
  }) {
    this.config = config;
  }

  /**
   * T,. Startet den Heartbeat-Monitor
   */
  start(): void {
    if (this.intervalId) {
      return; // Bereits gestartet
    }

    console.log(`T,. Heartbeat Manager: Starte Überwachung (Intervall: ${this.config.interval}ms, Timeout: ${this.config.timeout}ms)`);

    this.intervalId = setInterval(() => {
      this.checkProcesses();
    }, this.config.interval);
  }

  /**
   * T,. Stoppt den Heartbeat-Monitor
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("T,. Heartbeat Manager: Überwachung gestoppt");
    }
  }

  /**
   * T,. Registriert einen Prozess für Heartbeat-Überwachung
   */
  register(processId: string, metadata?: any): void {
    this.processes.set(processId, {
      processId,
      lastHeartbeat: Date.now(),
      missedHeartbeats: 0,
      status: 'running',
      metadata
    });

    console.log(`T,. Heartbeat Manager: Prozess registriert: ${processId}`);
  }

  /**
   * T,. Empfängt einen Heartbeat von einem Prozess
   */
  heartbeat(processId: string, metadata?: any): void {
    const process = this.processes.get(processId);
    if (!process) {
      // Automatische Registrierung bei erstem Heartbeat
      this.register(processId, metadata);
      return;
    }

    process.lastHeartbeat = Date.now();
    process.missedHeartbeats = 0;
    process.status = 'running';
    if (metadata) {
      process.metadata = metadata;
    }
  }

  /**
   * T,. Entfernt einen Prozess aus der Überwachung
   */
  unregister(processId: string): void {
    this.processes.delete(processId);
    console.log(`T,. Heartbeat Manager: Prozess entfernt: ${processId}`);
  }

  /**
   * T,. Prüft alle Prozesse auf Stillstände
   */
  private checkProcesses(): void {
    const now = Date.now();

    for (const [processId, process] of this.processes.entries()) {
      // Prüfe ob Prozess als completed markiert wurde
      if (process.metadata?.completed === true || process.metadata?.phase === 'completed') {
        // Prozess wurde absichtlich beendet - entferne aus Überwachung
        this.unregister(processId);
        continue;
      }

      const timeSinceLastHeartbeat = now - process.lastHeartbeat;

      if (timeSinceLastHeartbeat > this.config.timeout) {
        process.missedHeartbeats++;

        if (process.missedHeartbeats >= this.config.maxMissed) {
          // Prozess als tot markieren
          process.status = 'dead';
          this.emitEvent({
            processId,
            timestamp: now,
            status: 'dead',
            metadata: {
              timeSinceLastHeartbeat,
              missedHeartbeats: process.missedHeartbeats,
              ...process.metadata
            }
          });
        } else if (process.status === 'running') {
          // Prozess als hängend markieren
          process.status = 'stalled';
          this.emitEvent({
            processId,
            timestamp: now,
            status: 'stalled',
            metadata: {
              timeSinceLastHeartbeat,
              missedHeartbeats: process.missedHeartbeats,
              ...process.metadata
            }
          });
        }
      } else {
        // Prozess lebt noch
        if (process.status !== 'running') {
          process.status = 'running';
          process.missedHeartbeats = 0;
          this.emitEvent({
            processId,
            timestamp: now,
            status: 'alive',
            metadata: process.metadata
          });
        }
      }
    }
  }

  /**
   * T,. Sendet ein Heartbeat-Event an alle Listener
   */
  private emitEvent(event: HeartbeatEvent): void {
    console.log(`T,. Heartbeat Manager: Event - ${event.processId} - ${event.status}`);
    
    // Emit an alle registrierten Listener
    for (const listener of this.listeners.values()) {
      try {
        listener(event);
      } catch (error) {
        console.error(`T,. Heartbeat Manager: Fehler beim Emit an Listener:`, error);
      }
    }
  }

  /**
   * T,. Registriert einen Event-Listener
   */
  on(event: string, listener: (event: HeartbeatEvent) => void): void {
    this.listeners.set(event, listener);
  }

  /**
   * T,. Entfernt einen Event-Listener
   */
  off(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * T,. Gibt den Status aller Prozesse zurück
   */
  getStatus(): ProcessStatus[] {
    return Array.from(this.processes.values());
  }

  /**
   * T,. Gibt den Status eines spezifischen Prozesses zurück
   */
  getProcessStatus(processId: string): ProcessStatus | null {
    return this.processes.get(processId) || null;
  }
}


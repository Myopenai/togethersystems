/**
 * ============================================================================
 * STATUS MANAGER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Status Manager: Transparente Statusmeldungen statt Fake-Busy-Symbole
 * ============================================================================
 */

export type StatusPhase = 
  | 'idle'
  | 'initializing'
  | 'indexing'
  | 'analyzing'
  | 'generating'
  | 'validating'
  | 'building'
  | 'testing'
  | 'deploying'
  | 'completed'
  | 'error'
  | 'recovering'
  | 'stalled'
  | 'dead';

export interface StatusUpdate {
  processId: string;
  phase: StatusPhase;
  progress: number; // 0-100
  message: string;
  timestamp: number;
  metadata?: {
    currentStep?: string;
    totalSteps?: number;
    elapsedMs?: number;
    estimatedMs?: number;
    [key: string]: any;
  };
}

export interface StatusListener {
  (update: StatusUpdate): void;
}

/**
 * T,. Status Manager: Transparente Statusmeldungen
 */
export class StatusManager {
  private statuses: Map<string, StatusUpdate> = new Map();
  private listeners: Set<StatusListener> = new Set();
  private history: StatusUpdate[] = [];
  private maxHistorySize: number = 1000;

  /**
   * T,. Aktualisiert den Status eines Prozesses
   */
  update(processId: string, phase: StatusPhase, progress: number, message: string, metadata?: any): void {
    const update: StatusUpdate = {
      processId,
      phase,
      progress: Math.max(0, Math.min(100, progress)), // Clamp 0-100
      message,
      timestamp: Date.now(),
      metadata
    };

    // Update Status
    const previousStatus = this.statuses.get(processId);
    if (previousStatus) {
      // Berechne elapsed time
      const elapsedMs = update.timestamp - previousStatus.timestamp;
      update.metadata = {
        ...update.metadata,
        elapsedMs,
        previousPhase: previousStatus.phase
      };
    }

    this.statuses.set(processId, update);
    
    // Add to history
    this.history.push(update);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift(); // Remove oldest
    }

    // Emit to listeners
    this.emit(update);

    // Console log für Transparenz
    this.logStatus(update);
  }

  /**
   * T,. Gibt aktuellen Status eines Prozesses zurück
   */
  getStatus(processId: string): StatusUpdate | null {
    return this.statuses.get(processId) || null;
  }

  /**
   * T,. Gibt Status aller Prozesse zurück
   */
  getAllStatuses(): StatusUpdate[] {
    return Array.from(this.statuses.values());
  }

  /**
   * T,. Gibt Status-Historie zurück
   */
  getHistory(processId?: string): StatusUpdate[] {
    if (processId) {
      return this.history.filter(u => u.processId === processId);
    }
    return [...this.history];
  }

  /**
   * T,. Registriert einen Status-Listener
   */
  on(listener: StatusListener): void {
    this.listeners.add(listener);
  }

  /**
   * T,. Entfernt einen Status-Listener
   */
  off(listener: StatusListener): void {
    this.listeners.delete(listener);
  }

  /**
   * T,. Sendet Status-Update an alle Listener
   */
  private emit(update: StatusUpdate): void {
    for (const listener of this.listeners) {
      try {
        listener(update);
      } catch (error) {
        console.error(`T,. Status Manager: Fehler beim Emit an Listener:`, error);
      }
    }
  }

  /**
   * T,. Loggt Status transparent in Konsole
   */
  private logStatus(update: StatusUpdate): void {
    const progressBar = this.createProgressBar(update.progress);
    const phaseEmoji = this.getPhaseEmoji(update.phase);
    
    const logMessage = `T,. ${phaseEmoji} [${update.processId}] ${update.phase.toUpperCase()} ${progressBar} ${update.progress}% - ${update.message}`;
    
    switch (update.phase) {
      case 'error':
      case 'dead':
        console.error(logMessage);
        break;
      case 'stalled':
      case 'recovering':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }

    // Zusätzliche Metadaten
    if (update.metadata) {
      if (update.metadata.elapsedMs) {
        const seconds = (update.metadata.elapsedMs / 1000).toFixed(2);
        console.log(`  └─ Elapsed: ${seconds}s`);
      }
      if (update.metadata.estimatedMs) {
        const remainingSeconds = ((update.metadata.estimatedMs - (update.metadata.elapsedMs || 0)) / 1000).toFixed(2);
        console.log(`  └─ Estimated remaining: ${remainingSeconds}s`);
      }
      if (update.metadata.currentStep && update.metadata.totalSteps) {
        console.log(`  └─ Step: ${update.metadata.currentStep} (${update.metadata.currentStep}/${update.metadata.totalSteps})`);
      }
    }
  }

  /**
   * T,. Erstellt eine Text-Progress-Bar
   */
  private createProgressBar(progress: number, width: number = 20): string {
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    return `[${'='.repeat(filled)}${' '.repeat(empty)}]`;
  }

  /**
   * T,. Gibt Emoji für Phase zurück
   */
  private getPhaseEmoji(phase: StatusPhase): string {
    switch (phase) {
      case 'idle': return '💤';
      case 'initializing': return '🚀';
      case 'indexing': return '📚';
      case 'analyzing': return '🔍';
      case 'generating': return '⚙️';
      case 'validating': return '✅';
      case 'building': return '🔨';
      case 'testing': return '🧪';
      case 'deploying': return '🚢';
      case 'completed': return '✨';
      case 'error': return '❌';
      case 'recovering': return '🔄';
      case 'stalled': return '⏸️';
      case 'dead': return '💀';
      default: return '🔷';
    }
  }

  /**
   * T,. Löscht Status eines Prozesses
   */
  clear(processId: string): void {
    this.statuses.delete(processId);
  }

  /**
   * T,. Löscht alle Statuses
   */
  clearAll(): void {
    this.statuses.clear();
  }
}


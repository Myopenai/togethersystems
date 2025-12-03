/**
 * ============================================================================
 * ANTI-STALL SYSTEM
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Anti-Stall System: Integriertes System gegen Stillstände
 * ============================================================================
 */

import { WatchdogSystem, WatchdogProcess } from '../watchdog/watchdog-system';
import { HeartbeatManager } from '../heartbeat/heartbeat-manager';
import { StatusManager, StatusPhase } from '../status/status-manager';
import { AutoRecovery } from '../../Fabrikage.AutoExecution/recovery/auto-recovery';
import { MultiModelFallback } from '../../Fabrikage.IntelligenceMatrix/fallback/multi-model-fallback';
import { ResourceHygiene } from '../../Fabrikage.AutoExecution/hygiene/resource-hygiene';
import { initializeDashboard, startDashboardUpdates } from '../dashboard/dashboard-integration';

/**
 * T,. Anti-Stall System: Hauptkomponente gegen Stillstände
 */
export class AntiStallSystem {
  private watchdog: WatchdogSystem;
  private heartbeatManager: HeartbeatManager;
  private statusManager: StatusManager;
  private autoRecovery: AutoRecovery;
  private multiModelFallback: MultiModelFallback;
  private resourceHygiene: ResourceHygiene;
  private initialized: boolean = false;

  constructor() {
    // Initialize Watchdog
    this.watchdog = new WatchdogSystem({
      heartbeatInterval: 10000,
      heartbeatTimeout: 30000,
      maxMissedHeartbeats: 3,
      recoveryTimeout: 60000,
      maxRecoveryAttempts: 3
    });

    // Initialize Heartbeat Manager
    this.heartbeatManager = new HeartbeatManager({
      interval: 10000,
      timeout: 30000,
      maxMissed: 3
    });

    // Initialize Status Manager
    this.statusManager = new StatusManager();

    // Initialize Auto Recovery
    this.autoRecovery = new AutoRecovery(this.watchdog);

    // Initialize Multi-Model Fallback
    this.multiModelFallback = new MultiModelFallback();

    // Initialize Resource Hygiene
    this.resourceHygiene = new ResourceHygiene();

    // Event Listeners
    this.setupEventListeners();
  }

  /**
   * T,. Initialisiert das Anti-Stall-System
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    console.log("T,. Anti-Stall System: Initialisierung...");

    // Start Watchdog
    this.watchdog.start();

    // Start Heartbeat Manager
    this.heartbeatManager.start();

    // Start Resource Hygiene Monitoring
    this.resourceHygiene.startMonitoring(5000);

    // Initialize Dashboard
    initializeDashboard(this.statusManager, this.heartbeatManager);
    // Dashboard-Updates werden nur gestartet wenn aktiv benötigt
    // startDashboardUpdates(5000); // Wird manuell gestartet wenn nötig

    // Status Update
    this.statusManager.update('anti-stall-system', 'initializing', 100, 'Anti-Stall System initialisiert');

    this.initialized = true;
    console.log("T,. Anti-Stall System: Initialisierung abgeschlossen");
  }

  /**
   * T,. Stoppt das Anti-Stall-System
   */
  shutdown(): void {
    if (!this.initialized) {
      return;
    }

    console.log("T,. Anti-Stall System: Shutdown...");

    // Stop Dashboard Updates
    try {
      const { stopDashboardUpdates } = require('../dashboard/dashboard-integration');
      stopDashboardUpdates();
    } catch (e) {
      // Ignore if not available
    }

    // Stop all components
    this.watchdog.stop();
    this.heartbeatManager.stop();
    this.resourceHygiene.stopMonitoring();

    this.statusManager.update('anti-stall-system', 'idle', 0, 'Anti-Stall System gestoppt');

    this.initialized = false;
    console.log("T,. Anti-Stall System: Shutdown abgeschlossen");
  }

  /**
   * T,. Registriert einen Prozess für Anti-Stall-Überwachung
   */
  registerProcess(
    processId: string,
    processName: string,
    critical: boolean,
    recoveryCallback: () => Promise<void>
  ): void {
    const process: WatchdogProcess = {
      id: processId,
      name: processName,
      critical,
      recoveryStrategy: critical ? 'restart' : 'skip',
      metadata: {
        registeredAt: Date.now()
      }
    };

    // Register bei Auto-Recovery
    this.autoRecovery.register(
      processId,
      process,
      {
        type: critical ? 'restart' : 'skip',
        maxAttempts: 3,
        backoffMs: 1000,
        preserveState: true
      },
      recoveryCallback
    );

    // Status Update
    this.statusManager.update(
      processId,
      'idle',
      0,
      `Prozess ${processName} registriert für Anti-Stall-Überwachung`
    );

    console.log(`T,. Anti-Stall System: Prozess registriert - ${processName} (${processId})`);
  }

  /**
   * T,. Entfernt einen Prozess aus der Anti-Stall-Überwachung
   */
  unregisterProcess(processId: string): void {
    // Entferne aus Watchdog
    this.watchdog.unregister(processId);

    // Entferne aus Heartbeat Manager
    this.heartbeatManager.unregister(processId);

    // Entferne aus Auto-Recovery
    this.autoRecovery.unregister(processId);

    // Status Update
    this.statusManager.update(
      processId,
      'completed',
      100,
      `Prozess entfernt aus Anti-Stall-Überwachung`
    );

    console.log(`T,. Anti-Stall System: Prozess entfernt - ${processId}`);
  }

  /**
   * T,. Sendet Heartbeat für einen Prozess
   */
  heartbeat(processId: string, metadata?: any): void {
    this.heartbeatManager.heartbeat(processId, metadata);
    this.watchdog.heartbeat(processId, metadata);
  }

  /**
   * T,. Aktualisiert Status eines Prozesses
   */
  updateStatus(
    processId: string,
    phase: StatusPhase,
    progress: number,
    message: string,
    metadata?: any
  ): void {
    this.statusManager.update(processId, phase, progress, message, metadata);
  }

  /**
   * T,. Registriert Modell für Multi-Model Fallback
   */
  registerModel(model: any): void {
    this.multiModelFallback.register(model);
  }

  /**
   * T,. Führt Request mit Multi-Model Fallback durch
   */
  async requestWithFallback(request: any): Promise<any> {
    return this.multiModelFallback.request(request);
  }

  /**
   * T,. Gibt Status-Report zurück
   */
  getStatusReport(): any {
    return {
      watchdog: this.watchdog.getStatus(),
      heartbeat: this.heartbeatManager.getStatus(),
      status: this.statusManager.getAllStatuses(),
      resourceHygiene: this.resourceHygiene.getReport(),
      multiModelFallback: {
        models: this.multiModelFallback.getModels(),
        errorStats: Array.from(this.multiModelFallback.getErrorStats().entries())
      }
    };
  }

  /**
   * T,. Setup Event Listeners
   */
  private setupEventListeners(): void {
    // Heartbeat Manager Events
    this.heartbeatManager.on('stalled', (event) => {
      console.warn(`T,. Anti-Stall System: Heartbeat-Stall erkannt - ${event.processId}`);
      this.statusManager.update(
        event.processId,
        'stalled',
        0,
        `Prozess hängt - Heartbeat fehlt`,
        event.metadata
      );
    });

    this.heartbeatManager.on('dead', (event) => {
      console.error(`T,. Anti-Stall System: Heartbeat-Death erkannt - ${event.processId}`);
      this.statusManager.update(
        event.processId,
        'dead',
        0,
        `Prozess tot - Keine Heartbeats`,
        event.metadata
      );
    });

    // Status Manager Events
    this.statusManager.on((update) => {
      // Status-Updates werden bereits in StatusManager geloggt
      // Hier können zusätzliche Aktionen erfolgen
    });
  }
}


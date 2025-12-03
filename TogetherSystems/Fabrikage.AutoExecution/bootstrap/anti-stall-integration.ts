/**
 * ============================================================================
 * ANTI-STALL INTEGRATION
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Anti-Stall Integration: Integration in A-Start Bootstrapper
 * ============================================================================
 */

import { AntiStallSystem } from '../../Fabrikage.ObservabilityAtlas/anti-stall/anti-stall-system';
import * as fs from 'fs';
import * as path from 'path';

let antiStallSystem: AntiStallSystem | null = null;

/**
 * T,. Initialisiert Anti-Stall-System
 */
export function initializeAntiStallSystem(): AntiStallSystem {
  if (!antiStallSystem) {
    antiStallSystem = new AntiStallSystem();
    antiStallSystem.initialize();
    console.log("T,. Anti-Stall System: Integriert in A-Start Bootstrapper");
  }
  return antiStallSystem;
}

/**
 * T,. Gibt Anti-Stall-System zurück
 */
export function getAntiStallSystem(): AntiStallSystem | null {
  return antiStallSystem;
}

/**
 * T,. Registriert einen Prozess für Anti-Stall-Überwachung
 */
export function registerProcessForAntiStall(
  processId: string,
  processName: string,
  critical: boolean,
  recoveryCallback: () => Promise<void>
): void {
  const system = getAntiStallSystem();
  if (system) {
    system.registerProcess(processId, processName, critical, recoveryCallback);
  }
}

/**
 * T,. Sendet Heartbeat für einen Prozess
 */
export function sendHeartbeat(processId: string, metadata?: any): void {
  const system = getAntiStallSystem();
  if (system) {
    system.heartbeat(processId, metadata);
  }
}

/**
 * T,. Entfernt einen Prozess aus der Überwachung
 */
export function unregisterProcess(processId: string): void {
  const system = getAntiStallSystem();
  if (system) {
    system.unregisterProcess(processId);
  }
}

/**
 * T,. Aktualisiert Status eines Prozesses
 */
export function updateProcessStatus(
  processId: string,
  phase: 'idle' | 'initializing' | 'indexing' | 'analyzing' | 'generating' | 'validating' | 'building' | 'testing' | 'deploying' | 'completed' | 'error' | 'recovering' | 'stalled' | 'dead',
  progress: number,
  message: string,
  metadata?: any
): void {
  const system = getAntiStallSystem();
  if (system) {
    system.updateStatus(processId, phase, progress, message, metadata);
  }
}


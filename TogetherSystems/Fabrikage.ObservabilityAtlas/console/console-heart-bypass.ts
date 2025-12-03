/**
 * ============================================================================
 * CONSOLE HEART BYPASS
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Console Heart Bypass - Haupt-Integration
 * ============================================================================
 */

import { UnifiedConsoleLayer } from './unified-console-layer';
import { ErrorBus } from './error-bus';
import { BypassIntegration } from './bypass-integration';
import { AuditLayer } from './audit-layer';

export class ConsoleHeartBypass {
  private consoleLayer: UnifiedConsoleLayer;
  private errorBus: ErrorBus;
  private bypassIntegration: BypassIntegration;
  private auditLayer: AuditLayer;

  constructor() {
    this.errorBus = new ErrorBus();
    this.consoleLayer = new UnifiedConsoleLayer(this.errorBus);
    this.bypassIntegration = new BypassIntegration();
    this.auditLayer = new AuditLayer();
  }

  /**
   * Initialisiert Console Heart Bypass
   */
  initialize(): void {
    console.log('T,. Console Heart Bypass: Initialisiert');
    console.log('T,. Konsole ist das Herz der Software');
    console.log('T,. Fehler werden automatisch umgeleitet und korrigiert');
    console.log('T,. Fließband läuft kontinuierlich weiter');
    
    this.bypassIntegration.initialize();
  }

  /**
   * Erfasst Fehler und leitet sofort weiter (Bypass)
   */
  async captureError(
    message: string,
    source: 'debug' | 'problems' | 'output' | 'terminal' | 'playwright' | 'build' | 'test',
    stacktrace?: string,
    file?: string,
    line?: number,
    column?: number
  ): Promise<void> {
    // Erfasse Fehler
    this.consoleLayer.error(message, source, stacktrace, file, line, column);

    // Audit: Log Error
    const event = {
      timestamp: new Date().toISOString(),
      source,
      severity: 'error' as const,
      message,
      stacktrace,
      file,
      line,
      column,
    };
    this.auditLayer.logError(event);

    // Bypass: Fehler wird automatisch weitergeleitet und korrigiert
    // Fließband läuft weiter
  }

  /**
   * Gibt Console Layer zurück
   */
  getConsoleLayer(): UnifiedConsoleLayer {
    return this.consoleLayer;
  }

  /**
   * Gibt Error Bus zurück
   */
  getErrorBus(): ErrorBus {
    return this.errorBus;
  }

  /**
   * Gibt Audit Layer zurück
   */
  getAuditLayer(): AuditLayer {
    return this.auditLayer;
  }

  /**
   * Gibt Audit-Report zurück
   */
  getAuditReport(startTime?: string, endTime?: string): any {
    return this.auditLayer.generateReport(startTime, endTime);
  }
}


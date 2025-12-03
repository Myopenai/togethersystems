/**
 * ============================================================================
 * BYPASS INTEGRATION
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Bypass-Integration - Fehler werden umgeleitet, Fließband läuft weiter
 * ============================================================================
 */

import { UnifiedConsoleLayer } from './unified-console-layer';
import { ErrorBus } from './error-bus';
import { AIFixer, FixResult } from './ai-fixer';

export class BypassIntegration {
  private consoleLayer: UnifiedConsoleLayer;
  private errorBus: ErrorBus;
  private fixHistory: FixResult[] = [];

  constructor() {
    this.errorBus = new ErrorBus();
    this.consoleLayer = new UnifiedConsoleLayer(this.errorBus);
  }

  /**
   * Initialisiert Bypass-Mechanik
   */
  initialize(): void {
    console.log('T,. Bypass-Integration: Initialisiert');
    console.log('T,. Bypass-Integration: Fehler werden automatisch umgeleitet und korrigiert');
    console.log('T,. Bypass-Integration: Fließband läuft kontinuierlich weiter');
  }

  /**
   * Erfasst Fehler und leitet sofort weiter (Bypass)
   */
  async captureAndFix(
    message: string,
    source: 'debug' | 'problems' | 'output' | 'terminal' | 'playwright' | 'build' | 'test',
    stacktrace?: string,
    file?: string,
    line?: number,
    column?: number
  ): Promise<FixResult | null> {
    // Erfasse Fehler
    this.consoleLayer.error(message, source, stacktrace, file, line, column);

    // Error Bus leitet automatisch weiter
    // Fix wird asynchron angewendet
    // Fließband läuft weiter

    // Warte kurz auf Fix (in Produktion würde hier ein Event-System verwendet)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Gibt letzten Fix zurück (wenn vorhanden)
    return this.fixHistory.length > 0 ? this.fixHistory[this.fixHistory.length - 1] : null;
  }

  /**
   * Registriert Fix in Historie
   */
  registerFix(fix: FixResult): void {
    this.fixHistory.push(fix);
    console.log(`T,. Bypass-Integration: Fix registriert (${this.fixHistory.length} total)`);
  }

  /**
   * Gibt Fix-Historie zurück
   */
  getFixHistory(): FixResult[] {
    return this.fixHistory;
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
}


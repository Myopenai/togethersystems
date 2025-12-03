/**
 * ============================================================================
 * UNIFIED CONSOLE LAYER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Unified Console Layer - Alle Konsolen in eine API
 * ============================================================================
 */

import { ErrorBus } from './error-bus';

export interface ConsoleEvent {
  timestamp: string;
  source: 'debug' | 'problems' | 'output' | 'terminal' | 'playwright' | 'build' | 'test';
  severity: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  stacktrace?: string;
  file?: string;
  line?: number;
  column?: number;
  metadata?: Record<string, any>;
}

export interface ConsoleProfile {
  name: string;
  source: ConsoleEvent['source'];
  fixer: string; // 'syntax-fixer' | 'policy-fixer' | 'performance-fixer' | 'self-healing' | 'accessibility-fixer'
  auto_fix: boolean;
  priority: number;
}

export class UnifiedConsoleLayer {
  private events: ConsoleEvent[] = [];
  private profiles: Map<string, ConsoleProfile> = new Map();
  private errorBus: ErrorBus;

  constructor(errorBus: ErrorBus) {
    this.errorBus = errorBus;
    this.initializeProfiles();
  }

  /**
   * Initialisiert Konsolen-Profile
   */
  private initializeProfiles(): void {
    this.profiles.set('debug', {
      name: 'Debug Console',
      source: 'debug',
      fixer: 'syntax-fixer',
      auto_fix: true,
      priority: 1,
    });

    this.profiles.set('problems', {
      name: 'Problems Console',
      source: 'problems',
      fixer: 'policy-fixer',
      auto_fix: true,
      priority: 2,
    });

    this.profiles.set('output', {
      name: 'Output Console',
      source: 'output',
      fixer: 'performance-fixer',
      auto_fix: false,
      priority: 3,
    });

    this.profiles.set('terminal', {
      name: 'Terminal Console',
      source: 'terminal',
      fixer: 'self-healing',
      auto_fix: true,
      priority: 1,
    });

    this.profiles.set('playwright', {
      name: 'Playwright Console',
      source: 'playwright',
      fixer: 'accessibility-fixer',
      auto_fix: true,
      priority: 1,
    });

    this.profiles.set('build', {
      name: 'Build Console',
      source: 'build',
      fixer: 'syntax-fixer',
      auto_fix: true,
      priority: 1,
    });

    this.profiles.set('test', {
      name: 'Test Console',
      source: 'test',
      fixer: 'test-fixer',
      auto_fix: true,
      priority: 2,
    });
  }

  /**
   * Erfasst ein Konsolen-Event
   */
  capture(event: ConsoleEvent): void {
    this.events.push(event);

    // Bei Fehlern sofort an Error Bus weiterleiten
    if (event.severity === 'error' || event.severity === 'fatal') {
      this.errorBus.route(event);
    }

    // Logging
    this.logEvent(event);
  }

  /**
   * Erfasst Debug-Meldung
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.capture({
      timestamp: new Date().toISOString(),
      source: 'debug',
      severity: 'debug',
      message,
      metadata,
    });
  }

  /**
   * Erfasst Info-Meldung
   */
  info(message: string, source: ConsoleEvent['source'] = 'output', metadata?: Record<string, any>): void {
    this.capture({
      timestamp: new Date().toISOString(),
      source,
      severity: 'info',
      message,
      metadata,
    });
  }

  /**
   * Erfasst Warnung
   */
  warn(message: string, source: ConsoleEvent['source'] = 'problems', metadata?: Record<string, any>): void {
    this.capture({
      timestamp: new Date().toISOString(),
      source,
      severity: 'warn',
      message,
      metadata,
    });
  }

  /**
   * Erfasst Fehler
   */
  error(message: string, source: ConsoleEvent['source'], stacktrace?: string, file?: string, line?: number, column?: number): void {
    const event: ConsoleEvent = {
      timestamp: new Date().toISOString(),
      source,
      severity: 'error',
      message,
      stacktrace,
      file,
      line,
      column,
    };

    this.capture(event);
  }

  /**
   * Erfasst Fatal-Fehler
   */
  fatal(message: string, source: ConsoleEvent['source'], stacktrace?: string): void {
    const event: ConsoleEvent = {
      timestamp: new Date().toISOString(),
      source,
      severity: 'fatal',
      message,
      stacktrace,
    };

    this.capture(event);
  }

  /**
   * Loggt Event
   */
  private logEvent(event: ConsoleEvent): void {
    const profile = this.profiles.get(event.source);
    if (!profile) return;

    const logEntry = {
      timestamp: event.timestamp,
      source: event.source,
      severity: event.severity,
      message: event.message,
      fixer: profile.fixer,
      auto_fix: profile.auto_fix,
    };

    console.log('T,. Console Event:', JSON.stringify(logEntry, null, 2));
  }

  /**
   * Gibt alle Events zurück
   */
  getEvents(): ConsoleEvent[] {
    return this.events;
  }

  /**
   * Gibt Events nach Quelle zurück
   */
  getEventsBySource(source: ConsoleEvent['source']): ConsoleEvent[] {
    return this.events.filter(e => e.source === source);
  }

  /**
   * Gibt Fehler-Events zurück
   */
  getErrors(): ConsoleEvent[] {
    return this.events.filter(e => e.severity === 'error' || e.severity === 'fatal');
  }
}


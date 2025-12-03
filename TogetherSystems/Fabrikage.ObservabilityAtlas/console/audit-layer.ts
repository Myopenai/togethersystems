/**
 * ============================================================================
 * AUDIT LAYER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Audit Layer - Protokolliert Fehler + Fix für Verifikation
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { ConsoleEvent } from './unified-console-layer';
import { FixResult } from './ai-fixer';

export interface AuditEntry {
  timestamp: string;
  trace_id: string;
  error: {
    message: string;
    source: string;
    severity: string;
    file?: string;
    line?: number;
    column?: number;
    stacktrace?: string;
  };
  fix?: {
    fixer: string;
    patch?: string;
    corrected_file?: string;
    success: boolean;
    error?: string;
  };
  result: {
    status: 'fixed' | 'failed' | 'pending';
    verification?: {
      tests_passed: boolean;
      build_success: boolean;
      deployment_success: boolean;
    };
  };
}

export class AuditLayer {
  private auditLogPath: string;
  private errorLogPath: string;
  private fixLogPath: string;

  constructor(logDir: string = './logs/audit') {
    this.auditLogPath = path.join(logDir, 'audit.jsonl');
    this.errorLogPath = path.join(logDir, 'error.log');
    this.fixLogPath = path.join(logDir, 'fix.log');

    // Erstelle Log-Verzeichnis
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Protokolliert Fehler
   */
  logError(event: ConsoleEvent): void {
    const logEntry = {
      timestamp: event.timestamp,
      source: event.source,
      severity: event.severity,
      message: event.message,
      file: event.file,
      line: event.line,
      column: event.column,
      stacktrace: event.stacktrace,
    };

    fs.appendFileSync(this.errorLogPath, JSON.stringify(logEntry) + '\n');
  }

  /**
   * Protokolliert Fix
   */
  logFix(fix: FixResult, event: ConsoleEvent): void {
    const logEntry = {
      timestamp: fix.timestamp,
      trace_id: fix.trace_id,
      fixer: fix.fixer,
      patch: fix.patch,
      corrected_file: fix.corrected_file,
      success: fix.success,
      error: fix.error,
      original_error: {
        message: event.message,
        source: event.source,
        severity: event.severity,
      },
    };

    fs.appendFileSync(this.fixLogPath, JSON.stringify(logEntry) + '\n');
  }

  /**
   * Protokolliert vollständigen Audit-Eintrag
   */
  logAudit(entry: AuditEntry): void {
    fs.appendFileSync(this.auditLogPath, JSON.stringify(entry) + '\n');
  }

  /**
   * Erstellt Audit-Eintrag aus Event und Fix
   */
  createAuditEntry(event: ConsoleEvent, fix?: FixResult, verification?: AuditEntry['result']['verification']): AuditEntry {
    return {
      timestamp: new Date().toISOString(),
      trace_id: fix?.trace_id || `trace-${Date.now()}`,
      error: {
        message: event.message,
        source: event.source,
        severity: event.severity,
        file: event.file,
        line: event.line,
        column: event.column,
        stacktrace: event.stacktrace,
      },
      fix: fix ? {
        fixer: fix.fixer,
        patch: fix.patch,
        corrected_file: fix.corrected_file,
        success: fix.success,
        error: fix.error,
      } : undefined,
      result: {
        status: fix?.success ? 'fixed' : (fix ? 'failed' : 'pending'),
        verification: verification,
      },
    };
  }

  /**
   * Gibt Audit-Report zurück
   */
  generateReport(startTime?: string, endTime?: string): any {
    const entries = this.readAuditEntries(startTime, endTime);
    
    const stats = {
      total_errors: entries.length,
      fixed: entries.filter(e => e.result.status === 'fixed').length,
      failed: entries.filter(e => e.result.status === 'failed').length,
      pending: entries.filter(e => e.result.status === 'pending').length,
      by_source: this.groupBySource(entries),
      by_fixer: this.groupByFixer(entries),
    };

    return {
      period: {
        start: startTime || 'beginning',
        end: endTime || 'now',
      },
      statistics: stats,
      entries: entries,
    };
  }

  /**
   * Liest Audit-Einträge
   */
  private readAuditEntries(startTime?: string, endTime?: string): AuditEntry[] {
    if (!fs.existsSync(this.auditLogPath)) {
      return [];
    }

    const content = fs.readFileSync(this.auditLogPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const entries: AuditEntry[] = lines.map(line => JSON.parse(line));

    if (startTime || endTime) {
      return entries.filter(entry => {
        if (startTime && entry.timestamp < startTime) return false;
        if (endTime && entry.timestamp > endTime) return false;
        return true;
      });
    }

    return entries;
  }

  /**
   * Gruppiert nach Quelle
   */
  private groupBySource(entries: AuditEntry[]): Record<string, number> {
    const groups: Record<string, number> = {};
    entries.forEach(entry => {
      groups[entry.error.source] = (groups[entry.error.source] || 0) + 1;
    });
    return groups;
  }

  /**
   * Gruppiert nach Fixer
   */
  private groupByFixer(entries: AuditEntry[]): Record<string, number> {
    const groups: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.fix) {
        groups[entry.fix.fixer] = (groups[entry.fix.fixer] || 0) + 1;
      }
    });
    return groups;
  }
}


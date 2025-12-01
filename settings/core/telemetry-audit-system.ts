/**
 * Telemetry & Audit System
 * Privacy-first, hart auditierbar, datensparsam, global skalierbar
 * 
 * T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)
 */

export type TelemetryEventType = 
  | 'voucher_activation'
  | 'function_usage'
  | 'delay_applied'
  | 'user_feedback'
  | 'license_status'
  | 'policy_check'
  | 'error_occurred';

export interface TelemetryEvent {
  eventId: string;
  eventType: TelemetryEventType;
  userId?: string; // Alphabet-ID (optional für Privacy)
  productId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
  anonymized: boolean;
}

export interface AuditLog {
  logId: string;
  action: string;
  actor?: string; // Alphabet-ID (optional)
  target?: string;
  timestamp: Date;
  result: 'success' | 'failure' | 'pending';
  metadata: Record<string, any>;
  immutable: boolean;
}

export interface TelemetryConfig {
  enabled: boolean;
  privacyFirst: boolean;
  anonymizeUserIds: boolean;
  retentionDays: number;
  batchSize: number;
  flushIntervalMs: number;
}

export class TelemetryAuditSystem {
  private static instance: TelemetryAuditSystem;
  private events: TelemetryEvent[] = [];
  private auditLogs: AuditLog[] = [];
  private config: TelemetryConfig;

  private constructor() {
    this.config = {
      enabled: true,
      privacyFirst: true,
      anonymizeUserIds: true,
      retentionDays: 2555, // ~7 Jahre
      batchSize: 100,
      flushIntervalMs: 60000 // 1 Minute
    };

    this.startFlushInterval();
  }

  public static getInstance(): TelemetryAuditSystem {
    if (!TelemetryAuditSystem.instance) {
      TelemetryAuditSystem.instance = new TelemetryAuditSystem();
    }
    return TelemetryAuditSystem.instance;
  }

  /**
   * Sendet Telemetry-Event
   */
  public trackEvent(
    eventType: TelemetryEventType,
    metadata: Record<string, any> = {},
    userId?: string,
    productId?: string
  ): void {
    if (!this.config.enabled) {
      return;
    }

    const event: TelemetryEvent = {
      eventId: this.generateEventId(),
      eventType,
      userId: this.config.anonymizeUserIds && userId ? this.anonymizeUserId(userId) : userId,
      productId,
      timestamp: new Date(),
      metadata: this.sanitizeMetadata(metadata),
      anonymized: this.config.anonymizeUserIds && !!userId
    };

    this.events.push(event);

    // Auto-Flush wenn Batch voll
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Erstellt Audit-Log
   */
  public auditLog(
    action: string,
    result: 'success' | 'failure' | 'pending',
    metadata: Record<string, any> = {},
    actor?: string,
    target?: string
  ): void {
    const log: AuditLog = {
      logId: this.generateLogId(),
      action,
      actor: this.config.anonymizeUserIds && actor ? this.anonymizeUserId(actor) : actor,
      target,
      timestamp: new Date(),
      result,
      metadata: this.sanitizeMetadata(metadata),
      immutable: true // Audit-Logs sind unveränderlich
    };

    this.auditLogs.push(log);

    // Audit-Logs sofort speichern (kein Batching)
    this.saveAuditLog(log);
  }

  /**
   * Trackt Funktion-Nutzung
   */
  public trackFunctionUsage(
    functionName: string,
    slotType: string,
    delayMs: number,
    userId?: string,
    productId?: string
  ): void {
    this.trackEvent('function_usage', {
      functionName,
      slotType,
      delayMs,
      timestamp: new Date().toISOString()
    }, userId, productId);
  }

  /**
   * Trackt Voucher-Aktivierung
   */
  public trackVoucherActivation(
    voucherId: string,
    userId: string,
    productId: string,
    success: boolean
  ): void {
    this.trackEvent('voucher_activation', {
      voucherId,
      success,
      timestamp: new Date().toISOString()
    }, userId, productId);

    this.auditLog(
      'voucher_activation',
      success ? 'success' : 'failure',
      { voucherId, productId },
      userId
    );
  }

  /**
   * Trackt License-Status
   */
  public trackLicenseStatus(
    userId: string,
    productId: string,
    status: string,
    slotType: string
  ): void {
    this.trackEvent('license_status', {
      status,
      slotType,
      timestamp: new Date().toISOString()
    }, userId, productId);
  }

  /**
   * Trackt Policy-Check
   */
  public trackPolicyCheck(
    functionName: string,
    userId: string,
    productId: string,
    allowed: boolean,
    reason?: string
  ): void {
    this.trackEvent('policy_check', {
      functionName,
      allowed,
      reason,
      timestamp: new Date().toISOString()
    }, userId, productId);
  }

  /**
   * Trackt angewendete Verzögerung
   */
  public trackDelayApplied(
    functionName: string,
    slotType: string,
    delayMs: number,
    userId?: string
  ): void {
    this.trackEvent('delay_applied', {
      functionName,
      slotType,
      delayMs,
      timestamp: new Date().toISOString()
    }, userId);
  }

  /**
   * Trackt User-Feedback
   */
  public trackUserFeedback(
    feedback: string,
    rating?: number,
    userId?: string
  ): void {
    this.trackEvent('user_feedback', {
      feedback,
      rating,
      timestamp: new Date().toISOString()
    }, userId);
  }

  /**
   * Flusht Events (speichert)
   */
  public flush(): void {
    if (this.events.length === 0) {
      return;
    }

    // In Produktion: An Backend senden oder in Datenbank speichern
    const eventsToFlush = [...this.events];
    this.events = [];

    this.saveTelemetryEvents(eventsToFlush);
  }

  /**
   * Speichert Telemetry-Events
   */
  private saveTelemetryEvents(events: TelemetryEvent[]): void {
    // In Produktion: In Datenbank speichern oder an Backend senden
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('telemetry_events');
      const existing = stored ? JSON.parse(stored) : [];
      
      const combined = [...existing, ...events];
      
      // Cleanup alte Events (Retention)
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - this.config.retentionDays);
      
      const filtered = combined.filter((event: TelemetryEvent) => {
        return new Date(event.timestamp) >= cutoff;
      });

      localStorage.setItem('telemetry_events', JSON.stringify(filtered));
    }
  }

  /**
   * Speichert Audit-Log
   */
  private saveAuditLog(log: AuditLog): void {
    // In Produktion: In immutable Datenbank speichern
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('audit_logs');
      const existing = stored ? JSON.parse(stored) : [];
      
      existing.push(log);
      
      // Cleanup alte Logs (Retention)
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - this.config.retentionDays);
      
      const filtered = existing.filter((log: AuditLog) => {
        return new Date(log.timestamp) >= cutoff;
      });

      localStorage.setItem('audit_logs', JSON.stringify(filtered));
    }
  }

  /**
   * Exportiert Telemetry-Daten (für Audit)
   */
  public exportTelemetry(startDate?: Date, endDate?: Date): TelemetryEvent[] {
    let filtered = [...this.events];

    if (startDate) {
      filtered = filtered.filter(event => new Date(event.timestamp) >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(event => new Date(event.timestamp) <= endDate);
    }

    return filtered;
  }

  /**
   * Exportiert Audit-Logs (für Audit)
   */
  public exportAuditLogs(startDate?: Date, endDate?: Date): AuditLog[] {
    let filtered = [...this.auditLogs];

    if (startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }

    return filtered;
  }

  /**
   * Anonymisiert User-ID (Privacy-first)
   */
  private anonymizeUserId(userId: string): string {
    // Hash-basierte Anonymisierung (vereinfacht - in Produktion: SHA-256)
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `anon-${Math.abs(hash).toString(36)}`;
  }

  /**
   * Sanitized Metadata (entfernt sensitive Daten)
   */
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credit', 'ssn'];

    for (const [key, value] of Object.entries(metadata)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Generiert Event-ID
   */
  private generateEventId(): string {
    return `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generiert Log-ID
   */
  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Startet Flush-Interval
   */
  private startFlushInterval(): void {
    setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  /**
   * Aktualisiert Konfiguration
   */
  public updateConfig(config: Partial<TelemetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Hole Konfiguration
   */
  public getConfig(): TelemetryConfig {
    return { ...this.config };
  }
}

// Export Singleton
export default TelemetryAuditSystem;





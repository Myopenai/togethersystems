/**
 * Audit Log System
 * 
 * Loggt alle Settings-Änderungen für Compliance
 */

import type { SettingsNode } from '../schemas/settings.schema';

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  id: number;
  action: string;
  nodeId?: string;
  userId?: string;
  changes?: any;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Log Manager
 */
export class AuditLogManager {
  private db: D1Database | null;
  private inMemoryLog: AuditLogEntry[] = [];

  constructor(db?: D1Database) {
    this.db = db || null;
  }

  /**
   * Loggt Audit Event
   */
  async log(event: {
    action: string;
    nodeId?: string;
    userId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const entry: AuditLogEntry = {
      id: Date.now(),
      ...event,
      timestamp: Date.now()
    };

    // Speichere in D1 (wenn verfügbar)
    if (this.db) {
      await this.db.prepare(`
        INSERT INTO settings_audit_log (
          action, node_id, user_id, changes, timestamp, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        event.action,
        event.nodeId || null,
        event.userId || null,
        event.changes ? JSON.stringify(event.changes) : null,
        entry.timestamp,
        event.ipAddress || null,
        event.userAgent || null
      ).run();
    } else {
      // In-Memory Fallback
      this.inMemoryLog.push(entry);
      if (this.inMemoryLog.length > 1000) {
        this.inMemoryLog.shift(); // Keep last 1000
      }
    }
  }

  /**
   * Lädt Audit Log
   */
  async getLog(filters?: {
    nodeId?: string;
    userId?: string;
    action?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    if (this.db) {
      let query = 'SELECT * FROM settings_audit_log WHERE 1=1';
      const params: any[] = [];

      if (filters?.nodeId) {
        query += ' AND node_id = ?';
        params.push(filters.nodeId);
      }

      if (filters?.userId) {
        query += ' AND user_id = ?';
        params.push(filters.userId);
      }

      if (filters?.action) {
        query += ' AND action = ?';
        params.push(filters.action);
      }

      if (filters?.startTime) {
        query += ' AND timestamp >= ?';
        params.push(filters.startTime);
      }

      if (filters?.endTime) {
        query += ' AND timestamp <= ?';
        params.push(filters.endTime);
      }

      query += ' ORDER BY timestamp DESC';

      if (filters?.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      const result = await this.db.prepare(query).bind(...params).all();
      return result.results.map((row: any) => ({
        id: row.id,
        action: row.action,
        nodeId: row.node_id,
        userId: row.user_id,
        changes: row.changes ? JSON.parse(row.changes) : undefined,
        timestamp: row.timestamp,
        ipAddress: row.ip_address,
        userAgent: row.user_agent
      }));
    } else {
      // In-Memory Fallback
      let logs = [...this.inMemoryLog];

      if (filters?.nodeId) {
        logs = logs.filter(l => l.nodeId === filters.nodeId);
      }

      if (filters?.userId) {
        logs = logs.filter(l => l.userId === filters.userId);
      }

      if (filters?.action) {
        logs = logs.filter(l => l.action === filters.action);
      }

      if (filters?.startTime) {
        logs = logs.filter(l => l.timestamp >= filters.startTime!);
      }

      if (filters?.endTime) {
        logs = logs.filter(l => l.timestamp <= filters.endTime!);
      }

      logs.sort((a, b) => b.timestamp - a.timestamp);

      if (filters?.limit) {
        logs = logs.slice(0, filters.limit);
      }

      return logs;
    }
  }

  /**
   * Exportiert Audit Log
   */
  async export(format: 'json' | 'csv' = 'json'): Promise<string> {
    const logs = await this.getLog();

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV
      const headers = ['id', 'action', 'nodeId', 'userId', 'timestamp', 'ipAddress'];
      const rows = logs.map(log => [
        log.id,
        log.action,
        log.nodeId || '',
        log.userId || '',
        log.timestamp,
        log.ipAddress || ''
      ]);

      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
  }
}


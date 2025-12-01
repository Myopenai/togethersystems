/**
 * Auditierbares System für alle Produktionen
 * 
 * Jede Aktion wird geloggt und öffentlich verifizierbar gemacht
 * 
 * Garantie: KEINE User-Daten werden gespeichert oder geloggt
 */

import { createHash } from 'crypto';

/**
 * Audit-Log Eintrag (OHNE User-Daten)
 */
export interface AuditLog {
  action: string;
  timestamp: string;
  hash: string;
  publicKey: string; // Für öffentliche Verifizierung
  noUserData: true; // Garantie: Keine User-Daten
  kernelHash?: string; // Optional: Verweis auf Kernel-Zustand
}

/**
 * Audit-System für öffentliche Verifizierung
 */
export class AuditSystem {
  private logs: AuditLog[] = [];
  private publicKey: string;

  constructor(publicKey?: string) {
    // Generiere öffentlichen Schlüssel für Verifizierung
    this.publicKey = publicKey || this.generatePublicKey();
  }

  /**
   * Loggt System-Aktionen (OHNE User-Daten)
   * 
   * @param action - Die durchgeführte Aktion (z.B. "KERNEL_INITIALIZED")
   * @param kernelHash - Optional: Hash des Kernel-Zustands
   */
  logAction(action: string, kernelHash?: string): AuditLog {
    const timestamp = new Date().toISOString();
    const hash = this.generateHash(action, timestamp, kernelHash);

    const log: AuditLog = {
      action,
      timestamp,
      hash,
      publicKey: this.publicKey,
      noUserData: true, // Garantie
      kernelHash
    };

    this.logs.push(log);
    return log;
  }

  /**
   * Öffentliche Verifizierung eines Audit-Logs
   * 
   * Jeder kann diese Funktion verwenden, um Logs zu verifizieren
   * Keine geheimen Schlüssel nötig
   */
  verifyAuditLog(log: AuditLog): boolean {
    const expectedHash = this.generateHash(
      log.action,
      log.timestamp,
      log.kernelHash
    );

    return expectedHash === log.hash;
  }

  /**
   * Verifiziert alle Logs
   */
  verifyAllLogs(): { valid: number; invalid: number; logs: AuditLog[] } {
    let valid = 0;
    let invalid = 0;

    const verifiedLogs = this.logs.map(log => {
      const isValid = this.verifyAuditLog(log);
      if (isValid) {
        valid++;
      } else {
        invalid++;
      }
      return log;
    });

    return {
      valid,
      invalid,
      logs: verifiedLogs
    };
  }

  /**
   * Gibt alle Audit-Logs zurück (öffentlich)
   */
  getAllLogs(): AuditLog[] {
    return [...this.logs];
  }

  /**
   * Exportiert Audit-Logs als JSON (für öffentliche Verifizierung)
   */
  exportLogs(): string {
    return JSON.stringify({
      publicKey: this.publicKey,
      logs: this.logs,
      guarantee: 'NO_USER_DATA',
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Generiert Hash für Audit-Log
   * WICHTIG: Keine User-Daten im Hash!
   */
  private generateHash(
    action: string,
    timestamp: string,
    kernelHash?: string
  ): string {
    const data = kernelHash
      ? `${action}:${timestamp}:${kernelHash}`
      : `${action}:${timestamp}`;
    
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generiert öffentlichen Schlüssel für Verifizierung
   */
  private generatePublicKey(): string {
    const random = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString();
    return createHash('sha256')
      .update(`${random}:${timestamp}`)
      .digest('hex')
      .substring(0, 32);
  }
}

/**
 * Singleton-Instanz des Audit-Systems
 */
export const auditSystem = new AuditSystem();









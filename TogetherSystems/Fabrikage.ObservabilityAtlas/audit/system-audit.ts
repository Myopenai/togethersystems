/**
 * ============================================================================
 * SYSTEM AUDIT
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. System Audit: Echte Integritätsprüfung statt Fake-Busy
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AuditResult {
  module: string;
  status: 'active' | 'inactive' | 'error';
  integrity: boolean;
  connected: boolean;
  initialized: boolean;
  errors: string[];
  timestamp: number;
}

export interface SystemAuditReport {
  timestamp: number;
  overallStatus: 'healthy' | 'degraded' | 'critical';
  modules: AuditResult[];
  issues: string[];
  recommendations: string[];
}

/**
 * T,. System Audit: Echte Prüfung statt write-host
 */
export class SystemAudit {
  private rootDir: string;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }

  /**
   * T,. Führt vollständiges Audit durch
   */
  async auditAll(): Promise<SystemAuditReport> {
    console.log("T,. System Audit: Starte vollständige Integritätsprüfung...");

    const modules: AuditResult[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Prüfe alle kritischen Module
    const criticalModules = [
      'Fabrikage.CoreProtocols',
      'Fabrikage.AutoExecution',
      'Fabrikage.IntelligenceMatrix',
      'Fabrikage.ProvenanceLedger',
      'Fabrikage.ObservabilityAtlas'
    ];

    for (const module of criticalModules) {
      const result = await this.auditModule(module);
      modules.push(result);

      if (!result.integrity) {
        issues.push(`${module}: Integrität fehlt`);
      }
      if (!result.connected) {
        issues.push(`${module}: Nicht korrekt verbunden`);
      }
      if (!result.initialized) {
        issues.push(`${module}: Nicht initialisiert`);
      }
      if (result.errors.length > 0) {
        issues.push(`${module}: ${result.errors.join(', ')}`);
      }
    }

    // Prüfe Display-System
    const displayAudit = await this.auditDisplaySystem();
    modules.push(displayAudit);

    // Prüfe Anti-Stall-System
    const antiStallAudit = await this.auditAntiStallSystem();
    modules.push(antiStallAudit);

    // Bestimme Gesamtstatus
    const overallStatus = this.determineOverallStatus(modules, issues);

    // Generiere Empfehlungen
    if (issues.length > 0) {
      recommendations.push("Ignition-Reset durchführen");
      recommendations.push("Display-System neu initialisieren");
      recommendations.push("Alle Tests erneut ausführen");
    }

    const report: SystemAuditReport = {
      timestamp: Date.now(),
      overallStatus,
      modules,
      issues,
      recommendations
    };

    this.logReport(report);

    return report;
  }

  /**
   * T,. Prüft ein einzelnes Modul
   */
  private async auditModule(moduleName: string): Promise<AuditResult> {
    const modulePath = path.join(this.rootDir, moduleName);
    const errors: string[] = [];

    // Prüfe ob Verzeichnis existiert
    if (!fs.existsSync(modulePath)) {
      return {
        module: moduleName,
        status: 'error',
        integrity: false,
        connected: false,
        initialized: false,
        errors: [`Verzeichnis nicht gefunden: ${modulePath}`],
        timestamp: Date.now()
      };
    }

    // Prüfe ob Manifest vorhanden
    const manifestPath = path.join(modulePath, 'manifest.yaml');
    const hasManifest = fs.existsSync(manifestPath);

    // Prüfe ob Hauptdateien vorhanden
    const mainFiles = this.getMainFilesForModule(moduleName);
    const missingFiles: string[] = [];
    
    for (const file of mainFiles) {
      const filePath = path.join(modulePath, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      errors.push(`Fehlende Dateien: ${missingFiles.join(', ')}`);
    }

    return {
      module: moduleName,
      status: errors.length === 0 ? 'active' : 'error',
      integrity: hasManifest && missingFiles.length === 0,
      connected: true, // Wird durch Integration geprüft
      initialized: hasManifest,
      errors,
      timestamp: Date.now()
    };
  }

  /**
   * T,. Prüft Display-System
   */
  private async auditDisplaySystem(): Promise<AuditResult> {
    const dashboardPath = path.join(this.rootDir, 'Portal', 'dashboard', 'index.html');
    const templatePath = path.join(this.rootDir, 'Fabrikage.ObservabilityAtlas', 'dashboard', 'aquarium-dashboard.html');
    
    const errors: string[] = [];

    if (!fs.existsSync(dashboardPath)) {
      errors.push('Dashboard nicht generiert');
    }

    if (!fs.existsSync(templatePath)) {
      errors.push('Dashboard-Template nicht gefunden');
    }

    return {
      module: 'Display-System',
      status: errors.length === 0 ? 'active' : 'error',
      integrity: fs.existsSync(dashboardPath) && fs.existsSync(templatePath),
      connected: true,
      initialized: fs.existsSync(dashboardPath),
      errors,
      timestamp: Date.now()
    };
  }

  /**
   * T,. Prüft Anti-Stall-System
   */
  private async auditAntiStallSystem(): Promise<AuditResult> {
    const antiStallPath = path.join(this.rootDir, 'Fabrikage.ObservabilityAtlas', 'anti-stall', 'anti-stall-system.ts');
    const heartbeatPath = path.join(this.rootDir, 'Fabrikage.ObservabilityAtlas', 'heartbeat', 'heartbeat-manager.ts');
    const watchdogPath = path.join(this.rootDir, 'Fabrikage.ObservabilityAtlas', 'watchdog', 'watchdog-system.ts');
    
    const errors: string[] = [];

    if (!fs.existsSync(antiStallPath)) {
      errors.push('Anti-Stall-System nicht gefunden');
    }

    if (!fs.existsSync(heartbeatPath)) {
      errors.push('Heartbeat-Manager nicht gefunden');
    }

    if (!fs.existsSync(watchdogPath)) {
      errors.push('Watchdog-System nicht gefunden');
    }

    return {
      module: 'Anti-Stall-System',
      status: errors.length === 0 ? 'active' : 'error',
      integrity: fs.existsSync(antiStallPath) && fs.existsSync(heartbeatPath) && fs.existsSync(watchdogPath),
      connected: true,
      initialized: true,
      errors,
      timestamp: Date.now()
    };
  }

  /**
   * T,. Bestimmt Gesamtstatus
   */
  private determineOverallStatus(modules: AuditResult[], issues: string[]): 'healthy' | 'degraded' | 'critical' {
    const errorCount = modules.filter(m => m.status === 'error').length;
    const criticalIssues = issues.filter(i => i.includes('kritisch') || i.includes('nicht gefunden')).length;

    if (criticalIssues > 0 || errorCount > modules.length / 2) {
      return 'critical';
    } else if (errorCount > 0 || issues.length > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * T,. Gibt Hauptdateien für ein Modul zurück
   */
  private getMainFilesForModule(moduleName: string): string[] {
    const fileMap: Record<string, string[]> = {
      'Fabrikage.CoreProtocols': ['schemas', 'policies'],
      'Fabrikage.AutoExecution': ['bootstrap/a-start.ts', 'pipelines'],
      'Fabrikage.IntelligenceMatrix': ['fallback', 'optimization'],
      'Fabrikage.ProvenanceLedger': ['sbom', 'signatures'],
      'Fabrikage.ObservabilityAtlas': ['status', 'heartbeat', 'watchdog', 'anti-stall']
    };

    return fileMap[moduleName] || [];
  }

  /**
   * T,. Loggt Audit-Report
   */
  private logReport(report: SystemAuditReport): void {
    console.log("");
    console.log("=====================================");
    console.log("T,. SYSTEM AUDIT REPORT");
    console.log("=====================================");
    console.log(`Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`Zeitstempel: ${new Date(report.timestamp).toISOString()}`);
    console.log("");

    console.log("Module:");
    for (const module of report.modules) {
      const statusIcon = module.status === 'active' ? '✓' : '✗';
      console.log(`  ${statusIcon} ${module.module}: ${module.status}`);
      if (module.errors.length > 0) {
        module.errors.forEach(error => console.log(`    - ${error}`));
      }
    }

    if (report.issues.length > 0) {
      console.log("");
      console.log("Probleme:");
      report.issues.forEach(issue => console.log(`  ✗ ${issue}`));
    }

    if (report.recommendations.length > 0) {
      console.log("");
      console.log("Empfehlungen:");
      report.recommendations.forEach(rec => console.log(`  → ${rec}`));
    }

    console.log("");
    console.log("=====================================");
  }
}


/**
 * ============================================================================
 * DASHBOARD GENERATOR
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Dashboard Generator: Generiert automatisch das Aquarium-Dashboard
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { StatusManager, StatusUpdate } from '../status/status-manager';
import { HeartbeatManager } from '../heartbeat/heartbeat-manager';

export interface DashboardData {
  sections: Array<{
    id: string;
    name: string;
    status: 'active' | 'completed' | 'pending';
    time: number;
    zone: 'past' | 'current' | 'future';
    progress: number;
  }>;
  elapsedTime: number;
  remainingTime: number;
  overallProgress: number;
  activeCount: number;
  timestamp: number;
}

/**
 * T,. Dashboard Generator: Generiert automatisch das Aquarium-Dashboard
 */
export class DashboardGenerator {
  private statusManager: StatusManager;
  private heartbeatManager: HeartbeatManager;
  private outputDir: string;
  private templatePath: string;

  constructor(
    statusManager: StatusManager,
    heartbeatManager: HeartbeatManager,
    outputDir: string = './Portal/dashboard'
  ) {
    this.statusManager = statusManager;
    this.heartbeatManager = heartbeatManager;
    this.outputDir = outputDir;
    this.templatePath = path.join(__dirname, 'aquarium-dashboard.html');
  }

  /**
   * T,. Generiert Dashboard-Daten aus aktuellen Status
   */
  generateDashboardData(): DashboardData {
    const statuses = this.statusManager.getAllStatuses();
    const heartbeatStatuses = this.heartbeatManager.getStatus();

    // Mappe Statuses zu Sections
    const sections = statuses.map((status, index) => {
      let zone: 'past' | 'current' | 'future' = 'future';
      if (status.phase === 'completed' || status.phase === 'idle') {
        zone = 'past';
      } else if (status.phase === 'initializing' || status.phase === 'indexing' || 
                 status.phase === 'analyzing' || status.phase === 'generating' ||
                 status.phase === 'validating' || status.phase === 'building' ||
                 status.phase === 'testing' || status.phase === 'deploying' ||
                 status.phase === 'recovering') {
        zone = 'current';
      }

      let sectionStatus: 'active' | 'completed' | 'pending' = 'pending';
      if (status.phase === 'completed') {
        sectionStatus = 'completed';
      } else if (zone === 'current') {
        sectionStatus = 'active';
      }

      return {
        id: status.processId,
        name: this.getSectionName(status.processId),
        status: sectionStatus,
        time: this.getSectionTime(status),
        zone,
        progress: status.progress
      };
    });

    // Berechne Zeiten
    const elapsedTime = this.calculateElapsedTime(statuses);
    const remainingTime = this.calculateRemainingTime(statuses);
    const overallProgress = this.calculateOverallProgress(statuses);
    const activeCount = sections.filter(s => s.status === 'active').length;

    return {
      sections,
      elapsedTime,
      remainingTime,
      overallProgress,
      activeCount,
      timestamp: Date.now()
    };
  }

  /**
   * T,. Generiert HTML-Dashboard
   */
  async generateDashboard(): Promise<string> {
    const data = this.generateDashboardData();
    const template = fs.readFileSync(this.templatePath, 'utf-8');
    
    // Inline Dashboard-Daten in Template
    const dashboardHtml = template.replace(
      '// Initialize Dashboard',
      `// Initialize Dashboard\n        const dashboardData = ${JSON.stringify(data, null, 2)};\n        const dashboard = new AquariumDashboard();\n        dashboard.updateData(dashboardData.sections);`
    );

    return dashboardHtml;
  }

  /**
   * T,. Speichert Dashboard
   */
  async saveDashboard(): Promise<string> {
    const html = await this.generateDashboard();
    const outputPath = path.join(this.outputDir, 'index.html');

    // Stelle sicher, dass Output-Verzeichnis existiert
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`T,. Dashboard Generator: Dashboard gespeichert: ${outputPath}`);

    return outputPath;
  }

  private updateInterval: NodeJS.Timeout | null = null;

  /**
   * T,. Startet automatische Dashboard-Updates
   */
  startAutoUpdates(intervalMs: number = 5000): void {
    // Stoppe vorherige Updates falls vorhanden
    this.stopAutoUpdates();
    
    console.log(`T,. Dashboard Generator: Starte automatische Updates (Intervall: ${intervalMs}ms)`);
    
    this.updateInterval = setInterval(async () => {
      try {
        // Prüfe ob es noch aktive Prozesse gibt
        const statuses = this.statusManager.getAllStatuses();
        const hasActiveProcesses = statuses.some((s: any) => 
          s.phase !== 'completed' && s.phase !== 'idle' && s.phase !== 'error'
        );
        
        if (!hasActiveProcesses && statuses.length > 0) {
          // Alle Prozesse abgeschlossen - stoppe Updates
          this.stopAutoUpdates();
          console.log("T,. Dashboard Generator: Alle Prozesse abgeschlossen, Updates gestoppt");
          return;
        }
        
        await this.saveDashboard();
      } catch (error) {
        console.error('T,. Dashboard Generator: Fehler beim Dashboard-Update:', error);
      }
    }, intervalMs);
  }

  /**
   * T,. Stoppt automatische Dashboard-Updates
   */
  stopAutoUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("T,. Dashboard Generator: Automatische Updates gestoppt");
    }
  }

  /**
   * T,. Gibt Section-Namen zurück
   */
  private getSectionName(processId: string): string {
    const nameMap: Record<string, string> = {
      'a-start': 'A-Start',
      'recognize': 'Recognize',
      'validate': 'Validate',
      'produce': 'Produce',
      'build': 'Build',
      'test': 'Test',
      'deploy': 'Deploy'
    };

    return nameMap[processId] || processId;
  }

  /**
   * T,. Berechnet Section-Zeit
   */
  private getSectionTime(status: StatusUpdate): number {
    if (status.metadata?.elapsedMs) {
      return status.metadata.elapsedMs;
    }
    return 0;
  }

  /**
   * T,. Berechnet verstrichene Zeit
   */
  private calculateElapsedTime(statuses: StatusUpdate[]): number {
    const totalElapsed = statuses.reduce((sum, status) => {
      return sum + (status.metadata?.elapsedMs || 0);
    }, 0);
    return totalElapsed;
  }

  /**
   * T,. Berechnet verbleibende Zeit
   */
  private calculateRemainingTime(statuses: StatusUpdate[]): number {
    const pendingSections = statuses.filter(s => 
      s.phase === 'idle'
    ).length;
    const avgTimePerSection = 5000; // 5 Sekunden durchschnittlich
    return pendingSections * avgTimePerSection;
  }

  /**
   * T,. Berechnet Gesamtfortschritt
   */
  private calculateOverallProgress(statuses: StatusUpdate[]): number {
    if (statuses.length === 0) {
      return 0;
    }

    const totalProgress = statuses.reduce((sum, status) => {
      return sum + status.progress;
    }, 0);

    return totalProgress / statuses.length;
  }
}


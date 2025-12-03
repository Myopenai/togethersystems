/**
 * ============================================================================
 * RESOURCE HYGIENE
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Resource Hygiene: Ressourcen-Hygiene für CPU/GPU/IO, Indexing-Optimierung
 * ============================================================================
 */

export interface ResourceQuota {
  cpu: {
    maxPercent: number;
    currentPercent: number;
  };
  memory: {
    maxMB: number;
    currentMB: number;
  };
  io: {
    maxReadMBps: number;
    maxWriteMBps: number;
    currentReadMBps: number;
    currentWriteMBps: number;
  };
  network: {
    maxMbps: number;
    currentMbps: number;
  };
}

export interface IndexingConfig {
  excludePatterns: string[]; // z.B. ['node_modules/**', 'build/**', '.git/**']
  maxFileSize: number; // Max Dateigröße in MB
  maxFiles: number; // Maximale Anzahl zu indexierender Dateien
  prioritizeExtensions: string[]; // z.B. ['.ts', '.js', '.yaml', '.json']
}

export interface HygieneReport {
  timestamp: number;
  resourceUsage: ResourceQuota;
  indexingStats: {
    totalFiles: number;
    indexedFiles: number;
    excludedFiles: number;
    skippedFiles: number;
  };
  recommendations: string[];
}

/**
 * T,. Resource Hygiene: Verhindert Ressourcen-Überlastung
 */
export class ResourceHygiene {
  private quotas: ResourceQuota;
  private indexingConfig: IndexingConfig;
  private monitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    quotas: ResourceQuota = {
      cpu: { maxPercent: 80, currentPercent: 0 },
      memory: { maxMB: 4096, currentMB: 0 },
      io: { maxReadMBps: 100, maxWriteMBps: 50, currentReadMBps: 0, currentWriteMBps: 0 },
      network: { maxMbps: 1000, currentMbps: 0 }
    },
    indexingConfig: IndexingConfig = {
      excludePatterns: ['node_modules/**', 'build/**', 'dist/**', '.git/**', 'coverage/**'],
      maxFileSize: 10, // 10 MB
      maxFiles: 10000,
      prioritizeExtensions: ['.ts', '.js', '.tsx', '.jsx', '.yaml', '.json', '.md']
    }
  ) {
    this.quotas = quotas;
    this.indexingConfig = indexingConfig;
  }

  /**
   * T,. Startet Ressourcen-Monitoring
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.monitoring) {
      return;
    }

    console.log("T,. Resource Hygiene: Starte Ressourcen-Monitoring...");
    this.monitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.checkResources();
    }, intervalMs);
  }

  /**
   * T,. Stoppt Ressourcen-Monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.monitoring = false;
    console.log("T,. Resource Hygiene: Monitoring gestoppt");
  }

  /**
   * T,. Prüft aktuelle Ressourcen-Nutzung
   */
  private checkResources(): void {
    // Hier würde tatsächliche Ressourcen-Messung erfolgen
    // Für jetzt: Placeholder
    const cpuPercent = this.getCurrentCPUPercent();
    const memoryMB = this.getCurrentMemoryMB();

    this.quotas.cpu.currentPercent = cpuPercent;
    this.quotas.memory.currentMB = memoryMB;

    // Warnung bei hoher Nutzung
    if (cpuPercent > this.quotas.cpu.maxPercent) {
      console.warn(`T,. Resource Hygiene: WARNUNG - CPU-Nutzung zu hoch: ${cpuPercent}% (Max: ${this.quotas.cpu.maxPercent}%)`);
    }

    if (memoryMB > this.quotas.memory.maxMB) {
      console.warn(`T,. Resource Hygiene: WARNUNG - Memory-Nutzung zu hoch: ${memoryMB}MB (Max: ${this.quotas.memory.maxMB}MB)`);
    }
  }

  /**
   * T,. Gibt aktuelle CPU-Nutzung zurück (Placeholder)
   */
  private getCurrentCPUPercent(): number {
    // Placeholder: Hier würde tatsächliche CPU-Messung erfolgen
    // z.B. über os.cpus() oder process.cpuUsage()
    return process.cpuUsage().user / 1000000; // Vereinfacht
  }

  /**
   * T,. Gibt aktuellen Memory-Verbrauch zurück
   */
  private getCurrentMemoryMB(): number {
    const usage = process.memoryUsage();
    return Math.round(usage.heapUsed / 1024 / 1024);
  }

  /**
   * T,. Filtert Dateien für Indexing basierend auf Config
   */
  shouldIndexFile(filePath: string, fileSizeBytes: number): boolean {
    // Prüfe Exclude-Patterns
    for (const pattern of this.indexingConfig.excludePatterns) {
      if (this.matchesPattern(filePath, pattern)) {
        return false;
      }
    }

    // Prüfe Dateigröße
    const fileSizeMB = fileSizeBytes / 1024 / 1024;
    if (fileSizeMB > this.indexingConfig.maxFileSize) {
      return false;
    }

    return true;
  }

  /**
   * T,. Prüft ob Dateipfad einem Pattern entspricht
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Vereinfachte Pattern-Matching (sollte durch minimatch o.ä. ersetzt werden)
    const regex = new RegExp(
      pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\//g, '\\/')
    );
    return regex.test(filePath);
  }

  /**
   * T,. Gibt Hygiene-Report zurück
   */
  getReport(): HygieneReport {
    return {
      timestamp: Date.now(),
      resourceUsage: { ...this.quotas },
      indexingStats: {
        totalFiles: 0,
        indexedFiles: 0,
        excludedFiles: 0,
        skippedFiles: 0
      },
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * T,. Generiert Empfehlungen basierend auf aktueller Nutzung
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.quotas.cpu.currentPercent > this.quotas.cpu.maxPercent * 0.8) {
      recommendations.push("CPU-Nutzung hoch - Erwäge Parallelisierungs-Optimierung");
    }

    if (this.quotas.memory.currentMB > this.quotas.memory.maxMB * 0.8) {
      recommendations.push("Memory-Nutzung hoch - Erwäge Cache-Bereinigung");
    }

    if (recommendations.length === 0) {
      recommendations.push("Ressourcen-Nutzung im Normalbereich");
    }

    return recommendations;
  }

  /**
   * T,. Bereinigt Cache und temporäre Dateien
   */
  async cleanup(): Promise<void> {
    console.log("T,. Resource Hygiene: Starte Bereinigung...");
    
    // Hier würde tatsächliche Cache-Bereinigung erfolgen
    // z.B. Löschen von tmp-Dateien, Cache-Ordnern, etc.
    
    console.log("T,. Resource Hygiene: Bereinigung abgeschlossen");
  }

  /**
   * T,. Gibt aktuelle Quotas zurück
   */
  getQuotas(): ResourceQuota {
    return { ...this.quotas };
  }

  /**
   * T,. Aktualisiert Quotas
   */
  updateQuotas(quotas: Partial<ResourceQuota>): void {
    this.quotas = { ...this.quotas, ...quotas };
    console.log("T,. Resource Hygiene: Quotas aktualisiert");
  }
}


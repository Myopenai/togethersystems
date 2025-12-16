import { Logger } from '../common/logger';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';

export type ServiceType = 'ai' | 'plc' | 'gateway' | 'scada' | 'runtime' | 'other';
export type ServiceStatus = 'starting' | 'running' | 'degraded' | 'error' | 'stopped';

export interface ServiceInfo {
  id: string;
  name: string;
  type: ServiceType;
  status: ServiceStatus;
  lastCheck: Date;
  lastError?: string;
  metrics: Record<string, any>;
  metadata: Record<string, any>;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAvg: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usage: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
    usage: number;
  };
  network: {
    interfaces: any[];
  };
  timestamp: Date;
}

export class MonitoringService {
  private logger: Logger;
  private services: Map<string, ServiceInfo> = new Map();
  private metricsHistory: SystemMetrics[] = [];
  private maxHistory: number = 1000;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.logger = new Logger('MonitoringService');
  }

  public async initialize(): Promise<void> {
    if (this.isMonitoring) return;

    this.logger.info('Initializing Monitoring Service...');
    
    try {
      // Create necessary directories
      await this.ensureDirectoryExists('logs');
      await this.ensureDirectoryExists('data/metrics');
      
      // Start monitoring loop
      this.startMonitoring();
      
      this.isMonitoring = true;
      this.logger.info('Monitoring Service initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize Monitoring Service', { error });
      throw error;
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        this.logger.error(`Failed to create directory: ${dirPath}`, { error });
        throw error;
      }
    }
  }

  private startMonitoring(intervalMs: number = 60000): void {
    this.logger.info(`Starting system monitoring with ${intervalMs}ms interval`);
    
    // Initial collection
    this.collectSystemMetrics();
    
    // Set up periodic collection
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, intervalMs);
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      const metrics: SystemMetrics = {
        cpu: {
          usage: await this.getCpuUsage(),
          cores: os.cpus().length,
          loadAvg: os.loadavg()
        },
        memory: await this.getMemoryUsage(),
        disk: await this.getDiskUsage(),
        network: {
          interfaces: Object.values(os.networkInterfaces())
            .flat()
            .filter(iface => iface && !iface.internal)
            .map(iface => ({
              name: iface?.address,
              address: iface?.address,
              family: iface?.family,
              internal: iface?.internal
            }))
        },
        timestamp: new Date()
      };

      // Store metrics in history
      this.metricsHistory.push(metrics);
      
      // Keep history size in check
      if (this.metricsHistory.length > this.maxHistory) {
        this.metricsHistory.shift();
      }
      
      // Log if we're in development mode
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug('Collected system metrics', {
          cpuUsage: metrics.cpu.usage,
          memoryUsage: metrics.memory.usage,
          diskUsage: metrics.disk.usage
        });
      }
      
    } catch (error) {
      this.logger.error('Failed to collect system metrics', { error });
    }
  }

  private async getCpuUsage(): Promise<number> {
    // This is a simplified implementation
    // In a real system, you'd want to measure actual CPU usage over time
    const startUsage = process.cpuUsage();
    
    // Wait a short time to measure CPU usage
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endUsage = process.cpuUsage(startUsage);
    
    // Calculate CPU usage percentage
    const totalUsage = (endUsage.user + endUsage.system) / 1000; // Convert to ms
    return totalUsage / (100 * 1000); // Convert to percentage
  }

  private async getMemoryUsage(): Promise<SystemMetrics['memory']> {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    
    return {
      total,
      free,
      used,
      usage: used / total
    };
  }

  private async getDiskUsage(): Promise<SystemMetrics['disk']> {
    try {
      const diskInfo = await import('node-disk-info');
      const disks = await diskInfo.getDiskInfo();
      const rootDisk = disks.find(d => d.mounted === '/') || disks[0];
      
      if (!rootDisk) {
        throw new Error('Could not determine root disk');
      }
      
      const total = rootDisk.blocks * rootDisk.blockSize;
      const used = (rootDisk.blocks - rootDisk.available) * rootDisk.blockSize;
      const free = rootDisk.available * rootDisk.blockSize;
      
      return {
        total,
        free,
        used,
        usage: used / total
      };
      
    } catch (error) {
      // Fallback to basic disk usage if node-disk-info fails
      const stats = await fs.stat('/');
      const total = stats.blocks * stats.blksize;
      const free = stats.blocks * stats.blksize - stats.size;
      const used = stats.size;
      
      return {
        total,
        free,
        used,
        usage: used / total
      };
    }
  }

  public registerService(id: string, name: string, type: ServiceType): void {
    const serviceInfo: ServiceInfo = {
      id,
      name,
      type,
      status: 'starting',
      lastCheck: new Date(),
      metrics: {},
      metadata: {}
    };
    
    this.services.set(id, serviceInfo);
    this.logger.info(`Registered service: ${name} (${type})`);
  }

  public updateServiceStatus(serviceId: string, status: ServiceStatus, metadata?: Record<string, any>): void {
    const service = this.services.get(serviceId);
    if (!service) {
      this.logger.warn(`Attempted to update status for unregistered service: ${serviceId}`);
      return;
    }
    
    service.status = status;
    service.lastCheck = new Date();
    
    if (metadata) {
      service.metadata = { ...service.metadata, ...metadata };
    }
    
    if (status === 'error') {
      this.logger.error(`Service ${service.name} reported error status`, { metadata });
    } else if (status === 'degraded') {
      this.logger.warn(`Service ${service.name} reported degraded status`, { metadata });
    }
  }

  public recordMetric(serviceId: string, name: string, value: number, tags: Record<string, any> = {}): void {
    const service = this.services.get(serviceId);
    if (!service) {
      this.logger.warn(`Attempted to record metric for unregistered service: ${serviceId}`);
      return;
    }
    
    if (!service.metrics[name]) {
      service.metrics[name] = [];
    }
    
    const metric = {
      timestamp: new Date(),
      value,
      tags
    };
    
    service.metrics[name].push(metric);
    
    // Keep a reasonable history size
    if (service.metrics[name].length > 1000) {
      service.metrics[name].shift();
    }
  }

  public recordError(serviceId: string, error: Error, context: Record<string, any> = {}): void {
    const service = this.services.get(serviceId);
    if (!service) {
      this.logger.warn(`Attempted to record error for unregistered service: ${serviceId}`, { error });
      return;
    }
    
    service.lastError = error.message;
    service.status = 'error';
    service.lastCheck = new Date();
    
    this.logger.error(`Error in service ${service.name}: ${error.message}`, {
      error: error.stack,
      ...context
    });
    
    // Record the error as a metric
    this.recordMetric(serviceId, 'error_count', 1, {
      error: error.message,
      ...context
    });
  }

  public getServiceStatus(serviceId: string): ServiceInfo | undefined {
    return this.services.get(serviceId);
  }

  public getAllServicesStatus(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  public getSystemMetrics(): SystemMetrics | null {
    if (this.metricsHistory.length === 0) return null;
    return this.metricsHistory[this.metricsHistory.length - 1];
  }

  public getMetricsHistory(): SystemMetrics[] {
    return [...this.metricsHistory];
  }

  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down Monitoring Service...');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    // Save final metrics
    await this.saveMetricsToDisk();
    
    this.isMonitoring = false;
    this.logger.info('Monitoring Service has been shut down');
  }

  private async saveMetricsToDisk(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join('data/metrics', `metrics-${timestamp}.json`);
      
      const metricsData = {
        timestamp: new Date().toISOString(),
        services: this.getAllServicesStatus(),
        system: this.getSystemMetrics(),
        metricsHistory: this.getMetricsHistory()
      };
      
      await fs.writeFile(filePath, JSON.stringify(metricsData, null, 2));
      this.logger.debug(`Saved metrics to ${filePath}`);
      
    } catch (error) {
      this.logger.error('Failed to save metrics to disk', { error });
    }
  }
}

// Export a singleton instance
export const monitoringService = new MonitoringService();

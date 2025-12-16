import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as checkDiskSpace from 'check-disk-space';
import { MonitoringConfig, ServiceHealth, DirectoryCheck, HealthStatus } from './types';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
export class SelfHealingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SelfHealingService.name);
  private readonly services: Map<string, ServiceHealth> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private monitoringConfig: MonitoringConfig;
  private lastSystemCheck: Date | null = null;
  
  // Define required directories with detailed configuration
  private requiredDirectories: DirectoryCheck[] = [
    {
      path: path.join(process.cwd(), 'logs'),
      required: true,
      writable: true,
      autoCreate: true,
      permissions: 0o755,
      minFreeSpace: 100 * 1024 * 1024, // 100MB min free space
      description: 'Application logs directory'
    },
    {
      path: path.join(process.cwd(), 'uploads'),
      required: true,
      writable: true,
      autoCreate: true,
      permissions: 0o755,
      minFreeSpace: 500 * 1024 * 1024, // 500MB min free space
      description: 'File uploads directory'
    },
    {
      path: path.join(process.cwd(), 'tmp'),
      required: true,
      writable: true,
      autoCreate: true,
      permissions: 0o777,
      cleanup: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      description: 'Temporary files directory'
    },
    {
      path: path.join(process.cwd(), 'cache'),
      required: false,
      writable: true,
      autoCreate: true,
      permissions: 0o755,
      cleanup: true,
      description: 'Application cache directory'
    }
  ] as DirectoryCheck[];

  constructor(
    private readonly configService: ConfigService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2
  ) {
    this.loadConfiguration();
    this.initializeServices();
    
    // Register global error handlers
    this.registerGlobalHandlers();
  }

  private loadConfiguration() {
    this.monitoringConfig = {
      enabled: this.configService.get<boolean>('MONITORING_ENABLED', true),
      checkInterval: this.configService.get<number>('MONITORING_INTERVAL_MS', 30000),
      requiredDirs: this.requiredDirectories.map(dir => dir.path),
      maxFailuresBeforeAlert: this.configService.get<number>('MAX_FAILURES_BEFORE_ALERT', 3),
      maxAutoRecoveryAttempts: this.configService.get<number>('MAX_RECOVERY_ATTEMPTS', 3),
      memoryThreshold: this.configService.get<number>('MEMORY_THRESHOLD', 0.9),
      cpuThreshold: this.configService.get<number>('CPU_THRESHOLD', 0.9),
      diskThreshold: this.configService.get<number>('DISK_THRESHOLD', 0.8),
      alertChannels: {
        email: this.configService.get<string>('ALERT_EMAILS', '').split(',').filter(Boolean),
        slack: this.configService.get<string>('SLACK_WEBHOOK_URL', '')
      }
    };
    
    this.logger.log(`Monitoring configuration loaded: ${JSON.stringify({
      ...this.monitoringConfig,
      requiredDirs: this.monitoringConfig.requiredDirs.length + ' directories'
    })}`);
  }

  private registerGlobalHandlers() {
    process.on('uncaughtException', (error: Error) => {
      this.logger.error(`Uncaught Exception: ${error.message}`, error.stack);
      this.recordError('process', error);
      // Attempt graceful shutdown
      this.gracefulShutdown(1);
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      this.logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      this.recordError('process', new Error(`Unhandled rejection: ${reason}`));
    });
  }

  onModuleInit() {
    if (this.monitoringConfig.enabled) {
      this.startMonitoring();
    }
  }

  private initializeServices() {
    // Initialize critical services
    const criticalServices = [
      'filesystem',
      'memory',
      'disk',
      'cpu',
      'database',
      ...this.requiredDirectories.map(dir => `dir:${dir.path}`)
    ];

    for (const service of criticalServices) {
      this.services.set(service, {
        status: 'healthy',
        lastCheck: new Date(),
        errorCount: 0,
        recoveryAttempts: 0,
        details: {}
      });
    }
  }

  private startMonitoring() {
    const interval = this.monitoringConfig.checkInterval;
    this.logger.log(`Starting monitoring with ${interval}ms interval`);
    
    // Initial check
    this.performHealthChecks();
    
    // Schedule periodic checks
    this.monitoringInterval = setInterval(
      () => this.performHealthChecks(),
      interval
    );
  }

  private async performHealthChecks() {
    const startTime = Date.now();
    this.logger.debug('Starting health checks...');
    
    try {
      // Check and fix directories first
      await this.checkAndFixDirectories();
      
      // Check system resources in parallel
      await Promise.all([
        this.checkSystemResources(),
        this.checkDiskSpace(),
        this.checkMemoryUsage(),
        this.checkCpuUsage()
      ]);
      
      this.lastSystemCheck = new Date();
      this.logger.debug(`Health checks completed in ${Date.now() - startTime}ms`);
      
      // Emit health check completed event
      this.eventEmitter.emit('health.check.completed', {
        timestamp: new Date(),
        duration: Date.now() - startTime,
        services: Array.from(this.services.entries()).map(([name, health]) => ({
          name,
          status: health.status,
          lastCheck: health.lastCheck
        }))
      });
      
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Health check failed: ${err.message}`, err.stack);
      this.recordError('health_check', err);
      
      // Emit health check failed event
      this.eventEmitter.emit('health.check.failed', {
        timestamp: new Date(),
        error: {
          message: err.message,
          stack: err.stack,
          name: err.name
        }
      });
    }
  }
  }

  private async ensureDirectoryExists(dir: DirectoryCheck): Promise<void> {
    try {
      // Check if directory exists
      const exists = await fs.pathExists(dir.path);
      
      if (!exists && dir.required) {
        if (dir.autoCreate) {
          this.logger.log(`Creating directory: ${dir.path}`);
          await fs.ensureDir(dir.path, { mode: dir.permissions });
          this.logger.log(`Created directory: ${dir.path}`);
        } else {
          throw new Error(`Required directory does not exist: ${dir.path}`);
        }
      }
      
      // Verify directory permissions
      if (dir.writable) {
        try {
          await fs.access(dir.path, fs.constants.W_OK);
        } catch (error) {
          throw new Error(`Directory not writable: ${dir.path}. ${error.message}`);
        }
      }
      
      // Check available disk space if specified
      if (dir.minFreeSpace) {
        const diskSpace = await checkDiskSpace(dir.path);
        const freeSpaceMB = Math.floor(diskSpace.free / (1024 * 1024));
        const minSpaceMB = Math.floor(dir.minFreeSpace / (1024 * 1024));
        
        if (diskSpace.free < dir.minFreeSpace) {
          throw new Error(`Insufficient disk space in ${dir.path}: ${freeSpaceMB}MB free, minimum ${minSpaceMB}MB required`);
        }
      }
      
      // Cleanup old files if configured
      if (dir.cleanup && dir.maxAge) {
        await this.cleanupOldFiles(dir.path, dir.maxAge);
      }
      
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to ensure directory ${dir.path}: ${err.message}`, err.stack);
      throw err;
    }
  }

  private async cleanupOldFiles(directory: string, maxAgeMs: number): Promise<void> {
    try {
      const now = Date.now();
      const files = await fs.readdir(directory);
      
      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAgeMs) {
          await fs.remove(filePath);
          this.logger.debug(`Cleaned up old file: ${filePath}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to clean up old files in ${directory}: ${error.message}`);
    }
  }

  async checkAndFixDirectories() {
    const results = await Promise.allSettled(
      this.requiredDirectories.map(async (dir) => {
        const serviceName = `dir:${dir.path}`;
        try {
          await this.ensureDirectoryExists(dir);
          this.recordSuccess(serviceName);
          return { serviceName, success: true };
        } catch (error) {
          const err = error as Error;
          this.recordError(serviceName, err);
          return { serviceName, success: false, error: err };
        }
      })
    );
    
    // Check if any directory checks failed
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
    
    if (failed.length > 0) {
      const errorMessages = failed
        .map(r => r.status === 'rejected' ? r.reason : r.value.error)
        .map(e => e?.message || 'Unknown error')
        .join('; ');
        
      throw new Error(`Directory checks failed: ${errorMessages}`);
    }
  }
        if (dir.required) {
          throw err;
        }
      }
    }
  }

  async checkSystemResources() {
    try {
      await this.checkMemoryUsage();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.recordError('memory', err);
    }

    try {
      await this.checkDiskSpace();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.recordError('disk', err);
    }

    try {
      await this.checkCpuUsage();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.recordError('cpu', err);
    }
  }
  }

  private async ensureDirectoryExists(dir: DirectoryCheck): Promise<boolean> {
    const { path: dirPath, writable = true, autoCreate = true, permissions = 0o755 } = dir;
    
    try {
      // Check if directory exists
      await fs.promises.access(dirPath, fs.constants.F_OK);
      
      // Check if it's actually a directory
      const stats = await fs.promises.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${dirPath}`);
      }
      
      // Check write permissions if needed
      if (writable) {
        try {
          await fs.promises.access(dirPath, fs.constants.W_OK);
        } catch (err) {
          throw new Error(`Directory exists but is not writable: ${dirPath}`);
        }
      }
      
      this.logger.debug(`Directory verified: ${dirPath}`);
      return true;
      
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      
      // If directory doesn't exist and auto-create is enabled, try to create it
      if (err.code === 'ENOENT' && autoCreate) {
        this.logger.warn(`Directory not found: ${dirPath}, attempting to create...`);
        try {
          await fs.promises.mkdir(dirPath, { recursive: true, mode: permissions });
          this.logger.log(`Created directory: ${dirPath}`);
          return true;
        } catch (createError) {
          const createErr = createError as NodeJS.ErrnoException;
          throw new Error(`Failed to create directory ${dirPath}: ${createErr.message}`);
        }
      }
      
      // If we get here, either auto-create is disabled or another error occurred
      throw new Error(`Directory check failed for ${dirPath}: ${err.message}`);
    }
  }

  private async checkMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = usedMem / totalMem;
    const details = { 
      used: this.formatBytes(usedMem),
      total: this.formatBytes(totalMem),
      free: this.formatBytes(freeMem),
      usage: memoryUsage
    };
    
    if (memoryUsage > this.monitoringConfig.memoryThreshold) {
      throw new Error(`High memory usage: ${(memoryUsage * 100).toFixed(2)}%`, { cause: details });
    }
    
    this.recordSuccess('memory', details);
  }
  
  private async checkDiskSpace() {
    try {
      const diskSpace = await checkDiskSpace(process.cwd());
      const used = diskSpace.size - diskSpace.free;
      const diskUsage = used / diskSpace.size;
      
      if (diskUsage > this.monitoringConfig.diskThreshold) {
        const error = new Error(`High disk usage: ${(diskUsage * 100).toFixed(2)}%`);
        (error as any).details = {
          path: diskSpace.diskPath || process.cwd(),
          used: this.formatBytes(used),
          total: this.formatBytes(diskSpace.size),
          free: this.formatBytes(diskSpace.free),
          usage: diskUsage
        };
        throw error;
      }
      
      this.recordSuccess('disk', { 
        path: diskSpace.diskPath || process.cwd(),
        used: this.formatBytes(used),
        total: this.formatBytes(diskSpace.size),
        free: this.formatBytes(diskSpace.free),
        usage: diskUsage
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Disk space check failed: ${err.message}`);
      throw err;
    }
  }

  private async checkCpuUsage(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const startCpu = process.cpuUsage();

      // Sample CPU usage over 1 second
      setTimeout(() => {
        const endCpu = process.cpuUsage(startCpu);
        const cpuUsage = (endCpu.user + endCpu.system) / 1000000; // Convert to ms
        const details = {
          user: endCpu.user / 1000,
          system: endCpu.system / 1000,
          total: cpuUsage
        };

        if (cpuUsage > this.monitoringConfig.cpuThreshold * 1000) {
          const error = new Error(`High CPU usage: ${cpuUsage.toFixed(2)}ms`);
          (error as any).details = details;
          reject(error);
        } else {
          this.recordSuccess('cpu', details);
          resolve();
        }
      }, 1000);
    });
  }

  private recordSuccess(service: string, details: Record<string, any> = {}) {
    const serviceHealth = this.services.get(service);
    if (!serviceHealth) return;

    serviceHealth.status = 'healthy' as HealthStatus;
    serviceHealth.lastCheck = new Date();
    serviceHealth.lastError = undefined;
    serviceHealth.errorCount = 0;
    serviceHealth.details = details;

    this.logger.debug(`Service ${service} is healthy: ${JSON.stringify(details)}`);
  }

  private recordError(serviceName: string, error: Error) {
    const serviceHealth = this.services.get(serviceName);
    if (!serviceHealth) return;

    serviceHealth.errorCount++;
    serviceHealth.lastError = error;
    serviceHealth.lastCheck = new Date();

    if (serviceHealth.errorCount >= this.monitoringConfig.maxFailuresBeforeAlert) {
      serviceHealth.status = 'critical' as HealthStatus;
      this.triggerAlerts(serviceName, error);
    } else {
      serviceHealth.status = 'degraded' as HealthStatus;
    }

    this.logger.error(`Service ${serviceName} error: ${error.message}`, error.stack);
  }

  private triggerAlerts(serviceName: string, error: Error) {
    const serviceHealth = this.services.get(serviceName);
    if (!serviceHealth) return;

    const message = `[${serviceName.toUpperCase()}] Service is in ${serviceHealth.status} state\n` +
                   `Error: ${error.message}\n` +
                   `Error count: ${serviceHealth.errorCount}\n` +
                   `Last check: ${serviceHealth.lastCheck.toISOString()}`;

    // Send alerts via configured channels
    this.sendEmailAlert(serviceName, message);
    this.sendSlackAlert(serviceName, message);
  }

  private sendEmailAlert(serviceName: string, message: string) {
    const emails = this.monitoringConfig.alertChannels.email;
    if (!emails?.length) return;

    this.logger.log(`Sending email alert for ${serviceName} to ${emails.join(', ')}`);
    // Implement email sending logic here
  }

  private sendSlackAlert(serviceName: string, message: string) {
    const webhookUrl = this.monitoringConfig.alertChannels.slackWebhook;
    if (!webhookUrl) return;

    this.logger.log(`Sending Slack alert for ${serviceName}`);
    // Implement Slack webhook logic here
  }

  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async getServiceHealth(serviceName: string): Promise<ServiceHealth | undefined> {
    return this.services.get(serviceName);
  }

  async getAllServicesHealth(): Promise<Record<string, ServiceHealth>> {
    return Object.fromEntries(this.services.entries());
  }

  async onModuleDestroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  private startMonitoring() {
    const interval = this.monitoringConfig.checkInterval;
    this.logger.log(`Starting monitoring with ${interval}ms interval`);
    
    // Initial check
    this.performHealthChecks();
    
    // Schedule periodic checks
    this.monitoringInterval = setInterval(
      () => this.performHealthChecks(),
      interval
    );
  }
  }

}

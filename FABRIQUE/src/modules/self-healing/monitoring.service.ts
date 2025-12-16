import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SelfHealingService } from './self-healing.service';
import * as os from 'os';
import * as path from 'path';
import * as checkDiskSpace from 'check-disk-space';
import * as nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import * as fs from 'fs-extra';
import { HealthCheckResult } from '@nestjs/terminus';

export type ServiceStatus = 'healthy' | 'degraded' | 'critical' | 'recovering' | 'unknown';

export interface ServiceHealth {
  status: ServiceStatus;
  lastCheck: Date;
  lastError?: Error;
  errorCount: number;
  recoveryAttempts: number;
  lastRecovery?: Date;
  uptime?: number;
  metrics?: Record<string, any>;
}

export interface AlertChannel {
  email?: string[];
  slack?: string;
  webhook?: string;
  pagerDuty?: string;
  opsGenie?: string;
}

export interface Alert {
  id: string;
  service: string;
  status: ServiceStatus;
  message: string;
  timestamp: Date;
  resolved?: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface SystemMetrics {
  memory: {
    total: number;
    free: number;
    used: number;
    usage: number;
  };
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  disk: {
    total: number;
    free: number;
    used: number;
    usage: number;
  };
  uptime: number;
  timestamp: Date;
}

@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly services: Map<string, ServiceHealth> = new Map();
  private monitoringInterval: NodeJS.Timeout;
  private activeAlerts: Map<string, Alert> = new Map();
  private metricsHistory: SystemMetrics[] = [];
  private readonly METRICS_HISTORY_LIMIT = 100;
  
  private config: {
    checkInterval: number;
    maxFailuresBeforeAlert: number;
    maxAutoRecoveryAttempts: number;
    criticalServices: string[];
    memoryThreshold: number;
    diskThreshold: number;
    cpuThreshold: number;
    alertChannels: AlertChannel;
    emailConfig: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
      from: string;
    };
    metrics: {
      enabled: boolean;
      retentionDays: number;
      interval: number;
    };
  };

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    private readonly selfHealingService: SelfHealingService
  ) {
    this.loadConfiguration();
    this.initializeEventListeners();
  }

  private loadConfiguration() {
    this.config = {
      checkInterval: this.configService.get<number>('MONITORING_INTERVAL_MS', 30000),
      maxFailuresBeforeAlert: this.configService.get<number>('MAX_FAILURES_BEFORE_ALERT', 3),
      maxAutoRecoveryAttempts: this.configService.get<number>('MAX_RECOVERY_ATTEMPTS', 3),
      criticalServices: this.configService.get<string>('CRITICAL_SERVICES', 'database,filesystem,api,memory,disk')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      
      // Thresholds with environment variable overrides
      memoryThreshold: this.configService.get<number>('MEMORY_THRESHOLD', 0.9),
      diskThreshold: this.configService.get<number>('DISK_THRESHOLD', 0.8),
      cpuThreshold: this.configService.get<number>('CPU_THRESHOLD', 0.9),
      
      // Alerting configuration
      alertChannels: {
        email: this.configService.get<string>('ALERT_EMAILS', '').split(',').filter(Boolean),
        slack: this.configService.get<string>('SLACK_WEBHOOK_URL', ''),
        webhook: this.configService.get<string>('ALERT_WEBHOOK_URL', ''),
        pagerDuty: this.configService.get<string>('PAGERDUTY_INTEGRATION_KEY', ''),
        opsGenie: this.configService.get<string>('OPSGENIE_API_KEY', '')
      },
      
      // Email configuration
      emailConfig: {
        host: this.configService.get<string>('SMTP_HOST', 'localhost'),
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: this.configService.get<string>('SMTP_USER', ''),
          pass: this.configService.get<string>('SMTP_PASSWORD', '')
        },
        from: this.configService.get<string>('ALERT_FROM_EMAIL', 'noreply@fabrique.local')
      },
      
      // Metrics configuration
      metrics: {
        enabled: this.configService.get<boolean>('METRICS_ENABLED', true),
        retentionDays: this.configService.get<number>('METRICS_RETENTION_DAYS', 30),
        interval: this.configService.get<number>('METRICS_INTERVAL_MS', 60000)
      }
    };
    
    this.logger.log('Monitoring service configuration loaded');
  }
  
  private initializeEventListeners() {
    // Listen for health check events
    this.eventEmitter.on('health.check.completed', (data) => {
      this.logger.debug(`Health check completed in ${data.duration}ms`);
      this.updateServiceStatuses(data.services);
    });
    
    this.eventEmitter.on('health.check.failed', (error) => {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
      this.recordError('health_check', error);
    });
    
    // Listen for system resource events
    this.eventEmitter.on('system.resources.low', (data) => {
      this.handleResourceAlert('system_resources', 'degraded', 
        `Low system resources detected: ${JSON.stringify(data)}`);
    });
  }

  constructor(private readonly selfHealingService: SelfHealingService) {
    // Initialize critical services
    this.config.criticalServices.forEach(service => {
      this.services.set(service, {
        status: 'healthy',
        lastCheck: new Date(),
        errorCount: 0,
        recoveryAttempts: 0,
      });
    });
  }

  async onModuleInit() {
    await this.initialize();
  }

  async initialize() {
    this.logger.log('Initializing monitoring service');
    
    // Start monitoring interval
    this.monitoringInterval = setInterval(
      () => this.checkServices(),
      this.config.checkInterval
    );
    
    // Initial check
    await this.checkServices();
  }

  async checkServices() {
    const startTime = Date.now();
    this.logger.debug('Running comprehensive health checks...');
    
    try {
      // 1. Check system resources first
      const systemMetrics = await this.collectSystemMetrics();
      this.metricsHistory.push(systemMetrics);
      
      // Trim history if needed
      if (this.metricsHistory.length > this.METRICS_HISTORY_LIMIT) {
        this.metricsHistory.shift();
      }
      
      // Check resource thresholds
      await this.checkResourceThresholds(systemMetrics);
      
      // 2. Check directory health
      try {
        await this.selfHealingService.checkAndFixDirectories();
        this.recordSuccess('filesystem');
      } catch (error) {
        this.recordError('filesystem', error);
      }
      
      // 3. Check external services
      await this.checkExternalServices();
      
      this.logger.debug(`Health checks completed in ${Date.now() - startTime}ms`);
      
    } catch (error) {
      this.logger.error(`Error during health checks: ${error.message}`, error.stack);
      this.recordError('health_check', error);
    }
    
    // 2. Check memory usage
    try {
      await this.checkMemoryUsage();
    } catch (error) {
      this.recordError('memory', error);
    }
    
    // 3. Check disk space
    try {
      await this.checkDiskSpace();
    } catch (error) {
      this.recordError('disk', error);
    }
    
    // 4. Check CPU usage (sampled over 1 second)
    try {
      await this.checkCpuUsage();
    } catch (error) {
      this.recordError('cpu', error);
    }
    
    // 5. Check database connection
    try {
      await this.checkDatabaseConnection();
    } catch (error) {
      this.recordError('database', error);
    }
    
    // 6. Check external API dependencies
    try {
      await this.checkExternalServices();
    } catch (error) {
      this.recordError('external_services', error);
    }
  }
  
  private async checkMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = usedMem / totalMem;
    
    if (memoryUsage > this.config.memoryThreshold) {
      throw new Error(`High memory usage: ${(memoryUsage * 100).toFixed(2)}%`);
    }
    
    this.recordSuccess('memory', { used: usedMem, total: totalMem, percentage: memoryUsage });
  }
  
  private async checkDiskSpace() {
    try {
      const diskSpace = await checkDiskSpace(process.cwd());
      const used = diskSpace.size - diskSpace.free;
      const diskUsage = used / diskSpace.size;
      
      if (diskUsage > this.config.diskThreshold) {
        throw new Error(`High disk usage: ${(diskUsage * 100).toFixed(2)}%`);
      }
      
      this.recordSuccess('disk', { 
        path: diskSpace.diskPath || process.cwd(),
        used: this.formatBytes(used), 
        total: this.formatBytes(diskSpace.size), 
        available: this.formatBytes(diskSpace.free),
        percentage: diskUsage 
      });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown disk space check error';
      this.logger.error(`Disk space check failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }
  
  private async checkCpuUsage() {
    return new Promise<void>((resolve, reject) => {
      const startCpu = process.cpuUsage();
      
      // Sample CPU usage over 1 second
      setTimeout(() => {
        const endCpu = process.cpuUsage(startCpu);
        const cpuUsage = (endCpu.user + endCpu.system) / 1000000; // Convert to ms
        
        if (cpuUsage > this.config.cpuThreshold * 1000) { // Convert threshold to ms
          reject(new Error(`High CPU usage: ${cpuUsage.toFixed(2)}ms`));
        } else {
          this.recordSuccess('cpu', { usage: cpuUsage });
          resolve();
        }
      }, 1000);
    });
  }
  
  private async checkDatabaseConnection() {
    // Implement database connection check
    // This is a placeholder - replace with actual database check
    const isConnected = true; // Replace with actual check
    
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    this.recordSuccess('database');
  }
  
  private async checkExternalServices() {
    // Example: Check external API dependencies
    const services = [
      { name: 'auth_service', url: process.env.AUTH_SERVICE_URL },
      { name: 'payment_service', url: process.env.PAYMENT_SERVICE_URL },
    ];
    
    for (const service of services) {
      if (!service.url) continue;
      
      try {
        const response = await fetch(service.url, { method: 'HEAD', timeout: 5000 });
        if (!response.ok) {
          throw new Error(`Service ${service.name} returned ${response.status}`);
        }
        this.recordSuccess(service.name);
      } catch (error) {
        this.recordError(service.name, error);
      }
    }
  }

  // Add this helper method to format bytes
  private formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  recordError(service: string, error: any, metadata: Record<string, any> = {}) {
    const serviceHealth = this.services.get(service) || {
      status: 'healthy' as ServiceStatus,
      lastCheck: new Date(),
      errorCount: 0,
      recoveryAttempts: 0,
    };
    
    serviceHealth.status = 'degraded';
    serviceHealth.lastError = error;
    serviceHealth.errorCount++;
    serviceHealth.lastCheck = new Date();
    
    this.services.set(service, serviceHealth);
    
    this.logger.error(`Service ${service} error: ${error.message}`, error.stack);
    
    // Check if we need to alert
    if (serviceHealth.errorCount >= this.config.maxFailuresBeforeAlert) {
      this.alert(service, error);
    }
    
    // Attempt auto-recovery for critical services
    if (this.config.criticalServices.includes(service)) {
      this.attemptRecovery(service);
    }
    
    return serviceHealth;
  }

  recordSuccess(service: string) {
    const serviceHealth = this.services.get(service) || {
      status: 'healthy' as ServiceStatus,
      lastCheck: new Date(),
      errorCount: 0,
      recoveryAttempts: 0,
    };
    
    if (serviceHealth.status !== 'healthy') {
      this.logger.log(`Service ${service} recovered`);
    }
    
    serviceHealth.status = 'healthy';
    serviceHealth.errorCount = 0;
    serviceHealth.recoveryAttempts = 0;
    serviceHealth.lastCheck = new Date();
    
    this.services.set(service, serviceHealth);
    return serviceHealth;
  }

  getServiceStatus(service: string): ServiceStatus {
    return this.services.get(service)?.status || 'healthy';
  }

  getAllStatuses() {
    return Object.fromEntries(this.services.entries());
  }

  private async attemptRecovery(service: string) {
    const serviceHealth = this.services.get(service);
    if (!serviceHealth) return;
    
    if (serviceHealth.recoveryAttempts >= this.config.maxAutoRecoveryAttempts) {
      this.logger.error(`Max recovery attempts reached for ${service}, escalating to admin`);
      serviceHealth.status = 'critical';
      this.alert(service, new Error('Max recovery attempts reached'));
      return;
    }
    
    serviceHealth.status = 'recovering';
    serviceHealth.recoveryAttempts++;
    this.services.set(service, serviceHealth);
    
    this.logger.log(`Attempting to recover ${service} (attempt ${serviceHealth.recoveryAttempts})`);
    
    try {
      // Add recovery logic here based on the service
      if (service === 'filesystem') {
        await this.selfHealingService.checkAndFixDirectories();
      }
      
      // If we get here, recovery was successful
      this.recordSuccess(service);
    } catch (error) {
      this.logger.error(`Recovery attempt ${serviceHealth.recoveryAttempts} failed for ${service}: ${error.message}`);
      this.recordError(service, error);
    }
  }

  private alert(service: string, error: Error) {
    const serviceHealth = this.services.get(service);
    if (!serviceHealth) return;
    
    const message = `ALERT: Service ${service} is ${serviceHealth.status}\n` +
                   `Error: ${error.message}\n` +
                   `Error count: ${serviceHealth.errorCount}\n` +
                   `Last check: ${serviceHealth.lastCheck}`;
    
    this.logger.error(message);
    
    // Send alerts via configured channels
    if (this.config.alertChannels.email) {
      this.sendEmailAlert(service, message);
    }
    
    if (this.config.alertChannels.slack) {
      this.sendSlackAlert(service, message);
    }
  }

  private async sendEmailAlert(service: string, message: string) {
    if (!this.config.alertChannels.email?.length) return;
    
    const transporter = nodemailer.createTransport({
      host: this.config.emailConfig.host,
      port: this.config.emailConfig.port,
      secure: this.config.emailConfig.secure,
      auth: this.config.emailConfig.auth,
    });
    
    const mailOptions = {
      from: this.config.emailConfig.from,
      to: this.config.alertChannels.email.join(','),
      subject: `[ALERT] ${service} Service Issue`,
      text: message,
      html: `
        <h2>Service Alert: ${service}</h2>
        <pre>${message}</pre>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    };
    
    try {
      await transporter.sendMail(mailOptions);
      this.logger.log(`Email alert sent for ${service}`);
    } catch (error) {
      this.logger.error(`Failed to send email alert: ${error.message}`, error.stack);
    }
  }

  private async sendSlackAlert(service: string, message: string) {
    if (!this.config.alertChannels.slack) return;
    
    try {
      await fetch(this.config.alertChannels.slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *${service.toUpperCase()} ALERT*\n${message}`,
          username: 'System Monitor',
          icon_emoji: ':warning:',
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Service', value: service, short: true },
              { title: 'Status', value: 'CRITICAL', short: true },
              { title: 'Message', value: message },
              { title: 'Time', value: new Date().toISOString() },
            ],
          }],
        }),
      });
      
      this.logger.log(`Slack alert sent for ${service}`);
    } catch (error) {
      this.logger.error(`Failed to send Slack alert: ${error.message}`, error.stack);
    }
  }

  recordRecovery(service: string) {
    const serviceHealth = this.services.get(service);
    if (serviceHealth) {
      serviceHealth.status = 'healthy';
      serviceHealth.errorCount = 0;
      serviceHealth.recoveryAttempts = 0;
      serviceHealth.lastCheck = new Date();
      this.services.set(service, serviceHealth);
    }
    return this.getServiceStatus(service);
  }

  getStatus() {
    const status: Record<string, any> = {
      status: 'healthy',
      services: {},
      timestamp: new Date().toISOString(),
    };

    let allHealthy = true;
    
    for (const [service, health] of this.services.entries()) {
      status.services[service] = {
        status: health.status,
        lastCheck: health.lastCheck.toISOString(),
        errorCount: health.errorCount,
        lastError: health.lastError?.message,
      };
      
      if (health.status !== 'healthy') {
        allHealthy = false;
        if (status.status === 'healthy') {
          status.status = health.status;
        }
      }
    }
    
    if (!allHealthy && status.status === 'healthy') {
      status.status = 'degraded';
    }
    
    return status;
  }

  onModuleDestroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}

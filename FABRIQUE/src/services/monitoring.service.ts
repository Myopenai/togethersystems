import { Logger } from '../common/logger';
import { healthCheckService } from './health.service';
import { selfHealingService } from './selfHealing.service';

type MonitoringConfig = {
  checkInterval: number; // in milliseconds
  maxFailuresBeforeAlert: number;
  maxAutoRecoveryAttempts: number;
  criticalServices: string[];
};

type ServiceStatus = 'healthy' | 'degraded' | 'critical' | 'recovering';

export class MonitoringService {
  private static instance: MonitoringService;
  private logger = new Logger('MonitoringService');
  private status: Record<string, {
    status: ServiceStatus;
    lastCheck: Date;
    failures: number;
    lastError?: Error;
  }> = {};

  private config: MonitoringConfig = {
    checkInterval: 60000, // 1 minute
    maxFailuresBeforeAlert: 3,
    maxAutoRecoveryAttempts: 3,
    criticalServices: ['database', 'filesystem', 'api'],
  };

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing monitoring service');
    await this.initializeServiceStatus();
    this.startMonitoring();
  }

  private async initializeServiceStatus(): Promise<void> {
    // Initialize status for all critical services
    this.config.criticalServices.forEach(service => {
      this.status[service] = {
        status: 'healthy',
        lastCheck: new Date(),
        failures: 0,
      };
    });
  }

  private startMonitoring(): void {
    // Initial check
    this.performHealthChecks();

    // Schedule periodic checks
    setInterval(
      () => this.performHealthChecks(),
      this.config.checkInterval
    );

    this.logger.info(`Monitoring service started with ${this.config.checkInterval}ms interval`);
  }

  private async performHealthChecks(): Promise<void> {
    try {
      const health = await healthCheckService.check();
      
      // Check each critical service
      for (const [service, details] of Object.entries(health.details)) {
        if (!this.status[service]) {
          this.status[service] = {
            status: 'healthy',
            lastCheck: new Date(),
            failures: 0,
          };
        }

        const serviceStatus = this.status[service];
        serviceStatus.lastCheck = new Date();

        if (details.status === 'ok') {
          if (serviceStatus.status !== 'healthy') {
            this.logger.info(`Service recovered: ${service}`);
            serviceStatus.status = 'healthy';
            serviceStatus.failures = 0;
            serviceStatus.lastError = undefined;
          }
          continue;
        }

        // Service is not healthy
        serviceStatus.failures++;
        serviceStatus.lastError = new Error(JSON.stringify(details));

        // Check if we need to trigger recovery
        if (serviceStatus.failures >= this.config.maxFailuresBeforeAlert) {
          if (serviceStatus.status !== 'critical') {
            serviceStatus.status = 'critical';
            this.logger.error(`Service critical: ${service}`, { 
              failures: serviceStatus.failures,
              error: serviceStatus.lastError 
            });
            
            // Trigger self-healing
            this.triggerSelfHealing(service);
          }
        } else if (serviceStatus.status !== 'recovering') {
          serviceStatus.status = 'degraded';
          this.logger.warn(`Service degraded: ${service}`, { 
            failures: serviceStatus.failures,
            error: serviceStatus.lastError 
          });
        }
      }
    } catch (error) {
      this.logger.error('Failed to perform health checks', { error });
    }
  }

  private async triggerSelfHealing(service: string): Promise<void> {
    const serviceStatus = this.status[service];
    
    if (serviceStatus.status === 'recovering') {
      this.logger.debug(`Recovery already in progress for: ${service}`);
      return;
    }

    this.logger.info(`Initiating self-healing for service: ${service}`);
    serviceStatus.status = 'recovering';

    try {
      // Attempt to recover the service
      await this.attemptServiceRecovery(service);
      
      // Verify recovery
      const health = await healthCheckService.check();
      if (health.details[service]?.status === 'ok') {
        this.logger.info(`Successfully recovered service: ${service}`);
        serviceStatus.status = 'healthy';
        serviceStatus.failures = 0;
        serviceStatus.lastError = undefined;
      } else {
        throw new Error('Recovery verification failed');
      }
    } catch (error) {
      serviceStatus.status = 'critical';
      this.logger.error(`Failed to recover service: ${service}`, { error });
      
      // If we've exceeded max recovery attempts, escalate
      if (serviceStatus.failures >= this.config.maxAutoRecoveryAttempts) {
        this.escalateToHuman(service, error);
      }
    }
  }

  private async attemptServiceRecovery(service: string): Promise<void> {
    this.logger.info(`Attempting to recover service: ${service}`);
    
    switch (service) {
      case 'database':
        await this.recoverDatabase();
        break;
      case 'filesystem':
        await selfHealingService.checkAndFixDirectories();
        break;
      case 'api':
        await this.restartApiService();
        break;
      default:
        this.logger.warn(`No specific recovery strategy for service: ${service}`);
    }
  }

  private async recoverDatabase(): Promise<void> {
    this.logger.info('Attempting database recovery');
    // Implement database-specific recovery logic
    // e.g., reconnect, reset connection pool, run migrations
  }

  private async restartApiService(): Promise<void> {
    this.logger.info('Attempting API service restart');
    // Implement service restart logic
    // e.g., using PM2, Docker, or Kubernetes API
  }

  private escalateToHuman(service: string, error: Error): void {
    this.logger.error(`Escalating to human operator for service: ${service}`, { error });
    
    // Implement alerting to human operators
    // e.g., send email, SMS, or trigger incident management system
    
    // For now, just log the escalation
    console.error(`\n=== HUMAN ATTENTION REQUIRED ===`);
    console.error(`Service: ${service} has failed multiple recovery attempts`);
    console.error(`Error: ${error.message}`);
    console.error(`Last check: ${new Date().toISOString()}`);
    console.error(`Please investigate and take appropriate action.\n`);
  }

  public getServiceStatus(service: string): ServiceStatus | undefined {
    return this.status[service]?.status;
  }

  public getAllStatuses(): Record<string, ServiceStatus> {
    const result: Record<string, ServiceStatus> = {};
    Object.entries(this.status).forEach(([service, status]) => {
      result[service] = status.status;
    });
    return result;
  }
}

export const monitoringService = MonitoringService.getInstance();

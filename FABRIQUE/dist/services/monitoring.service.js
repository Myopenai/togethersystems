"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringService = exports.MonitoringService = void 0;
const logger_1 = require("../common/logger");
const health_service_1 = require("./health.service");
const selfHealing_service_1 = require("./selfHealing.service");
class MonitoringService {
    static instance;
    logger = new logger_1.Logger('MonitoringService');
    status = {};
    config = {
        checkInterval: 60000, // 1 minute
        maxFailuresBeforeAlert: 3,
        maxAutoRecoveryAttempts: 3,
        criticalServices: ['database', 'filesystem', 'api'],
    };
    constructor() { }
    static getInstance() {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }
    async initialize() {
        this.logger.info('Initializing monitoring service');
        await this.initializeServiceStatus();
        this.startMonitoring();
    }
    async initializeServiceStatus() {
        // Initialize status for all critical services
        this.config.criticalServices.forEach(service => {
            this.status[service] = {
                status: 'healthy',
                lastCheck: new Date(),
                failures: 0,
            };
        });
    }
    startMonitoring() {
        // Initial check
        this.performHealthChecks();
        // Schedule periodic checks
        setInterval(() => this.performHealthChecks(), this.config.checkInterval);
        this.logger.info(`Monitoring service started with ${this.config.checkInterval}ms interval`);
    }
    async performHealthChecks() {
        try {
            const health = await health_service_1.healthCheckService.check();
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
                }
                else if (serviceStatus.status !== 'recovering') {
                    serviceStatus.status = 'degraded';
                    this.logger.warn(`Service degraded: ${service}`, {
                        failures: serviceStatus.failures,
                        error: serviceStatus.lastError
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to perform health checks', { error });
        }
    }
    async triggerSelfHealing(service) {
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
            const health = await health_service_1.healthCheckService.check();
            if (health.details[service]?.status === 'ok') {
                this.logger.info(`Successfully recovered service: ${service}`);
                serviceStatus.status = 'healthy';
                serviceStatus.failures = 0;
                serviceStatus.lastError = undefined;
            }
            else {
                throw new Error('Recovery verification failed');
            }
        }
        catch (error) {
            serviceStatus.status = 'critical';
            this.logger.error(`Failed to recover service: ${service}`, { error });
            // If we've exceeded max recovery attempts, escalate
            if (serviceStatus.failures >= this.config.maxAutoRecoveryAttempts) {
                this.escalateToHuman(service, error);
            }
        }
    }
    async attemptServiceRecovery(service) {
        this.logger.info(`Attempting to recover service: ${service}`);
        switch (service) {
            case 'database':
                await this.recoverDatabase();
                break;
            case 'filesystem':
                await selfHealing_service_1.selfHealingService.checkAndFixDirectories();
                break;
            case 'api':
                await this.restartApiService();
                break;
            default:
                this.logger.warn(`No specific recovery strategy for service: ${service}`);
        }
    }
    async recoverDatabase() {
        this.logger.info('Attempting database recovery');
        // Implement database-specific recovery logic
        // e.g., reconnect, reset connection pool, run migrations
    }
    async restartApiService() {
        this.logger.info('Attempting API service restart');
        // Implement service restart logic
        // e.g., using PM2, Docker, or Kubernetes API
    }
    escalateToHuman(service, error) {
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
    getServiceStatus(service) {
        return this.status[service]?.status;
    }
    getAllStatuses() {
        const result = {};
        Object.entries(this.status).forEach(([service, status]) => {
            result[service] = status.status;
        });
        return result;
    }
}
exports.MonitoringService = MonitoringService;
exports.monitoringService = MonitoringService.getInstance();
//# sourceMappingURL=monitoring.service.js.map
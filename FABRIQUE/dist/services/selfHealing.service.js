"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selfHealingService = exports.SelfHealingService = void 0;
const logger_1 = require("../common/logger");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const logger = new logger_1.Logger('SelfHealingService');
class SelfHealingService {
    static instance;
    requiredDirectories = [
        { path: 'logs', required: true, writable: true, autoCreate: true, permissions: 0o755 },
        { path: 'uploads', required: true, writable: true, autoCreate: true, permissions: 0o755 },
        { path: 'tmp', required: true, writable: true, autoCreate: true, permissions: 0o777 },
        { path: 'config', required: true, writable: false, autoCreate: false },
    ];
    requiredEndpoints = [
        { name: 'Health Check', url: '/health', method: 'GET', expectedStatus: 200, timeout: 5000 },
        { name: 'API Status', url: '/api/status', method: 'GET', expectedStatus: 200, timeout: 5000 },
    ];
    constructor() { }
    static getInstance() {
        if (!SelfHealingService.instance) {
            SelfHealingService.instance = new SelfHealingService();
        }
        return SelfHealingService.instance;
    }
    async initialize() {
        logger.info('Initializing self-healing service');
        await this.checkAndFixDirectories();
        await this.checkAndFixEndpoints();
        this.setupPeriodicChecks();
    }
    async checkAndFixDirectories() {
        for (const dir of this.requiredDirectories) {
            try {
                await this.verifyDirectory(dir);
            }
            catch (error) {
                logger.error(`Failed to verify directory: ${dir.path}`, { error });
                if (dir.required) {
                    // If directory is critical, try to create it
                    if (dir.autoCreate) {
                        await this.attemptDirectoryRepair(dir);
                    }
                    else {
                        throw new Error(`Critical directory check failed: ${dir.path}`);
                    }
                }
            }
        }
    }
    async verifyDirectory(dir) {
        try {
            const stats = await promises_1.default.stat(dir.path);
            if (!stats.isDirectory()) {
                throw new Error(`Path exists but is not a directory: ${dir.path}`);
            }
            if (dir.writable) {
                try {
                    const testFile = path_1.default.join(dir.path, '.writetest');
                    await promises_1.default.writeFile(testFile, 'test');
                    await promises_1.default.unlink(testFile);
                }
                catch (error) {
                    throw new Error(`Directory not writable: ${dir.path}`);
                }
            }
            logger.debug(`Directory verified: ${dir.path}`);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`Directory not found: ${dir.path}`);
            }
            throw error;
        }
    }
    async attemptDirectoryRepair(dir) {
        try {
            logger.warn(`Attempting to create missing directory: ${dir.path}`);
            await promises_1.default.mkdir(dir.path, { recursive: true, mode: dir.permissions });
            logger.info(`Successfully created directory: ${dir.path}`);
            // Verify after creation
            await this.verifyDirectory(dir);
        }
        catch (error) {
            logger.error(`Failed to create directory: ${dir.path}`, { error });
            throw new Error(`Directory repair failed: ${dir.path}`);
        }
    }
    async checkAndFixEndpoints() {
        for (const endpoint of this.requiredEndpoints) {
            try {
                await this.verifyEndpoint(endpoint);
            }
            catch (error) {
                logger.error(`Endpoint check failed: ${endpoint.name} (${endpoint.url})`, { error });
                await this.attemptEndpointRecovery(endpoint);
            }
        }
    }
    async verifyEndpoint(endpoint) {
        const { url, method = 'GET', expectedStatus = 200, timeout = 5000 } = endpoint;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, {
                method,
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' },
            });
            clearTimeout(timeoutId);
            if (response.status !== expectedStatus) {
                throw new Error(`Unexpected status: ${response.status} ${response.statusText}`);
            }
            logger.debug(`Endpoint verified: ${endpoint.name} (${endpoint.url})`);
        }
        catch (error) {
            clearTimeout(timeoutId);
            throw new Error(`Endpoint check failed: ${error.message}`);
        }
    }
    async attemptEndpointRecovery(endpoint) {
        logger.warn(`Attempting to recover endpoint: ${endpoint.name}`);
        // Implement recovery strategies based on endpoint
        switch (endpoint.name) {
            case 'Health Check':
                // Try to restart dependent services
                await this.restartDependentServices();
                break;
            case 'API Status':
                // Try to clear cache and retry
                await this.clearApiCache();
                break;
            default:
                logger.warn(`No specific recovery strategy for endpoint: ${endpoint.name}`);
        }
        // Verify after recovery attempt
        try {
            await this.verifyEndpoint(endpoint);
            logger.info(`Successfully recovered endpoint: ${endpoint.name}`);
        }
        catch (error) {
            logger.error(`Failed to recover endpoint: ${endpoint.name}`, { error });
            throw new Error(`Endpoint recovery failed: ${endpoint.name}`);
        }
    }
    async restartDependentServices() {
        // Implementation depends on your infrastructure
        // Could be Kubernetes, Docker, PM2, etc.
        logger.info('Attempting to restart dependent services');
        // Add actual service restart logic here
    }
    async clearApiCache() {
        // Implementation depends on your caching solution
        logger.info('Clearing API cache');
        // Add actual cache clearing logic here
    }
    setupPeriodicChecks() {
        // Run checks every 5 minutes
        setInterval(async () => {
            try {
                await this.checkAndFixDirectories();
                await this.checkAndFixEndpoints();
            }
            catch (error) {
                logger.error('Periodic self-check failed', { error });
            }
        }, 5 * 60 * 1000);
        logger.info('Periodic self-checks enabled');
    }
}
exports.SelfHealingService = SelfHealingService;
exports.selfHealingService = SelfHealingService.getInstance();
//# sourceMappingURL=selfHealing.service.js.map
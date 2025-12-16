"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SelfHealingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfHealingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs-extra"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const checkDiskSpace = __importStar(require("check-disk-space"));
const event_emitter_1 = require("@nestjs/event-emitter");
let SelfHealingService = SelfHealingService_1 = class SelfHealingService {
    configService;
    eventEmitter;
    logger = new common_1.Logger(SelfHealingService_1.name);
    services = new Map();
    monitoringInterval = null;
    monitoringConfig;
    lastSystemCheck = null;
    // Define required directories with detailed configuration
    requiredDirectories = [
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
    ];
    constructor(configService, eventEmitter) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.loadConfiguration();
        this.initializeServices();
        // Register global error handlers
        this.registerGlobalHandlers();
    }
    loadConfiguration() {
        this.monitoringConfig = {
            enabled: this.configService.get('MONITORING_ENABLED', true),
            checkInterval: this.configService.get('MONITORING_INTERVAL_MS', 30000),
            requiredDirs: this.requiredDirectories.map(dir => dir.path),
            maxFailuresBeforeAlert: this.configService.get('MAX_FAILURES_BEFORE_ALERT', 3),
            maxAutoRecoveryAttempts: this.configService.get('MAX_RECOVERY_ATTEMPTS', 3),
            memoryThreshold: this.configService.get('MEMORY_THRESHOLD', 0.9),
            cpuThreshold: this.configService.get('CPU_THRESHOLD', 0.9),
            diskThreshold: this.configService.get('DISK_THRESHOLD', 0.8),
            alertChannels: {
                email: this.configService.get('ALERT_EMAILS', '').split(',').filter(Boolean),
                slack: this.configService.get('SLACK_WEBHOOK_URL', '')
            }
        };
        this.logger.log(`Monitoring configuration loaded: ${JSON.stringify({
            ...this.monitoringConfig,
            requiredDirs: this.monitoringConfig.requiredDirs.length + ' directories'
        })}`);
    }
    registerGlobalHandlers() {
        process.on('uncaughtException', (error) => {
            this.logger.error(`Uncaught Exception: ${error.message}`, error.stack);
            this.recordError('process', error);
            // Attempt graceful shutdown
            this.gracefulShutdown(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
            this.recordError('process', new Error(`Unhandled rejection: ${reason}`));
        });
    }
    onModuleInit() {
        if (this.monitoringConfig.enabled) {
            this.startMonitoring();
        }
    }
    initializeServices() {
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
    startMonitoring() {
        const interval = this.monitoringConfig.checkInterval;
        this.logger.log(`Starting monitoring with ${interval}ms interval`);
        // Initial check
        this.performHealthChecks();
        // Schedule periodic checks
        this.monitoringInterval = setInterval(() => this.performHealthChecks(), interval);
    }
    async performHealthChecks() {
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
        }
        catch (error) {
            const err = error;
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
};
exports.SelfHealingService = SelfHealingService;
exports.SelfHealingService = SelfHealingService = SelfHealingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(event_emitter_1.EventEmitter2)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        event_emitter_1.EventEmitter2])
], SelfHealingService);
async;
ensureDirectoryExists(dir, types_1.DirectoryCheck);
Promise < void  > {
    try: {
        // Check if directory exists
        const: exists = await fs.pathExists(dir.path),
        if(, exists) { }
    } && dir.required
};
{
    if (dir.autoCreate) {
        this.logger.log(`Creating directory: ${dir.path}`);
        await fs.ensureDir(dir.path, { mode: dir.permissions });
        this.logger.log(`Created directory: ${dir.path}`);
    }
    else {
        throw new Error(`Required directory does not exist: ${dir.path}`);
    }
}
// Verify directory permissions
if (dir.writable) {
    try {
        await fs.access(dir.path, fs.constants.W_OK);
    }
    catch (error) {
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
try { }
catch (error) {
    const err = error;
    this.logger.error(`Failed to ensure directory ${dir.path}: ${err.message}`, err.stack);
    throw err;
}
async;
cleanupOldFiles(directory, string, maxAgeMs, number);
Promise < void  > {
    try: {
        const: now = Date.now(),
        const: files = await fs.readdir(directory),
        for(, file, of, files) {
            const filePath = path.join(directory, file);
            const stats = await fs.stat(filePath);
            if (now - stats.mtime.getTime() > maxAgeMs) {
                await fs.remove(filePath);
                this.logger.debug(`Cleaned up old file: ${filePath}`);
            }
        }
    }, catch(error) {
        this.logger.warn(`Failed to clean up old files in ${directory}: ${error.message}`);
    }
};
async;
checkAndFixDirectories();
{
    const results = await Promise.allSettled(this.requiredDirectories.map(async (dir) => {
        const serviceName = `dir:${dir.path}`;
        try {
            await this.ensureDirectoryExists(dir);
            this.recordSuccess(serviceName);
            return { serviceName, success: true };
        }
        catch (error) {
            const err = error;
            this.recordError(serviceName, err);
            return { serviceName, success: false, error: err };
        }
    }));
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
async;
checkSystemResources();
{
    try {
        await this.checkMemoryUsage();
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.recordError('memory', err);
    }
    try {
        await this.checkDiskSpace();
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.recordError('disk', err);
    }
    try {
        await this.checkCpuUsage();
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.recordError('cpu', err);
    }
}
async;
ensureDirectoryExists(dir, types_1.DirectoryCheck);
Promise < boolean > {
    const: { path: dirPath, writable = true, autoCreate = true, permissions = 0o755 } = dir,
    try: {
        // Check if directory exists
        await, fs, : .promises.access(dirPath, fs.constants.F_OK),
        // Check if it's actually a directory
        const: stats = await fs.promises.stat(dirPath),
        if(, stats) { }, : .isDirectory()
    }
};
{
    throw new Error(`Path exists but is not a directory: ${dirPath}`);
}
// Check write permissions if needed
if (writable) {
    try {
        await fs.promises.access(dirPath, fs.constants.W_OK);
    }
    catch (err) {
        throw new Error(`Directory exists but is not writable: ${dirPath}`);
    }
}
this.logger.debug(`Directory verified: ${dirPath}`);
return true;
try { }
catch (error) {
    const err = error;
    // If directory doesn't exist and auto-create is enabled, try to create it
    if (err.code === 'ENOENT' && autoCreate) {
        this.logger.warn(`Directory not found: ${dirPath}, attempting to create...`);
        try {
            await fs.promises.mkdir(dirPath, { recursive: true, mode: permissions });
            this.logger.log(`Created directory: ${dirPath}`);
            return true;
        }
        catch (createError) {
            const createErr = createError;
            throw new Error(`Failed to create directory ${dirPath}: ${createErr.message}`);
        }
    }
    // If we get here, either auto-create is disabled or another error occurred
    throw new Error(`Directory check failed for ${dirPath}: ${err.message}`);
}
async;
checkMemoryUsage();
{
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
async;
checkDiskSpace();
{
    try {
        const diskSpace = await checkDiskSpace(process.cwd());
        const used = diskSpace.size - diskSpace.free;
        const diskUsage = used / diskSpace.size;
        if (diskUsage > this.monitoringConfig.diskThreshold) {
            const error = new Error(`High disk usage: ${(diskUsage * 100).toFixed(2)}%`);
            error.details = {
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
    }
    catch (error) {
        const err = error;
        this.logger.error(`Disk space check failed: ${err.message}`);
        throw err;
    }
}
async;
checkCpuUsage();
Promise < void  > {
    return: new Promise((resolve, reject) => {
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
                error.details = details;
                reject(error);
            }
            else {
                this.recordSuccess('cpu', details);
                resolve();
            }
        }, 1000);
    })
};
recordSuccess(service, string, details, (Record) = {});
{
    const serviceHealth = this.services.get(service);
    if (!serviceHealth)
        return;
    serviceHealth.status = 'healthy';
    serviceHealth.lastCheck = new Date();
    serviceHealth.lastError = undefined;
    serviceHealth.errorCount = 0;
    serviceHealth.details = details;
    this.logger.debug(`Service ${service} is healthy: ${JSON.stringify(details)}`);
}
recordError(serviceName, string, error, Error);
{
    const serviceHealth = this.services.get(serviceName);
    if (!serviceHealth)
        return;
    serviceHealth.errorCount++;
    serviceHealth.lastError = error;
    serviceHealth.lastCheck = new Date();
    if (serviceHealth.errorCount >= this.monitoringConfig.maxFailuresBeforeAlert) {
        serviceHealth.status = 'critical';
        this.triggerAlerts(serviceName, error);
    }
    else {
        serviceHealth.status = 'degraded';
    }
    this.logger.error(`Service ${serviceName} error: ${error.message}`, error.stack);
}
triggerAlerts(serviceName, string, error, Error);
{
    const serviceHealth = this.services.get(serviceName);
    if (!serviceHealth)
        return;
    const message = `[${serviceName.toUpperCase()}] Service is in ${serviceHealth.status} state\n` +
        `Error: ${error.message}\n` +
        `Error count: ${serviceHealth.errorCount}\n` +
        `Last check: ${serviceHealth.lastCheck.toISOString()}`;
    // Send alerts via configured channels
    this.sendEmailAlert(serviceName, message);
    this.sendSlackAlert(serviceName, message);
}
sendEmailAlert(serviceName, string, message, string);
{
    const emails = this.monitoringConfig.alertChannels.email;
    if (!emails?.length)
        return;
    this.logger.log(`Sending email alert for ${serviceName} to ${emails.join(', ')}`);
    // Implement email sending logic here
}
sendSlackAlert(serviceName, string, message, string);
{
    const webhookUrl = this.monitoringConfig.alertChannels.slackWebhook;
    if (!webhookUrl)
        return;
    this.logger.log(`Sending Slack alert for ${serviceName}`);
    // Implement Slack webhook logic here
}
formatBytes(bytes, number, decimals = 2);
string;
{
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
async;
getServiceHealth(serviceName, string);
Promise < types_1.ServiceHealth | undefined > {
    return: this.services.get(serviceName)
};
async;
getAllServicesHealth();
Promise < Record < string, types_1.ServiceHealth >> {
    return: Object.fromEntries(this.services.entries())
};
async;
onModuleDestroy();
{
    if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
    }
}
startMonitoring();
{
    const interval = this.monitoringConfig.checkInterval;
    this.logger.log(`Starting monitoring with ${interval}ms interval`);
    // Initial check
    this.performHealthChecks();
    // Schedule periodic checks
    this.monitoringInterval = setInterval(() => this.performHealthChecks(), interval);
}
//# sourceMappingURL=self-healing.service.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckService = exports.HealthCheckService = void 0;
const logger_1 = require("../common/logger");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const logger = new logger_1.Logger('HealthService');
class HealthCheckService {
    static instance;
    dbConnection = null;
    checks = [];
    constructor() {
        this.initializeChecks();
    }
    static getInstance() {
        if (!HealthCheckService.instance) {
            HealthCheckService.instance = new HealthCheckService();
        }
        return HealthCheckService.instance;
    }
    setDbConnection(connection) {
        this.dbConnection = connection;
    }
    initializeChecks() {
        // Database health check
        this.addCheck('database', async () => {
            if (!this.dbConnection) {
                return { status: 'error', details: 'Database connection not initialized' };
            }
            try {
                await this.dbConnection.query('SELECT 1');
                return { status: 'ok' };
            }
            catch (error) {
                logger.error('Database health check failed', { error });
                return { status: 'error', details: error.message };
            }
        });
        // Memory usage check
        this.addCheck('memory', async () => {
            const memoryUsage = process.memoryUsage();
            const memoryStatus = {
                rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
                external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)}MB`,
            };
            return {
                status: 'ok',
                details: memoryStatus,
            };
        });
        // Disk space check (if running in a container with /proc/self/mountinfo)
        if (process.platform === 'linux') {
            this.addCheck('disk', async () => {
                try {
                    const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
                    const stats = await fs.statfs('/');
                    const total = stats.blocks * stats.bsize;
                    const free = stats.bfree * stats.bsize;
                    const used = total - free;
                    const percentageUsed = (used / total) * 100;
                    return {
                        status: percentageUsed > 90 ? 'warning' : 'ok',
                        details: {
                            total: `${(total / 1024 / 1024 / 1024).toFixed(2)}GB`,
                            used: `${(used / 1024 / 1024 / 1024).toFixed(2)}GB`,
                            free: `${(free / 1024 / 1024 / 1024).toFixed(2)}GB`,
                            usage: `${percentageUsed.toFixed(2)}%`,
                        },
                    };
                }
                catch (error) {
                    return {
                        status: 'error',
                        details: `Disk check failed: ${error.message}`,
                    };
                }
            });
        }
    }
    addCheck(name, check) {
        this.checks = this.checks.filter((c) => c.name !== name);
        this.checks.push({ name, check });
    }
    async check() {
        const results = {};
        let overallStatus = 'ok';
        // Run all checks in parallel
        await Promise.all(this.checks.map(async ({ name, check }) => {
            try {
                const result = await check();
                results[name] = {
                    status: result.status,
                    ...(result.details && { details: result.details }),
                };
                // Update overall status
                if (result.status === 'error' && overallStatus !== 'error') {
                    overallStatus = 'error';
                }
                else if (result.status === 'warning' && overallStatus === 'ok') {
                    overallStatus = 'warning';
                }
            }
            catch (error) {
                logger.error(`Health check '${name}' failed`, { error });
                results[name] = {
                    status: 'error',
                    error: error.message,
                };
                overallStatus = 'error';
            }
        }));
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            details: results,
        };
    }
}
exports.HealthCheckService = HealthCheckService;
exports.healthCheckService = HealthCheckService.getInstance();
//# sourceMappingURL=health.service.js.map
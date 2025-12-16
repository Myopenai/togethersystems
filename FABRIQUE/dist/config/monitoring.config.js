"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('monitoring', () => ({
    enabled: process.env.MONITORING_ENABLED === 'true',
    checkInterval: parseInt(process.env.MONITORING_INTERVAL) || 60000, // 1 minute
    requiredDirs: (process.env.REQUIRED_DIRS || 'logs,uploads,tmp').split(','),
    maxFailuresBeforeAlert: parseInt(process.env.MAX_FAILURES_BEFORE_ALERT) || 3,
    maxAutoRecoveryAttempts: parseInt(process.env.MAX_RECOVERY_ATTEMPTS) || 3,
    memoryThreshold: parseFloat(process.env.MEMORY_THRESHOLD) || 0.9, // 90%
    cpuThreshold: parseFloat(process.env.CPU_THRESHOLD) || 0.9, // 90%
    diskThreshold: parseFloat(process.env.DISK_THRESHOLD) || 0.8, // 80%
    alertChannels: {
        email: process.env.ALERT_EMAILS?.split(','),
        slackWebhook: process.env.SLACK_WEBHOOK_URL,
    },
}));
//# sourceMappingURL=monitoring.config.js.map
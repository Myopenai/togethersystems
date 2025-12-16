export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'recovering';
export interface ServiceHealth {
    status: HealthStatus;
    lastCheck: Date;
    lastError?: Error;
    errorCount: number;
    recoveryAttempts: number;
    details?: Record<string, any>;
}
export interface MonitoringConfig {
    enabled: boolean;
    checkInterval: number;
    requiredDirs: string[];
    maxFailuresBeforeAlert: number;
    maxAutoRecoveryAttempts: number;
    memoryThreshold: number;
    cpuThreshold: number;
    diskThreshold: number;
    alertChannels: {
        email?: string[];
        slackWebhook?: string;
    };
}
export interface DirectoryCheck {
    path: string;
    required?: boolean;
    writable?: boolean;
    autoCreate?: boolean;
    permissions?: number;
}

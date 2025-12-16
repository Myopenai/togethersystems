import { OnModuleInit } from '@nestjs/common';
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
export declare class MonitoringService implements OnModuleInit {
    private readonly configService;
    private readonly eventEmitter;
    private readonly selfHealingService;
    private readonly logger;
    private readonly services;
    private monitoringInterval;
    private activeAlerts;
    private metricsHistory;
    private readonly METRICS_HISTORY_LIMIT;
    private config;
    private loadConfiguration;
    private initializeEventListeners;
    onModuleInit(): Promise<void>;
    initialize(): Promise<void>;
    checkServices(): Promise<void>;
    private checkMemoryUsage;
    private checkDiskSpace;
    private checkCpuUsage;
    private checkDatabaseConnection;
    private checkExternalServices;
    private formatBytes;
    recordError(service: string, error: any, metadata?: Record<string, any>): ServiceHealth;
    recordSuccess(service: string): ServiceHealth;
    getServiceStatus(service: string): ServiceStatus;
    getAllStatuses(): {
        [k: string]: ServiceHealth;
    };
    private attemptRecovery;
    private alert;
    private sendEmailAlert;
    private sendSlackAlert;
    recordRecovery(service: string): ServiceStatus;
    getStatus(): Record<string, any>;
    onModuleDestroy(): void;
}

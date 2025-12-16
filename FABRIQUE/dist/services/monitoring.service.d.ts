type ServiceStatus = 'healthy' | 'degraded' | 'critical' | 'recovering';
export declare class MonitoringService {
    private static instance;
    private logger;
    private status;
    private config;
    private constructor();
    static getInstance(): MonitoringService;
    initialize(): Promise<void>;
    private initializeServiceStatus;
    private startMonitoring;
    private performHealthChecks;
    private triggerSelfHealing;
    private attemptServiceRecovery;
    private recoverDatabase;
    private restartApiService;
    private escalateToHuman;
    getServiceStatus(service: string): ServiceStatus | undefined;
    getAllStatuses(): Record<string, ServiceStatus>;
}
export declare const monitoringService: MonitoringService;
export {};

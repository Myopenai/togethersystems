import { MonitoringService } from './monitoring.service';
export declare class HealthController {
    private readonly monitoringService;
    constructor(monitoringService: MonitoringService);
    getHealth(): Record<string, any>;
    getMonitor(): {
        status: string;
        timestamp: string;
        services: {
            [k: string]: import("./monitoring.service").ServiceHealth;
        };
    };
    getMetrics(): {
        status: string;
        timestamp: string;
        metrics: {
            http_requests_total: number;
            http_request_duration_seconds: number;
            memory_usage_bytes: number;
            uptime_seconds: number;
        };
    };
}

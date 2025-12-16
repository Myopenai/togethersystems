import { DataSource } from 'typeorm';
export declare class HealthCheckService {
    private static instance;
    private dbConnection;
    private checks;
    private constructor();
    static getInstance(): HealthCheckService;
    setDbConnection(connection: DataSource): void;
    private initializeChecks;
    addCheck(name: string, check: () => Promise<{
        status: string;
        details?: any;
    }>): void;
    check(): Promise<{
        status: 'ok' | 'warning' | 'error';
        timestamp: string;
        uptime: number;
        details: Record<string, any>;
    }>;
}
export declare const healthCheckService: HealthCheckService;

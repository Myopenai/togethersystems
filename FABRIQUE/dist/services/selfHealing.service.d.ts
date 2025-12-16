export declare class SelfHealingService {
    private static instance;
    private requiredDirectories;
    private requiredEndpoints;
    private constructor();
    static getInstance(): SelfHealingService;
    initialize(): Promise<void>;
    private checkAndFixDirectories;
    private verifyDirectory;
    private attemptDirectoryRepair;
    private checkAndFixEndpoints;
    private verifyEndpoint;
    private attemptEndpointRecovery;
    private restartDependentServices;
    private clearApiCache;
    private setupPeriodicChecks;
}
export declare const selfHealingService: SelfHealingService;

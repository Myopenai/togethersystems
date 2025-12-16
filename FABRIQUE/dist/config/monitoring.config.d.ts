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
declare const _default: (() => MonitoringConfig) & import("@nestjs/config").ConfigFactoryKeyHost<MonitoringConfig>;
export default _default;

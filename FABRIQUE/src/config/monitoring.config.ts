import { registerAs } from '@nestjs/config';

export interface MonitoringConfig {
  enabled: boolean;
  checkInterval: number; // in milliseconds
  requiredDirs: string[];
  maxFailuresBeforeAlert: number;
  maxAutoRecoveryAttempts: number;
  memoryThreshold: number; // 0-1 percentage
  cpuThreshold: number;    // 0-1 percentage
  diskThreshold: number;   // 0-1 percentage
  alertChannels: {
    email?: string[];
    slackWebhook?: string;
  };
}

export default registerAs('monitoring', (): MonitoringConfig => ({
  enabled: process.env.MONITORING_ENABLED === 'true',
  checkInterval: parseInt(process.env.MONITORING_INTERVAL) || 60000, // 1 minute
  requiredDirs: (process.env.REQUIRED_DIRS || 'logs,uploads,tmp').split(','),
  maxFailuresBeforeAlert: parseInt(process.env.MAX_FAILURES_BEFORE_ALERT) || 3,
  maxAutoRecoveryAttempts: parseInt(process.env.MAX_RECOVERY_ATTEMPTS) || 3,
  memoryThreshold: parseFloat(process.env.MEMORY_THRESHOLD) || 0.9, // 90%
  cpuThreshold: parseFloat(process.env.CPU_THRESHOLD) || 0.9,       // 90%
  diskThreshold: parseFloat(process.env.DISK_THRESHOLD) || 0.8,     // 80%
  alertChannels: {
    email: process.env.ALERT_EMAILS?.split(','),
    slackWebhook: process.env.SLACK_WEBHOOK_URL,
  },
}));

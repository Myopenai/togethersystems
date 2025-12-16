import { DataSource } from 'typeorm';
import { Logger } from '../common/logger';
import { config } from 'dotenv';

config();

const logger = new Logger('HealthService');

export class HealthCheckService {
  private static instance: HealthCheckService;
  private dbConnection: DataSource | null = null;
  private checks: Array<{
    name: string;
    check: () => Promise<{ status: string; details?: any }>;
  }> = [];

  private constructor() {
    this.initializeChecks();
  }

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  public setDbConnection(connection: DataSource): void {
    this.dbConnection = connection;
  }

  private initializeChecks(): void {
    // Database health check
    this.addCheck('database', async () => {
      if (!this.dbConnection) {
        return { status: 'error', details: 'Database connection not initialized' };
      }

      try {
        await this.dbConnection.query('SELECT 1');
        return { status: 'ok' };
      } catch (error) {
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
          const fs = await import('fs/promises');
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
        } catch (error) {
          return {
            status: 'error',
            details: `Disk check failed: ${error.message}`,
          };
        }
      });
    }
  }

  public addCheck(
    name: string,
    check: () => Promise<{ status: string; details?: any }>
  ): void {
    this.checks = this.checks.filter((c) => c.name !== name);
    this.checks.push({ name, check });
  }

  public async check(): Promise<{
    status: 'ok' | 'warning' | 'error';
    timestamp: string;
    uptime: number;
    details: Record<string, any>;
  }> {
    const results: Record<string, any> = {};
    let overallStatus: 'ok' | 'warning' | 'error' = 'ok';

    // Run all checks in parallel
    await Promise.all(
      this.checks.map(async ({ name, check }) => {
        try {
          const result = await check();
          results[name] = {
            status: result.status,
            ...(result.details && { details: result.details }),
          };

          // Update overall status
          if (result.status === 'error' && overallStatus !== 'error') {
            overallStatus = 'error';
          } else if (result.status === 'warning' && overallStatus === 'ok') {
            overallStatus = 'warning';
          }
        } catch (error) {
          logger.error(`Health check '${name}' failed`, { error });
          results[name] = {
            status: 'error',
            error: error.message,
          };
          overallStatus = 'error';
        }
      })
    );

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      details: results,
    };
  }
}

export const healthCheckService = HealthCheckService.getInstance();

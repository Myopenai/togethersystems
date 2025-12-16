import { Logger } from '../common/logger';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

config();

const logger = new Logger('SelfHealingService');

type DirectoryCheck = {
  path: string;
  required?: boolean;
  writable?: boolean;
  autoCreate?: boolean;
  permissions?: number; // e.g., 0o755
};

type EndpointCheck = {
  name: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  expectedStatus?: number;
  timeout?: number;
};

export class SelfHealingService {
  private static instance: SelfHealingService;
  private requiredDirectories: DirectoryCheck[] = [
    { path: 'logs', required: true, writable: true, autoCreate: true, permissions: 0o755 },
    { path: 'uploads', required: true, writable: true, autoCreate: true, permissions: 0o755 },
    { path: 'tmp', required: true, writable: true, autoCreate: true, permissions: 0o777 },
    { path: 'config', required: true, writable: false, autoCreate: false },
  ];

  private requiredEndpoints: EndpointCheck[] = [
    { name: 'Health Check', url: '/health', method: 'GET', expectedStatus: 200, timeout: 5000 },
    { name: 'API Status', url: '/api/status', method: 'GET', expectedStatus: 200, timeout: 5000 },
  ];

  private constructor() {}

  public static getInstance(): SelfHealingService {
    if (!SelfHealingService.instance) {
      SelfHealingService.instance = new SelfHealingService();
    }
    return SelfHealingService.instance;
  }

  public async initialize(): Promise<void> {
    logger.info('Initializing self-healing service');
    await this.checkAndFixDirectories();
    await this.checkAndFixEndpoints();
    this.setupPeriodicChecks();
  }

  private async checkAndFixDirectories(): Promise<void> {
    for (const dir of this.requiredDirectories) {
      try {
        await this.verifyDirectory(dir);
      } catch (error) {
        logger.error(`Failed to verify directory: ${dir.path}`, { error });
        if (dir.required) {
          // If directory is critical, try to create it
          if (dir.autoCreate) {
            await this.attemptDirectoryRepair(dir);
          } else {
            throw new Error(`Critical directory check failed: ${dir.path}`);
          }
        }
      }
    }
  }

  private async verifyDirectory(dir: DirectoryCheck): Promise<void> {
    try {
      const stats = await fs.stat(dir.path);
      if (!stats.isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${dir.path}`);
      }
      
      if (dir.writable) {
        try {
          const testFile = path.join(dir.path, '.writetest');
          await fs.writeFile(testFile, 'test');
          await fs.unlink(testFile);
        } catch (error) {
          throw new Error(`Directory not writable: ${dir.path}`);
        }
      }
      
      logger.debug(`Directory verified: ${dir.path}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Directory not found: ${dir.path}`);
      }
      throw error;
    }
  }

  private async attemptDirectoryRepair(dir: DirectoryCheck): Promise<void> {
    try {
      logger.warn(`Attempting to create missing directory: ${dir.path}`);
      await fs.mkdir(dir.path, { recursive: true, mode: dir.permissions });
      logger.info(`Successfully created directory: ${dir.path}`);
      
      // Verify after creation
      await this.verifyDirectory(dir);
    } catch (error) {
      logger.error(`Failed to create directory: ${dir.path}`, { error });
      throw new Error(`Directory repair failed: ${dir.path}`);
    }
  }

  private async checkAndFixEndpoints(): Promise<void> {
    for (const endpoint of this.requiredEndpoints) {
      try {
        await this.verifyEndpoint(endpoint);
      } catch (error) {
        logger.error(`Endpoint check failed: ${endpoint.name} (${endpoint.url})`, { error });
        await this.attemptEndpointRecovery(endpoint);
      }
    }
  }

  private async verifyEndpoint(endpoint: EndpointCheck): Promise<void> {
    const { url, method = 'GET', expectedStatus = 200, timeout = 5000 } = endpoint;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      
      clearTimeout(timeoutId);
      
      if (response.status !== expectedStatus) {
        throw new Error(`Unexpected status: ${response.status} ${response.statusText}`);
      }
      
      logger.debug(`Endpoint verified: ${endpoint.name} (${endpoint.url})`);
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(`Endpoint check failed: ${error.message}`);
    }
  }

  private async attemptEndpointRecovery(endpoint: EndpointCheck): Promise<void> {
    logger.warn(`Attempting to recover endpoint: ${endpoint.name}`);
    
    // Implement recovery strategies based on endpoint
    switch (endpoint.name) {
      case 'Health Check':
        // Try to restart dependent services
        await this.restartDependentServices();
        break;
      case 'API Status':
        // Try to clear cache and retry
        await this.clearApiCache();
        break;
      default:
        logger.warn(`No specific recovery strategy for endpoint: ${endpoint.name}`);
    }
    
    // Verify after recovery attempt
    try {
      await this.verifyEndpoint(endpoint);
      logger.info(`Successfully recovered endpoint: ${endpoint.name}`);
    } catch (error) {
      logger.error(`Failed to recover endpoint: ${endpoint.name}`, { error });
      throw new Error(`Endpoint recovery failed: ${endpoint.name}`);
    }
  }

  private async restartDependentServices(): Promise<void> {
    // Implementation depends on your infrastructure
    // Could be Kubernetes, Docker, PM2, etc.
    logger.info('Attempting to restart dependent services');
    // Add actual service restart logic here
  }

  private async clearApiCache(): Promise<void> {
    // Implementation depends on your caching solution
    logger.info('Clearing API cache');
    // Add actual cache clearing logic here
  }

  private setupPeriodicChecks(): void {
    // Run checks every 5 minutes
    setInterval(async () => {
      try {
        await this.checkAndFixDirectories();
        await this.checkAndFixEndpoints();
      } catch (error) {
        logger.error('Periodic self-check failed', { error });
      }
    }, 5 * 60 * 1000);
    
    logger.info('Periodic self-checks enabled');
  }
}

export const selfHealingService = SelfHealingService.getInstance();

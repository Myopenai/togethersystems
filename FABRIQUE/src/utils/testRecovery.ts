import { Logger } from '../common/logger';
import { selfHealingService } from '../services/selfHealing.service';
import { monitoringService } from '../services/monitoring.service';
import fs from 'fs/promises';
import path from 'path';

const logger = new Logger('TestRecovery');

class TestRecovery {
  private testDir = 'test-recovery-dir';
  private testFile = path.join(this.testDir, 'test-file.txt');

  async runTests() {
    logger.info('Starting recovery tests');
    
    try {
      // Initialize services
      await selfHealingService.initialize();
      await monitoringService.initialize();
      
      // Run test scenarios
      await this.testDirectoryRecovery();
      await this.testMonitoring();
      
      logger.info('✓ All recovery tests completed successfully');
    } catch (error) {
      logger.error('Recovery tests failed', { error });
      throw error;
    } finally {
      // Cleanup
      await this.cleanup();
    }
  }

  private async testDirectoryRecovery() {
    logger.info('Testing directory recovery...');
    
    // Ensure test directory doesn't exist
    await this.cleanup();
    
    // Add test directory to required directories
    selfHealingService.addDirectoryCheck({
      path: this.testDir,
      required: true,
      writable: true,
      autoCreate: true,
      permissions: 0o755
    });
    
    // Trigger directory check
    await selfHealingService.checkAndFixDirectories();
    
    // Verify directory was created
    try {
      const stats = await fs.stat(this.testDir);
      if (!stats.isDirectory()) {
        throw new Error('Test directory was not created');
      }
      logger.info('✓ Directory recovery test passed');
    } catch (error) {
      throw new Error(`Directory recovery failed: ${error.message}`);
    }
  }

  private async testMonitoring() {
    logger.info('Testing monitoring service...');
    
    // Simulate an error
    const error = new Error('Test error');
    monitoringService.recordError('test-service', error);
    
    // Check status
    const status = monitoringService.getServiceStatus('test-service');
    if (status !== 'degraded' && status !== 'critical') {
      throw new Error(`Unexpected status after error: ${status}`);
    }
    
    // Simulate recovery
    monitoringService.recordRecovery('test-service');
    
    // Verify recovery
    const recoveredStatus = monitoringService.getServiceStatus('test-service');
    if (recoveredStatus !== 'healthy') {
      throw new Error('Service did not recover successfully');
    }
    
    logger.info('✓ Monitoring service test passed');
  }

  private async cleanup() {
    try {
      await fs.rm(this.testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const test = new TestRecovery();
  test.runTests().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { TestRecovery };

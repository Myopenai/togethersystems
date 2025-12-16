import { Logger } from '../common/logger';
import { selfHealingService } from '../services/selfHealing.service';
import { monitoringService } from '../services/monitoring.service';
import fs from 'fs/promises';
import path from 'path';

const logger = new Logger('SelfHealingTest');

async function runTests() {
  logger.info('Starting self-healing system tests');
  
  try {
    // Test 1: Verify directory creation
    await testDirectoryCreation();
    
    // Test 2: Simulate missing critical directory
    await testMissingDirectoryRecovery();
    
    // Test 3: Test monitoring service health checks
    await testMonitoringService();
    
    logger.info('All self-healing tests completed successfully');
  } catch (error) {
    logger.error('Self-healing tests failed', { error });
    process.exit(1);
  }
}

async function testDirectoryCreation() {
  logger.info('Testing directory creation...');
  
  // This will trigger the directory verification and creation
  await selfHealingService.initialize();
  
  // Verify directories exist
  const requiredDirs = ['logs', 'uploads', 'tmp'];
  for (const dir of requiredDirs) {
    try {
      const stats = await fs.stat(dir);
      if (!stats.isDirectory()) {
        throw new Error(`${dir} exists but is not a directory`);
      }
      logger.info(`✓ Directory verified: ${dir}`);
    } catch (error) {
      throw new Error(`Directory check failed for ${dir}: ${error.message}`);
    }
  }
  
  logger.info('✓ Directory creation test passed');
}

async function testMissingDirectoryRecovery() {
  logger.info('Testing missing directory recovery...');
  
  // Delete a directory
  const testDir = 'test-recovery-dir';
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore if directory doesn't exist
  }
  
  // Add the test directory to required directories
  selfHealingService.addDirectoryCheck({
    path: testDir,
    required: true,
    writable: true,
    autoCreate: true,
    permissions: 0o755
  });
  
  // Trigger directory check
  await selfHealingService.checkAndFixDirectories();
  
  // Verify directory was created
  try {
    const stats = await fs.stat(testDir);
    if (!stats.isDirectory()) {
      throw new Error('Test directory was not created as a directory');
    }
    logger.info('✓ Missing directory was automatically created');
    
    // Clean up
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    throw new Error(`Directory recovery failed: ${error.message}`);
  }
  
  logger.info('✓ Missing directory recovery test passed');
}

async function testMonitoringService() {
  logger.info('Testing monitoring service...');
  
  // Initialize monitoring service
  await monitoringService.initialize();
  
  // Simulate a service failure
  monitoringService.recordError('test-service', new Error('Test error'));
  
  // Get current status
  const status = monitoringService.getServiceStatus('test-service');
  logger.info(`Test service status after error: ${status}`);
  
  // Simulate recovery
  monitoringService.recordRecovery('test-service');
  
  const recoveredStatus = monitoringService.getServiceStatus('test-service');
  if (recoveredStatus !== 'healthy') {
    throw new Error('Service did not recover successfully');
  }
  
  logger.info('✓ Monitoring service test passed');
}

// Run the tests
runTests().catch(error => {
  logger.error('Unhandled error in self-healing tests', { error });
  process.exit(1);
});

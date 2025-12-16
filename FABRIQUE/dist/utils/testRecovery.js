"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRecovery = void 0;
const logger_1 = require("../common/logger");
const selfHealing_service_1 = require("../services/selfHealing.service");
const monitoring_service_1 = require("../services/monitoring.service");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const logger = new logger_1.Logger('TestRecovery');
class TestRecovery {
    testDir = 'test-recovery-dir';
    testFile = path_1.default.join(this.testDir, 'test-file.txt');
    async runTests() {
        logger.info('Starting recovery tests');
        try {
            // Initialize services
            await selfHealing_service_1.selfHealingService.initialize();
            await monitoring_service_1.monitoringService.initialize();
            // Run test scenarios
            await this.testDirectoryRecovery();
            await this.testMonitoring();
            logger.info('✓ All recovery tests completed successfully');
        }
        catch (error) {
            logger.error('Recovery tests failed', { error });
            throw error;
        }
        finally {
            // Cleanup
            await this.cleanup();
        }
    }
    async testDirectoryRecovery() {
        logger.info('Testing directory recovery...');
        // Ensure test directory doesn't exist
        await this.cleanup();
        // Add test directory to required directories
        selfHealing_service_1.selfHealingService.addDirectoryCheck({
            path: this.testDir,
            required: true,
            writable: true,
            autoCreate: true,
            permissions: 0o755
        });
        // Trigger directory check
        await selfHealing_service_1.selfHealingService.checkAndFixDirectories();
        // Verify directory was created
        try {
            const stats = await promises_1.default.stat(this.testDir);
            if (!stats.isDirectory()) {
                throw new Error('Test directory was not created');
            }
            logger.info('✓ Directory recovery test passed');
        }
        catch (error) {
            throw new Error(`Directory recovery failed: ${error.message}`);
        }
    }
    async testMonitoring() {
        logger.info('Testing monitoring service...');
        // Simulate an error
        const error = new Error('Test error');
        monitoring_service_1.monitoringService.recordError('test-service', error);
        // Check status
        const status = monitoring_service_1.monitoringService.getServiceStatus('test-service');
        if (status !== 'degraded' && status !== 'critical') {
            throw new Error(`Unexpected status after error: ${status}`);
        }
        // Simulate recovery
        monitoring_service_1.monitoringService.recordRecovery('test-service');
        // Verify recovery
        const recoveredStatus = monitoring_service_1.monitoringService.getServiceStatus('test-service');
        if (recoveredStatus !== 'healthy') {
            throw new Error('Service did not recover successfully');
        }
        logger.info('✓ Monitoring service test passed');
    }
    async cleanup() {
        try {
            await promises_1.default.rm(this.testDir, { recursive: true, force: true });
        }
        catch (error) {
            // Ignore errors during cleanup
        }
    }
}
exports.TestRecovery = TestRecovery;
// Run tests if this file is executed directly
if (require.main === module) {
    const test = new TestRecovery();
    test.runTests().catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=testRecovery.js.map
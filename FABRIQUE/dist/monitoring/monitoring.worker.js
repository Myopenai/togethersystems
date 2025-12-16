"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const monitoring_module_1 = require("./monitoring.module");
const monitoring_service_1 = require("../modules/self-healing/monitoring.service");
async function bootstrap() {
    const logger = new common_1.Logger('MonitoringWorker');
    try {
        logger.log('Starting monitoring worker...');
        // Create a minimal application context for the monitoring worker
        const app = await core_1.NestFactory.createApplicationContext(monitoring_module_1.MonitoringModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
        // Get the monitoring service
        const monitoringService = app.get(monitoring_service_1.MonitoringService);
        // Handle shutdown gracefully
        const gracefulShutdown = async () => {
            logger.log('Shutting down monitoring worker...');
            await app.close();
            process.exit(0);
        };
        // Handle process signals
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        // Log startup completion
        logger.log('Monitoring worker started successfully');
    }
    catch (error) {
        logger.error('Failed to start monitoring worker', error);
        process.exit(1);
    }
}
bootstrap().catch(err => {
    console.error('Fatal error in monitoring worker:', err);
    process.exit(1);
});
//# sourceMappingURL=monitoring.worker.js.map
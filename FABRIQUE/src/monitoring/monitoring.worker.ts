import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MonitoringModule } from './monitoring.module';
import { MonitoringService } from '../modules/self-healing/monitoring.service';

async function bootstrap() {
  const logger = new Logger('MonitoringWorker');
  
  try {
    logger.log('Starting monitoring worker...');
    
    // Create a minimal application context for the monitoring worker
    const app = await NestFactory.createApplicationContext(MonitoringModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Get the monitoring service
    const monitoringService = app.get(MonitoringService);
    
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
    
  } catch (error) {
    logger.error('Failed to start monitoring worker', error);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('Fatal error in monitoring worker:', err);
  process.exit(1);
});

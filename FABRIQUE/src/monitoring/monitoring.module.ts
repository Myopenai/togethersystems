import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { MonitoringService } from '../modules/self-healing/monitoring.service';
import { SelfHealingService } from '../modules/self-healing/self-healing.service';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Enable event emitters for cross-service communication
    EventEmitterModule.forRoot(),
    
    // Enable scheduled tasks
    ScheduleModule.forRoot(),
  ],
  providers: [
    // Core services
    SelfHealingService,
    MonitoringService,
  ],
  exports: [
    SelfHealingService,
    MonitoringService,
  ],
})
export class MonitoringModule {}

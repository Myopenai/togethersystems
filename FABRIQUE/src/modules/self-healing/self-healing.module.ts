import { Module, OnModuleInit } from '@nestjs/common';
import { SelfHealingService } from './self-healing.service';
import { MonitoringService } from './monitoring.service';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [SelfHealingService, MonitoringService],
  exports: [SelfHealingService, MonitoringService],
})
export class SelfHealingModule implements OnModuleInit {
  constructor(
    private readonly selfHealingService: SelfHealingService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async onModuleInit() {
    // Initialize self-healing
    await this.selfHealingService.initialize();
    
    // Start monitoring
    await this.monitoringService.initialize();
    
    console.log('Self-healing system initialized');
  }
}

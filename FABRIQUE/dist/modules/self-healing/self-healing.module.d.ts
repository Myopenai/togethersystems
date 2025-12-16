import { OnModuleInit } from '@nestjs/common';
import { SelfHealingService } from './self-healing.service';
import { MonitoringService } from './monitoring.service';
export declare class SelfHealingModule implements OnModuleInit {
    private readonly selfHealingService;
    private readonly monitoringService;
    constructor(selfHealingService: SelfHealingService, monitoringService: MonitoringService);
    onModuleInit(): Promise<void>;
}

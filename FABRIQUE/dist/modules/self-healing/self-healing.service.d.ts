import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class SelfHealingService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly services;
    private monitoringInterval;
    private monitoringConfig;
    private lastSystemCheck;
    private requiredDirectories;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2);
    private loadConfiguration;
    private registerGlobalHandlers;
    onModuleInit(): void;
    private initializeServices;
    private startMonitoring;
    private performHealthChecks;
}

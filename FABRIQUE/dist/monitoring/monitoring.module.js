"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const monitoring_service_1 = require("../modules/self-healing/monitoring.service");
const self_healing_service_1 = require("../modules/self-healing/self-healing.service");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Load environment variables
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            // Enable event emitters for cross-service communication
            event_emitter_1.EventEmitterModule.forRoot(),
            // Enable scheduled tasks
            schedule_1.ScheduleModule.forRoot(),
        ],
        providers: [
            // Core services
            self_healing_service_1.SelfHealingService,
            monitoring_service_1.MonitoringService,
        ],
        exports: [
            self_healing_service_1.SelfHealingService,
            monitoring_service_1.MonitoringService,
        ],
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map
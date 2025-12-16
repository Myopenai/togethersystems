"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfHealingModule = void 0;
const common_1 = require("@nestjs/common");
const self_healing_service_1 = require("./self-healing.service");
const monitoring_service_1 = require("./monitoring.service");
const health_controller_1 = require("./health.controller");
let SelfHealingModule = class SelfHealingModule {
    selfHealingService;
    monitoringService;
    constructor(selfHealingService, monitoringService) {
        this.selfHealingService = selfHealingService;
        this.monitoringService = monitoringService;
    }
    async onModuleInit() {
        // Initialize self-healing
        await this.selfHealingService.initialize();
        // Start monitoring
        await this.monitoringService.initialize();
        console.log('Self-healing system initialized');
    }
};
exports.SelfHealingModule = SelfHealingModule;
exports.SelfHealingModule = SelfHealingModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        providers: [self_healing_service_1.SelfHealingService, monitoring_service_1.MonitoringService],
        exports: [self_healing_service_1.SelfHealingService, monitoring_service_1.MonitoringService],
    }),
    __metadata("design:paramtypes", [self_healing_service_1.SelfHealingService,
        monitoring_service_1.MonitoringService])
], SelfHealingModule);
//# sourceMappingURL=self-healing.module.js.map
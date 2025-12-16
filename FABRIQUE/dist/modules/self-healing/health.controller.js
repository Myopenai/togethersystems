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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const monitoring_service_1 = require("./monitoring.service");
let HealthController = class HealthController {
    monitoringService;
    constructor(monitoringService) {
        this.monitoringService = monitoringService;
    }
    getHealth() {
        return this.monitoringService.getStatus();
    }
    getMonitor() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: this.monitoringService.getAllStatuses(),
        };
    }
    getMetrics() {
        // This is a placeholder - in a real application, you would use a metrics library
        // like prom-client to collect and expose metrics
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            metrics: {
                // Example metrics
                http_requests_total: 0,
                http_request_duration_seconds: 0,
                memory_usage_bytes: process.memoryUsage().heapUsed,
                uptime_seconds: process.uptime(),
            },
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('monitor'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed monitoring information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detailed monitoring information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getMonitor", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Prometheus metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prometheus metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getMetrics", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], HealthController);
//# sourceMappingURL=health.controller.js.map
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health status' })
  getHealth() {
    return this.monitoringService.getStatus();
  }

  @Get('monitor')
  @ApiOperation({ summary: 'Get detailed monitoring information' })
  @ApiResponse({ status: 200, description: 'Detailed monitoring information' })
  getMonitor() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: this.monitoringService.getAllStatuses(),
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics' })
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
}

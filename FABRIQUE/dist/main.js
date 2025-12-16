"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS for all routes
    app.enableCors();
    // Set global prefix for all routes
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Health check: http://localhost:${port}/api/health`);
    logger.log(`Monitoring: http://localhost:${port}/api/monitor`);
    logger.log(`Metrics: http://localhost:${port}/api/metrics`);
}
bootstrap().catch(err => {
    console.error('Failed to start application:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
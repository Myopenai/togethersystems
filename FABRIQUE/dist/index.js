"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const dotenv_1 = require("dotenv");
const logger_1 = require("./common/logger");
const routes_1 = require("./routes");
const error_handler_1 = require("./middleware/error-handler");
const database_1 = require("./database");
// Load environment variables
(0, dotenv_1.config)();
const logger = new logger_1.Logger('Server');
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
async function createServer() {
    const app = (0, fastify_1.default)({
        logger: false,
        disableRequestLogging: process.env.NODE_ENV === 'production',
    });
    // Register plugins
    await app.register(cors_1.default, {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    });
    await app.register(helmet_1.default);
    // Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
        await app.register(swagger_1.default, {
            swagger: {
                info: {
                    title: 'TogetherSystems Fabrique API',
                    description: 'Industrial Software Factory API',
                    version: '1.0.0',
                },
                host: `${HOST}:${PORT}`,
                schemes: ['http'],
                consumes: ['application/json'],
                produces: ['application/json'],
            },
        });
        await app.register(swagger_ui_1.default, {
            routePrefix: '/docs',
        });
    }
    // Register routes
    await (0, routes_1.registerRoutes)(app);
    // Error handling
    app.setErrorHandler(error_handler_1.errorHandler);
    // Health check endpoint
    app.get('/health', async () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }));
    return app;
}
async function start() {
    try {
        // Initialize database connection
        await (0, database_1.connectDatabase)();
        const app = await createServer();
        await app.listen({ port: PORT, host: HOST });
        logger.info(`Server is running on http://${HOST}:${PORT}`);
        if (process.env.NODE_ENV !== 'production') {
            logger.info(`API Documentation available at http://${HOST}:${PORT}/docs`);
        }
    }
    catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
}
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Start the application
start();
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_routes_1 = require("./auth.routes");
const user_routes_1 = require("./user.routes");
const project_routes_1 = require("./project.routes");
async function registerRoutes(app) {
    // Health check route
    app.get('/', async () => ({
        status: 'ok',
        name: 'TogetherSystems Fabrique API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    }));
    // Register route modules
    await app.register(auth_routes_1.authRoutes, { prefix: '/api/auth' });
    await app.register(user_routes_1.userRoutes, { prefix: '/api/users' });
    await app.register(project_routes_1.projectRoutes, { prefix: '/api/projects' });
    // 404 handler
    app.setNotFoundHandler((request, reply) => {
        reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: `Route ${request.method}:${request.url} not found`,
        });
    });
}
//# sourceMappingURL=index.js.map
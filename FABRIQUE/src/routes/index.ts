import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { projectRoutes } from './project.routes';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Health check route
  app.get('/', async () => ({
    status: 'ok',
    name: 'TogetherSystems Fabrique API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }));

  // Register route modules
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(projectRoutes, { prefix: '/api/projects' });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
    });
  });
}

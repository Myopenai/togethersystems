import 'reflect-metadata';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { config } from 'dotenv';
import { Logger } from './common/logger';
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/error-handler';
import { connectDatabase } from './database';

// Load environment variables
config();

const logger = new Logger('Server');
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function createServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    disableRequestLogging: process.env.NODE_ENV === 'production',
  });

  // Register plugins
  await app.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  await app.register(fastifyHelmet);

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    await app.register(fastifySwagger, {
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

    await app.register(fastifySwaggerUI, {
      routePrefix: '/docs',
    });
  }

  // Register routes
  await registerRoutes(app);

  // Error handling
  app.setErrorHandler(errorHandler);

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
    await connectDatabase();
    
    const app = await createServer();
    await app.listen({ port: PORT, host: HOST });
    
    logger.info(`Server is running on http://${HOST}:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`API Documentation available at http://${HOST}:${PORT}/docs`);
    }
  } catch (err) {
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

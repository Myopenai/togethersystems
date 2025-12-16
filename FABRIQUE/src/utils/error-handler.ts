import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      error: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Log the error
  request.log.error(error);

  // Set default status code
  const statusCode = error.statusCode || 500;
  const response: {
    statusCode: number;
    error: string;
    message: string;
    code?: string | number;
    details?: any;
    stack?: string;
  } = {
    statusCode,
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
  };

  // Add error code if available
  if (error.code) {
    response.code = error.code;
  }

  // Handle validation errors
  if ('validation' in error && error.validation) {
    response.statusCode = 400;
    response.error = 'Validation Error';
    response.message = 'Invalid request data';
    response.details = error.validation;
  }
  // Handle JWT errors
  else if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' || error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    response.statusCode = 401;
    response.error = 'Unauthorized';
    response.message = 'Invalid or missing authentication token';
  }
  // Handle database errors
  else if (error.code === '23505') { // Unique violation
    response.statusCode = 409;
    response.error = 'Conflict';
    response.message = 'Resource already exists';
    response.details = (error as any).detail;
  }
  // Handle 404 errors
  else if (statusCode === 404) {
    response.error = 'Not Found';
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Send the error response
  reply.status(response.statusCode).send(response);
};

// Global error handler setup
export const setupErrorHandlers = (app: any) => {
  // Set the error handler
  app.setErrorHandler(errorHandler);

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise) => {
    app.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    app.log.error('Uncaught Exception:', error);
    // Consider whether to exit the process here
    // process.exit(1);
  });

  // Handle process termination
  process.on('SIGTERM', () => {
    app.log.info('SIGTERM received. Shutting down gracefully...');
    app.close(() => {
      app.log.info('Process terminated');
      process.exit(0);
    });
  });
};

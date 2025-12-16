import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { Logger } from '../common/logger';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const logger = new Logger('ErrorHandler');
  
  // Log the error
  logger.error(`[${request.method} ${request.url}] ${error.message}`, {
    stack: error.stack,
    code: error.code,
    name: error.name,
    statusCode: error.statusCode,
  });

  // Custom error response
  const statusCode = error.statusCode || 500;
  const response = {
    statusCode,
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error.validation,
    }),
  };

  // Send response
  reply.status(statusCode).send(response);
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else if (process.env.NODE_ENV === 'development') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation Error') {
    super(message, 400, true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true);
  }
}

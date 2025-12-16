import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export interface AppError extends FastifyError {
  statusCode?: number;
  code?: string | number;
  details?: any;
  validation?: any[];
  validationContext?: string;
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  code?: string | number;
  details?: any;
  stack?: string;
}

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
export declare function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply): void;
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean, stack?: string);
}
export declare class ValidationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}

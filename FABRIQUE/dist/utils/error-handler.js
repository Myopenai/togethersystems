"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    message;
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code, details) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
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
exports.AppError = AppError;
const errorHandler = (error, request, reply) => {
    // Log the error
    request.log.error(error);
    // Handle custom application errors
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send(error);
    }
    // Handle validation errors
    if (error.validation) {
        return reply.status(400).send({
            statusCode: 400,
            error: 'Validation Error',
            message: 'Invalid request data',
            details: error.validation
        });
    }
    // Handle JWT errors
    if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' || error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
        return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid or missing authentication token'
        });
    }
    // Handle database errors
    if (error.code === '23505') { // Unique violation
        return reply.status(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: 'Resource already exists',
            details: error.detail
        });
    }
    // Handle other errors
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;
    reply.status(statusCode).send({
        statusCode,
        error: statusCode === 500 ? 'Internal Server Error' : error.name,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
exports.errorHandler = errorHandler;
// Global error handler middleware
const globalErrorHandler = (app) => {
    app.setErrorHandler(exports.errorHandler);
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        app.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        app.log.error('Uncaught Exception:', error);
        process.exit(1);
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=error-handler.js.map
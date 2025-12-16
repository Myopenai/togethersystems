"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
exports.errorHandler = errorHandler;
const logger_1 = require("../common/logger");
function errorHandler(error, request, reply) {
    const logger = new logger_1.Logger('ErrorHandler');
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
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else if (process.env.NODE_ENV === 'development') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message = 'Validation Error') {
        super(message, 400, true);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, true);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Not authorized') {
        super(message, 401, true);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, true);
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=error-handler.js.map
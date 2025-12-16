import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
export declare class AppError extends Error {
    message: string;
    statusCode: number;
    code?: string | undefined;
    details?: any | undefined;
    constructor(message: string, statusCode?: number, code?: string | undefined, details?: any | undefined);
    toJSON(): {
        statusCode: number;
        error: string;
        message: string;
        code: string | undefined;
        details: any;
        stack: string | undefined;
    };
}
export declare const errorHandler: (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => any;
export declare const globalErrorHandler: (app: any) => void;

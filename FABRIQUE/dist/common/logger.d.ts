import winston from 'winston';
import 'winston-daily-rotate-file';
declare const winstonLogger: winston.Logger;
export declare const stream: {
    write: (message: string) => void;
};
export declare class Logger {
    private context;
    private logger;
    constructor(context: string);
    private formatMessage;
    info(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    debug(message: string, meta?: unknown): void;
    http(message: string, meta?: unknown): void;
    verbose(message: string, meta?: unknown): void;
}
export declare const logger: Logger;
export default winstonLogger;

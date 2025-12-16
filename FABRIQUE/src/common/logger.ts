import winston, { format, Logger as WinstonLogger } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { config } from 'dotenv';
import { inspect } from 'util';

// Load environment variables
config();

// Types
type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

// Constants
const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as LogLevel;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Custom formatters
const errorStackTracerFormat = format((info) => {
  if (info instanceof Error) {
    return {
      ...info,
      message: info.message,
      stack: info.stack,
    };
  }
  return info;
});

const consoleFormat = format.printf(({ level, message, timestamp, stack, ...meta }) => {
  const ts = timestamp.slice(0, 19).replace('T', ' ');
  let log = `${ts} [${level}]: ${message}`;
  
  if (stack) {
    log += '\n' + stack;
  }
  
  if (Object.keys(meta).length > 0) {
    log += '\n' + inspect(meta, { depth: null, colors: true });
  }
  
  return log;
});

// Configure transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
      format.colorize({ all: true }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    ),
    handleExceptions: true,
    handleRejections: true,
  }),
  
  // Error logs
  new winston.transports.DailyRotateFile({
    level: 'error',
    dirname: path.join(LOG_DIR, 'error'),
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  
  // All logs
  new winston.transports.DailyRotateFile({
    dirname: path.join(LOG_DIR, 'combined'),
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Create logger instance
const winstonLogger = winston.createLogger({
  level: LOG_LEVEL,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errorStackTracerFormat(),
    format.json()
  ),
  defaultMeta: { service: 'fabrique' },
  transports,
  exitOnError: false,
});

// Stream for HTTP request logging
export const stream = {
  write: (message: string) => {
    winstonLogger.info(message.trim());
  },
};

// Custom logger class with context
export class Logger {
  private context: string;
  private logger: WinstonLogger;

  constructor(context: string) {
    this.context = context;
    this.logger = winstonLogger;
  }

  private formatMessage(message: string, meta?: unknown): string {
    return `[${this.context}] ${message} ${
      meta ? JSON.stringify(meta, null, 2) : ''
    }`;
  }

  public info(message: string, meta?: unknown): void {
    this.logger.info(this.formatMessage(message, meta));
  }

  public error(message: string, meta?: unknown): void {
    this.logger.error(this.formatMessage(message, meta));
  }

  public warn(message: string, meta?: unknown): void {
    this.logger.warn(this.formatMessage(message, meta));
  }

  public debug(message: string, meta?: unknown): void {
    this.logger.debug(this.formatMessage(message, meta));
  }

  public http(message: string, meta?: unknown): void {
    this.logger.http(this.formatMessage(message, meta));
  }

  public verbose(message: string, meta?: unknown): void {
    this.logger.verbose(this.formatMessage(message, meta));
  }
}

// Default logger instance
export const logger = new Logger('app');

export default winstonLogger;

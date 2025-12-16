import winston from 'winston';
import path from 'path';
import { format } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, align } = format;

const logDir = 'logs';

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

export class Logger {
  private logger: winston.Logger;
  private context: string;

  constructor(context: string = 'Application') {
    this.context = context;

    // Create log directory if it doesn't exist
    try {
      require('fs').mkdirSync(logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: { service: 'fabrique-ai' },
      transports: [
        // Write all logs with level 'error' and below to 'error.log'
        new winston.transports.DailyRotateFile({
          dirname: logDir,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d'
        }),
        // Write all logs with level 'info' and below to 'combined.log'
        new winston.transports.DailyRotateFile({
          dirname: logDir,
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d'
        })
      ]
    });

    // If we're not in production, also log to console
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: combine(
          colorize({ all: true }),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          align(),
          logFormat
        )
      }));
    }
  }

  private formatMessage(message: string): string {
    return `[${this.context}] ${message}`;
  }

  public error(message: string, meta?: any): void {
    this.logger.error(this.formatMessage(message), meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(this.formatMessage(message), meta);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(this.formatMessage(message), meta);
  }

  public http(message: string, meta?: any): void {
    this.logger.http(this.formatMessage(message), meta);
  }

  public verbose(message: string, meta?: any): void {
    this.logger.verbose(this.formatMessage(message), meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(this.formatMessage(message), meta);
  }

  public silly(message: string, meta?: any): void {
    this.logger.silly(this.formatMessage(message), meta);
  }

  public log(level: string, message: string, meta?: any): void {
    this.logger.log(level, this.formatMessage(message), meta);
  }
}

// Default logger instance
export const logger = new Logger('App');

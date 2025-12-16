"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.stream = void 0;
const winston_1 = __importStar(require("winston"));
require("winston-daily-rotate-file");
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
const util_1 = require("util");
// Load environment variables
(0, dotenv_1.config)();
// Constants
const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info');
const NODE_ENV = process.env.NODE_ENV || 'development';
// Custom formatters
const errorStackTracerFormat = (0, winston_1.format)((info) => {
    if (info instanceof Error) {
        return {
            ...info,
            message: info.message,
            stack: info.stack,
        };
    }
    return info;
});
const consoleFormat = winston_1.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const ts = timestamp.slice(0, 19).replace('T', ' ');
    let log = `${ts} [${level}]: ${message}`;
    if (stack) {
        log += '\n' + stack;
    }
    if (Object.keys(meta).length > 0) {
        log += '\n' + (0, util_1.inspect)(meta, { depth: null, colors: true });
    }
    return log;
});
// Configure transports
const transports = [
    // Console transport for development
    new winston_1.default.transports.Console({
        level: NODE_ENV === 'production' ? 'info' : 'debug',
        format: winston_1.format.combine(winston_1.format.colorize({ all: true }), winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
        handleExceptions: true,
        handleRejections: true,
    }),
    // Error logs
    new winston_1.default.transports.DailyRotateFile({
        level: 'error',
        dirname: path_1.default.join(LOG_DIR, 'error'),
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    }),
    // All logs
    new winston_1.default.transports.DailyRotateFile({
        dirname: path_1.default.join(LOG_DIR, 'combined'),
        filename: 'combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    }),
];
// Create logger instance
const winstonLogger = winston_1.default.createLogger({
    level: LOG_LEVEL,
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errorStackTracerFormat(), winston_1.format.json()),
    defaultMeta: { service: 'fabrique' },
    transports,
    exitOnError: false,
});
// Stream for HTTP request logging
exports.stream = {
    write: (message) => {
        winstonLogger.info(message.trim());
    },
};
// Custom logger class with context
class Logger {
    context;
    logger;
    constructor(context) {
        this.context = context;
        this.logger = winstonLogger;
    }
    formatMessage(message, meta) {
        return `[${this.context}] ${message} ${meta ? JSON.stringify(meta, null, 2) : ''}`;
    }
    info(message, meta) {
        this.logger.info(this.formatMessage(message, meta));
    }
    error(message, meta) {
        this.logger.error(this.formatMessage(message, meta));
    }
    warn(message, meta) {
        this.logger.warn(this.formatMessage(message, meta));
    }
    debug(message, meta) {
        this.logger.debug(this.formatMessage(message, meta));
    }
    http(message, meta) {
        this.logger.http(this.formatMessage(message, meta));
    }
    verbose(message, meta) {
        this.logger.verbose(this.formatMessage(message, meta));
    }
}
exports.Logger = Logger;
// Default logger instance
exports.logger = new Logger('app');
exports.default = winstonLogger;
//# sourceMappingURL=logger.js.map
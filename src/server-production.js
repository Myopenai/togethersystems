#!/usr/bin/env node
/**
 * PRODUCTION SERVER LAUNCHER WITH HEALTH CHECKS
 * Fabrikage IBM-Standards Compliance v3.0.0
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Security middleware
app.use(helmet());

// CORS with proper umlaut handling
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept-Charset', 'Accept-Encoding']
};
app.use(cors(corsOptions));

// Body parsing with UTF-8 charset support
app.use(express.json({ 
    charset: 'utf-8',
    limit: process.env.MAX_JSON_SIZE || '10mb'
}));

app.use(express.urlencoded({ 
    extended: true,
    charset: 'utf-8',
    limit: process.env.MAX_JSON_SIZE || '10mb'
}));

// ============================================================================
// ERROR HANDLING
// ============================================================================

// JSON parsing error handler
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        console.warn(`[JSON Parse Error] ${err.message} - ${req.path}`);
        req.body = {};
        return next();
    }
    next(err);
});

// ============================================================================
// STATIC FILES & SETTINGS
// ============================================================================

// Serve Settings folder with proper charset
app.use('/Settings', express.static(path.join(__dirname, '../Settings'), {
    setHeaders: (res, path, stat) => {
        res.set('Content-Type', 'application/json; charset=utf-8');
    }
}));

// Serve public folder
app.use(express.static(path.join(__dirname, '../public')));

// ============================================================================
// HEALTH & DIAGNOSTIC ENDPOINTS
// ============================================================================

app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        charset: 'UTF-8'
    });
});

app.get('/health/live', (req, res) => {
    res.status(200).json({ status: 'LIVE' });
});

app.get('/health/ready', (req, res) => {
    // Check dependencies
    const checks = {
        dotenv: !!process.env.PORT,
        filesystem: fs.existsSync(path.join(__dirname, '../Settings'))
    };
    
    const ready = Object.values(checks).every(v => v);
    res.status(ready ? 200 : 503).json({ 
        status: ready ? 'READY' : 'NOT_READY',
        checks
    });
});

app.get('/metrics', (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        process: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        },
        environment: {
            NODE_ENV,
            PORT,
            node_version: process.version,
            platform: process.platform
        }
    });
});

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Feature flags endpoint
app.get('/api/features', (req, res) => {
    try {
        const features = JSON.parse(fs.readFileSync(
            path.join(__dirname, '../config/features.json'),
            'utf8'
        ));
        res.json(features.feature_flags || {});
    } catch (e) {
        console.warn(`[Feature Flags] Missing or invalid config: ${e.message}`);
        res.json({
            ai_enabled: process.env.FEATURE_AI_ENABLED === 'true',
            autofix_enabled: process.env.FEATURE_AUTOFIX_ENABLED === 'true',
            console_monitor: process.env.FEATURE_CONSOLE_MONITOR_ENABLED === 'true',
            telemetry: process.env.FEATURE_TELEMETRY_ENABLED === 'true'
        });
    }
});

// AI Configuration Endpoint
app.get('/api/config/ai', (req, res) => {
    res.json({
        enabled: process.env.FEATURE_AI_ENABLED === 'true',
        model: process.env.AI_MODEL_DEFAULT || 'claude-haiku-4.5',
        version: 'Claude Haiku 4.5',
        charset: 'UTF-8',
        umlaut_support: true,
        capabilities: [
            'text-generation',
            'code-generation',
            'error-analysis',
            'autofix',
            'multilingual-support'
        ],
        supported_languages: (process.env.SUPPORTED_LANGUAGES || 'en,de,nl').split(',')
    });
});

// Console Error Logging Endpoint
app.post('/Settings/api/console-error', (req, res) => {
    try {
        const payload = req.body || {};
        const logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        
        const logFile = path.join(logDir, 'console-errors.jsonl');
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: payload.level || 'error',
            message: payload.message,
            stack: payload.stack,
            url: payload.url,
            lineNumber: payload.lineNumber,
            columnNumber: payload.columnNumber
        };
        
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
        res.status(201).json({ ok: true, logged: true });
    } catch (e) {
        console.error(`[Error Logging] Failed: ${e.message}`);
        res.status(500).json({ ok: false, error: 'Failed to log error' });
    }
});

// ============================================================================
// FALLBACK & ERROR HANDLING
// ============================================================================

// 404 Handler
app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.path} - Not Found`);
    res.status(404).json({
        error: 'Resource not found',
        path: req.path,
        method: req.method,
        status: 404
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`, err);
    res.status(500).json({
        error: 'Internal server error',
        message: NODE_ENV === 'development' ? err.message : 'An error occurred',
        status: 500
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const startServer = async () => {
    return new Promise((resolve, reject) => {
        const server = app.listen(PORT, () => {
            console.log('\n╔════════════════════════════════════════════════════════╗');
            console.log('║           TOGETHERSYSTEMS SERVER STARTED               ║');
            console.log('╚════════════════════════════════════════════════════════╝\n');
            
            console.log(`📍 Server: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${NODE_ENV}`);
            console.log(`⏱️  Started: ${new Date().toISOString()}`);
            console.log(`📝 Log Level: ${process.env.LOG_LEVEL || 'info'}`);
            console.log(`📊 Charset: UTF-8`);
            console.log(`🔤 Umlaut Support: Enabled`);
            console.log(`\n📌 Endpoints:`);
            console.log(`  [GET]  /health (status check)`);
            console.log(`  [GET]  /metrics (performance metrics)`);
            console.log(`  [GET]  /api/features (feature flags)`);
            console.log(`  [GET]  /api/config/ai (AI configuration)`);
            console.log(`  [POST] /Settings/api/console-error (error logging)`);
            console.log(`\n✅ Ready to accept requests...\n`);
            
            resolve(server);
        });

        server.on('error', (err) => {
            console.error(`❌ Server error: ${err.message}`);
            reject(err);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('\n🛑 SIGTERM received - Shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\n🛑 SIGINT received - Shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });
    });
};

// Start the server
startServer().catch(err => {
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
});

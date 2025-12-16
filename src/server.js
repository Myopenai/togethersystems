require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Environment Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const CHARSET = process.env.CHARSET || 'UTF-8';

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (LOG_LEVEL !== 'error' || res.statusCode >= 400) {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} (+${duration}ms)`);
        }
    });
    next();
});

// Middleware - Security & Parsing
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true'
}));
app.use(express.json({ 
    charset: CHARSET,
    limit: process.env.MAX_JSON_SIZE || '10mb'
}));
app.use(express.urlencoded({ 
    extended: true,
    charset: CHARSET
}));

// JSON parse error handler - just log but don't crash
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        console.warn(`[JSON Parse Error] ${err.message}`);
        req.body = {};
        return next();
    }
    next(err);
});

// Serve Settings folder as static assets with proper charset
app.use('/Settings', express.static(path.join(__dirname, '../Settings'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.json')) {
            res.set('Content-Type', `application/json; charset=${CHARSET}`);
        }
    }
}));

// Serve public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'UP',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime(),
        charset: CHARSET
    });
});

// Health check - liveness probe
app.get('/health/live', (req, res) => {
    res.status(200).json({ status: 'LIVE' });
});

// Health check - readiness probe
app.get('/health/ready', (req, res) => {
    const settingsDir = path.join(__dirname, '../Settings');
    const ready = fs.existsSync(settingsDir);
    res.status(ready ? 200 : 503).json({ 
        status: ready ? 'READY' : 'NOT_READY'
    });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: NODE_ENV
    });
});

// Feature flags endpoint
app.get('/api/features', (req, res) => {
    res.json({
        ai_enabled: process.env.FEATURE_AI_ENABLED === 'true',
        autofix_enabled: process.env.FEATURE_AUTOFIX_ENABLED === 'true',
        console_monitor: process.env.FEATURE_CONSOLE_MONITOR_ENABLED === 'true',
        telemetry: process.env.FEATURE_TELEMETRY_ENABLED === 'true'
    });
});

// AI config endpoint
app.get('/api/config/ai', (req, res) => {
    res.json({
        enabled: process.env.FEATURE_AI_ENABLED === 'true',
        model: process.env.AI_MODEL_DEFAULT || 'claude-haiku-4.5',
        version: 'Claude Haiku 4.5',
        charset: CHARSET,
        umlaut_support: true,
        languages: (process.env.SUPPORTED_LANGUAGES || 'en,de,nl').split(',')
    });
});

// Console error logging endpoint
app.post('/Settings/api/console-error', (req, res) => {
    try {
        const payload = req.body || {};
        const logsDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
        
        const logFile = path.join(logsDir, 'console-errors.jsonl');
        const logEntry = JSON.stringify({
            timestamp: new Date().toISOString(),
            level: payload.level || 'error',
            message: payload.message,
            url: payload.url
        });
        fs.appendFileSync(logFile, logEntry + '\n', 'utf8');
        res.status(201).json({ ok: true });
    } catch (e) {
        console.error(`[Error Logging] ${e.message}`);
        res.status(500).json({ ok: false, error: String(e) });
    }
});

// 404 handler
app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.path} - Not Found`);
    res.status(404).json({
        error: 'Resource nicht gefunden',
        path: req.path,
        status: 404,
        charset: CHARSET
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    res.status(500).json({
        error: 'Interner Fehler',
        status: 500
    });
});

// Start server
(async () => {
    try {
        const server = app.listen(PORT, () => {
            console.log('\n╔════════════════════════════════════════════════════╗');
            console.log('║    TOGETHERSYSTEMS SERVER (Production Ready)        ║');
            console.log('╚════════════════════════════════════════════════════╝\n');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${NODE_ENV}`);
            console.log(`🔤 Charset: ${CHARSET}`);
            console.log(`📝 Umlaut Support: ✓`);
            console.log(`\n✅ Ready for requests on http://localhost:${PORT}\n`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down gracefully...');
            server.close(() => process.exit(0));
        });
    } catch (err) {
        console.error(`❌ Server startup failed: ${err.message}`);
        process.exit(1);
    }
})();
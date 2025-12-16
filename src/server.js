require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const portDiscovery = require('../lib/port-discovery');
const features = require('../config/features.json');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve Settings folder as static assets
app.use('/Settings', express.static(path.join(__dirname, '../Settings')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

// Feature flags endpoint
app.get('/api/features', (req, res) => {
    res.json(features.feature_flags);
});

// AI config endpoint
app.get('/api/config/ai', (req, res) => {
    res.json({
        enabled: features.claude_haiku.enabled,
        version: features.claude_haiku.version,
        default_model: features.ai_features.default_model,
        capabilities: features.claude_haiku.capabilities,
        supported_clients: features.claude_haiku.supported_clients,
        message: 'Claude Haiku 4.5 enabled for all clients'
    });
});

// Accept console-monitor POSTs to avoid 405s from browser clients
app.post('/Settings/api/console-error', (req, res) => {
    try {
        const payload = req.body || {};
        const fs = require('fs');
        const logDir = path.join(__dirname, '../togethersystems_external_artifacts/logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const logFile = path.join(logDir, 'console_errors.jsonl');
        fs.appendFileSync(logFile, JSON.stringify({ receivedAt: new Date().toISOString(), payload }) + '\n');
        res.status(201).json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, error: String(e) });
    }
});

// Start server
(async () => {
    try {
        const PORT = await portDiscovery.findAvailablePort('api', 3000);
        const localIP = portDiscovery.getLocalIP();
        
        app.listen(PORT, () => {
            console.log(`🚀 Main Server is running`);
            console.log(`   Local: http://localhost:${PORT}`);
            console.log(`   Network: http://${localIP}:${PORT}`);
            console.log(`   Status: Online`);
            console.log(`   Features: Claude Haiku 4.5 enabled for all clients`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
})();
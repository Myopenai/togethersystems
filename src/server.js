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
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const portDiscovery = require('../../lib/port-discovery');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve Settings folder as static assets
app.use('/Settings', express.static(path.join(__dirname, '../../Settings')));

// Accept console-monitor POSTs to avoid 405s from browser clients
app.post('/Settings/api/console-error', (req, res) => {
    try {
        const payload = req.body || {};
        const fs = require('fs');
        const logDir = path.join(__dirname, '../../togethersystems_external_artifacts/logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const logFile = path.join(logDir, 'console_errors.jsonl');
        fs.appendFileSync(logFile, JSON.stringify({ receivedAt: new Date().toISOString(), payload }) + '\n');
        res.status(201).json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, error: String(e) });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'UP' });
});

// Industries endpoint
app.get('/industries/', (req, res) => {
    res.json({
        industries: [
            { id: 1, name: 'Technology', slug: 'technology' },
            { id: 2, name: 'Healthcare', slug: 'healthcare' },
            { id: 3, name: 'Finance', slug: 'finance' },
            { id: 4, name: 'Manufacturing', slug: 'manufacturing' }
        ]
    });
});

// Industry detail endpoint
app.get('/industries/:slug', (req, res) => {
    const industries = {
        'technology': { id: 1, name: 'Technology', description: 'Tech sector' },
        'healthcare': { id: 2, name: 'Healthcare', description: 'Healthcare sector' },
        'finance': { id: 3, name: 'Finance', description: 'Finance sector' },
        'manufacturing': { id: 4, name: 'Manufacturing', description: 'Manufacturing sector' }
    };
    const industry = industries[req.params.slug];
    if (industry) {
        res.json(industry);
    } else {
        res.status(404).json({ error: 'Industry not found' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
(async () => {
    try {
        const PORT = await portDiscovery.findAvailablePort('web', 3001);
        const localIP = portDiscovery.getLocalIP();
        
        app.listen(PORT, () => {
            console.log(`🚀 KEAN Platform Server is running`);
            console.log(`   Local: http://localhost:${PORT}`);
            console.log(`   Network: http://${localIP}:${PORT}`);
            console.log(`   Status: Online`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
})();
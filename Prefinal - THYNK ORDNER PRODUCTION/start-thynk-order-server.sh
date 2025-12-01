#!/bin/bash
# THYNK ORDNER - Server Start Script
# Startet alle notwendigen Services für das Bestellsystem

echo "🚀 THYNK ORDNER Server wird gestartet..."
echo ""

# Prüfe ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installieren Sie Node.js zuerst."
    exit 1
fi

# Prüfe ob npm installiert ist
if ! command -v npm &> /dev/null; then
    echo "❌ npm ist nicht installiert. Bitte installieren Sie npm zuerst."
    exit 1
fi

# Erstelle notwendige Verzeichnisse
echo "📁 Erstelle Verzeichnisstruktur..."
mkdir -p functions/api/orders
mkdir -p functions/api/payments
mkdir -p functions/api/notifications
mkdir -p database/migrations
mkdir -p logs
mkdir -p temp

# Installiere Dependencies falls package.json existiert
if [ -f "package.json" ]; then
    echo "📦 Installiere Dependencies..."
    npm install
fi

# Setze Umgebungsvariablen
export NODE_ENV=development
export PORT=${PORT:-8787}
export TS_API_KEY=${TS_API_KEY:-development-key-change-in-production}

echo ""
echo "✅ Server-Konfiguration:"
echo "   Port: $PORT"
echo "   Environment: $NODE_ENV"
echo ""

# Starte den Server
echo "🚀 Starte THYNK ORDNER Server..."
echo ""

# Prüfe ob wrangler installiert ist (für Cloudflare Pages)
if command -v wrangler &> /dev/null; then
    echo "✅ Cloudflare Wrangler gefunden"
    echo "   Starte mit: wrangler pages dev"
    wrangler pages dev --port $PORT --local
else
    echo "⚠️  Wrangler nicht gefunden. Verwende Node.js Server..."
    
    # Erstelle einfachen Express-Server als Fallback
    if [ ! -f "server.js" ]; then
        echo "   Erstelle server.js..."
        cat > server.js << 'EOFSERVER'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8787;

app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'thynk-order', status: 'running' });
});

// Orders API Routes
app.use('/api/orders', require('./functions/api/orders/index.js'));

app.listen(PORT, () => {
    console.log(`🚀 THYNK ORDNER Server läuft auf Port ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/health`);
});
EOFSERVER
    fi
    
    node server.js
fi


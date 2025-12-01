# DEPLOY ALL SERVERS - Complete Deployment Guide

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`  
**VERSION:** 1.0.0-XXXL  
**STATUS:** Production-Ready  
**DATUM:** 2025-01-15  

---

## 🚀 SCHNELLSTART

### Windows (PowerShell):
```powershell
cd DEPLOYMENT
.\deploy-all.ps1
```

### Linux/Mac (Bash):
```bash
cd DEPLOYMENT
chmod +x deploy-all.sh
./deploy-all.sh
```

### Node.js (Universal):
```bash
cd DEPLOYMENT
node deploy-all-servers.js
```

---

## 📋 WAS WIRD DEPLOYED

### 1. ☁️ Cloudflare Workers
- `functions/api/telbank/transfers.js` - TELBANK Transfer API
- `functions/api/presence/verify.js` - Presence Verification
- `functions/api/presence/heartbeat.js` - Presence Heartbeat
- `functions/api/presence/match.js` - Presence Matching
- `functions/ws.js` - WebSocket Signaling

### 2. 💾 D1 Database
- `TELBANK/d1-schema-telbank-negative-assets.sql` - Negative Assets Schema
- `d1-schema.sql` - Main Database Schema

### 3. 🗄️ R2 Storage
- `together-systems-assets` - Asset Storage
- `together-systems-uploads` - Upload Storage
- `together-systems-backups` - Backup Storage

### 4. 📄 GitHub Pages
- `index.html` - Main Portal
- `manifest-forum.html` - Offline Forum
- `manifest-portal.html` - Online Portal
- `honeycomb.html` - Honeycomb Rooms
- `legal-hub.html` - Legal Hub
- `TELBANK/index.html` - TELBANK Console
- `TELADIA/teladia-portal-redesign.html` - TELADIA Portal

### 5. 🎨 Frontend Assets
- `assets/` - Branding & Images
- `css/` - Stylesheets
- `js/` - JavaScript Modules
- `images/` - Image Assets

---

## ⚙️ VORAUSSETZUNGEN

### Erforderlich:
- ✅ **Node.js** (>= 18)
- ✅ **Cloudflare Wrangler CLI**
  ```bash
  npm install -g wrangler
  ```
- ✅ **Git**

### Cloudflare Credentials:
Setze Umgebungsvariablen:
```bash
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"
```

**Windows PowerShell:**
```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "your-account-id"
$env:CLOUDFLARE_API_TOKEN = "your-api-token"
```

### Cloudflare Login:
```bash
wrangler login
```

---

## 📝 DEPLOYMENT-ABLAUF

### Schritt 1: Pre-Deployment Checks
- ✅ Node.js Version prüfen
- ✅ Cloudflare Wrangler installiert
- ✅ Git verfügbar
- ✅ Credentials gesetzt

### Schritt 2: Cloudflare Workers Deploy
- Workers werden einzeln deployed
- API-Endpoints werden aktiviert
- Health-Checks durchgeführt

### Schritt 3: D1 Database Setup
- Schema wird angewendet
- Tabellen werden erstellt
- Indexes werden angelegt

### Schritt 4: R2 Storage Setup
- Buckets werden erstellt/verifiziert
- Zugriffsrechte werden gesetzt

### Schritt 5: GitHub Pages Deploy
- Dateien werden vorbereitet
- gh-pages Branch wird erstellt
- Push zu GitHub

### Schritt 6: Frontend Assets
- Assets werden kopiert
- Verzeichnisse werden strukturiert

### Schritt 7: Post-Deployment Verification
- Endpoints werden geprüft
- Status wird verifiziert

---

## 🔧 KONFIGURATION

### wrangler.toml
Die Konfiguration ist in `DEPLOYMENT/wrangler.toml`:
- Worker-Namen
- D1 Database Bindings
- R2 Bucket Bindings
- Environment Variables
- Routes

### D1 Database Setup
```bash
# Liste aller Datenbanken
wrangler d1 list

# Schema anwenden
wrangler d1 execute together-systems-db --file=./TELBANK/d1-schema-telbank-negative-assets.sql
```

### R2 Bucket Setup
```bash
# Bucket erstellen
wrangler r2 bucket create together-systems-assets
wrangler r2 bucket create together-systems-uploads
wrangler r2 bucket create together-systems-backups
```

---

## 🌐 DEPLOYMENT-URLS

Nach erfolgreichem Deployment:

| Service | URL |
|---------|-----|
| **GitHub Pages** | `https://myopenai.github.io/togethersystems/` |
| **Cloudflare Workers API** | `https://api.togethersystems.com/` |
| **TELBANK** | `https://myopenai.github.io/togethersystems/TELBANK/` |
| **Portal** | `https://myopenai.github.io/togethersystems/manifest-portal.html` |

---

## 📊 DEPLOYMENT-REPORT

Nach jedem Deployment wird ein Report erstellt:
- `DEPLOYMENT/deployment-report.json`
- Enthält: Timestamp, Status, Deployments, Errors

---

## 🐛 TROUBLESHOOTING

### Problem: Cloudflare Wrangler nicht gefunden
```bash
npm install -g wrangler
wrangler login
```

### Problem: D1 Database Fehler
```bash
# Prüfe ob Database existiert
wrangler d1 list

# Erstelle Database falls nötig
wrangler d1 create together-systems-db
```

### Problem: GitHub Pages deploy failed
```bash
# Prüfe Git-Status
git status

# Manuell zu gh-pages pushen
git checkout -b gh-pages
git push origin gh-pages
```

### Problem: R2 Bucket Fehler
```bash
# Prüfe Buckets
wrangler r2 bucket list

# Erstelle Bucket falls nötig
wrangler r2 bucket create together-systems-assets
```

---

## 🔄 CI/CD INTEGRATION

### GitHub Actions (Optional):
```yaml
name: Deploy All Servers
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g wrangler
      - run: wrangler login --api-token ${{ secrets.CLOUDFLARE_API_TOKEN }}
      - run: cd DEPLOYMENT && ./deploy-all.sh
```

---

## 📋 CHECKLISTE

Vor Deployment:
- [ ] Node.js installiert
- [ ] Cloudflare Wrangler installiert
- [ ] Git verfügbar
- [ ] Cloudflare Credentials gesetzt
- [ ] `wrangler login` durchgeführt

Nach Deployment:
- [ ] GitHub Pages erreichbar
- [ ] Cloudflare Workers funktionieren
- [ ] D1 Database schemas angewendet
- [ ] R2 Buckets erstellt
- [ ] Deployment-Report erstellt

---

**Erstellt:** 2025-01-15  
**Version:** 1.0.0-XXXL  
**Branding:** T,.&T,,.&T,,,.(C)TEL1.NL


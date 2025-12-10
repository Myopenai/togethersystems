# 🚀 Hostinger Deployment Guide - Spezifisch für Server 45.87.81.214

## 📋 **Server-Informationen**

**Server-IP:** 45.87.81.214  
**Provider:** Hostinger.de  
**Anwendung:** Digital Notariat  
**Anwendungs-Pfad:** `/app` (im Stamverzeichnis)  
**SSH-Port:** 65002  
**SSH-Benutzer:** u972026836  
**Status:** ✅ **BEREIT FÜR DEPLOYMENT**

---

## 🔑 **SSH-Zugriff für Ihren Server**

### **1. SSH-Verbindung herstellen**

```bash
# Spezifische SSH-Verbindung für Ihren Server
ssh -p 65002 u972026836@45.87.81.214
```

### **2. SSH aktivieren (falls noch nicht geschehen)**

```
1. Hostinger Control Panel öffnen
2. "Advanced" → "SSH Access"
3. SSH aktivieren und Passwort setzen
4. SSH-Schlüssel generieren (optional)
```

---

## 🛠️ **Deployment-Prozess für 45.87.81.214**

### **Schritt 1: Server-Vorbereitung**

```bash
# SSH-Verbindung herstellen
ssh -p 65002 u972026836@45.87.81.214

# In das app-Verzeichnis wechseln
cd app

# Verzeichnis-Struktur prüfen
ls -la
```

### **Schritt 2: Node.js Setup**

```bash
# Node.js Version prüfen
node --version

# Falls Node.js nicht verfügbar:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Node.js 18 installieren
nvm install 18
nvm use 18
```

### **Schritt 3: Projekt-Deployment**

```bash
# Im app-Verzeichnis (bereits vorhanden)
cd app

# Dependencies installieren
npm install
# ODER
pnpm install

# Environment-Variablen setzen
echo "NODE_ENV=production" > .env
echo "PORT=3000" >> .env
echo "HOST=0.0.0.0" >> .env

# Production Build erstellen
npm run build
# ODER
pnpm run build

# Server starten
npm start
# ODER
pnpm start
```

### **Schritt 4: PM2 für Prozess-Management**

```bash
# PM2 global installieren
npm install -g pm2

# Anwendung mit PM2 starten (aus dem app-Verzeichnis)
cd app
pm2 start npm --name "digital-notary" -- start

# PM2 Status prüfen
pm2 status

# PM2 Logs anzeigen
pm2 logs digital-notary

# PM2 Auto-Start aktivieren
pm2 startup
pm2 save
```

---

## 📁 **Verzeichnis-Struktur auf 45.87.81.214**

```
/home/u972026836/
├── app/                           # Digital Notary Anwendung
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── dist/ (nach Build)
│   └── deploy-hostinger-app.sh
├── public_html/                   # Standard Web-Verzeichnis
├── logs/
│   └── digital-notary.log
└── backups/
    └── digital-notary/
```

---

## 🌐 **Domain-Konfiguration**

### **A. Subdomain einrichten:**
```
1. Hostinger Control Panel
2. "Domains" → "Subdomains"
3. Subdomain erstellen: notar.yourdomain.com
4. Auf app Verzeichnis zeigen (nicht public_html)
```

### **B. SSL-Zertifikat:**
```
1. "SSL" → "SSL Manager"
2. Kostenloses SSL für Subdomain aktivieren
3. HTTPS-Redirect einrichten
```

### **C. DNS-Einträge (falls erforderlich):**
```
A-Record: notar.yourdomain.com → 45.87.81.214
CNAME: www.notar.yourdomain.com → notar.yourdomain.com
```

---

## 🔧 **Spezifische Konfiguration für 45.87.81.214**

### **A. Vite Konfiguration für Production:**
```typescript
// app/vite.config.ts
export default defineConfig({
  base: '/',  // Da die App im Root-Verzeichnis ist
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  },
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  }
})
```

### **B. Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "start": "vite preview --port 3000 --host 0.0.0.0",
    "backup": "node scripts/backup.js",
    "health-check": "node scripts/health-check.js",
    "deploy": "bash deploy-hostinger-app.sh"
  }
}
```

---

## 📊 **Monitoring und Wartung**

### **A. Log-Monitoring:**
```bash
# PM2 Logs
pm2 logs digital-notary

# System Logs
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log

# Anwendungs-Logs
tail -f /home/u972026836/logs/digital-notary.log
```

### **B. Performance-Monitoring:**
```bash
# System-Ressourcen
htop
df -h
free -h

# Node.js Prozesse
ps aux | grep node
pm2 monit
```

### **C. Backup-Strategie:**
```bash
# Automatisches Backup-Script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/u972026836/backups/digital-notary"
SOURCE_DIR="/home/u972026836/app"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $SOURCE_DIR

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
```

---

## 🚨 **Troubleshooting für 45.87.81.214**

### **Häufige Probleme:**

#### **1. Node.js nicht verfügbar:**
```bash
# NVM installieren
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### **2. Port bereits belegt:**
```bash
# Verfügbare Ports prüfen
netstat -tulpn | grep LISTEN

# Anderen Port verwenden
cd app
npm start -- --port 3001
```

#### **3. Berechtigungsprobleme:**
```bash
# Berechtigungen setzen
chmod -R 755 /home/u972026836/app
chown -R u972026836:u972026836 /home/u972026836/app
```

#### **4. Memory-Limits:**
```bash
# Node.js Memory-Limit erhöhen
export NODE_OPTIONS="--max-old-space-size=2048"
cd app
npm start
```

#### **5. Firewall-Probleme:**
```bash
# Port 3000 freigeben (falls erforderlich)
# Kontaktieren Sie Hostinger Support für Firewall-Konfiguration
```

---

## 📞 **Support-Kontakte**

### **Hostinger Support:**
- **Live Chat:** Hostinger Control Panel
- **E-Mail:** support@hostinger.com
- **Telefon:** +49 69 348 77 88 0

### **Server-spezifische Informationen:**
- **Server-IP:** 45.87.81.214
- **Provider:** Hostinger.de
- **SSH-Port:** 65002
- **SSH-Benutzer:** u972026836
- **Anwendungs-Pfad:** `/app`

---

## ✅ **Deployment-Checkliste für 45.87.81.214**

- [ ] SSH-Zugriff aktiviert
- [ ] Node.js installiert (Version 18+)
- [ ] Im app-Verzeichnis gewechselt (`cd app`)
- [ ] Dependencies installiert (`npm install`)
- [ ] Production Build erstellt (`npm run build`)
- [ ] PM2 installiert und konfiguriert
- [ ] SSL-Zertifikat aktiviert
- [ ] Domain/Subdomain konfiguriert
- [ ] Monitoring eingerichtet
- [ ] Backup-Strategie implementiert

---

## 🎯 **Nächste Schritte**

1. **SSH aktivieren** im Hostinger Control Panel
2. **SSH-Verbindung herstellen:** `ssh -p 65002 u972026836@45.87.81.214`
3. **In app-Verzeichnis wechseln:** `cd app`
4. **Deployment-Script ausführen:** `./deploy-hostinger-app.sh`
5. **Anwendung testen:** http://45.87.81.214:3000
6. **Domain konfigurieren** (falls vorhanden)

---

## 🔧 **Schnellstart-Befehle**

```bash
# 1. SSH-Verbindung
ssh -p 65002 u972026836@45.87.81.214

# 2. In app-Verzeichnis wechseln
cd app

# 3. Dependencies installieren
npm install

# 4. Build erstellen
npm run build

# 5. PM2 installieren und starten
npm install -g pm2
pm2 start npm --name "digital-notary" -- start

# 6. Status prüfen
pm2 status
```

---

**🎯 Die Digital Notary Anwendung ist bereit für das Deployment auf Ihrem Server 45.87.81.214 im app-Verzeichnis!** 
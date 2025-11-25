# 🚀 Hostinger Deployment Guide - Digital Notariat

## 📋 **Übersicht**

**Server:** Hostinger.de  
**Anwendung:** Digital Notariat  
**Deployment-Methode:** Node.js / React  
**Status:** ✅ **DEPLOYMENT-READY**

---

## 🔑 **Server-Zugriff Methoden**

### **1. SSH-Zugriff (Empfohlen)**

#### **A. SSH aktivieren:**
```
1. Hostinger Control Panel öffnen
2. "Advanced" → "SSH Access"
3. SSH aktivieren und Passwort setzen
4. SSH-Schlüssel generieren (optional)
```

#### **B. SSH-Verbindung:**
```bash
# Verbindung herstellen
ssh u123456789@your-server.hostinger.com

# Oder mit Port (falls erforderlich)
ssh -p 22 u123456789@your-server.hostinger.com
```

#### **C. Verfügbare Befehle nach SSH-Login:**
```bash
# Verzeichnis wechseln
cd public_html

# Node.js Version prüfen
node --version
npm --version

# Package Manager installieren (falls nicht verfügbar)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Projekt klonen/hochladen
git clone https://github.com/your-repo/digital-notary.git
# ODER Dateien über FTP hochladen

# Dependencies installieren
cd digital-notary
npm install
# ODER
pnpm install

# Build erstellen
npm run build
# ODER
pnpm run build

# Server starten
npm start
# ODER
pnpm start
```

---

### **2. Hostinger Terminal (Web-basiert)**

#### **A. Terminal öffnen:**
```
1. Hostinger Control Panel
2. "Advanced" → "Terminal"
3. Web-basiertes Terminal öffnen
```

#### **B. Verfügbare Befehle:**
```bash
# Verzeichnis navigieren
cd public_html

# Node.js prüfen
which node
which npm

# Projekt-Setup
mkdir digital-notary
cd digital-notary

# Dependencies installieren
npm install

# Build-Prozess
npm run build

# Server starten
npm start
```

---

### **3. Cron Jobs (Automatisierung)**

#### **A. Cron Job einrichten:**
```
1. Hostinger Control Panel
2. "Advanced" → "Cron Jobs"
3. Neue Cron Job erstellen
```

#### **B. Beispiel Cron Jobs:**
```bash
# Täglich um 2:00 Uhr Backup erstellen
0 2 * * * cd /home/u123456789/public_html/digital-notary && npm run backup

# Alle 5 Minuten Server-Status prüfen
*/5 * * * * cd /home/u123456789/public_html/digital-notary && npm run health-check

# Wöchentlich Dependencies aktualisieren
0 3 * * 0 cd /home/u123456789/public_html/digital-notary && npm update
```

---

### **4. FTP/SFTP Upload + SSH Commands**

#### **A. Dateien hochladen:**
```
1. FileZilla oder ähnliches FTP-Programm
2. Verbindung zu Hostinger-Server
3. Projekt-Dateien in public_html hochladen
4. SSH für Build-Befehle verwenden
```

#### **B. SSH-Befehle nach Upload:**
```bash
# SSH-Verbindung
ssh u123456789@your-server.hostinger.com

# In Projekt-Verzeichnis wechseln
cd public_html/digital-notary

# Dependencies installieren
npm install

# Production Build erstellen
npm run build

# Server starten
npm start
```

---

## 🛠️ **Deployment-Prozess**

### **Schritt 1: Server-Vorbereitung**
```bash
# SSH-Verbindung herstellen
ssh u123456789@your-server.hostinger.com

# Verzeichnis erstellen
mkdir -p public_html/digital-notary
cd public_html/digital-notary
```

### **Schritt 2: Node.js Setup**
```bash
# Node.js Version prüfen
node --version

# Falls Node.js nicht verfügbar:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### **Schritt 3: Projekt-Deployment**
```bash
# Projekt-Dateien hochladen (über FTP oder Git)
# Dann in SSH:

# Dependencies installieren
npm install

# Environment-Variablen setzen
echo "NODE_ENV=production" > .env

# Production Build erstellen
npm run build

# Server starten
npm start
```

### **Schritt 4: PM2 für Prozess-Management**
```bash
# PM2 global installieren
npm install -g pm2

# Anwendung mit PM2 starten
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

## 📁 **Verzeichnis-Struktur**

```
/home/u123456789/
├── public_html/
│   ├── digital-notary/
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── dist/ (nach Build)
│   └── index.html (Redirect)
├── logs/
│   └── digital-notary.log
└── backups/
    └── digital-notary/
```

---

## 🔧 **Konfiguration**

### **A. Vite Konfiguration für Production:**
```typescript
// vite.config.ts
export default defineConfig({
  base: '/digital-notary/',
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
    "health-check": "node scripts/health-check.js"
  }
}
```

---

## 🌐 **Domain-Konfiguration**

### **A. Subdomain einrichten:**
```
1. Hostinger Control Panel
2. "Domains" → "Subdomains"
3. Subdomain erstellen: notar.yourdomain.com
4. Auf digital-notary Verzeichnis zeigen
```

### **B. SSL-Zertifikat:**
```
1. "SSL" → "SSL Manager"
2. Kostenloses SSL für Subdomain aktivieren
3. HTTPS-Redirect einrichten
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
tail -f /home/u123456789/logs/digital-notary.log
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
BACKUP_DIR="/home/u123456789/backups/digital-notary"
SOURCE_DIR="/home/u123456789/public_html/digital-notary"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $SOURCE_DIR

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
```

---

## 🚨 **Troubleshooting**

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
npm start -- --port 3001
```

#### **3. Berechtigungsprobleme:**
```bash
# Berechtigungen setzen
chmod -R 755 /home/u123456789/public_html/digital-notary
chown -R u123456789:u123456789 /home/u123456789/public_html/digital-notary
```

#### **4. Memory-Limits:**
```bash
# Node.js Memory-Limit erhöhen
export NODE_OPTIONS="--max-old-space-size=2048"
npm start
```

---

## 📞 **Support-Kontakte**

### **Hostinger Support:**
- **Live Chat:** Hostinger Control Panel
- **E-Mail:** support@hostinger.com
- **Telefon:** +49 69 348 77 88 0

### **Deployment-Support:**
- **SSH-Zugriff:** Über Hostinger Control Panel
- **Terminal:** Web-basiertes Terminal verfügbar
- **FTP:** FileZilla oder ähnliche Clients

---

## ✅ **Deployment-Checkliste**

- [ ] SSH-Zugriff aktiviert
- [ ] Node.js installiert (Version 18+)
- [ ] Projekt-Dateien hochgeladen
- [ ] Dependencies installiert (`npm install`)
- [ ] Production Build erstellt (`npm run build`)
- [ ] PM2 installiert und konfiguriert
- [ ] SSL-Zertifikat aktiviert
- [ ] Domain/Subdomain konfiguriert
- [ ] Monitoring eingerichtet
- [ ] Backup-Strategie implementiert

---

**🎯 Die Digital Notary Anwendung ist bereit für das Deployment auf Hostinger!** 
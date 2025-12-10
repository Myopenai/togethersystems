# [.SYSTEMS.T.SYSTEMS.] Host Deployment System

**Original:** https://tinyurl.com/BUGCOMPANY  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

---

## 📦 Host Deployment

Deployed Server auf Remote-Hosts oder lokale Verzeichnisse.

### Unterstützte Deployment-Methoden

1. **SSH/SCP** - Linux/macOS Server
2. **FTP/SFTP** - FTP-Server
3. **Lokal** - Lokales Verzeichnis
4. **Docker** - Docker Container

---

## 🚀 Verwendung

### Einzelner Host

```cmd
cd builds
DEPLOY-TO-HOST.bat
```

### Mehrere Hosts (PowerShell)

```powershell
cd builds\hosts
.\DEPLOY-TO-HOSTS.ps1
```

---

## ⚙️ Host-Konfiguration

**Datei:** `hosts\host-config.json`

**Beispiel:**
```json
{
  "hosts": [
    {
      "name": "Production Server",
      "type": "ssh",
      "host": "user@example.com",
      "port": 22,
      "path": "/var/www/ostosos",
      "platform": "linux-amd64"
    }
  ]
}
```

---

## 📝 Deployment-Typen

### SSH/SCP

- Kopiert Server-Binary via SCP
- Erstellt Start-Script auf Remote-Host
- Benötigt: OpenSSH oder Git Bash

### FTP/SFTP

- Manuelles Deployment via FTP-Client
- Script zeigt Datei und Ziel-Pfad

### Lokal

- Kopiert Server in lokales Verzeichnis
- Für Windows IIS oder lokale Tests

### Docker

- Erstellt Docker-Image
- Startet Container

---

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**


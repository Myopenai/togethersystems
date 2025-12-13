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


---

## 🏢 Unternehmens-Branding & OCR

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

| Information | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |
| **Businessplan** | [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf) |

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---

# [.SYSTEMS.T.SYSTEMS.] Deploy All Servers - Dokumentation

**Original:** https://tinyurl.com/BUGCOMPANY  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

---

## 📦 Deploy-System

Deployed alle Server auf allen Plattformen in eine saubere Struktur.

### Verzeichnisstruktur

```
builds\deploy\
  ├── windows-amd64\
  │   ├── ostosos-server.exe
  │   ├── ostosos-server-python.exe (optional)
  │   └── START-SERVER.bat
  ├── windows-arm64\
  │   ├── ostosos-server.exe
  │   └── START-SERVER.bat
  ├── linux-amd64\
  │   ├── ostosos-server
  │   └── START-SERVER.sh
  ├── linux-386\
  │   ├── ostosos-server
  │   └── START-SERVER.sh
  ├── linux-arm64\
  │   ├── ostosos-server
  │   └── START-SERVER.sh
  ├── macos-amd64\
  │   ├── ostosos-server
  │   └── START-SERVER.sh
  ├── macos-arm64\
  │   ├── ostosos-server
  │   └── START-SERVER.sh
  └── README.txt
```

---

## 🚀 Verwendung

### Deployment ausführen

```cmd
cd builds
DEPLOY-ALL-SERVERS.bat
```

### Server starten

**Windows:**
```cmd
cd deploy\windows-amd64
START-SERVER.bat
```

**Linux/macOS:**
```bash
cd deploy/linux-amd64
chmod +x START-SERVER.sh
./START-SERVER.sh
```

---

## ✅ Features

- ✅ Alle Go-Server auf alle 7 Plattformen deployed
- ✅ Python-Server für Windows deployed
- ✅ Start-Scripts für jede Plattform
- ✅ Automatisches Browser-Öffnen
- ✅ Saubere Deploy-Struktur

---

## 📝 Deployed Server

### Go Server (ostosos-server)

- ✅ Windows amd64
- ✅ Windows arm64
- ✅ Linux amd64
- ✅ Linux 386
- ✅ Linux arm64
- ✅ macOS amd64
- ✅ macOS arm64

### Python Server (ostosos-server-python.exe)

- ✅ Windows amd64

---

## 🔧 Start-Scripts

### Windows: START-SERVER.bat

- Startet Server im Hintergrund
- Öffnet Browser automatisch
- Zeigt Server-URL

### Linux/macOS: START-SERVER.sh

- Startet Server im Hintergrund
- Öffnet Browser automatisch (xdg-open/open)
- Zeigt Server-PID und URL

---

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**


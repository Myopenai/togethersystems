# [.SYSTEMS.T.SYSTEMS.] Python Executable - Alle 7 Plattformen

**Original:** https://tinyurl.com/BUGCOMPANY  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

---

## 📋 Übersicht

Python HTTP Server als ausführbare Datei für alle 7 Plattformen.

### Unterstützte Plattformen

**Windows:**
- Windows amd64 (x64)
- Windows arm64

**macOS:**
- macOS amd64 (Intel)
- macOS arm64 (Apple Silicon)

**Linux:**
- Linux amd64 (x64)
- Linux arm64
- Linux 386 (32-bit)

---

## 🚀 Build

### PowerShell (Windows)

```powershell
cd builds
.\FABRIKAGE-BUILD-ALL-PLATFORMS.ps1
```

### Bash (Linux/macOS)

```bash
cd builds/python-executable
chmod +x build-all-platforms.sh
./build-all-platforms.sh
```

### Manuell

```bash
# Installiere PyInstaller
pip install pyinstaller

# Build
pyinstaller --onefile --name ostosos-server python-server.py
```

---

## 📦 Ausgabe

**Build-Verzeichnis:** `python-executable\build\`

```
python-executable\build\
  ├── windows-amd64\
  │   └── ostosos-server.exe
  ├── windows-arm64\
  │   └── ostosos-server.exe
  ├── linux-amd64\
  │   └── ostosos-server
  ├── linux-arm64\
  │   └── ostosos-server
  ├── linux-386\
  │   └── ostosos-server
  ├── macos-amd64\
  │   └── ostosos-server
  └── macos-arm64\
      └── ostosos-server
```

---

## 🔧 Funktionen

- ✅ HTTP Server (Port 9090)
- ✅ Automatische index.html Suche
- ✅ CORS Support
- ✅ Custom Logging
- ✅ Fabrikation Standard TÜV MCP

---

## 📝 Verwendung

### Ausführbare Datei starten

**Windows:**
```cmd
ostosos-server.exe
```

**Linux/macOS:**
```bash
./ostosos-server
```

### Python Script direkt

```bash
python python-server.py
```

---

## 🔗 CI/CD

**GitHub Actions:** `.github\workflows\build-all-platforms.yml`

Baut automatisch alle 7 Plattformen bei Push/PR.

---

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**


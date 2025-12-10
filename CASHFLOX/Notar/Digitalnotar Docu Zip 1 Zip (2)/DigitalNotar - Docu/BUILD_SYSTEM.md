# 🏗️ Produktions-Build System - Digitales Notariat

## 📋 Übersicht

Das Digitales Notariat verfügt über ein vollständiges Build-System, das automatisch Produktions-Builds für alle gängigen Plattformen erstellt:

- **Windows** (x64, ia32)
- **macOS** (x64, arm64)
- **Linux** (x64)

## 🚀 Schnellstart

### One-Click Build (Empfohlen)

#### Windows
```batch
build-all-platforms.bat
```

#### Linux/macOS
```bash
chmod +x build-all-platforms.sh
./build-all-platforms.sh
```

### Manuelle Builds

#### Alle Plattformen
```bash
pnpm run dist-all
```

#### Einzelne Plattformen
```bash
# Windows
pnpm run dist-win

# macOS
pnpm run dist-mac

# Linux
pnpm run dist-linux
```

## 📦 Erstellte Build-Typen

### Windows
- **NSIS Installer** (.exe) - Vollständiger Installer
- **Portable** (.exe) - Tragbare Version ohne Installation

### macOS
- **DMG** (.dmg) - Disk Image für einfache Installation
- **ZIP** (.zip) - Komprimierte Version

### Linux
- **AppImage** (.AppImage) - Universelle Linux-Distribution
- **DEB** (.deb) - Debian/Ubuntu Paket
- **RPM** (.rpm) - Red Hat/Fedora Paket

## 🛠️ Build-Konfiguration

### Electron Builder Konfiguration

```json
{
  "build": {
    "appId": "com.digitales-notariat.app",
    "productName": "Digitales Notariat",
    "directories": {
      "output": "dist-production"
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "node_modules/**/*"
    ]
  }
}
```

### Plattform-spezifische Einstellungen

#### Windows
- **Targets**: NSIS Installer, Portable
- **Architekturen**: x64, ia32
- **Features**: Desktop-Shortcut, Start-Menü

#### macOS
- **Targets**: DMG, ZIP
- **Architekturen**: x64, arm64 (Apple Silicon)
- **Kategorie**: Business

#### Linux
- **Targets**: AppImage, DEB, RPM
- **Architekturen**: x64
- **Kategorie**: Office

## 📁 Build-Ausgabe

### Verzeichnisstruktur
```
dist-production/
├── build-report.json          # Detaillierter Build-Report
├── Digitales Notariat-1.0.0.exe          # Windows NSIS
├── Digitales Notariat-1.0.0-portable.exe # Windows Portable
├── Digitales Notariat-1.0.0.dmg          # macOS DMG
├── Digitales Notariat-1.0.0-mac.zip      # macOS ZIP
├── Digitales Notariat-1.0.0.AppImage     # Linux AppImage
├── digitales-notariat_1.0.0_amd64.deb    # Linux DEB
└── digitales-notariat-1.0.0.x86_64.rpm   # Linux RPM
```

### Build-Report
```json
{
  "timestamp": "2025-08-02T10:30:00.000Z",
  "duration": "45.23s",
  "success": true,
  "errors": [],
  "logs": [...],
  "buildInfo": {
    "nodeVersion": "v20.18.1",
    "pnpmVersion": "8.15.0",
    "platform": "win32",
    "arch": "x64"
  }
}
```

## 🔧 Erweiterte Build-Optionen

### Entwicklung vs. Produktion

#### Entwicklung
```bash
# Electron mit Hot-Reload
pnpm run electron-dev

# Nur Electron (ohne Hot-Reload)
pnpm run electron
```

#### Produktion
```bash
# Vollständiger Build
pnpm run dist-all

# Nur Packaging (ohne Distribution)
pnpm run package-all
```

### Plattform-spezifische Builds

#### Windows-spezifisch
```bash
# Nur Windows Builds
pnpm run build-win
pnpm run dist-win
pnpm run package-win
```

#### macOS-spezifisch
```bash
# Nur macOS Builds
pnpm run build-mac
pnpm run dist-mac
pnpm run package-mac
```

#### Linux-spezifisch
```bash
# Nur Linux Builds
pnpm run build-linux
pnpm run dist-linux
pnpm run package-linux
```

## 🎨 Icon-Generierung

Das Build-System erstellt automatisch Icons für alle Plattformen:

- **Windows**: `assets/icon.ico`
- **macOS**: `assets/icon.icns`
- **Linux**: `assets/icon.png`

### Icon-Spezifikationen
- **Größe**: 256x256 Pixel
- **Format**: PNG, ICO, ICNS
- **Design**: Professionelles Notariat-Design

## 🔒 Sicherheitsfeatures

### Code-Signierung (Optional)
```bash
# Windows Code-Signierung
pnpm run dist-win -- --sign

# macOS Code-Signierung
pnpm run dist-mac -- --sign

# Linux Code-Signierung
pnpm run dist-linux -- --sign
```

### Notarization (macOS)
```bash
# macOS Notarization
pnpm run dist-mac -- --notarize
```

## 📊 Build-Performance

### Optimierungen
- **Parallel Builds**: Mehrere Plattformen gleichzeitig
- **Caching**: Electron Builder Cache
- **Compression**: Optimierte Dateigrößen
- **Tree Shaking**: Unnötiger Code entfernt

### Build-Zeiten (Durchschnitt)
- **Windows**: ~2-3 Minuten
- **macOS**: ~3-4 Minuten
- **Linux**: ~2-3 Minuten
- **Alle Plattformen**: ~8-10 Minuten

## 🐛 Troubleshooting

### Häufige Probleme

#### 1. Build-Fehler
```bash
# Abhängigkeiten neu installieren
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Build-Cache löschen
rm -rf dist-production
```

#### 2. Electron Builder Fehler
```bash
# Electron Builder Cache löschen
rm -rf ~/.cache/electron-builder
rm -rf ~/.cache/electron
```

#### 3. Plattform-spezifische Probleme

**Windows**
- Visual Studio Build Tools erforderlich
- Windows SDK installieren

**macOS**
- Xcode Command Line Tools erforderlich
- Apple Developer Account für Code-Signierung

**Linux**
- Build-Essentials installieren
- AppImage-Tools für AppImage-Builds

### Debug-Modus
```bash
# Detaillierte Build-Logs
DEBUG=electron-builder pnpm run dist-all

# Nur Web-Build testen
pnpm run build
pnpm run preview
```

## 📈 Monitoring & Logging

### Build-Logs
- **Console Output**: Echtzeit-Build-Status
- **Log-Dateien**: `logs/build-YYYY-MM-DD.log`
- **Build-Report**: `dist-production/build-report.json`

### Performance-Monitoring
```bash
# Build-Zeit messen
time pnpm run dist-all

# Speicherverbrauch überwachen
node build-production.js --monitor
```

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Build and Release
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run dist-${{ matrix.platform }}
```

### GitLab CI
```yaml
build:
  stage: build
  image: node:20
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm run dist-all
  artifacts:
    paths:
      - dist-production/
```

## 📚 Weitere Ressourcen

### Dokumentation
- [Electron Builder Dokumentation](https://www.electron.build/)
- [Electron Dokumentation](https://www.electronjs.org/docs)
- [Vite Dokumentation](https://vitejs.dev/)

### Tools
- [Electron Builder](https://github.com/electron-userland/electron-builder)
- [Electron Forge](https://www.electronforge.io/)
- [AppImage Builder](https://github.com/AppImageCrafters/appimage-builder)

---

**🎯 Das Build-System ist vollständig automatisiert und erstellt professionelle Distributions-Pakete für alle gängigen Plattformen!** 
# T,. OSOTOSOS Universal Go Build Pipeline

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

Universelle Build-Pipeline für alle Plattformen mit Go (Golang). Ein Klick genügt, und dein Programm läuft sofort auf jedem Gerät.

---

## 🎯 Features

- ✅ **Cross-Compilation** für alle Plattformen
- ✅ **One-Click Setup** - Ein Klick, sofortiger Start
- ✅ **Automatische Updates** - Hintergrund-Updates über CI/CD
- ✅ **Minimaler Useraufwand** - <0,5% Handlungen
- ✅ **Native Binaries** - Keine Abhängigkeiten

---

## 📦 Unterstützte Plattformen

### Desktop
- ✅ **Windows** (amd64, arm64)
- ✅ **macOS** (amd64, arm64/Apple Silicon)
- ✅ **Linux** (amd64, arm64, 386)

### Mobile (in Planung)
- ⏳ **Android** (APK)
- ⏳ **iOS** (IPA)

---

## 🚀 Schnellstart

### Windows (PowerShell)

```powershell
.\build-all.ps1
```

### Linux/macOS (Bash)

```bash
chmod +x build-all.sh
./build-all.sh
```

### Make (alle Plattformen)

```bash
make all
```

---

## 📋 Verfügbare Build-Targets

### Alle Plattformen bauen

```bash
make all
```

oder

```bash
make windows macos linux
```

### Einzelne Plattformen

```bash
make windows    # Windows Builds
make macos      # macOS Builds
make linux      # Linux Builds
```

### Hilfe anzeigen

```bash
make help
```

---

## 🔧 Build-Optionen

### Flags

- `-s` - Strips debug symbols (kleinere Binaries)
- `-w` - Omits DWARF symbol table (kleinere Binaries)
- `-H windowsgui` - Windows GUI application (kein Konsolen-Fenster)

### Cross-Compilation

Go unterstützt Cross-Compilation direkt über Umgebungsvariablen:

```bash
# Linux Binary
GOOS=linux GOARCH=amd64 go build -o build/myapp-linux main.go

# Windows Binary
GOOS=windows GOARCH=amd64 go build -o build/myapp-windows.exe main.go

# macOS Binary
GOOS=darwin GOARCH=amd64 go build -o build/myapp-macos main.go
```

---

## 📂 Build-Ausgabe

Alle Build-Artefakte werden im `build/` Verzeichnis erstellt:

```
build/
├── windows-amd64/
│   └── ostosos-server.exe
├── windows-arm64/
│   └── ostosos-server.exe
├── macos-amd64/
│   └── ostosos-server
├── macos-arm64/
│   └── ostosos-server
├── linux-amd64/
│   └── ostosos-server
├── linux-arm64/
│   └── ostosos-server
└── linux-386/
    └── ostosos-server
```

---

## 📦 Installer-Erstellung

### Windows

- **MSIX** - Modern Windows App Package
- **Inno Setup** - Traditional Installer
- **WiX Toolset** - Professional Installer

### macOS

- **.dmg** - Disk Image (empfohlen)
- **.pkg** - Package Installer

### Linux

- **.deb** - Debian/Ubuntu Package
- **.rpm** - RedHat/Fedora Package
- **.AppImage** - Universal Linux App
- **Snap** - Snapcraft Package
- **Flatpak** - Flatpak Package

---

## 🔄 Automatische Updates

### CI/CD Integration

Die Pipeline kann in CI/CD-Systeme integriert werden:

- **GitHub Actions**
- **GitLab CI**
- **Azure DevOps**
- **Jenkins**

### Update-Mechanismus

1. Build wird automatisch erstellt
2. Installer wird automatisch gebaut
3. Updates werden automatisch verteilt
4. User muss nichts tun

---

## 📝 Verwendung

### Server starten

```bash
# Windows
.\ostosos-server.exe

# macOS/Linux
./ostosos-server
```

### Port angeben

```bash
./ostosos-server 8080
```

Standard-Port ist `8080`.

---

## 🔐 Sicherheit

- ✅ **Code Signing** (in Planung)
- ✅ **SBOM** (Software Bill of Materials)
- ✅ **Verschlüsselte Updates**
- ✅ **Hash-Verifikation**

---

## 📚 Dokumentation

- [Go Build Pipeline Guide](../GO-BUILD-PIPELINE-GUIDE.md)
- [Installer Guide](../INSTALLER-GUIDE.md)
- [Update Mechanism](../UPDATE-MECHANISM.md)

---

## 🛠️ Entwicklung

### Lokaler Build

```bash
go build -o ostosos-server main.go
```

### Tests ausführen

```bash
go test ./...
```

### Code formatieren

```bash
go fmt ./...
```

---

## ⚡ Performance

- **Kompilierte Binaries** - Keine Runtime-Abhängigkeiten
- **Kleine Dateigröße** - Optimiert mit `-s -w` Flags
- **Schneller Start** - Native Ausführung
- **Geringer Speicherverbrauch** - Effiziente Go Runtime

---

## 🌍 Internationalisierung

- Unterstützt alle Sprachen über UTF-8
- Lokalisierte Installer (in Planung)
- Mehrsprachige UI (in Planung)

---

## 📞 Support

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems

---

## ✅ Status

- ✅ Windows Builds - Funktionsfähig
- ✅ macOS Builds - Funktionsfähig
- ✅ Linux Builds - Funktionsfähig
- ⏳ Android Builds - In Planung
- ⏳ iOS Builds - In Planung
- ⏳ Installer - In Planung
- ⏳ Auto-Updates - In Planung

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems


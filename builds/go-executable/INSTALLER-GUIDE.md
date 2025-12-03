# T,. OSOTOSOS Installer Guide

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

Vollständige Anleitung zur Erstellung von Installern für alle Plattformen.

---

## 🪟 Windows Installer

### Option 1: Inno Setup (Empfohlen)

**Voraussetzungen:**
- Inno Setup installiert: https://jrsoftware.org/isdl.php

**Erstellen:**
```powershell
cd builds/go-executable/installers
.\create-windows-installer.ps1
```

**Ergebnis:**
- `installers/windows/ostosos-installer.iss` - Inno Setup Script
- Öffne die .iss Datei in Inno Setup
- Klicke: Build > Compile
- Installer wird erstellt

### Option 2: ZIP-Installer (Einfach)

**Automatisch erstellt:**
- `installers/windows/ostosos-server-1.0.0-windows.zip`
- Enthält Binary + START-OSTOSOS.bat
- Einfach entpacken und ausführen

### Option 3: MSIX (Modern Windows)

**Erstellung:**
- Benötigt Windows SDK
- Erstellt `.msix` Package
- Auto-Update fähig

---

## 🍎 macOS Installer

### Option 1: DMG (Empfohlen)

**Erstellen:**
```bash
cd builds/go-executable/installers
chmod +x create-macos-installer.sh
./create-macos-installer.sh
```

**Ergebnis:**
- `installers/macos/OSTOSOS Server.app` - App Bundle
- `installers/macos/ostosos-server-1.0.0-macos.dmg` - Disk Image
- Einfach DMG öffnen, App in Applications ziehen

### Option 2: PKG Installer

**Erstellung:**
- Benötigt `pkgbuild` und `productbuild`
- Erstellt `.pkg` Package
- Automatische Installation möglich

---

## 🐧 Linux Installer

### Option 1: DEB Package (Debian/Ubuntu)

**Erstellen:**
```bash
cd builds/go-executable/installers
chmod +x create-linux-installer.sh
./create-linux-installer.sh
```

**Installation:**
```bash
sudo dpkg -i installers/linux/ostosos-server_1.0.0_amd64.deb
```

**Ergebnis:**
- `.deb` Package
- Installiert in `/usr/bin/`
- Desktop Entry erstellt

### Option 2: RPM Package (RedHat/Fedora)

**Erstellung:**
- Benötigt `rpmbuild`
- Erstellt `.rpm` Package
- Installiert via `yum` oder `dnf`

### Option 3: TAR.GZ (Universal)

**Erstellt automatisch wenn DEB/RPM nicht verfügbar:**
- `installers/linux/ostosos-server-1.0.0-linux.tar.gz`
- Einfach entpacken und ausführen

---

## 📦 Installer-Features

### Auto-Start nach Installation

**Windows:**
- Checkbox: "Start OSTOSOS Server after installation"
- Wird automatisch nach Installation gestartet

**macOS:**
- App wird automatisch gestartet nach Installation
- Verknüpfung auf Desktop

**Linux:**
- Service wird automatisch gestartet (optional)
- Desktop Entry erstellt

---

## 🔄 Automatische Updates

### Update-Mechanismus

1. **Check für Updates:**
   - Beim Start prüft App auf Updates
   - Verwendet GitHub Releases API

2. **Download Update:**
   - Lädt neue Version automatisch
   - Verifiziert Hash

3. **Installation:**
   - Installiert Update im Hintergrund
   - Startet App neu

---

## 📋 Installer-Scripts

### Verfügbare Scripts

1. `installers/create-windows-installer.ps1` - Windows Installer
2. `installers/create-macos-installer.sh` - macOS Installer
3. `installers/create-linux-installer.sh` - Linux Installer

### Verwendung

**Alle Installer erstellen:**
```bash
# Windows
cd builds/go-executable/installers
.\create-windows-installer.ps1

# macOS/Linux
cd builds/go-executable/installers
./create-macos-installer.sh
./create-linux-installer.sh
```

---

## ✅ Status

- ✅ Windows ZIP Installer - Funktionsfähig
- ✅ Windows Inno Setup Script - Erstellt
- ✅ macOS DMG - Funktionsfähig
- ✅ macOS App Bundle - Funktionsfähig
- ✅ Linux DEB Package - Funktionsfähig
- ✅ Linux TAR.GZ - Funktionsfähig
- ⏳ MSIX Package - In Planung
- ⏳ PKG Installer - In Planung
- ⏳ RPM Package - In Planung

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems


# T,. OSTOSOS - Multi-Boot USB-Stick Erstellung

**VERSION:** 1.0.0  
**BRANDING:** T,.&T,,.&T,,,.(C)TEL1.NL  
**DATUM:** 2025-12-01

---

## 📁 ORDNER-STRUKTUR

```
OSTOSOS-MULTIBOOT-USB-ORDNER/
├── builds/
│   ├── windows/
│   │   └── OSTOSOS-Windows-Setup.exe
│   ├── macos/
│   │   └── OSTOSOS-macOS-Setup
│   └── linux/
│       └── OSTOSOS-Linux-Setup.bin
├── usb-image-creator/
│   ├── OSTOSOS-USB-MULTIBOOT-CREATOR.html
│   ├── autorun/
│   │   ├── autorun.inf (Windows)
│   │   ├── autorun.command (macOS)
│   │   └── autorun.sh (Linux)
│   └── bootloader/
│       ├── EFI/
│       └── BIOS/
├── tools/
│   ├── os-detector.js
│   ├── launcher/
│   │   ├── OSTOSOS-Launcher.exe (Windows)
│   │   ├── OSTOSOS-Launcher.app (macOS)
│   │   └── OSTOSOS-Launcher.bin (Linux)
│   └── memory-installer.js
└── config/
    └── USB-CONFIG.json
```

---

## 🎯 FUNKTION

Dieser Ordner enthält alles für die Erstellung von Multi-Boot USB-Sticks:

1. **Builds:** Alle OS-Versionen (Windows, macOS, Linux)
2. **USB-Image-Creator:** Tool zum Erstellen des USB-Images
3. **Autorun:** Auto-Start-Mechanismen für alle Plattformen
4. **Bootloader:** Universal Bootloader für Boot von leerem Rechner
5. **Tools:** OS-Erkennung, Launcher, Memory-Installer
6. **Config:** Konfigurationsdateien

---

## 📋 BENENNUNG

**OS-Bezeichnungen für User-Freundlichkeit:**
- `OSTOSOS-Windows-Setup.exe` - Klar erkennbar für Windows
- `OSTOSOS-macOS-Setup` - Klar erkennbar für macOS
- `OSTOSOS-Linux-Setup.bin` - Klar erkennbar für Linux

**Ordner-Struktur:**
- `builds/windows/` - Windows Builds
- `builds/macos/` - macOS Builds
- `builds/linux/` - Linux Builds

---

**ERSTELLT:** 2025-12-01  
**STATUS:** Neue Architektur - Bereit für Implementierung


# [.SYSTEMS.T.SYSTEMS.] Pitch-Paket System

**Original:** https://tinyurl.com/BUGCOMPANY  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

---

## 📦 Pitch-Paket System

Ein professionelles, "eine ZIP-Datei" Pitch-Paket, das auf **allen Systemen** funktioniert.

### Ziel

**Eine ZIP-Datei** mit:
- Alle Binaries für Windows, Linux, macOS, Raspberry Pi
- Auto-Auswahl der richtigen Binary
- Automatisches Browser-Öffnen
- Professionelles UX

---

## 🚀 Verwendung

### 1. Pitch-Paket erstellen

```cmd
cd builds
MAKE-PITCH.bat
```

Das Script:
- Sammelt alle Go-Builds
- Kopiert Start-Scripts (`run.bat`, `run.sh`)
- Erstellt Verzeichnisstruktur
- Erstellt README.txt

### 2. ZIP erstellen

```cmd
cd dist
tar -a -c -f ostosos-pitch.zip ostosos-pitch
```

Oder manuell:
- ZIP erstellen aus `dist\ostosos-pitch`

### 3. Verteilen

**Eine Datei:** `ostosos-pitch.zip`

**Inhalt:**
```
ostosos-pitch/
  run.bat           (Windows)
  run.sh            (Linux/macOS/Raspberry Pi)
  bin/
    windows-amd64/ostosos-server.exe
    windows-arm64/ostosos-server.exe
    linux-amd64/ostosos-server
    linux-386/ostosos-server
    linux-arm/ostosos-server
    linux-arm64/ostosos-server
    macos-amd64/ostosos-server
    macos-arm64/ostosos-server
  ui/               (optional)
  docs/             (optional)
  README.txt
```

---

## 📋 Start-Scripts

### Windows: `run.bat`

- Auto-Auswahl: `windows-amd64` oder `windows-arm64`
- Startet Server im Hintergrund
- Öffnet Browser automatisch

### Linux/macOS/Raspberry Pi: `run.sh`

- Auto-Auswahl basierend auf `uname -s` und `uname -m`
- Unterstützt:
  - Linux: `x86_64`, `i386/i686`, `armv6l/armv7l`, `aarch64/arm64`
  - macOS: `x86_64`, `arm64`
- Startet Server im Hintergrund
- Öffnet Browser automatisch (xdg-open/open)

---

## 🔧 Erweiterte Features

### Raspberry Pi Support

Für Raspberry Pi wird automatisch erkannt:
- `linux-arm` (32-bit, ältere Pis)
- `linux-arm64` (64-bit, neuere Pis)

### Browser-Öffnen

- **Windows:** `start "" "http://127.0.0.1:9090"`
- **Linux:** `xdg-open "http://127.0.0.1:9090"`
- **macOS:** `open "http://127.0.0.1:9090"`

---

## 📝 Struktur

```
builds/
  pitch/
    run.bat          (Windows Start-Script)
    run.sh           (Linux/macOS/Raspberry Pi Start-Script)
    README.md        (Diese Datei)
  MAKE-PITCH.bat     (Erstellt Pitch-Paket)
  dist/
    ostosos-pitch/   (Fertiges Pitch-Paket)
```

---

## ✅ Checkliste

- [x] `run.bat` - Windows Auto-Auswahl
- [x] `run.sh` - Linux/macOS/Raspberry Pi Auto-Auswahl
- [x] `MAKE-PITCH.bat` - Sammelt alle Builds
- [x] README.txt - Anleitung für Empfänger
- [x] Browser-Auto-Öffnen
- [x] Raspberry Pi Support

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

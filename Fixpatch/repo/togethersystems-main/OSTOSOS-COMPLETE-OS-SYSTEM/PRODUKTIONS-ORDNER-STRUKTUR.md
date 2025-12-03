# T,. OSTOSOS - Produktionsordner-Struktur

**VERSION:** 1.0.0  
**BRANDING:** T,.&T,,.&T,,,.(C)TEL1.NL

---

## 📁 Produktionsordner-Struktur

Nach dem Build werden alle Dateien in folgender Struktur organisiert:

```
Produktionsordner/
└── OSTOSOS-Build-YYYYMMDD-HHMMSS/
    ├── Windows/
    │   └── OSTOSOS-Setup.exe
    ├── macOS/
    │   └── OSTOSOS-Setup.app
    ├── Linux/
    │   └── OSTOSOS-Setup.bin
    ├── Universal/
    │   └── (Zukünftige Universal-Builds)
    ├── Source/
    │   ├── OSTOSOS-SETUP.go
    │   └── BUILD-EXECUTABLE.md
    └── BUILD-INFO.json
```

---

## 🎯 Benannte Ordner

### Windows/
- **Datei:** `OSTOSOS-Setup.exe`
- **Plattform:** Windows 10/11 (64-bit)
- **Architektur:** AMD64
- **Verwendung:** Doppelklick zum Installieren

### macOS/
- **Datei:** `OSTOSOS-Setup.app`
- **Plattform:** macOS 10.15+ (64-bit)
- **Architektur:** AMD64
- **Verwendung:** Doppelklick zum Installieren

### Linux/
- **Datei:** `OSTOSOS-Setup.bin`
- **Plattform:** Linux (64-bit)
- **Architektur:** AMD64
- **Verwendung:** `chmod +x OSTOSOS-Setup.bin && ./OSTOSOS-Setup.bin`

### Universal/
- **Zweck:** Zukünftige Universal-Builds (WebAssembly, etc.)
- **Status:** Vorbereitet für zukünftige Erweiterungen

### Source/
- **Zweck:** Source-Code und Dokumentation
- **Dateien:** Go-Source, Build-Anleitung

---

## 📋 BUILD-INFO.json

Enthält Informationen über den Build:
- Build-Datum
- Build-Typ
- Go-Version
- Plattformen
- Dateipfade

---

## ✅ Qualitätssicherung

Alle Builds werden:
- ✅ Auf Funktionalität getestet
- ✅ Auf Kompatibilität geprüft
- ✅ In benannten Ordnern organisiert
- ✅ Mit Build-Info dokumentiert

---

**ERSTELLT:** 2025-01-15  
**VERSION:** 1.0.0  
**BRANDING:** T,.&T,,.&T,,,.(C)TEL1.NL


# [.SYSTEMS.T.SYSTEMS.] Script-Dokumentation

**Original:** https://tinyurl.com/BUGCOMPANY  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

---

## ✅ Script-Status

**Alle drei Haupt-Scripts sind logisch konsistent und lauffähig:**

- ✅ `BUILD-ALL-OS.bat` - Baut alle OS (Go + Python)
- ✅ `SHOW-ALL-OS.bat` - Zeigt alle Builds
- ✅ `START-SERVER.bat` - Startet Server

---

## 📋 BUILD-ALL-OS.bat

### Funktionen

1. **Verzeichnis-Wechsel**
   - `cd /d "%~dp0"` mit Fehlerbehandlung ✅

2. **Go Builds**
   - Prüft `go-executable\build-all.ps1`
   - Testet `go version`
   - Ruft PowerShell mit korrektem Exit-Code:
     ```bat
     powershell.exe -ExecutionPolicy Bypass -NoProfile -Command "Set-Location '%GO_DIR%'; .\build-all.ps1; exit $LASTEXITCODE"
     ```
   - Speichert ERRORLEVEL sofort nach PowerShell-Aufruf ✅

3. **Python Builds**
   - Prüft `python-executable\python-server.py`
   - Testet `python --version`
   - Installiert/prüft PyInstaller
   - Baut Executable nach: `python-executable\build\windows-amd64\ostosos-server.exe` ✅

4. **Zusammenfassung**
   - Zählt Go-Builds mit `GO_COUNT`
   - Verwendet DelayedExpansion (`!GO_COUNT!`)
   - Gibt globalen Fehlercode zurück ✅

### Voraussetzungen

- ✅ Go installiert und im PATH
- ✅ Python + pip installiert
- ✅ PowerShell verfügbar (Windows Standard)

---

## 📋 SHOW-ALL-OS.bat

### Funktionen

1. **Verzeichnis-Wechsel**
   - `cd /d "%~dp0"` mit Fehlerbehandlung ✅

2. **Pfade**
   - `GO_DIR=%BUILD_DIR%\go-executable\build`
   - `PYTHON_DIR=%BUILD_DIR%\python-executable\build` ✅

3. **Prüft alle Builds**
   - Go: `windows-amd64`, `windows-arm64`, `linux-amd64`, `linux-arm64`, `linux-386`, `macos-amd64`, `macos-arm64`
   - Python: `windows-amd64` ✅

4. **Ausgabe**
   - `[OK]` oder `[WARN]` für jeden Pfad ✅

### Keine Seiteneffekte

- Reine Anzeige-Logik
- Keine Änderungen am System ✅

---

## 📋 START-SERVER.bat

### Funktionen

1. **Verzeichnis-Wechsel**
   - `cd /d "%~dp0"` mit Fehlerbehandlung ✅

2. **Pfade setzen**
   - `PY_EXE=%PY_DIR%\build\windows-amd64\ostosos-server.exe`
   - `GO_EXE=%GO_DIR%\windows-amd64\ostosos-server.exe`
   - `PY_SCRIPT=%PY_DIR%\python-server.py` ✅

3. **Priorität (Server-Auswahl)**
   1. Python Executable (`PY_EXE`)
   2. Go Executable (`GO_EXE`)
   3. Python Script (`PY_SCRIPT`) ✅

4. **Server-Start**
   - `start "" %SERVER_CMD%`
   - Korrekt gequotet ✅

---

## 🐛 Debugging

### Wenn Scripts nicht funktionieren

**Mögliche Ursachen:**

1. **Fehlende Tools**
   - Go nicht installiert oder nicht im PATH
   - Python nicht installiert oder nicht im PATH
   - PyInstaller nicht installiert

2. **Fehlende Dateien**
   - `go-executable\build-all.ps1` nicht vorhanden
   - `python-executable\python-server.py` nicht vorhanden

3. **PowerShell-Fehler**
   - `build-all.ps1` wirft Fehler
   - ExecutionPolicy blockiert

### Debugging-Schritte

1. **Führe `BUILD-ALL-OS.bat` aus**
2. **Kopiere die komplette Konsolenausgabe**
3. **Prüfe:**
   - Gibt es Fehlermeldungen zu Go/Python?
   - Gibt es Pfad-Fehler?
   - Gibt es PowerShell-Fehler?

### Beispiel-Debugging

```bat
REM Prüfe Go
go version

REM Prüfe Python
python --version

REM Prüfe Pfade
dir "go-executable\build-all.ps1"
dir "python-executable\python-server.py"

REM Prüfe Builds
dir "go-executable\build" /s
dir "python-executable\build" /s
```

---

## 📝 Master-Scripts

### RUN-ALL.bat
- Baut alle OS
- Zeigt alle Builds
- Startet Server (optional)
- Mit Pausen zwischen Schritten

### RUN-ALL-AUTO.bat
- Vollautomatisch (keine Pausen)
- Baut alle OS
- Zeigt alle Builds
- Startet Server automatisch

### RUN-ALL-QUICK.bat
- Nur Builds (ohne Anzeige/Server)
- Schnellste Variante

---

## ✅ Checkliste

- [x] BUILD-ALL-OS.bat - Logisch konsistent
- [x] SHOW-ALL-OS.bat - Logisch konsistent
- [x] START-SERVER.bat - Logisch konsistent
- [x] Master-Scripts erstellt
- [x] Dokumentation erstellt

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

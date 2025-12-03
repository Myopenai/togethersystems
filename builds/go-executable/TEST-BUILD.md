# T,. OSOTOSOS Build Pipeline - Test-Anleitung

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

## 🔍 Voraussetzungen prüfen

### 1. Go installiert?

Öffne PowerShell und führe aus:
```powershell
go version
```

**Erwartete Ausgabe:**
```
go version go1.21.x windows/amd64
```

**Wenn nicht installiert:**
- Download: https://golang.org/dl/
- Installieren und PATH prüfen

---

## 🚀 Build ausführen

### Schritt 1: Verzeichnis wechseln

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\builds\go-executable"
```

### Schritt 2: Execution Policy prüfen (falls nötig)

Falls Fehler "cannot be loaded because running scripts is disabled":

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Schritt 3: Build ausführen

```powershell
.\build-all.ps1
```

---

## 📋 Alternative: Manueller Build

Wenn das Script nicht funktioniert, kannst du auch manuell bauen:

### Windows amd64:
```powershell
$env:GOOS="windows"
$env:GOARCH="amd64"
go build -ldflags="-s -w -H windowsgui" -o build/windows-amd64/ostosos-server.exe main.go
```

### Linux amd64:
```powershell
$env:GOOS="linux"
$env:GOARCH="amd64"
go build -ldflags="-s -w" -o build/linux-amd64/ostosos-server main.go
```

---

## ✅ Erwartete Ausgabe

Bei erfolgreichem Build siehst du:

```
========================================
T,. OSOTOSOS Universal Go Build Pipeline
========================================

Prüfe Go Installation...
✓ Go gefunden: go version go1.21.x ...

Building für alle Plattformen...

Building Windows Binaries...
  → Windows (amd64)...
    ✓ Windows (amd64) Build erfolgreich
  → Windows (arm64)...
    ✓ Windows (arm64) Build erfolgreich

Building macOS Binaries...
  → macOS (amd64)...
    ✓ macOS (amd64) Build erfolgreich
  → macOS (arm64/Apple Silicon)...
    ✓ macOS (arm64) Build erfolgreich

Building Linux Binaries...
  → Linux (amd64)...
    ✓ Linux (amd64) Build erfolgreich
  → Linux (arm64)...
    ✓ Linux (arm64) Build erfolgreich
  → Linux (386)...
    ✓ Linux (386) Build erfolgreich

========================================
✓ Build Pipeline abgeschlossen!
========================================
```

---

## 🔧 Probleme beheben

### Problem: "Go nicht gefunden"

**Lösung:**
1. Prüfe ob Go installiert ist: `go version`
2. Prüfe PATH: `$env:PATH`
3. Go neu installieren falls nötig

### Problem: "Execution Policy"

**Lösung:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problem: "Binary nicht gefunden nach Build"

**Lösung:**
- Prüfe `build/` Verzeichnis
- Prüfe ob Build erfolgreich war
- Prüfe Go-Installation

---

## 📂 Build-Ausgabe

Nach erfolgreichem Build findest du die Binaries in:

```
builds/go-executable/build/
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

## 🧪 Test eines Builds

### Windows Binary testen:

```powershell
cd build/windows-amd64
.\ostosos-server.exe
```

### Server sollte starten auf:
```
http://localhost:8080
```

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems


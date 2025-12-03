# T,. OSOTOSOS Quick Start

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

## ⚡ Schnellstart in 3 Schritten

### 1. Prüfe Go Installation

```powershell
go version
```

**Erwartet:** `go version go1.21.x ...`

---

### 2. Wechsle ins Verzeichnis

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\builds\go-executable"
```

---

### 3. Starte Build

```powershell
.\build-all.ps1
```

---

## 📦 Build für eine Plattform

### Nur Windows:
```powershell
$env:GOOS="windows"
$env:GOARCH="amd64"
go build -o build/ostosos-server.exe main.go
```

### Nur Linux:
```powershell
$env:GOOS="linux"
$env:GOARCH="amd64"
go build -o build/ostosos-server main.go
```

---

## ✅ Fertig!

Binaries findest du in: `build/`

**T,.&T,,.&T,,,.T.** - Together Systems


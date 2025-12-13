# [.SYSTEMS.T.SYSTEMS.] OS Build Ordner-Struktur

**Original:** https://tinyurl.com/BUGCOMPANY  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

---

## 📦 Go Builds - Ordner-Struktur

**Hauptordner:** `builds\go-executable\build\`

```
builds\go-executable\build\
  ├── linux-386\
  │   └── ostosos-server
  ├── linux-amd64\
  │   └── ostosos-server
  ├── linux-arm64\
  │   └── ostosos-server
  ├── macos-amd64\
  │   └── ostosos-server
  ├── macos-arm64\
  │   └── ostosos-server
  ├── windows-amd64\
  │   └── ostosos-server.exe
  └── windows-arm64\
      └── ostosos-server.exe
```

### Vollständige Pfade

**Windows:**
- `builds\go-executable\build\windows-amd64\ostosos-server.exe`
- `builds\go-executable\build\windows-arm64\ostosos-server.exe`

**Linux:**
- `builds\go-executable\build\linux-amd64\ostosos-server`
- `builds\go-executable\build\linux-arm64\ostosos-server`
- `builds\go-executable\build\linux-386\ostosos-server`

**macOS:**
- `builds\go-executable\build\macos-amd64\ostosos-server`
- `builds\go-executable\build\macos-arm64\ostosos-server`

---

## 🐍 Python Builds - Ordner-Struktur

**Hauptordner:** `builds\python-executable\build\`

```
builds\python-executable\build\
  └── windows-amd64\
      └── ostosos-server.exe
```

### Vollständige Pfade

**Windows:**
- `builds\python-executable\build\windows-amd64\ostosos-server.exe`

**Weitere Plattformen:** Via CI/CD (`.github\workflows\build-all-platforms.yml`)

---

## 📂 Projekt-Struktur

```
D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\
  └── builds\
      ├── go-executable\
      │   ├── build\                    ← GO BUILDS HIER
      │   │   ├── windows-amd64\
      │   │   ├── windows-arm64\
      │   │   ├── linux-amd64\
      │   │   ├── linux-arm64\
      │   │   ├── linux-386\
      │   │   ├── macos-amd64\
      │   │   └── macos-arm64\
      │   ├── main.go
      │   └── build-all.ps1
      └── python-executable\
          ├── build\                     ← PYTHON BUILDS HIER
          │   └── windows-amd64\
          ├── python-server.py
          └── build-all-platforms.sh
```

---

## 🎯 Schnellzugriff

### Windows Builds
```powershell
cd "builds\go-executable\build\windows-amd64"
.\ostosos-server.exe
```

### Linux Builds
```bash
cd builds/go-executable/build/linux-amd64
./ostosos-server
```

### macOS Builds
```bash
cd builds/go-executable/build/macos-arm64
./ostosos-server
```

---

## 📝 Ordner-Namen Konvention

**Format:** `{os}-{arch}`

- `windows-amd64` = Windows 64-bit (x64)
- `windows-arm64` = Windows ARM 64-bit
- `linux-amd64` = Linux 64-bit (x64)
- `linux-arm64` = Linux ARM 64-bit
- `linux-386` = Linux 32-bit
- `macos-amd64` = macOS Intel (x64)
- `macos-arm64` = macOS Apple Silicon (ARM)

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

# T,. OSOTOSOS CI/CD Integration Guide

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

Vollständige Anleitung zur CI/CD-Integration mit GitHub Actions.

---

## 🚀 GitHub Actions

### Workflow-Datei

Die CI/CD-Pipeline ist bereits konfiguriert in:
- `.github/workflows/build-and-release.yml`

### Features

✅ **Automatisches Build** bei jedem Push
✅ **Cross-Platform Builds** für alle Plattformen
✅ **Automatische Releases** bei Tag-Erstellung
✅ **Artifact Upload** für alle Builds
✅ **Release Assets** automatisch erstellt

---

## 📋 Workflow-Trigger

### 1. Push zu main/master
```yaml
on:
  push:
    branches: [ main, master ]
```

### 2. Pull Requests
```yaml
on:
  pull_request:
    branches: [ main, master ]
```

### 3. Release erstellen
```yaml
on:
  release:
    types: [ created ]
```

### 4. Manuell auslösen
```yaml
on:
  workflow_dispatch:
```

---

## 🔨 Build-Matrix

### Unterstützte Plattformen

| OS | Arch | GoOS | GoARCH | Extension |
|----|------|------|--------|-----------|
| Windows | amd64 | windows | amd64 | .exe |
| Windows | arm64 | windows | arm64 | .exe |
| macOS | amd64 | darwin | amd64 | - |
| macOS | arm64 | darwin | arm64 | - |
| Linux | amd64 | linux | amd64 | - |
| Linux | arm64 | linux | arm64 | - |
| Linux | 386 | linux | 386 | - |

---

## 📦 Release-Erstellung

### Automatisch

1. **Erstelle Release auf GitHub:**
   - Repository > Releases > "Draft a new release"
   - Tag: `v1.0.0`
   - Titel: `OSTOSOS Server v1.0.0`
   - Beschreibung: Release Notes

2. **Workflow läuft automatisch:**
   - Builds für alle Plattformen
   - Erstellt Release Archive
   - Lädt Assets hoch

3. **Release ist fertig:**
   - Alle Binaries verfügbar
   - ZIP-Archive pro Plattform
   - Download-Links automatisch

---

## 🧪 Tests

### Test-Job

```yaml
test:
  name: Test
  runs-on: ubuntu-latest
  steps:
    - Run tests
    - Build test (Linux)
```

### Tests ausführen

```bash
go test ./... -v
```

---

## 📊 Artifacts

### Artifact-Namen

- `ostosos-server-windows-amd64`
- `ostosos-server-windows-arm64`
- `ostosos-server-darwin-amd64`
- `ostosos-server-darwin-arm64`
- `ostosos-server-linux-amd64`
- `ostosos-server-linux-arm64`
- `ostosos-server-linux-386`

### Artifact-Download

Nach Build abrufbar für 30 Tage:
- GitHub Actions > Run > Artifacts

---

## 🔄 Automatische Updates

### Update-Check im Code

```go
// Prüfe auf Updates
func checkForUpdates() {
    resp, err := http.Get("https://api.github.com/repos/USER/REPO/releases/latest")
    // ...
}
```

### CI/CD Update-Flow

1. **Code Push** → Build läuft
2. **Tag erstellen** → Release erstellt
3. **App prüft** → Update verfügbar
4. **Download** → Automatisch
5. **Installation** → Hintergrund

---

## 🛠️ Lokale Tests

### Workflow lokal testen

```bash
# Installiere act (GitHub Actions lokal)
brew install act  # macOS
# oder
scoop install act  # Windows

# Teste Workflow
cd builds/go-executable
act -l
act push
```

---

## 📝 Workflow-Konfiguration

### Secrets (falls benötigt)

In GitHub Repository Settings > Secrets:

- `GITHUB_TOKEN` - Automatisch verfügbar
- `SIGNING_KEY` - Für Code Signing (optional)
- `DEPLOY_KEY` - Für Deployment (optional)

---

## ✅ Status

- ✅ GitHub Actions Workflow - Implementiert
- ✅ Cross-Platform Builds - Funktionsfähig
- ✅ Automatic Releases - Funktionsfähig
- ✅ Artifact Upload - Funktionsfähig
- ⏳ Code Signing - In Planung
- ⏳ Auto-Deployment - In Planung

---

## 🚀 Schnellstart

### 1. Workflow aktivieren

1. Committe Workflow-Datei:
   ```bash
   git add .github/workflows/build-and-release.yml
   git commit -m "Add CI/CD pipeline"
   git push
   ```

2. Workflow läuft automatisch bei nächstem Push

### 2. Release erstellen

1. Gehe zu: Repository > Releases
2. Klicke: "Draft a new release"
3. Tag: `v1.0.0`
4. Klicke: "Publish release"
5. Workflow erstellt automatisch alle Builds

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems


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

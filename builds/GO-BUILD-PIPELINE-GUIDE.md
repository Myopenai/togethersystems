# T,. Go Build-Pipeline – Universelles One-Click Setup

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

## Ziel

Mit **Go (Golang)** lassen sich plattformübergreifende Builds erstellen, die auf **Windows, macOS, Linux, iOS und Android** laufen.  

Das Ziel ist ein **One-Click Setup**, das sofort nach der Installation startet und den User maximal entlastet (<0,5% Handlungen).

---

## Schritte

### 1. Cross-Compilation

Go unterstützt Cross-Compilation direkt über Umgebungsvariablen:

```bash
# Linux Binary
GOOS=linux GOARCH=amd64 go build -o build/myapp-linux main.go

# Windows Binary
GOOS=windows GOARCH=amd64 go build -o build/myapp-windows.exe

# macOS Binary
GOOS=darwin GOARCH=amd64 go build -o build/myapp-macos
```

👉 Ergebnis: native Binaries für jede Plattform.

---

### 2. Installer-Erstellung

- **Windows:** MSIX, Inno Setup oder WiX → erstellt ein Setup, das dein Go-Binary installiert und sofort startet.  

- **macOS:** `.dmg` oder `.pkg` → Binary eingebettet, Auto-Start nach Installation.  

- **Linux:** `.deb` oder `.rpm` → Paketmanager installiert Binary und startet es.  

- **Mobile:** `gomobile build` → erzeugt APK (Android) oder IPA (iOS).

---

### 3. Auto-Start & Sichtbarkeit

- Installer konfiguriert, dass das Programm **nach Installation automatisch geöffnet wird**.  

- Keine weiteren Userhandlungen nötig.  

- Nur Bedienung des Programms selbst bleibt dem User überlassen.

---

### 4. Updates

- **Hintergrund-Updates** über CI/CD (z. B. GitHub Actions, GitLab, Azure DevOps).  

- User muss keine manuelle Aktualisierung durchführen.  

---

## Ergebnis

- **Universelles Produkt**: läuft auf allen Plattformen.  

- **One-Click Setup**: Installation + sofortiger Start.  

- **Minimaler Useraufwand**: <0,5% Handlungen.  

- **Automatische Updates**: keine Überraschungen, keine Stillstände.  

---

## Fazit

Mit Go erreichst du eine **universelle Build-Pipeline**:  

Ein Klick genügt, und dein Programm läuft sofort auf jedem Gerät – **von A bis Z**.

---

## Implementierung

Die vollständige Pipeline wurde implementiert in:

- ✅ `builds/go-executable/build-all.ps1` - Windows PowerShell Script
- ✅ `builds/go-executable/build-all.sh` - Linux/macOS Bash Script
- ✅ `builds/go-executable/Makefile` - Universal Makefile

**Verwendung:**

```bash
# Windows
.\build-all.ps1

# Linux/macOS
./build-all.sh

# Make
make all
```

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems


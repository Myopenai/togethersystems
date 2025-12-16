# 🔨 BUILD-ANLEITUNG: AUSFÜHRBARE DATEIEN ERSTELLEN

## ⚠️ WICHTIG: Die Builds sind Konfigurationsdateien!

Die Dateien im `builds/` Ordner sind **Konfigurationsdateien**, keine ausführbaren Dateien.  
Um ausführbare Dateien zu erstellen, benötigst du die entsprechenden **Build-Tools**.

---

## ✅ SOFORT VERWENDBAR (Keine Kompilierung nötig):

### 1. WEB PWA
**Pfad:** `builds/web/pwa/`

**So verwenden:**
1. Öffne `index.html` direkt im Browser
2. Oder starte einen lokalen Webserver:
   ```powershell
   cd builds\web\pwa
   python -m http.server 8080
   ```
3. Öffne im Browser: `http://localhost:8080`

**Launcher erstellt:** `START-OSTOSOS.bat` (Windows) oder `start-ostosos.sh` (Linux)

---

## 🔧 AUSFÜHRBARE DATEIEN ERSTELLEN:

### 2. ELECTRON (Windows EXE, macOS APP, Linux)

**Benötigt:**
- Node.js (https://nodejs.org/)
- npm (kommt mit Node.js)

**Schritte:**
```powershell
cd builds\electron\windows
npm install
npm install electron electron-builder --save-dev
npm run build
```

**Ergebnis:** `.exe` Datei im `dist/` Ordner

---

### 3. DOCKER IMAGE

**Benötigt:**
- Docker Desktop (https://www.docker.com/products/docker-desktop)

**Schritte:**
```powershell
cd builds\docker
docker build -t ostosos:latest .
docker run -p 8080:80 ostosos:latest
```

**Ergebnis:** Docker Image `ostosos:latest`

---

### 4. C-SYSTEM (Windows EXE)

**Benötigt:**
- GCC Compiler (MinGW auf Windows: https://www.mingw-w64.org/)

**Schritte:**
```powershell
cd builds\c-system
gcc -o ostosos-server.exe ostosos-server.c
```

**Ergebnis:** `ostosos-server.exe`

---

### 5. WINDOWS MSI INSTALLER

**Benötigt:**
- WiX Toolset (https://wixtoolset.org/)

**Schritte:**
```powershell
cd builds\windows\msi
candle ostosos.wxs
light ostosos.wixobj
```

**Ergebnis:** `ostosos.msi`

---

### 6. macOS DMG/PKG

**Benötigt:**
- macOS Computer
- Xcode Command Line Tools

**Schritte:**
```bash
cd builds/macos/dmg
chmod +x create-dmg.sh
./create-dmg.sh
```

**Ergebnis:** `OSTOSOS.dmg`

---

### 7. LINUX DEB PACKAGE

**Benötigt:**
- Linux System (Debian/Ubuntu)
- dpkg-deb

**Schritte:**
```bash
cd builds/linux/deb
dpkg-deb --build ostosos_1.0.0
```

**Ergebnis:** `ostosos_1.0.0.deb`

---

### 8. LINUX RPM PACKAGE

**Benötigt:**
- Linux System (Red Hat/Fedora)
- rpmbuild

**Schritte:**
```bash
cd builds/linux/rpm
rpmbuild -ba ostosos.spec
```

**Ergebnis:** `.rpm` Datei

---

### 9. ANDROID APK

**Benötigt:**
- Android Studio
- Android SDK
- Gradle

**Schritte:**
1. Öffne Android Studio
2. Importiere `builds/android/apk/`
3. Build → Build APK

**Ergebnis:** `app-debug.apk`

---

### 10. iOS IPA

**Benötigt:**
- macOS Computer
- Xcode
- Apple Developer Account

**Schritte:**
1. Öffne Xcode
2. Importiere `builds/ios/ipa/`
3. Product → Archive

**Ergebnis:** `.ipa` Datei

---

## 📋 ZUSAMMENFASSUNG:

| Build-Typ | Tool benötigt | Schwierigkeit |
|-----------|---------------|---------------|
| **Web PWA** | Browser | ✅ Sehr einfach |
| **Electron** | Node.js + npm | ✅ Einfach |
| **Docker** | Docker Desktop | ✅ Einfach |
| **C-System** | GCC | ✅ Einfach |
| **Windows MSI** | WiX Toolset | ⚠️ Mittel |
| **macOS DMG** | macOS + Xcode | ⚠️ Mittel |
| **Linux DEB** | Linux + dpkg | ⚠️ Mittel |
| **Linux RPM** | Linux + rpmbuild | ⚠️ Mittel |
| **Android APK** | Android Studio | ⚠️ Mittel |
| **iOS IPA** | macOS + Xcode + Account | ❌ Schwer |

---

## 🚀 SCHNELLSTART (Einfachste Methode):

**Für sofortige Nutzung:**
1. Öffne `builds/web/pwa/` im Browser
2. Oder verwende `START-OSTOSOS.bat`

**Für ausführbare Datei (Windows):**
1. Installiere Node.js
2. Führe aus: `ERSTELLE-AUSFUEHRBARE-BUILDS.ps1`
3. Oder manuell: `cd builds\electron\windows && npm install && npm run build`

---

**T,.&T,,.&T,,,. TOGETHERSYSTEMS**  
**Alle Konfigurationen sind vorhanden - Tools installieren und bauen!**


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

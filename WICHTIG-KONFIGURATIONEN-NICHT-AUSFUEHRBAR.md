# ⚠️ WICHTIG: DAS SIND KONFIGURATIONEN, NICHT AUSFÜHRBARE DATEIEN!

## 📋 SITUATION:

Die Dateien im `builds/` Ordner sind **Konfigurationsdateien**, keine ausführbaren Dateien!

### Was ist vorhanden:
- ✅ Konfigurationsdateien (XML, JSON, YAML, etc.)
- ✅ Build-Scripts
- ✅ Manifeste
- ✅ Installer-Konfigurationen

### Was fehlt:
- ❌ Ausführbare .exe Dateien
- ❌ Kompilierte Programme
- ❌ Installer-Pakete (.msi, .dmg, etc.)

---

## ✅ SOFORT VERWENDBAR:

### WEB PWA (Funktioniert sofort!)
**Pfad:** `builds/web/pwa/`

**So verwenden:**
1. Öffne `index.html` direkt im Browser
2. Oder starte einen lokalen Server:
   ```powershell
   cd builds\web\pwa
   python -m http.server 8080
   ```
3. Öffne: `http://localhost:8080`

---

## 🔧 AUSFÜHRBARE DATEIEN ERSTELLEN:

Um ausführbare Dateien zu erstellen, benötigst du die entsprechenden **Build-Tools**:

### 1. Electron (Windows EXE)
**Benötigt:** Node.js + npm + electron-builder
**Anleitung:** Siehe `BUILD-ANLEITUNG-AUSFUEHRBARE-DATEIEN.md`

### 2. Docker Image
**Benötigt:** Docker Desktop
**Anleitung:** Siehe `BUILD-ANLEITUNG-AUSFUEHRBARE-DATEIEN.md`

### 3. C-System (EXE)
**Benötigt:** GCC Compiler
**Anleitung:** Siehe `BUILD-ANLEITUNG-AUSFUEHRBARE-DATEIEN.md`

### 4. Windows MSI
**Benötigt:** WiX Toolset
**Anleitung:** Siehe `BUILD-ANLEITUNG-AUSFUEHRBARE-DATEIEN.md`

### 5. macOS DMG/PKG
**Benötigt:** macOS + Xcode
**Anleitung:** Siehe `BUILD-ANLEITUNG-AUSFUEHRBARE-DATEIEN.md`

### 6. Linux DEB/RPM
**Benötigt:** Linux System + dpkg/rpmbuild
**Anleitung:** Siehe `BUILD-ANLEITUNG-AUSFUEHRBARE-DATEIEN.md`

---

## 📖 VOLLSTÄNDIGE ANLEITUNG:

Siehe: **`BUILD-ANLEITUNG-AUSFUEHRBARE-DATEIEN.md`**

---

**T,.&T,,.&T,,,. TOGETHERSYSTEMS**  
**Konfigurationen vorhanden - Tools installieren und bauen!**




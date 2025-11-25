# 📤 GIT COMMIT & PUSH - ANLEITUNG

## ✅ AUTOMATISCHES SKRIPT

Führe das PowerShell-Skript aus:

```powershell
.\commit-and-push.ps1
```

Das Skript führt automatisch aus:
1. `git status` - Zeigt alle Änderungen
2. `git add .` - Fügt alle Dateien hinzu
3. `git commit -m "..."` - Erstellt Commit
4. `git push origin main` - Pusht zu GitHub

---

## 🔧 MANUELLE AUSFÜHRUNG

Falls das Skript nicht funktioniert, führe diese Befehle manuell aus:

```powershell
# 1. Status prüfen
git status

# 2. Alle Änderungen hinzufügen
git add .

# 3. Commit erstellen
git commit -m "Alle kritischen Fehler behoben: Autofix, Service Worker, Bilder, Farbsplashes, Telbank-Links"

# 4. Push zu GitHub
git push origin main
```

---

## ⚠️ FALLS PUSH FEHLSCHLÄGT

### Problem: "Updates were rejected because the remote contains work"

**Lösung:**
```powershell
# Remote-Änderungen holen und mergen
git pull origin main --allow-unrelated-histories

# Falls Konflikte: Auflösen, dann:
git add .
git commit -m "Merge remote changes"

# Dann pushen
git push origin main
```

### Problem: "Permission denied" oder "403 Forbidden"

**Lösung:**
1. Alte Git-Credentials entfernen:
   - Windows: Einstellungen → Anmeldeinformationsverwaltung → Windows-Anmeldeinformationsverwaltung
   - Suche nach "github.com" und lösche Einträge

2. Neues Personal Access Token erstellen:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Neuen Token mit `repo` Scope erstellen

3. Token beim Push verwenden:
   ```powershell
   git push https://[TOKEN]@github.com/myopenai/togethersystems.git main
   ```

---

## ✅ NACH ERFOLGREICHEM PUSH

### 1. Browser-Cache leeren
- **Strg+Shift+R** (Hard Reload)
- Oder: Browser-Einstellungen → Verlauf löschen → Bilder und Dateien im Cache

### 2. Service Worker aktualisieren
1. **DevTools öffnen** (F12)
2. **Application** Tab
3. **Service Workers** (links)
4. **"Unregister"** klicken
5. Seite neu laden

### 3. Seite neu laden
- **Strg+F5** (Hard Reload)
- Oder: Seite schließen und neu öffnen

---

## 📋 GEÄNDERTE DATEIEN

Folgende Dateien wurden geändert:

- ✅ `autofix-client.js` - `window.enqueueError` exportiert
- ✅ `sw.js` - Cache-Name aktualisiert (v1 → v2)
- ✅ `index.html` - Telbank-Link in Toolbar hinzugefügt
- ✅ `KRITISCHE-FEHLER-BEHEBUNG-KOMPLETT.md` - Dokumentation
- ✅ `ALLE-FEHLER-BEHOBEN.md` - Zusammenfassung

---

## 🎯 ERFOLG

Nach erfolgreichem Push:
- ✅ Alle Änderungen sind auf GitHub
- ✅ Cloudflare Pages deployt automatisch (falls GitHub Actions konfiguriert)
- ✅ Website wird aktualisiert

**Status:** Bereit für Deployment!



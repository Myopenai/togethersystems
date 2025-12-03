# ✅ FINALE GIT-BEFEHLE - Mit deinem Username "kean"

## ✅ Dein GitHub-Username: kean

Führe diese Befehle **nacheinander** in PowerShell aus:

---

## 🔧 SCHRITT 1: Remote korrigieren

```powershell
git remote remove origin
git remote add origin https://github.com/kean/togethersystems-portal.git
git remote -v
```

**Prüfe die Ausgabe:** Es sollte zeigen:
```
origin  https://github.com/kean/togethersystems-portal.git (fetch)
origin  https://github.com/kean/togethersystems-portal.git (push)
```

---

## 🔧 SCHRITT 2: Code pushen

```powershell
git push -u origin main
```

**Falls Authentifizierung erforderlich:**
- GitHub wird nach Username/Password fragen
- **Username:** `kean`
- **Password:** Verwende **Personal Access Token** (nicht dein Passwort!)
- Token erstellen: https://github.com/settings/tokens
- Scopes: `repo` (vollständiger Zugriff)

---

## ⚠️ WICHTIG: Repository muss existieren!

**Falls Fehler "Repository not found":**
1. Gehe zu: https://github.com/new
2. Repository name: `togethersystems-portal`
3. **NICHT** "Initialize with README" ankreuzen
4. Klicke "Create repository"
5. Dann nochmal pushen

---

## ✅ NACH ERFOLGREICHEM PUSH

1. Gehe zu: https://github.com/kean/togethersystems-portal
2. Prüfe ob alle Dateien da sind
3. Gehe zu: Settings → Secrets and variables → Actions
4. Füge hinzu:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
5. GitHub Actions deployt automatisch!

---

**Führe jetzt die Befehle aus!**


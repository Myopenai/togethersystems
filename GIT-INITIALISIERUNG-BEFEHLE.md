# 🚀 GIT INITIALISIERUNG - Befehle zum Ausführen

## ✅ Schritt 1: Git Repository initialisieren

Führe diese Befehle **nacheinander** in PowerShell aus:

```powershell
# 1. Git Repository initialisieren
git init

# 2. Alle Dateien hinzufügen
git add .

# 3. Ersten Commit erstellen
git commit -m "Initial commit: TogetherSystems Portal - Alle Features implementiert"

# 4. Branch auf 'main' umbenennen
git branch -M main
```

---

## ✅ Schritt 2: GitHub Repository erstellen

**WICHTIG:** Mache das **BEVOR** du den Remote hinzufügst!

1. Gehe zu: https://github.com/new
2. **Repository name:** `togethersystems-portal` (oder wie du willst)
3. **Description:** (optional) "TogetherSystems Portal - Business Connect Hub"
4. Wähle **Public** oder **Private**
5. **NICHT** "Initialize with README" ankreuzen
6. Klicke **"Create repository"**
7. **Kopiere die Repository URL** (wird angezeigt)

---

## ✅ Schritt 3: Remote Repository hinzufügen

**Ersetze `DEIN-USERNAME` und `togethersystems-portal` mit deinen Werten!**

```powershell
# Remote Repository hinzufügen
git remote add origin https://github.com/DEIN-USERNAME/togethersystems-portal.git

# Prüfen ob Remote korrekt ist
git remote -v
```

---

## ✅ Schritt 4: Code zu GitHub pushen

```powershell
# Code zu GitHub pushen
git push -u origin main
```

**Falls Authentifizierung erforderlich:**
- GitHub wird nach Username/Password fragen
- Verwende **Personal Access Token** statt Password (sicherer)
- Token erstellen: https://github.com/settings/tokens

---

## ✅ Schritt 5: GitHub Secrets konfigurieren

1. Gehe zu deinem Repository auf GitHub
2. Klicke auf **"Settings"** (oben im Menü)
3. Links: **"Secrets and variables"** → **"Actions"**
4. Klicke **"New repository secret"**
5. Füge hinzu:
   - **Name:** `CLOUDFLARE_API_TOKEN`
   - **Secret:** (dein Cloudflare API Token)
6. Klicke **"Add secret"**
7. Wiederhole für:
   - **Name:** `CLOUDFLARE_ACCOUNT_ID`
   - **Secret:** (deine Cloudflare Account ID)

---

## ✅ Schritt 6: Cloudflare Token & Account ID holen

### Cloudflare API Token:
1. Gehe zu: https://dash.cloudflare.com/profile/api-tokens
2. Klicke **"Create Token"**
3. Wähle **"Edit Cloudflare Workers"** Template
4. Klicke **"Continue to summary"**
5. Klicke **"Create Token"**
6. **Kopiere den Token** (wird nur einmal angezeigt!)

### Cloudflare Account ID:
1. Gehe zu: https://dash.cloudflare.com/
2. Klicke auf **"Workers & Pages"**
3. Die **Account ID** steht rechts oben
4. **Kopiere die Account ID**

---

## ✅ Schritt 7: Deployment testen

Nach dem ersten Push sollte automatisch deployt werden:

1. Gehe zu: https://github.com/DEIN-USERNAME/togethersystems-portal
2. Klicke auf **"Actions"** Tab
3. Du solltest einen Workflow-Run sehen: **"Deploy to Cloudflare Pages"**
4. Klicke darauf, um den Status zu sehen

---

## 🔧 TROUBLESHOOTING

### Problem: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/DEIN-USERNAME/togethersystems-portal.git
```

### Problem: "Authentication failed"
- Verwende Personal Access Token statt Password
- Token erstellen: https://github.com/settings/tokens
- Scopes: `repo` (vollständiger Zugriff)

### Problem: "Workflow not found"
- Prüfe ob `.github/workflows/deploy.yml` existiert
- Prüfe: `git add .github/workflows/deploy.yml`
- Prüfe: `git commit -m "Add GitHub workflow"`

---

## ✅ FERTIG!

Nach erfolgreichem Push:
- ✅ Code ist auf GitHub
- ✅ GitHub Actions läuft automatisch
- ✅ Deployment zu Cloudflare Pages startet
- ✅ Website ist live unter: `https://ts-portal.pages.dev`

**Viel Erfolg! 🚀**


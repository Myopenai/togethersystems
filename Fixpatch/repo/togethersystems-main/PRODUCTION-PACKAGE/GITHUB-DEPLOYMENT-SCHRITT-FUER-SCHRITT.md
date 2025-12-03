# 🚀 GITHUB DEPLOYMENT - Schritt für Schritt Anleitung

## ✅ Voraussetzungen

- GitHub Account
- Cloudflare Account
- Git installiert auf deinem Computer
- Wrangler CLI installiert (optional, für manuelles Deployment)

---

## 📋 SCHRITT 1: Cloudflare API Token erstellen

### 1.1 Cloudflare Dashboard öffnen
1. Gehe zu: https://dash.cloudflare.com/
2. Logge dich ein

### 1.2 API Token erstellen
1. Klicke auf dein **Profil** (rechts oben)
2. Wähle **"My Profile"**
3. Gehe zu **"API Tokens"** (linke Sidebar)
4. Klicke auf **"Create Token"**
5. Wähle **"Edit Cloudflare Workers"** Template
6. Oder erstelle Custom Token mit folgenden Permissions:
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **Account Settings** → **Read**
7. Klicke **"Continue to summary"**
8. Klicke **"Create Token"**
9. **WICHTIG:** Kopiere den Token sofort (wird nur einmal angezeigt!)
   - Beispiel: `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

### 1.3 Account ID finden
1. Im Cloudflare Dashboard → **"Workers & Pages"**
2. Klicke auf **"Overview"**
3. Die **Account ID** steht rechts oben
   - Beispiel: `8c8df1278bdf1a2e47def8fe2c8e5bd0`
4. Kopiere die Account ID

---

## 📋 SCHRITT 2: GitHub Repository erstellen

### 2.1 Neues Repository auf GitHub
1. Gehe zu: https://github.com/new
2. **Repository name:** z.B. `togethersystems-portal`
3. **Description:** (optional) "TogetherSystems Portal - Business Connect Hub"
4. Wähle **Public** oder **Private**
5. **NICHT** "Initialize with README" ankreuzen (wenn Code schon vorhanden)
6. Klicke **"Create repository"**

### 2.2 Repository URL kopieren
- Beispiel: `https://github.com/DEIN-USERNAME/togethersystems-portal.git`
- Kopiere diese URL

---

## 📋 SCHRITT 3: Lokales Git Repository initialisieren

### 3.1 Git im Projektordner initialisieren
Öffne PowerShell im Projektordner:
```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)"
```

### 3.2 Git Repository initialisieren
```powershell
git init
```

### 3.3 .gitignore prüfen
Stelle sicher, dass `.gitignore` existiert (sollte bereits vorhanden sein):
```powershell
Get-Content .gitignore
```

Falls nicht vorhanden, erstelle es:
```powershell
@"
node_modules/
BACKUPS/
*.log
.env
.wrangler/
playwright-report/
test-results/
"@ | Out-File -FilePath .gitignore -Encoding UTF8
```

### 3.4 Alle Dateien hinzufügen
```powershell
git add .
```

### 3.5 Erster Commit
```powershell
git commit -m "Initial commit: TogetherSystems Portal mit Bildkarussell, Farbsplashes und allen Features"
```

### 3.6 Branch umbenennen (falls nötig)
```powershell
git branch -M main
```

### 3.7 Remote Repository hinzufügen
Ersetze `DEIN-USERNAME` und `togethersystems-portal` mit deinen Werten:
```powershell
git remote add origin https://github.com/DEIN-USERNAME/togethersystems-portal.git
```

### 3.8 Code zu GitHub pushen
```powershell
git push -u origin main
```

**Falls Authentifizierung erforderlich:**
- GitHub wird nach Username/Password fragen
- Oder verwende Personal Access Token statt Password

---

## 📋 SCHRITT 4: GitHub Secrets konfigurieren

### 4.1 Repository Settings öffnen
1. Gehe zu deinem GitHub Repository
2. Klicke auf **"Settings"** (oben im Menü)

### 4.2 Secrets öffnen
1. Links in der Sidebar: **"Secrets and variables"**
2. Klicke auf **"Actions"**

### 4.3 CLOUDFLARE_API_TOKEN hinzufügen
1. Klicke **"New repository secret"**
2. **Name:** `CLOUDFLARE_API_TOKEN`
3. **Secret:** Füge den Token aus Schritt 1.2 ein
4. Klicke **"Add secret"**

### 4.4 CLOUDFLARE_ACCOUNT_ID hinzufügen
1. Klicke **"New repository secret"**
2. **Name:** `CLOUDFLARE_ACCOUNT_ID`
3. **Secret:** Füge die Account ID aus Schritt 1.3 ein
4. Klicke **"Add secret"**

---

## 📋 SCHRITT 5: Cloudflare Pages Projekt erstellen

### 5.1 Cloudflare Pages öffnen
1. Gehe zu: https://dash.cloudflare.com/
2. Wähle **"Workers & Pages"** (linke Sidebar)
3. Klicke auf **"Create application"**
4. Wähle **"Pages"** Tab
5. Klicke **"Connect to Git"**

### 5.2 GitHub verbinden
1. Wähle **"GitHub"** als Git Provider
2. Autorisiere Cloudflare (falls nötig)
3. Wähle dein Repository: `togethersystems-portal`
4. Klicke **"Begin setup"**

### 5.3 Projekt konfigurieren
1. **Project name:** `ts-portal` (oder wie du willst)
2. **Production branch:** `main` (oder `master`)
3. **Build command:** (leer lassen - statische Seite)
4. **Build output directory:** `.` (Root-Verzeichnis)
5. Klicke **"Save and Deploy"**

**ODER:** Wenn GitHub Actions verwendet werden soll:
- Lasse Cloudflare Pages Projekt leer
- GitHub Actions wird automatisch deployen

---

## 📋 SCHRITT 6: Deployment testen

### 6.1 Code ändern und pushen
Ändere eine kleine Datei (z.B. README.md) und pushe:
```powershell
git add .
git commit -m "Test deployment"
git push origin main
```

### 6.2 GitHub Actions prüfen
1. Gehe zu deinem Repository auf GitHub
2. Klicke auf **"Actions"** Tab
3. Du solltest einen Workflow-Run sehen: **"Deploy to Cloudflare Pages"**
4. Klicke darauf, um den Status zu sehen

### 6.3 Cloudflare Pages prüfen
1. Gehe zu Cloudflare Dashboard → **"Workers & Pages"**
2. Klicke auf dein Projekt: `ts-portal`
3. Du siehst die Deployment-Historie
4. Klicke auf das neueste Deployment
5. Die URL ist: `https://ts-portal.pages.dev` (oder ähnlich)

---

## 📋 SCHRITT 7: Custom Domain (optional)

### 7.1 Custom Domain hinzufügen
1. Im Cloudflare Pages Projekt → **"Custom domains"**
2. Klicke **"Set up a custom domain"**
3. Gib deine Domain ein (z.B. `togethersystems.com`)
4. Folge den DNS-Anweisungen

---

## ✅ FERTIG!

### Was jetzt automatisch passiert:
- ✅ Jeder Push zu `main` → automatisches Deployment
- ✅ GitHub Actions führt Deployment aus
- ✅ Cloudflare Pages wird aktualisiert
- ✅ Website ist live unter: `https://ts-portal.pages.dev`

### Nächste Schritte:
1. Code ändern
2. `git add .`
3. `git commit -m "Beschreibung"`
4. `git push origin main`
5. Deployment läuft automatisch!

---

## 🔧 TROUBLESHOOTING

### Problem: "Workflow not found"
- Prüfe ob `.github/workflows/deploy.yml` existiert
- Prüfe ob Datei im Repository ist: `git add .github/workflows/deploy.yml`

### Problem: "Secrets not found"
- Prüfe GitHub Secrets: Settings → Secrets and variables → Actions
- Namen müssen exakt sein: `CLOUDFLARE_API_TOKEN` und `CLOUDFLARE_ACCOUNT_ID`

### Problem: "Deployment failed"
- Prüfe Cloudflare API Token Permissions
- Prüfe Account ID
- Prüfe GitHub Actions Logs für Details

### Problem: "Git push failed"
- Prüfe Git Credentials
- Verwende Personal Access Token statt Password
- Prüfe Repository URL

---

## 📞 HILFE

Bei Problemen:
1. GitHub Actions Logs prüfen
2. Cloudflare Dashboard prüfen
3. Git Status prüfen: `git status`

**Viel Erfolg! 🚀**




---
## 🏢 Unternehmens-Branding

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

**Initiator:** Raymond Demitrio Tel  
**ORCID:** [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430)  
**Website:** [tel1.nl](https://tel1.nl)  
**WhatsApp:** [+31 613 803 782](https://wa.me/31613803782)  
**GitHub:** [myopenai/togethersystems](https://github.com/myopenai/togethersystems)  
**Businessplan:** [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf)

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---

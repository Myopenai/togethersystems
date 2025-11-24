# ⚡ QUICK START - GitHub Deployment

## 🚀 Schnellstart (5 Minuten)

### 1. Cloudflare Token & Account ID
```powershell
# Gehe zu: https://dash.cloudflare.com/profile/api-tokens
# Erstelle Token mit "Edit Cloudflare Workers" Template
# Kopiere Token und Account ID
```

### 2. GitHub Repository erstellen
```powershell
# Gehe zu: https://github.com/new
# Erstelle Repository: togethersystems-portal
# Kopiere Repository URL
```

### 3. Git initialisieren
```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/togethersystems-portal.git
git push -u origin main
```

### 4. GitHub Secrets
```powershell
# Gehe zu: https://github.com/DEIN-USERNAME/togethersystems-portal/settings/secrets/actions
# Füge hinzu:
# - CLOUDFLARE_API_TOKEN: (dein Token)
# - CLOUDFLARE_ACCOUNT_ID: (deine Account ID)
```

### 5. Fertig!
```powershell
# Jeder Push deployt automatisch:
git add .
git commit -m "Update"
git push origin main
```

**Deployment läuft automatisch! 🎉**


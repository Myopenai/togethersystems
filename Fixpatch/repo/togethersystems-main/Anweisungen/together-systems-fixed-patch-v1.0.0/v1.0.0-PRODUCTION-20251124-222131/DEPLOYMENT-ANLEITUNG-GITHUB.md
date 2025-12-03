# 🚀 DEPLOYMENT-ANLEITUNG - GitHub + Cloudflare Pages

## ✅ GitHub Deployment eingerichtet

**Datei:** `.github/workflows/deploy.yml`

---

## 📋 ZWEI DEPLOYMENT-OPTIONEN

### Option 1: Direkt via Wrangler (aktuell)

```powershell
wrangler pages deploy . --project-name ts-portal
```

### Option 2: Automatisch via GitHub (NEU)

**Vorteile:**
- ✅ Automatisches Deployment bei jedem Push
- ✅ Keine manuellen Befehle nötig
- ✅ Versionierung über Git

**Setup:**
1. Repository auf GitHub pushen
2. GitHub Secrets konfigurieren:
   - `CLOUDFLARE_API_TOKEN` (aus Cloudflare Dashboard)
   - `CLOUDFLARE_ACCOUNT_ID` (aus Cloudflare Dashboard)
3. Bei jedem Push zu `main`/`master` wird automatisch deployed

---

## 🔧 GITHUB SECRETS EINRICHTEN

1. **Cloudflare API Token erstellen:**
   - Cloudflare Dashboard → My Profile → API Tokens
   - "Create Token" → "Edit Cloudflare Workers" Template
   - Account ID kopieren
   - Token kopieren

2. **GitHub Secrets hinzufügen:**
   - Repository → Settings → Secrets and variables → Actions
   - "New repository secret" für:
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFLARE_ACCOUNT_ID`

---

## ✅ STATUS

- ✅ GitHub Workflow erstellt (`.github/workflows/deploy.yml`)
- ✅ Automatisches Deployment bei Push
- ✅ Direktes Deployment via Wrangler weiterhin möglich

**Beide Optionen funktionieren!**


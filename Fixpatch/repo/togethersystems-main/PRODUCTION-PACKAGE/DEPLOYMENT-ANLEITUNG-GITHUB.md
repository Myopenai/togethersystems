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

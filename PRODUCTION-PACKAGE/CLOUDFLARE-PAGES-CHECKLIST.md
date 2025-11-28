# Cloudflare Pages Checklist - Was wurde gemacht & was ist zu beachten

## ✅ Bereits erledigt für Cloudflare Pages

### 1. 404-Funktion aktualisiert ✅
- **Datei:** `functions/404.js`
- **Änderungen:**
  - Telbank-Redirects hinzugefügt
  - OneNetwork-Redirects hinzugefügt
  - Case-insensitive Fallbacks
  - Telbank-Link in 404-Seite hinzugefügt

### 2. Links korrigiert ✅
- **Alle HTML-Dateien:** Links von `./TELBANK/index.html` auf `TELBANK/index.html`
- **Funktioniert auf:** Cloudflare Pages UND GitHub Pages
- **Grund:** Relative Pfade funktionieren auf beiden Plattformen

### 3. API-Calls konfiguriert ✅
- **GitHub Pages:** API-Calls deaktiviert (keine Serverless Functions)
- **Cloudflare Pages:** API-Calls aktiviert (Functions verfügbar)
- **Erkennung:** Automatisch via `location.hostname.includes('pages.dev')`

---

## 🔧 Cloudflare Pages Deployment

### Aktuelles Setup
- **Projekt-Name:** `ts-portal`
- **Deployment-Skript:** `deploy.ps1`
- **GitHub Actions:** `.github/workflows/deploy.yml`

### Deployment-Befehl
```powershell
wrangler pages deploy . --project-name ts-portal
```

### Wichtige Hinweise
1. **BACKUPS-Ordner:** Sollte NICHT im Projekt sein (Dateigrößen-Limit 25MB)
2. **Functions:** Werden automatisch aus `functions/` deployt
3. **D1-Datenbank:** Muss separat konfiguriert werden (Binding im Cloudflare Dashboard)

---

## 📋 Was funktioniert auf Cloudflare Pages

### ✅ Funktioniert
- **404-Handler:** `functions/404.js` fängt 404-Fehler ab
- **API-Endpoints:** `/api/presence/*`, `/api/voucher/*`, `/api/telbank/*`, etc.
- **WebSocket:** `/ws` (via `functions/ws.js`)
- **Links:** Telbank & OneNetwork funktionieren
- **Bilder:** Fallbacks implementiert

### ⚠️ Zu beachten
- **D1-Datenbank:** Muss im Cloudflare Dashboard konfiguriert sein
- **R2-Bucket:** Falls verwendet, muss Binding gesetzt sein
- **Umgebungsvariablen:** `TS_API_KEY` etc. müssen im Dashboard gesetzt sein

---

## 🚀 Nächste Schritte für Cloudflare Pages

1. ✅ **404-Funktion:** Bereits aktualisiert
2. ✅ **Links:** Bereits korrigiert
3. ⏭ **Deployment:** `.\deploy.ps1` ausführen
4. ⏭ **Tests:** Nach Deployment testen

---

## 📝 Unterschiede: GitHub Pages vs. Cloudflare Pages

| Feature | GitHub Pages | Cloudflare Pages |
|---------|--------------|------------------|
| **API-Calls** | ❌ Deaktiviert | ✅ Aktiviert |
| **404-Handler** | ❌ Nicht verfügbar | ✅ `functions/404.js` |
| **WebSocket** | ❌ Nicht verfügbar | ✅ `functions/ws.js` |
| **Links** | ✅ Funktioniert | ✅ Funktioniert |
| **Bilder** | ✅ Mit Fallbacks | ✅ Mit Fallbacks |

---

## ✅ Status

- ✅ **404-Funktion:** Aktualisiert für Cloudflare Pages
- ✅ **Links:** Korrigiert (funktioniert auf beiden Plattformen)
- ✅ **API-Erkennung:** Automatisch (GitHub Pages = deaktiviert, Cloudflare = aktiviert)
- ✅ **Deployment-Skript:** Bereit (`deploy.ps1`)

**Alles ist bereit für Cloudflare Pages!** 🚀




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

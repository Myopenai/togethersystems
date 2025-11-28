# TELBANK DEPLOYMENT INSTRUCTIONS

**Version:** 1.0.0-XXXL  
**Branding:** T,.&T,,.&T,,,.TELBANK(C)(R)

---

## 🚀 DEPLOYMENT-SCHRITTE

### 1. D1 Database erstellen

```bash
# D1 Database für TELBANK erstellen
wrangler d1 create telbank-db

# Schema deployen
wrangler d1 execute telbank-db --file=./TELBANK/d1-schema-telbank-negative-assets.sql

# Initiale Asset-Klassen prüfen
wrangler d1 execute telbank-db --command="SELECT * FROM asset_class;"
```

### 2. Cloudflare Pages Binding konfigurieren

In `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "telbank-db"
database_id = "YOUR_DATABASE_ID"
```

### 3. API-Endpoints deployen

Die Functions sind bereits in `functions/api/telbank/`:
- `negative-assets.js`
- `transformations.js`
- `banks.js`

Werden automatisch deployt mit Cloudflare Pages.

### 4. Portal testen

1. Öffne: `https://your-domain.pages.dev/TELBANK/telbank-portal-negative-assets.html`
2. Prüfe Browser-Konsole auf Fehler
3. Teste API-Calls

---

## 📋 VERIFIKATION

### API-Endpoints testen:
```bash
# Negative Assets abrufen
curl https://your-domain.pages.dev/api/telbank/negative-assets

# Banks abrufen
curl https://your-domain.pages.dev/api/telbank/banks

# Transformations abrufen
curl https://your-domain.pages.dev/api/telbank/transformations
```

### D1 Database prüfen:
```bash
# Tabellen auflisten
wrangler d1 execute telbank-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Asset-Klassen prüfen
wrangler d1 execute telbank-db --command="SELECT * FROM asset_class;"
```

---

## 🔧 TROUBLESHOOTING

### Problem: API gibt 404
- Prüfe: `wrangler.toml` D1 Binding
- Prüfe: Functions in `functions/api/telbank/`
- Prüfe: Cloudflare Pages Deployment

### Problem: D1 Schema-Fehler
- Prüfe: SQL-Syntax
- Prüfe: D1-Kompatibilität (SQLite)
- Prüfe: Indizes und Constraints

---

**STATUS:** 🟢 **DEPLOYMENT-INSTRUCTIONS ERSTELLT**


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

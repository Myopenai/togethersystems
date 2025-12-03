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


# D1 Schema Deployment Anleitung

## Schritt 1: D1 Datenbank erstellen

```bash
npx wrangler d1 create togethersystems-cms
```

Dies gibt eine `database_id` zurück. Diese in `wrangler.toml` eintragen:

```toml
[[d1_databases]]
binding = "DB"
database_name = "togethersystems-cms"
database_id = "HIER_DIE_DATABASE_ID_EINTRAGEN"
```

## Schritt 2: Schema deployen

```bash
npx wrangler d1 execute togethersystems-cms --file=./d1-schema-cms.sql
```

## Schritt 3: Verifizieren

```bash
npx wrangler d1 execute togethersystems-cms --command="SELECT name FROM sqlite_master WHERE type='table';"
```

## Wichtig

- Die `database_id` muss in `wrangler.toml` eingetragen werden
- Das Schema wird nur auf Cloudflare Pages deployed, nicht auf GitHub Pages
- Für GitHub Pages wird das CMS im Demo-Modus ohne Backend laufen


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

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


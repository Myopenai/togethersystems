# 📋 IMPLEMENTIERUNGS-ANLEITUNG

## Schritt 1: Portal-Einstiegs-Hinweis integrieren

### In `index.html` einbinden:

```html
<head>
  <link rel="stylesheet" href="./portal-entry-notice/css/style.css">
</head>
<body>
  <!-- Portal-Inhalt -->
  
  <script src="./portal-entry-notice/js/config.js"></script>
  <script src="./portal-entry-notice/js/entryNotice.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      PortalEntryNotice.init();
    });
  </script>
</body>
```

### In `manifest-portal.html` einbinden:

Gleiche Integration wie oben.

---

## Schritt 2: Backup-System erweitern

### In `manifest-forum.html` oder `admin.html`:

```html
<button id="ts-backup-export" class="btn">Lokale Daten sichern (.json)</button>
<script src="./backup-restore-enhanced.js"></script>
```

---

## Schritt 3: Datenbank-Schema anwenden

### Cloudflare D1:

```bash
# Schema anwenden
wrangler d1 execute togethersystems-db --file=./d1-schema-cms.sql

# Mikro-Sites-Migration
wrangler d1 execute togethersystems-db --file=./migrations/003_microsite_support.sql

# Standard-Block-Typen
wrangler d1 execute togethersystems-db --file=./migrations/004_default_block_types.sql
```

---

## Schritt 4: API-Endpoints testen

### Mikro-Site erstellen:

```bash
curl -X POST https://your-domain.com/api/microsite/create \
  -H "Content-Type: application/json" \
  -H "X-TS-APIKEY: YOUR_KEY" \
  -d '{"userId": "user123", "name": "Meine Website"}'
```

### Public-Rendering testen:

```
https://your-domain.com/microsite/T,user123.
```

---

## ✅ FERTIG!

Nach diesen Schritten sind alle Systeme aktiv und einsatzbereit.



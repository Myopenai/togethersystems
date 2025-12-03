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








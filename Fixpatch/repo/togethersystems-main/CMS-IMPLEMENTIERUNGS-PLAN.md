# CMS-Implementierungsplan für Together Systems Portal

## Übersicht

Dieses Dokument beschreibt die Integration eines vollwertigen, block-basierten CMS-Systems in das Together Systems Portal. Das System ist **keine Kopie** eines bestehenden Systems, sondern eine **eigenständige Weiterentwicklung** mit erweiterten Features.

## Architektur

### Datenbank-Schema

- **d1-schema-cms.sql**: Vollständiges Datenbankschema für Multi-Tenant-CMS
  - Tenants, Sites, Domains
  - Pages, BlockTypes, Blocks
  - Collections (Blog, Produkte, Events)
  - E-Commerce (Products, Orders)
  - API-Keys, Webhooks, Audit-Logs

### API-Endpoints

**Basis-Struktur:**
```
/api/cms/
  ├── sites/              # Site-Verwaltung
  │   └── [siteId]/
  │       └── pages/      # Seiten-Verwaltung
  ├── pages/
  │   └── [pageId]        # Einzelne Seite (GET, PUT, DELETE)
  ├── blocks/             # Block-Verwaltung
  ├── collections/        # Collections (Blog, etc.)
  ├── products/           # E-Commerce
  ├── media/              # Medien-Verwaltung
  └── public/
      └── [siteSlug]/
          └── [...path]   # Public Website-Rendering
```

### Frontend-Integration

**Portal-Routen:**
```
/portal/cms/
  ├── index              # Sites-Dashboard
  ├── site/[siteId]      # Site-Verwaltung
  └── editor/
      └── [siteId]/[pageId]  # Block-Editor
```

## Implementierungs-Phasen

### Phase 1: Basis (MVP)
- ✅ Datenbank-Schema
- ✅ Sites API (GET, POST)
- ⏳ Pages API
- ⏳ Blocks API
- ⏳ Basis-Editor-UI

### Phase 2: Erweitert
- ⏳ Collections
- ⏳ Mehrsprachigkeit
- ⏳ Media-Verwaltung
- ⏳ Public-Rendering

### Phase 3: E-Commerce
- ⏳ Products API
- ⏳ Orders API
- ⏳ Zahlungsintegration

### Phase 4: Enterprise
- ⏳ API-Keys & Webhooks
- ⏳ Audit-Logs
- ⏳ Plugin-System
- ⏳ Multi-Tenant-Verwaltung

## Nächste Schritte

1. ✅ Datenbank-Schema erstellt
2. ✅ Sites API implementiert
3. ⏳ Pages API implementieren
4. ⏳ Block-Editor-UI erstellen
5. ⏳ Public-Rendering implementieren

## Technische Details

### Block-System

Blöcke sind generische Content-Bausteine:
- **BlockType**: Definiert Schema und Komponente
- **Block**: Instanz mit Daten (JSON)
- **Zones**: main, sidebar, footer, header
- **Position**: Reihenfolge innerhalb Zone

### Multi-Tenant

Jeder Tenant kann mehrere Sites haben:
- Tenant → Sites (1:n)
- Sites isoliert pro Tenant
- Tenant-basierte API-Keys

### Headless-Fähig

Inhalte können:
- Klassisch als Website gerendert werden
- Per API (JSON) ausgeliefert werden
- Headless-Frontends speisen

## Wichtige Hinweise

⚠️ **Keine Erwähnung des Originalsystems** in Code, UI oder Dokumentation.

✅ **Eigenständige Entwicklung** – basiert nur auf funktionalen Anforderungen.

🚀 **Performance**: Edge-Caching, Query-Optimierung, CDN-Integration.


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








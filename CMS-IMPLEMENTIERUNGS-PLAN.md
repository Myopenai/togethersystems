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



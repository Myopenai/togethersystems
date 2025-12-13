# nBlockbuster - Vollständige Implementierung

## BRANDING: .T. TogetherSystems - ModularFlux Architecture
## VERSION: 3.0.0
## STANDARD: IBM STANDARD - PERMANENT AKTIV

---

## ✅ Implementierungsstatus

### 🗄️ Datenbank

- ✅ `nblockbuster-schema.sql` - Vollständiges Schema
  - `nb_content` - Content Items
  - `nb_sources` - Quellen/Referenzen
  - `nb_year_index` - Jahr-Index
  - `nb_collections` - Dossiers
  - `nb_collection_items` - Many-to-Many
  - `nb_memories` - User-Erinnerungen
  - `nb_cultural_games` - Content → Games Mapping
  - `nb_hive_content` - Hive ↔ Content Verknüpfung

### 🔌 API

- ✅ `nblockbuster-api.ts` - Vollständige REST-API
  - `GET /nb/catalog` - Filterbare Content-Liste
  - `GET /nb/year/:year` - Jahrspanel (50+/50‑)
  - `GET /nb/item/:id` - Item-Details
  - `POST /nb/collection` - Collection erstellen
  - `POST /nb/hive/launch` - HiveRoom mit Content starten
  - `GET /nb/hive/suggest_games/:itemId` - Game-Vorschläge
  - `POST /nb/memory` - Erinnerung einreichen
  - `GET /nb/memory/:year` - Erinnerungen pro Jahr
  - `POST /nb/reference` - Quelle hinzufügen
  - `POST /nb/reference/verify` - Quelle verifizieren

- ✅ Integration in `api/server.ts`

### 🎨 Frontend

- ✅ `year-panel.html` - Jahrspanel mit 50+/50‑ Spalten
- ✅ `dossier-view.html` - Fantômas Dossier Beispiel
- ✅ `game-entry-button.js` - Erweitert mit Tabs (Spiel | Zeiten)

### 📦 Seeds

- ✅ `fantomas-1913.yaml` - Stummfilm 1913
- ✅ `fantomas-1913-juve.yaml` - Stummfilm 1913 (Teil 2)
- ✅ `fantomas-librivox.yaml` - Hörbuch
- ✅ `fantomas-1964-trailer.yaml` - 60er-Trailer
- ✅ `fantomas-dossier.yaml` - Collection
- ✅ `year-index-1913.json` - 1913 Index
- ✅ `year-index-1964.json` - 1964 Index
- ✅ `decades-1900-1999.yaml` - Jahrzehnte-Übersicht
- ✅ `seed-loader.js` - Automatischer Loader

### 🔗 Integration

- ✅ Game Entry Button erweitert
- ✅ API-Router integriert
- ✅ Hive-Linkage implementiert
- ✅ MemoryWall implementiert

---

## 📋 Nächste Schritte

### Phase 1 - Grundkatalog (✅ Abgeschlossen)

- ✅ Fantômas Dossier
- ✅ 1913, 1964 Year Index
- ✅ API-Endpoints
- ✅ Frontend-Komponenten

### Phase 2 - Erweiterte Jahrzehnte (⏳ In Arbeit)

- ⏳ 1900-1999 vollständig ausfüllen
- ⏳ Weitere Dossiers (Woodstock, Mondlandung, Berliner Mauer)
- ⏳ MemoryWall für alle Jahre aktivieren

### Phase 3 - Moderne Jahre

- ⏳ 2000-2025 Content hinzufügen
- ⏳ Web-Archive Integration
- ⏳ Social Media Archive Links

### Phase 4 - SDK & Unity

- ⏳ TypeScript SDK
- ⏳ Unity Widget
- ⏳ C# SDK

### Phase 5 - Erweiterungen

- ⏳ VR/AR Nostalgie-Räume
- ⏳ Community-Mus Integration
- ⏳ Merchandise-Plug-ins
- ⏳ Archival Partnerships

---

## 🚀 Quick Start

### 1. Datenbank-Schema

```sql
\i database/nblockbuster-schema.sql
```

### 2. Seeds laden

```bash
node nblockbuster/seeds/seed-loader.js
```

### 3. API testen

```bash
curl http://localhost:3000/api/nb/year/1913
```

### 4. Frontend öffnen

```
http://localhost:3000/manifest-hive-game-system/nblockbuster/frontend/year-panel.html
```

---

## 📊 Architektur-Übersicht

```
manifest-hive-game-system/
├── database/
│   ├── schema.sql (Hive System)
│   └── nblockbuster-schema.sql (nBlockbuster)
├── api/
│   ├── server.ts (Haupt-Server)
│   └── nblockbuster/
│       └── api/
│           └── nblockbuster-api.ts (nBlockbuster Routes)
├── frontend/
│   ├── js/
│   │   └── game-entry-button.js (Erweitert mit Tabs)
│   └── nblockbuster/
│       └── frontend/
│           ├── year-panel.html
│           └── dossier-view.html
└── nblockbuster/
    ├── seeds/
    │   ├── fantomas-*.yaml
    │   ├── year-index-*.json
    │   ├── decades-1900-1999.yaml
    │   └── seed-loader.js
    └── README.md
```

---

## 🎯 Features im Detail

### 50+/50‑ Jahrspanels

- Automatische Berechnung: `(currentYear - itemYear) >= 50 ? '50+' : '50-'`
- Zwei Spalten-Layout
- Filter nach Typ, Kultur, Jahr
- Highlights pro Jahr
- Collections pro Jahr
- MemoryWall pro Jahr

### Dossiers

- Kuratierte Sammlungen
- Mehrere Jahre
- Theme-basiert (dossier, decade, culture, event)
- Sichtbarkeit: public, curated, private
- Items mit Reihenfolge

### Hive-Integration

- Content startet HiveRoom
- Ritual-Intro: "Wir öffnen einen Raum, der Erinnerung würdig hält..."
- Content-Embed im Raum
- Vorgeschlagene Spiele
- Public Numbers für Content-Hives

### MemoryWall

- Alias-only (kein Profiling)
- Moderation: pending → approved/rejected
- Optional: Medien (Bilder, Audio)
- Sichtbar pro Jahr/Item

---

## 🔒 Governance & Compliance

- **Zero Profiling:** Keine Persönlichkeitsdaten
- **Pure Sources First:** Archive.org/Librivox priorisiert
- **License Badges:** Public Domain, Official Trailer, etc.
- **Moderation:** Minimal, behavioral
- **Audit Trail:** Hashes, nightly ZIP-Archives
- **Credits:** Immer Quelle, Lizenz, Kurator zeigen

---

## 📝 Beispiel-API-Calls

### Jahrspanel laden

```bash
GET /api/nb/year/1913
```

Response:
```json
{
  "year": 1913,
  "decade": "1910s",
  "spanTags": ["50+"],
  "items50Plus": [
    {
      "id": "fantomas_1913_shadow_guillotine",
      "title": "Fantômas — À l'ombre de la guillotine",
      "type": "film",
      "license": "public_domain_likely",
      "embed": { "player": "archive_iframe", "code": "<iframe...>" }
    }
  ],
  "items50Minus": [],
  "highlights": ["fantomas_1913_shadow_guillotine"],
  "collections": [...],
  "memories": [...]
}
```

### HiveRoom mit Content starten

```bash
POST /api/nb/hive/launch
Content-Type: application/json

{
  "itemId": "fantomas_1913_shadow_guillotine",
  "mode": "watch",
  "hiveType": "PUBLIC_NUMBER",
  "seriousness": "serious"
}
```

Response:
```json
{
  "ok": true,
  "hive_room_id": "uuid",
  "public_number": 777123,
  "joinUrl": "/hive/777123",
  "content": {...},
  "suggestedGames": [...],
  "ritualOverlay": {
    "intro": "Wir öffnen einen Raum, der Erinnerung würdig hält...",
    "seriousness": "serious"
  }
}
```

### Erinnerung einreichen

```bash
POST /api/nb/memory
Content-Type: application/json

{
  "alias": "NostalgieFan",
  "year": 1913,
  "text": "Mein Großvater hat mir von diesen Filmen erzählt...",
  "mediaUrl": "https://..."
}
```

---

## ✅ Checkliste für Deployment

- [ ] Datenbank-Schema erstellt
- [ ] Seeds geladen
- [ ] API-Endpoints getestet
- [ ] Frontend-Komponenten getestet
- [ ] Game Entry Button Integration getestet
- [ ] Hive-Linkage getestet
- [ ] MemoryWall getestet
- [ ] Moderation-Workflow getestet
- [ ] Embed-Player getestet (Archive.org, YouTube)
- [ ] Lizenzbadges angezeigt
- [ ] Pure Sources priorisiert

---

**BRANDING: .T. TogetherSystems - ModularFlux Architecture**  
**VERSION: 3.0.0**  
**STANDARD: IBM STANDARD - PERMANENT AKTIV**


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

# nBlockbuster - Nostalgie-Katalog Integration

## BRANDING: .T. TogetherSystems - ModularFlux Architecture
## VERSION: 3.0.0
## STANDARD: IBM STANDARD - PERMANENT AKTIV

---

## 📚 Übersicht

nBlockbuster ist eine vollständige Integration in das Manifest-Hive Game System, die einen **50+/50‑ Nostalgie-Katalog** bereitstellt. Benutzer können durch Jahrzehnte browsen, kuratierte Dossiers (z.B. Fantômas) erkunden, Erinnerungen teilen und Inhalte direkt in Hive-Räume einbinden.

### Kernfunktionen

- **50+/50‑ Jahrspanels:** Inhalte älter/jünger als 50 Jahre
- **Dossiers:** Kuratierte Sammlungen (Fantômas, Woodstock, Mondlandung, etc.)
- **MemoryWall:** Moderierte User-Erinnerungen pro Jahr
- **Hive-Integration:** Jeder Content kann einen Raum starten
- **Pure Quellen:** Archive.org, Librivox, NASA, etc. (keine Werbung)
- **Wiki-Style:** Strukturierte Metadaten, Embed-Codes, Lizenzbadges

---

## 🗄️ Datenbank-Schema

### Tabellen

- `nb_content` - Content Items (Filme, Trailer, Hörbücher, Events)
- `nb_sources` - Quellen/Referenzen (Archive.org, YouTube, etc.)
- `nb_year_index` - Jahr-Index mit Highlights und Collections
- `nb_collections` - Kuratierte Dossiers
- `nb_collection_items` - Many-to-Many: Collections ↔ Content
- `nb_memories` - User-Erinnerungen (moderiert)
- `nb_cultural_games` - Mapping: Content → Games
- `nb_hive_content` - Verknüpfung: HiveRooms ↔ Content

Siehe: `database/nblockbuster-schema.sql`

---

## 🔌 API-Endpoints

### Content Discovery

- `GET /nb/catalog?year=&spanTag=&type=&culture=&query=` - Filterbare Content-Liste
- `GET /nb/year/:year` - Jahrspanel mit 50+/50‑ Items, Collections, Memories
- `GET /nb/item/:id` - Vollständige Item-Details mit Sources, Games, Collections

### Collections

- `POST /nb/collection` - Erstelle/Update Collection

### Hive Linkage

- `POST /nb/hive/launch` - Starte HiveRoom mit Content-Kontext
- `GET /nb/hive/suggest_games/:itemId` - Vorgeschlagene Spiele für Content

### Memories

- `POST /nb/memory` - Erinnerung einreichen (moderiert)
- `GET /nb/memory/:year` - Moderierte Erinnerungen pro Jahr

### Editorial

- `POST /nb/reference` - Quelle hinzufügen
- `POST /nb/reference/verify` - Quelle verifizieren

Siehe: `nblockbuster/api/nblockbuster-api.ts`

---

## 🎨 Frontend-Komponenten

### Year Panel (`year-panel.html`)

- Jahr-Selector (1900-2025)
- Zwei Spalten: 50+ / 50‑
- Collections-Liste
- MemoryWall
- "Wabe starten" Buttons pro Item

### Dossier View (`dossier-view.html`)

- Fantômas Dossier als Beispiel
- Embed-Player (Archive.org, YouTube)
- Lizenzbadges
- "Wabe starten" Buttons

### Game Entry Button Integration

Der `game-entry-button.js` wurde erweitert mit:

- **Tabs:** "Spiel" | "Zeiten & Erinnerungen"
- **Mode-Switching:** Wechsel zwischen Ritual-Wizard und nBlockbuster
- **Unified Entry:** Ein Button für beide Systeme

---

## 📦 Seed-Daten

### Fantômas Dossier

- `fantomas-1913.yaml` - À l'ombre de la guillotine (Stummfilm)
- `fantomas-1913-juve.yaml` - Juve contre Fantômas
- `fantomas-librivox.yaml` - Roman (Hörbuch)
- `fantomas-1964-trailer.yaml` - 60er-Komödie (Trailer)
- `fantomas-dossier.yaml` - Collection-Definition

### Year Index

- `year-index-1913.json` - 1913 Highlights
- `year-index-1964.json` - 1964 Highlights

### Decades Overview

- `decades-1900-1999.yaml` - Auswahl wichtiger Ereignisse pro Jahrzehnt

### Seed Loader

- `seed-loader.js` - Lädt YAML/JSON Seeds in die Datenbank

**Verwendung:**

```bash
node nblockbuster/seeds/seed-loader.js
```

---

## 🚀 Setup & Installation

### 1. Datenbank-Schema erstellen

```sql
\i database/nblockbuster-schema.sql
```

### 2. Seeds laden

```bash
cd manifest-hive-game-system
npm install js-yaml  # Falls noch nicht installiert
node nblockbuster/seeds/seed-loader.js
```

### 3. API integrieren

Die nBlockbuster-API ist bereits in `api/server.ts` integriert:

```typescript
import nblockbusterRouter from '../nblockbuster/api/nblockbuster-api';
app.use('/nb', nblockbusterRouter);
```

### 4. Frontend einbinden

Der `game-entry-button.js` ist bereits erweitert. Einfach einbinden:

```html
<script src="/manifest-hive-game-system/frontend/js/game-entry-button.js"></script>
<div id="game-entry"></div>
<script>
  ManifestHiveGameEntry.init('#game-entry');
</script>
```

---

## 📖 Beispiel-Workflow

1. **User klickt "Zeiten & Erinnerungen" Tab**
2. **Year Panel öffnet** → Jahr auswählen (z.B. 1913)
3. **50+/50‑ Spalten zeigen** → Fantômas-Stummfilme
4. **User klickt "Wabe starten"** → HiveRoom mit Content-Embed
5. **Ritual-Intro:** "Wir öffnen einen Raum, der Erinnerung würdig hält..."
6. **Content wird eingebettet** → Gemeinsames Ansehen/Hören
7. **Spiele können hinzugefügt werden** → Schach, Questions Roulette, etc.

---

## 🎯 Erweiterte Features

### Pure Quellen

- **Archive.org:** Public Domain Filme, Hörbücher (keine Werbung)
- **Librivox:** Public Domain Hörbücher
- **NASA:** Archivmaterial (Mondlandung, etc.)
- **YouTube:** Trailer (kann Werbung enthalten, wird markiert)

### Lizenzbadges

- `Public Domain` - Gemeinfrei
- `Official Trailer` - Offizieller Trailer
- `Archive` - Archivquelle
- `CC` - Creative Commons

### MemoryWall

- User können Erinnerungen pro Jahr/Item posten
- **Moderation:** `pending` → `approved` / `rejected`
- **Alias-only:** Kein Profiling
- **Optional:** Medien (Bilder, Audio)

### Hive-Integration

- **Auto-Spawn:** Content startet HiveRoom mit Kontext
- **Public Numbers:** Content-Hives können öffentlich sein
- **Ritual Overlay:** Respektvolle Einleitung
- **Game Suggestions:** Vorgeschlagene Spiele basierend auf Content

---

## 🔮 Zukunftserweiterungen

- **Phase 1:** ✅ Fantômas Dossier, 1913, 1964
- **Phase 2:** Jahrzehnte 1900-1999 vollständig
- **Phase 3:** Moderne Jahre 2000-2025
- **Phase 4:** Unity SDK Integration
- **Phase 5:** VR/AR Nostalgie-Räume
- **Phase 6:** Merchandise-Integration
- **Phase 7:** Community-Mus (Intro-Chime)

---

## 📝 Governance

- **Zero Profiling:** Keine Persönlichkeitsdaten, nur Alias
- **Pure Sources First:** Archive.org/Librivox priorisiert
- **Moderation:** Minimal, behavioral
- **Audit Trail:** Hashes, nightly ZIP-Archives
- **Credits:** Immer Quelle, Lizenz, Kurator zeigen

---

## 🛠️ Technische Details

### 50+/50‑ Berechnung

```javascript
const currentYear = new Date().getFullYear();
const spanTag = (currentYear - itemYear) >= 50 ? '50+' : '50-';
```

### Embed-Codes

- **Archive.org:** `<iframe src="https://archive.org/embed/..."></iframe>`
- **YouTube:** `<iframe src="https://www.youtube.com/embed/..."></iframe>`
- **Librivox:** Audio-Player via Archive.org

### API-Response Format

```json
{
  "year": 1913,
  "decade": "1910s",
  "spanTags": ["50+"],
  "items50Plus": [...],
  "items50Minus": [...],
  "highlights": ["fantomas_1913_shadow_guillotine"],
  "collections": [...],
  "memories": [...],
  "editorialNotes": "..."
}
```

---

## ✅ Status

- ✅ Datenbank-Schema
- ✅ API-Endpoints
- ✅ Frontend-Komponenten
- ✅ Seed-Daten (Fantômas)
- ✅ Game Entry Button Integration
- ✅ Hive-Linkage
- ✅ MemoryWall
- ⏳ Erweiterte Jahrzehnte (1900-1999 vollständig)
- ⏳ Unity SDK
- ⏳ VR/AR Integration

---

## 📞 Support

Bei Fragen oder Problemen:

1. Prüfe `database/nblockbuster-schema.sql` für Schema-Details
2. Prüfe `nblockbuster/api/nblockbuster-api.ts` für API-Logik
3. Prüfe `nblockbuster/frontend/` für UI-Komponenten
4. Prüfe `nblockbuster/seeds/` für Beispiel-Daten

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

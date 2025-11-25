# Mikro-Sites-Konzept für Together Systems Portal

## Übersicht

**Mikro-Sites** sind vollwertige, professionelle Websites für verifizierte Portal-User. Jeder User bekommt automatisch eine **maschinengenerierte URL** im Format `T,.&T,,.&T,,,.&T,,,,.etc.` und kann seine Website per Drag & Drop erstellen.

---

## URL-System: Maschinengenerierte URLs

### Format-Erklärung

**Basis-Struktur:**
```
T,.&T,,.&T,,,.&T,,,,.&T,,,,,,.etc.
```

**Bedeutung:**
- `T` = Together Systems Logo/Symbol
- `,` (Komma) + `.` (Punkt) = **Host-ID-Container**
- Zwischen Komma und Punkt = **User-Host-ID** (z.B. `abc123xyz`)
- Jede zusätzliche Seite = **+1 Komma-Punkt-Paar**

### Beispiel-URLs

**Startseite eines Users:**
```
T,user123.
```
- User-ID: `user123`
- Host-ID: `user123`

**Sub-Seiten:**
```
T,user123.&T,,page1.
T,user123.&T,,page1.&T,,,page2.
T,user123.&T,,page1.&T,,,page2.&T,,,,page3.
```

**Rotations-Format (automatisch generiert):**
```
T,abc123.                    → Startseite User "abc123"
T,abc123.&T,,about.          → Über-uns Seite
T,abc123.&T,,about.&T,,,team. → Team-Seite (unter About)
```

### Technische Umsetzung

**URL-Encoder/Decoder:**
```javascript
// URL-Encoding
function encodeMicrositeUrl(userId, pathSegments = []) {
  let url = `T,${userId}.`;
  pathSegments.forEach((segment, index) => {
    const commas = ','.repeat(index + 2); // +2 weil Basis bereits , hat
    url += `&T${commas}${segment}.`;
  });
  return url;
}

// URL-Decoding
function decodeMicrositeUrl(url) {
  const matches = url.match(/^T,([^.]+)\.(.*)$/);
  if (!matches) return null;
  
  const userId = matches[1];
  const rest = matches[2] || '';
  const segments = [];
  
  let segmentRegex = /&T(,+)([^.]+)\./g;
  let match;
  while ((match = segmentRegex.exec(rest)) !== null) {
    segments.push(match[2]);
  }
  
  return { userId, segments };
}
```

---

## Architektur

### 1. User-Verifizierung & Host-Zuweisung

**Flow:**
1. User verifiziert sich im OfflineHub/Portal
2. System erstellt automatisch **Mikro-Site-Host**
3. User bekommt **maschinengenerierte URL**: `T,{userId}.`
4. User kann sofort Website erstellen

### 2. Website-Builder (Drag & Drop)

**Features:**
- **Plug & Play**: Maus-Schieben, Rechts-/Linksklick
- **Block-basiert**: Text, Bild, Video, Formular, Galerie, etc.
- **Menüs & Popups**: Automatisch generiert
- **Responsive**: Automatisch mobil-optimiert
- **Templates**: Vorgefertigte Designs (optional)

**Zwei Modi:**
- **Einfacher Modus**: Für Laien (wie jouwweb.nl, aber besser)
- **Developer-Modus**: Für Full-Stack-Developer (erweiterte Features, API, Code-Editor)

### 3. CMS-Integration

Das Mikro-Sites-System nutzt das **CMS-Schema** (`d1-schema-cms.sql`):

- Jeder User = **Tenant**
- Jede Mikro-Site = **Site** in CMS
- Seiten = **Pages** mit **Blocks**
- URL-Struktur wird in `cms_pages.path` gespeichert

---

## Datenmodell

### Erweiterung für Mikro-Sites

```sql
-- Zusätzlich zu cms_sites:

ALTER TABLE cms_sites ADD COLUMN IF NOT EXISTS microsite_url TEXT; -- T,userId.
ALTER TABLE cms_sites ADD COLUMN IF NOT EXISTS user_id TEXT; -- Verweis auf verifizierten User
ALTER TABLE cms_sites ADD COLUMN IF NOT EXISTS builder_mode TEXT DEFAULT 'simple'; -- 'simple' | 'developer'

-- URL-Rotation-Tracking:
CREATE TABLE IF NOT EXISTS microsite_url_rotations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  url_pattern TEXT NOT NULL, -- T,userId.&T,,page.
  rotation_index INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES cms_sites(id)
);
```

---

## API-Endpoints

### Mikro-Sites API

**Basis:**
```
GET  /api/microsite/create          # Neue Mikro-Site für User erstellen
GET  /api/microsite/my-sites        # Alle Sites des Users
GET  /api/microsite/[siteId]/url    # URL der Site (T,. Format)
```

**Website-Builder:**
```
GET  /api/microsite/[siteId]/editor # Editor-Daten laden
POST /api/microsite/[siteId]/publish # Site veröffentlichen
```

**Public-Rendering:**
```
GET  /microsite/T,userId.           # Startseite rendern
GET  /microsite/T,userId.&T,,page.  # Sub-Seite rendern
```

---

## Website-Builder UI

### Einfacher Modus (Laien)

- **Drag & Drop**: Blöcke per Maus verschieben
- **WYSIWYG**: Direktes Editieren im Browser
- **Vordefinierte Blöcke**: Text, Bild, Button, Galerie, Formular, Video
- **Theme-Auswahl**: Vorgefertigte Designs

### Developer-Modus

- **Alles vom einfachen Modus** +
- **Code-Editor**: HTML/CSS/JS direkt editieren
- **API-Zugriff**: REST-API für Inhalte
- **Custom Blocks**: Eigene Komponenten erstellen
- **Versionierung**: Git-ähnliche Versionen
- **Webhooks**: Events abonnieren

---

## Integration mit Portal

### OfflineHub → Online Portal

1. User erstellt Inhalte **offline** im Manifest-Forum
2. Beim Veröffentlichen wird automatisch **Mikro-Site erstellt**
3. User bekommt **URL**: `T,{userId}.`
4. Website ist sofort **online verfügbar**

### Verifizierung

- User ist bereits **verifiziert** im Portal
- Verifizierung = automatische **Host-Freischaltung**
- Kein zusätzlicher Registrierungsprozess nötig

---

## Nächste Schritte

1. ✅ Konzept erstellt
2. ⏳ URL-Generator implementieren
3. ⏳ Website-Builder UI erstellen
4. ⏳ Mikro-Sites API-Endpoints
5. ⏳ Public-Rendering für T,. URLs
6. ⏳ Integration mit Portal

---

## Beispiel-Workflow

1. User verifiziert sich im Portal → `user123`
2. System erstellt automatisch Mikro-Site
3. User bekommt URL: `T,user123.`
4. User öffnet Website-Builder
5. User zieht Blöcke per Maus zusammen
6. User klickt "Veröffentlichen"
7. Website ist live: `https://portal.togethersystems/microsite/T,user123.`
8. User kann später TinyURL kürzen: `tinyurl.com/meine-site` → führt zu `T,user123.`

---

**Status:** ✅ Konzept erstellt, bereit für Implementierung



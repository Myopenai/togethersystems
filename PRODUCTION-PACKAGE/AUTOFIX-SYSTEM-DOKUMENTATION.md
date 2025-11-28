# Autofix-System: Automatische Fehlererkennung und -korrektur

## Übersicht

Das Autofix-System erkennt automatisch Fehler, die durch User-Aktionen auftauchen, und korrigiert sie **online, live, just-in-time** mit Benachrichtigungen an den User.

## Architektur

### Backend (Cloudflare Pages Functions)

1. **`/api/autofix/errors` (POST)**
   - Empfängt Fehler von Client
   - Erkennt Fehlermuster
   - Wendet automatische Korrekturen an
   - Speichert Events in D1

2. **`/api/autofix/notify` (GET)**
   - Server-Sent Events (SSE) Stream
   - Sendet Live-Benachrichtigungen über automatische Korrekturen
   - Polling alle 2 Sekunden

3. **`/api/autofix/status` (GET)**
   - Status der automatischen Korrekturen
   - Statistiken (letzte 24 Stunden)
   - Liste der letzten Korrekturen

### Frontend (`autofix-client.js`)

- **Global Error Handler**: Fängt alle JavaScript-Fehler ab
- **Unhandled Promise Rejection Handler**: Fängt Promise-Rejections ab
- **Fetch Error Handler**: Wrappt `fetch()` und erkennt HTTP-Fehler
- **Error Queue**: Batch-Verarbeitung (alle 2 Sekunden oder bei 5 Fehlern)
- **Live-Benachrichtigungen**: SSE-Verbindung für Echtzeit-Updates
- **UI-Benachrichtigungen**: Visuelle Popups mit Korrektur-Details

## Unterstützte Fehlermuster

| Muster | Typ | Korrektur | Beschreibung |
|--------|-----|-----------|--------------|
| `ERR_CONNECTION_REFUSED` | api_connection | disable_api_calls | API-Verbindung fehlgeschlagen |
| `404` | not_found | fallback_content | Ressource nicht gefunden |
| `500` | server_error | retry_with_backoff | Server-Fehler |
| `CORS` | cors_error | use_relative_paths | CORS-Fehler |
| `timeout` | timeout | increase_timeout | Timeout erkannt |
| `null` | null_reference | add_null_check | Null-Referenz |
| `undefined` | undefined_reference | add_undefined_check | Undefined-Referenz |

## Automatische Korrekturen

### 1. `disable_api_calls`
- **Aktion**: Setzt API-Base-URL auf `null`
- **Verwendung**: Wenn API-Verbindung nicht möglich ist
- **Ergebnis**: API-Aufrufe werden deaktiviert, keine weiteren Fehler

### 2. `fallback_content`
- **Aktion**: Zeigt Fallback-Inhalt
- **Verwendung**: Wenn Ressource nicht gefunden wird
- **Ergebnis**: Benutzerfreundliche Fehlermeldung

### 3. `retry_with_backoff`
- **Aktion**: Plant Wiederholung mit Backoff
- **Verwendung**: Bei Server-Fehlern
- **Ergebnis**: Automatische Wiederholung nach 2 Sekunden (max. 3x)

### 4. `use_relative_paths`
- **Aktion**: Wechselt zu relativen Pfaden
- **Verwendung**: Bei CORS-Fehlern
- **Ergebnis**: Verwendet relative Pfade statt absolute URLs

### 5. `increase_timeout`
- **Aktion**: Erhöht Timeout auf 30 Sekunden
- **Verwendung**: Bei Timeout-Fehlern
- **Ergebnis**: Längere Wartezeit für langsame Verbindungen

### 6. `add_null_check`
- **Aktion**: Fügt Null-Prüfung hinzu
- **Verwendung**: Bei Null-Referenz-Fehlern
- **Ergebnis**: Verhindert weitere Null-Referenz-Fehler

### 7. `add_undefined_check`
- **Aktion**: Fügt Undefined-Prüfung hinzu
- **Verwendung**: Bei Undefined-Referenz-Fehlern
- **Ergebnis**: Verhindert weitere Undefined-Referenz-Fehler

## Integration

### In HTML-Dateien einbinden

```html
<script type="module" src="./autofix-client.js"></script>
```

Das System initialisiert sich automatisch beim Laden der Seite.

### Manuelle Initialisierung

```javascript
import { initAutofix, getAutofixStatus } from './autofix-client.js';

// Initialisierung
initAutofix();

// Status abrufen
const status = await getAutofixStatus();
console.log(status);
```

## Benachrichtigungen

### Visuelle Benachrichtigungen

- **Position**: Oben rechts (fixed)
- **Design**: Neon-grüner Rahmen, dunkler Hintergrund
- **Auto-Entfernung**: Nach 10 Sekunden
- **Animation**: Slide-in von rechts

### Benachrichtigungsinhalt

- **Titel**: "🔧 Automatische Fehlerkorrektur"
- **Erkanntes Muster**: Typ des Fehlers
- **Aktion**: Beschreibung der Korrektur
- **Zeitstempel**: Wann die Korrektur angewendet wurde

## Monitoring

### Admin-Monitoring-Dashboard

Das `admin-monitoring.html` Dashboard zeigt:
- **Autofix-Statistiken** (letzte 24 Stunden)
- **Anzahl der Korrekturen** nach Typ
- **Letzte Korrekturen** mit Details

### API-Endpoints

- `GET /api/autofix/status` - Status und Statistiken
- `GET /api/autofix/notify` - SSE-Stream für Live-Updates
- `POST /api/autofix/errors` - Fehler melden und korrigieren

## Datenbank

### Events-Tabelle

Alle automatischen Korrekturen werden in der `events` Tabelle gespeichert:

```sql
INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
VALUES (?, 'autofix.applied', ?, 'error', ?, ?, ?)
```

**Meta-Felder:**
- `fixType`: Typ der Korrektur
- `action`: Durchgeführte Aktion
- `params`: Parameter der Aktion
- `error`: Original-Fehlermeldung
- `timestamp`: Zeitstempel

## Beispiel-Workflow

1. **User-Aktion**: Klickt auf "Voucher laden"
2. **Fehler tritt auf**: `ERR_CONNECTION_REFUSED` bei API-Aufruf
3. **Autofix erkennt**: Fehlermuster `ERR_CONNECTION_REFUSED`
4. **Korrektur wird angewendet**: `disable_api_calls` → API-Base-URL auf `null`
5. **Benachrichtigung**: "API-Verbindung fehlgeschlagen. API-Aufrufe werden deaktiviert."
6. **Event gespeichert**: In D1-Datenbank für Monitoring
7. **Weitere Fehler verhindert**: Keine weiteren API-Aufrufe, keine weiteren Fehler

## Erweiterung

### Neue Fehlermuster hinzufügen

1. In `functions/api/autofix/errors.js`:
   ```javascript
   const ERROR_PATTERNS = {
     'NEUES_MUSTER': {
       type: 'neuer_typ',
       fix: 'neue_korrektur',
       message: 'Beschreibung',
     },
   };
   ```

2. Neue Korrektur implementieren:
   ```javascript
   const AUTO_FIXES = {
     neue_korrektur: (error, context) => {
       return {
         action: 'neue_aktion',
         params: { ... },
         message: 'Korrektur-Beschreibung',
       };
     },
   };
   ```

### Frontend-Integration erweitern

In `autofix-client.js` können weitere Error-Handler hinzugefügt werden:

```javascript
// Beispiel: Custom Error Handler
window.addEventListener('customError', (event) => {
  enqueueError(event.detail.error, event.detail.context);
});
```

## Status

✅ **Implementiert:**
- Backend API-Endpoints
- Frontend Error-Handler
- Live-Benachrichtigungen (SSE)
- Visuelle UI-Benachrichtigungen
- Integration in manifest-portal.html
- Integration in admin-monitoring.html
- Batch-Verarbeitung
- Event-Speicherung in D1

🔄 **In Entwicklung:**
- Erweiterte Fehlermuster
- Proaktive Fehlerprävention
- Machine Learning für Fehlererkennung

## Kontakt

Bei Fragen oder Problemen:
- **T,.&T,,.TOGETHERSYSTEMS.T,,,.(C)**
- **+31 - 613 803 782 | X@TEL1.NL | TEL1.NL**




---
## 🏢 Unternehmens-Branding

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

**Initiator:** Raymond Demitrio Tel  
**ORCID:** [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430)  
**Website:** [tel1.nl](https://tel1.nl)  
**WhatsApp:** [+31 613 803 782](https://wa.me/31613803782)  
**GitHub:** [myopenai/togethersystems](https://github.com/myopenai/togethersystems)  
**Businessplan:** [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf)

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---

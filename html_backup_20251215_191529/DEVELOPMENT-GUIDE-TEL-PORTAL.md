## TogetherSystems Portal – Entwicklungsleitfaden (Vertikalen, DB, Security, Psychologie)

Dieser Bericht ist für einen echten Entwickler / ein Team gedacht, um das aktuelle Demo‑System
(`ts-portal` auf Cloudflare Pages) in ein produktiv nutzbares Multi‑Vertical‑System zu verwandeln.

Er beschreibt:
1. Aktuellen Stand (was IST da)
2. Lücken (was FEHLT)
3. Konkrete Umsetzungsschritte je Schicht:
   - Vertikalen (Geschäfte)
   - Backend (D1 / APIs)
   - Security & Monitoring
   - Psychologie / AI‑Layer

---

### 1. Aktueller Stand (IST)

**Frontend / UIs**
- `index.html`: Offline‑Portal‑Start, Download‑Link fürs Manifest‑Forum.
- `manifest-forum.html`: Offline‑Forum (Single‑File), inkl. Verifizierungs‑Button „Portal öffnen (verifiziert)“.
- `manifest-portal.html`: Online‑Portal mit:
  - Feed‑Ansicht (Lesen),
  - Token‑Verifikation (Hash‑Parameter),
  - Auto‑Connect (Presence‑API, Match‑Loop),
  - Live‑Room‑Stub (WebSocket‑Signaling),
  - Voucher & Termine (inkl. Branch‑Templates + Kalender),
  - Immoblien & Hypotheken (Demo),
  - Events & Memberships‑Übersicht (Text‑Report aus Voucher‑API).
- `honeycomb.html`: Wabenräume (lokale Raum‑Logik).
- `legal-hub.html`: Rechtlicher Hub (Branding, Text) + lokale Contract‑Verknüpfung (Datei ↔ Voucher/Raum).
- `TELBANK/index.html`: Telbank‑Konsole (MetaMask‑Flows, In/Out, Transfer‑Logging).

**Backend / Functions**
- Cloudflare Pages Functions (im Verzeichnis `functions/`):
  - `api/telbank/transfers.js`: Telbank‑Transfers, aktuell bereits auf **D1** umgestellt (`env.DB` Binding, `transfers`‑Tabelle).
  - Presence‑API (`functions/api/presence/*.js`): Verify / Heartbeat / Match (In‑Memory‑Store, NICHT D1).
  - WebSocket‑Signaling (`functions/ws.js`): Räume + Broadcast (In‑Memory‑Store).
- Lokale Node‑Server (nicht auf Pages ausgerollt, nur für lokale Tests):
  - `voucher-api-server.js`: Voucher + Slots (In‑Memory).
  - `mortgage-api-server.js`: Hypothek‑Demo (In‑Memory).

**Datenmodell / DB**
- `d1-schema.sql`: Definiert Tabellen für:
  - `transfers` (Telbank),
  - `vouchers`, `voucher_bookings`,
  - `properties`, `mortgage_applications`, `mortgage_offers`.
- `BACKEND-ARCHITECTURE-DB-MONITORING-FEES.md`: beschreibt zusätzliche Tabellenideen (Events, Fees etc.).

---

### 2. Gaps (SOLLSOLL vs. IST)

**Vertikalen:**
- Maschinenzeit, Events, Memberships, Business‑Deals etc. existieren nur als:
  - Branch‑Buttons (Voucher‑Templates),
  - Text‑Karten im Portal,
  - Backend‑Schema.
- Es fehlen:
  - Eigene Oberflächen pro Vertical (Listen, Filter, Status, Detail‑Views),
  - Branch‑spezifische Business‑Regeln (z.B. Maschinen‑IDs, Standort, Verfügbarkeit, Stornoregeln),
  - Echte Verknüpfung zu Legal‑Hub (Contracts in D1 + R2).

**Backend (D1 / APIs):**
- Nur Telbank‑Transfers nutzen D1.
- Presence‑API, Voucher‑API, Mortgage‑API laufen noch in Memory / lokalen Node‑Prozessen.
- Kein einheitlicher Event‑/Audit‑Log.

**Security & Monitoring:**
- Keine Authentisierung (nur „Besitz“ eines Manifest‑Tokens),
- Keine Rate‑Limits,
- Kein globales Audit‑Log (`events`),
- Keine Admin‑Screens für Monitoring (nur einzelne Text‑Outputs).

**Psychologie / AI:**
- Konzepte (Telemetrie, Rage‑Clicks, UI‑Anpassung) sind beschrieben, aber:
  - keine echte Telemetrie‑Collection,
  - keine Auswertung,
  - kein Einfluss auf UI/Flows.

---

### 3. Phasenplan – Schrittweise Umsetzung

#### Phase 1: D1‑Backend für Voucher & Hypothek

Ziel: Lokale Node‑Server ablösen und Voucher/Hypothek‑Flows vollständig über D1‑Backends laufen lassen.

1. **Voucher‑API nach D1 migrieren (Workers‑Stil)**  
   - Neue Functions anlegen, z.B.:
     - `functions/api/voucher/issue.js`
     - `functions/api/voucher/list.js`
     - `functions/api/voucher/slots.js`
     - `functions/api/voucher/book.js`
     - `functions/api/voucher/cancel.js`
   - Implementierung: SELECT/INSERT/UPDATE gegen `vouchers` und `voucher_bookings` aus `d1-schema.sql`.
   - URL‑Schema: `/api/voucher/issue`, `/api/voucher/list`, `/api/slots/available`, etc., so dass `manifest-portal.html` nur die Basis `VOUCHER_API_BASE` von `http://localhost:3200/api` auf `/api` ändern muss.

2. **Mortgage‑Demo nach D1 migrieren (optional, aber empfohlen)**  
   - Functions:
     - `functions/api/mortgage/application.js` (POST),
     - `functions/api/mortgage/application-list.js` (GET),
     - `functions/api/mortgage/offer.js` (POST),
     - `functions/api/mortgage/offer-list.js` (GET).
   - Nutzung der Tabellen `properties`, `mortgage_applications`, `mortgage_offers`.

3. **Portal‑Konfiguration anpassen**
   - `manifest-portal.html`: `VOUCHER_API_BASE` von `http://localhost:3200/api` auf `'/api'` umstellen.
   - Mortgage‑Endpoints von `http://localhost:3300/...` auf `'/api/mortgage/...'` anpassen.

#### Phase 2: Vertikal‑UIs ausrollen

Ziel: Pro Vertical eine klar erkennbare UI, basierend auf Voucher/Hypothek‑Daten.

1. **Maschinenzeit‑Konsole**
   - Neues Panel, z.B. `machines.html` oder ein Abschnitt in `manifest-portal.html`:
     - Tabelle „Maschinen“, gespeist aus `vouchers` mit `service_type='machine.timeslot'`.
     - Spalten: Maschine (Titel), Standort, Preis, verfügbare Slots, Status.
     - Aktionen: „Slot buchen“, „Vertrag ansehen“ (Link zum Legal‑Hub mit `voucherId`).

2. **Events‑Konsole**
   - Filter auf `service_type IN ('consulting.session','therapy.session','realestate.viewing')`.
   - UI ähnlich: Liste der Sessions/Events, Slots, Buchungsstatus.

3. **Membership‑Konsole**
   - Filter auf `service_type='membership.access'`.
   - Anzeigen, welche Mitgliedschaften aktiv sind (Status, Zeitraum).

Alle drei Konsole nutzen dieselben Endpunkte wie „Voucher & Termine“, aber bieten eine **branchen‑spezifische Sicht**.

#### Phase 3: Legal‑Hub ↔ D1 & R2

Ziel: Verträge nicht nur lokal, sondern persistent mit D1 + R2 verknüpfen.

1. **R2‑Bucket für Contracts**  
   - Bucket z.B. `ts-contracts`, Binding `CONTRACTS_BUCKET`.

2. **D1‑Tabellen erweitern**  
   - `contracts` und `contract_links` wie in `BACKEND-ARCHITECTURE-DB-MONITORING-FEES.md` beschrieben anlegen:
     - `contracts`: Metadaten (name, mime_type, size, storage_url, hash).
     - `contract_links`: Mapping contract ↔ voucher ↔ room.

3. **Upload‑Function**  
   - `functions/api/contracts/upload.js`:
     - Erwartet `multipart/form-data` mit Datei, `voucherId`, `roomId`.
     - Speichert Datei in R2 (`CONTRACTS_BUCKET`), schreibt Metadaten in D1 (`contracts` + `contract_links`).

4. **Legal‑Hub UI**  
   - `legal-hub.html` so erweitern, dass:
     - vorhandene lokale Verknüpfungs‑Demo optional auf Online‑Upload umstellt,
     - Liste aus D1 geladen und angezeigt wird (echte Contracts).

#### Phase 4: Security & Monitoring

Ziel: Basis‑Security einziehen und Betriebsdaten sichtbar machen.

1. **Auth‑Header / API‑Key light**
   - In allen produktiven Functions (`voucher`, `mortgage`, `transfers`, `contracts`) optional einen Header wie `X-TS-APIKEY` auswerten.
   - Keys in D1 in einer `api_keys`‑Tabelle pflegen (oder `wrangler secret` / Secrets Store).

2. **Rate‑Limit light**
   - Einfache Drosselung per IP + Zeitfenster, z.B. über R2/KV oder D1‑Tabelle `rate_limits` (Key, Count, Window).
   - Minimal: pro Function‐Aufruf prüfen, ob über Schwellwert.

3. **Events‑Tabelle & Audit‑Log**
   - In D1 Tabelle `events` anlegen (siehe Architektur‑Dok).
   - In jeder Function bei Erfolg einen Event schreiben:
     - `presence.heartbeat`, `voucher.issue`, `voucher.book`, `transfer.logged`, `contract.upload`, …

4. **Monitoring‑UI**
   - Eine einfache Admin‑Seite (z.B. `admin-monitoring.html`), die:
     - Summen und letzte N Events aus `/api/admin/events` anzeigt,
     - Statistiken für Transfers, Voucher‑Buchungen, Hypotheken‑Anfragen rendert.

#### Phase 5: Psychologie / AI‑Layer

Ziel: Telemetrie und psychologische Indikatoren sammeln und (vorsichtig) auf UI/Flows anwenden.

1. **Telemetrie‑Client**
   - `psy-telemetry.js`: sammelt Events wie:
     - Klick‑Pfad, Abbrüche, „Rage Clicks“, Verweilzeiten.
   - Schickt diese an `/api/telemetry` (Workers‑Function, die in D1‑Tabelle `telemetry_events` schreibt).

2. **Mini‑Analyzer**
   - Periodische Auswertung (z.B. Worker‑Cron oder manuell):
     - Welche Panels verursachen viele Abbrüche?
     - Wo häufen sich Errors / 500er?

3. **UI‑Anpassung light**
   - Anfänglich nur Hinweise/Tooltips:
     - z.B. wenn viele Nutzer nicht verstehen, wie Voucher funktioniert, zeige automatisch kurze Hilfetexte.
   - Keine „Black‑Box‑AI“, sondern nachvollziehbare Regeln auf Basis der Telemetrie.

---

### 4. Tooling & Betrieb

**Wrangler / Deploy**
- Standard‑Deploy:
  - `wrangler pages deploy . --project-name ts-portal`

**D1**
- Vorhandene DB verwenden (`wrangler d1 list`).
- Schema migrieren:
  - `wrangler d1 execute <dbName> --file=./d1-schema.sql`

**R2**
- Bucket anlegen, Binding im Pages‑Projekt setzen (`CONTRACTS_BUCKET`).

---

### 5. Checkliste für Entwickler

1. Bestehende D1‑DB auswählen (`wrangler d1 list`) und Schema ausführen.
2. Binding `DB` im Pages‑Projekt sicherstellen.
3. Voucher‑API als Workers‑Functions nach D1 heben, `manifest-portal.html` auf `/api` umstellen.
4. Mortgage‑Demo optional nach D1 heben.
5. Drei Vertikal‑UIs im Portal ausrollen:
   - Maschinenzeit‑Konsole,
   - Events‑Konsole,
   - Membership‑Konsole.
6. Legal‑Hub an D1 + R2 anschließen (Contracts & Links).
7. Basic Auth‑Header + Rate‑Limit in produktiven Functions einführen.
8. Events‑Tabelle + Monitoring‑UI bauen.
9. Telemetrie‑Client + `/api/telemetry` hinzufügen, spätere UI‑Anpassung vorbereiten.

Dieser Leitfaden beschreibt, was **konkret** fehlt und wie es sich Stück für Stück implementieren lässt,
ohne das System zu zerbrechen – so dass aus der jetzigen Demo‑Architektur eine real nutzbare Plattform werden kann.


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

# Communication Hub – Architekturübersicht

> Ziel: Autopilot‑Kommunikation für Manifest‑Offline‑Portal + Online‑Portal  
> („Ich bin online“ → Präsenz, Matching, Live‑Raum, Signaling, APIs – alles automatisch)

---

## 1. Systemkomponenten im Überblick

**Frontend**
- `manifest-forum.html` (Offline‑Manifest)
  - Speichert Beiträge lokal (`localStorage`).
  - Kennt `MOT_ACCESS_TOKEN` bzw. Token/Lokale Identität.
  - Öffnet das Online‑Portal mit HMAC‑gesichertem Token in der URL (`#mot=...&ts=...&sig=...`).
- `manifest-portal.html` (Online‑Portal)
  - Liest Token aus `location.hash` / optional `localStorage.mot_token`.
  - Auto‑Verifikation + Auto‑Presence + Auto‑Matching.
  - UI für:
    - JSON‑Import / API‑URL
    - Signaling‑URL / Presets
    - No‑Code Raum‑JSON‑Builder
    - Auto‑Connect (`pairCodeInput`, `connectStatus`, `liveRoom`).

**Backend**
- `presence-api-server.js` (Node/Express Presence‑API)
  - `/verify` – Identität klären und `thinker_id` ableiten.
  - `/heartbeat` – Anwesenheit melden (Status + `last_seen` + `pair_code`).
  - `/match` – passende Partner/Gruppe mit gleichem `pair_code` finden, `room_id` vergeben.
  - Optional später: Anschluss an DB (Supabase/Firebase/Postgres).
- (zukünftig) Signaling‑Server (WSS)
  - Verwaltet WebSocket‑Verbindungen/Signaling für Text, WebRTC, Datei‑Signalisierung.
  - Räume werden anhand von `room_id` organisiert.
- (zukünftig) API‑Katalog‑Service
  - Liefert Liste verfügbarer APIs (Verifikation, Dokumente, KI, etc.).
  - Bietet Metadaten: `base_url`, Auth‑Typ, Beispiel‑Payload.

---

## 2. Datenmodelle

### 2.1 Presence

In‑Memory (später DB):

```json
{
  "thinker_id": "thinker-abc123",
  "token": "mot-shared-token-v1",
  "pair_code": "projekt_alpha",
  "status": "online",
  "last_seen": 1732350000,
  "room_id": "room-projekt_alpha-xyz"
}
```

Felder:
- **thinker_id**: stabile Identität eines Users (aus Token abgeleitet oder explizit).
- **token**: Roh‑Token (z.B. `MOT_ACCESS_TOKEN`).
- **pair_code**: frei gewähltes Stichwort (z.B. `projekt_alpha`, `familie`).
- **status**: `"online"` / `"offline"` (später optional `idle`).
- **last_seen**: Zeitstempel des letzten Heartbeats.
- **room_id**: zugewiesener Raum (wenn bereits verbunden).

### 2.2 Room (Konfiguration)

```json
{
  "type": "video",            // text | video | file | contract
  "roomId": "post-123",
  "permissions": {
    "read": true,
    "send": true,
    "sign": false,
    "upload": true
  }
}
```

In der Portal‑UI werden diese Objekte über das No‑Code‑Formular erzeugt und im JSON‑Format (z.B. `{ "rooms": [...] }`) an das Backend/Signaling weitergegeben.

### 2.3 API‑Katalog (Entwurf)

```json
{
  "id": "doc-verify-x",
  "name": "Dokument-Verifikation X",
  "category": "verification",
  "base_url": "https://api.example.com/v1/documents",
  "auth_type": "bearer",
  "doc_url": "https://docs.example.com",
  "example_payload": { "file_id": "123" }
}
```

---

## 3. Haupt‑Flows (Autopilot)

### 3.1 „Ich gehe online“ – vom Offline‑Manifest ins Portal

1. User öffnet `manifest-forum.html` (lokal/offline).
2. Manifest kennt bzw. erzeugt ein Token (`MOT_ACCESS_TOKEN` / lokales Token).
3. Beim Klick „Portal öffnen (verifiziert)“:
   - Manifest erzeugt HMAC‑Signatur: `sig = HMAC(token, token + "." + ts)`.
   - Öffnet `manifest-portal.html#mot=<token>&ts=<timestamp>&sig=<sig>`.

Auf Portalseite:
1. `tryAutoVerify()` prüft Signatur, aktiviert UI für verifizierte Nutzer.
2. `autoConnectFromToken()`:
   - Liest Token aus Hash oder `localStorage.mot_token`.
   - Ruft `/verify` auf → erhält `{ thinker_id, pair_code? }`.
   - Startet Heartbeat + Matching.

### 3.2 Presence & Matching

**Heartbeat** (`startPresenceHeartbeat` im Portal):
- Alle 25s:
  - `POST /heartbeat { thinker_id, pair_code, status:"online" }`.
- Bei Seitenverlassen optional:
  - `status:"offline"` senden.

**Matching** (`startMatchLoop` im Portal):
- Alle 5s:
  - `POST /match { thinker_id, pair_code }`.
  - Backend:
    - Sucht alle Thinker mit `pair_code`, `status:"online"`, `last_seen` ≤ 60s.
    - Wenn ≥ 2:
      - Vergibt/teilt `room_id`.
      - Antwort: `{ room_id: "room-..." }`.
- Portal:
  - Bei neuer `room_id`:
    - Zeigt Status an (`connectStatus`).
    - Öffnet `liveRoom` + Info (`liveRoomInfo`).
    - Übergibt `room_id` an Signaling‑Layer (später).

### 3.3 Signaling / Live‑Verbindung (späterer Ausbau)

1. Portal erhält `room_id`.
2. Portal ruft `joinRoom(room_id, thinker_id)` am Signaling‑Server auf:
   - z.B. via WebSocket Nachricht `{ type:"join", room_id, thinker_id }`.
3. Signaling‑Server:
   - Hält eine Liste der aktiven Connections je `room_id`.
   - Vermittelt:
     - Textnachrichten (`chat`),
     - WebRTC Signaling (Offer/Answer/ICE),
     - Datei‑Transfer‑Signalisierung.
4. Backend‑Orchestrator kann anhand der Room‑Definition (siehe 2.2) entscheiden:
   - Wer darf senden?
   - Wer darf unterschreiben?
   - Wer darf Dateien hochladen?

---

## 4. Zustandsmodell (States)

Für jeden Raum:

- **waiting**  
  Mindestens 1 Thinker mit `pair_code` online, aber noch kein Match.

- **joining**  
  Zweiter (oder weitere) Thinker kommt dazu, `room_id` wird vergeben.

- **active**  
  Raum ist aktiv, mindestens zwei Teilnehmer verbunden; Signaling läuft.

- **closing**  
  Raum wird geschlossen (z.B. weil alle bis auf einen gegangen sind oder Timeout).

- **closed**  
  Kein weiterer Traffic; `room_id` kann archiviert/vergessen werden.

Im ersten Schritt wird dieses State‑Modell implizit über `presence` + Zeitfenster abgebildet. Später kann ein eigenes `rooms`‑Modell eingeführt werden, das diese States explizit speichert.

---

## 5. Roadmap‑Punkte, die auf dieser Architektur aufbauen

1. **DB‑Anschluss**  
   - Präsenz aus dem In‑Memory‑Store in eine echte Datenbank (Supabase/Firebase/Postgres) überführen.

2. **Signaling‑Layer ergänzen**  
   - Einheitliche Schnittstelle `joinRoom`, `sendMessage`, `onMessage` in einem separaten Modul (`signal-server.js`).

3. **API‑Katalog‑Service**  
   - Endpunkt `GET /api/catalog/apis`, Integration in Portal‑UI (Dropdown + Auto‑Konfiguration).

4. **Gruppen‑Matching & Rollen**  
   - Mehr als 2 Teilnehmer, Rollen (Host, Gast, Observer) in Presence/Rooms modellieren.

5. **Monitoring & Fehler‑Autopilot**  
   - Health‑Checks, Logs, Monitoring‑Dashboard, damit „Autopilot“ bei Fehlern kontrolliert eingreift (z.B. Reconnect‑Strategien).

Dieses Dokument dient als Referenz dafür, wie Manifest‑Offline‑Portal, Online‑Portal, Presence‑API, Signaling und API‑Katalog zu einem Communication Hub zusammenwachsen, der für Endnutzer wie ein Autopilot funktioniert: „Ich gehe online“ genügt – der Rest läuft automatisch.





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

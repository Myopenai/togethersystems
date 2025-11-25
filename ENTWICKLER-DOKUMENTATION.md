# TogetherSystems – Entwickler-Dokumentation

> Vollständige Architektur, Verdrahtungen und Code-Beispiele für die Weiterentwicklung

---

## 📋 Inhaltsverzeichnis

1. [System-Architektur](#system-architektur)
2. [Backend-Struktur (Cloudflare Pages Functions)](#backend-struktur)
3. [Frontend-Struktur](#frontend-struktur)
4. [Datenfluss & API-Verdrahtungen](#datenfluss--api-verdrahtungen)
5. [Datenbank-Schema (D1)](#datenbank-schema-d1)
6. [Wichtige Code-Beispiele](#wichtige-code-beispiele)
7. [Deployment](#deployment)

---

## 🏗️ System-Architektur

### Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (GitHub Pages)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │manifest-forum│  │manifest-portal│  │admin-dashboard│     │
│  │   (Offline)  │  │   (Online)   │  │  (Monitoring) │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         │  localStorage    │  fetch/WebSocket │  fetch       │
│         │  (lokale DB)     │  (API-Calls)     │  (API-Calls) │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                      │
┌─────────▼──────────┐              ┌───────────▼──────────┐
│  CLOUDFLARE PAGES  │              │   CLOUDFLARE D1      │
│     Functions      │◄─────────────┤    (SQLite DB)       │
│                    │              │                      │
│  /api/voucher/*    │              │  - vouchers          │
│  /api/telbank/*    │              │  - voucher_bookings  │
│  /api/presence/*   │              │  - transfers         │
│  /api/ai/gateway   │              │  - events            │
│  /ws (WebSocket)   │              │  - telemetry_events  │
└────────────────────┘              └──────────────────────┘
```

### Hauptkomponenten

**Frontend:**
- `manifest-forum.html` - Offline-Editor (LocalStorage)
- `manifest-portal.html` - Online-Portal (API-Calls)
- `admin.html` - Lokale Verwaltung
- `production-dashboard.html` - System-Monitoring
- `neural-network-console.html` - AI-Test-Interface

**Backend:**
- Cloudflare Pages Functions (Serverless)
- D1 Database (SQLite)
- WebSocket-Server für Live-Chat

---

## 🔧 Backend-Struktur

### Verzeichnisstruktur

```
functions/
├── api/
│   ├── admin/
│   │   ├── dashboard.js      # GET /api/admin/dashboard
│   │   └── events.js         # GET /api/admin/events
│   ├── ai/
│   │   ├── gateway.js        # POST /api/ai/gateway
│   │   └── gateway-enhanced.js
│   ├── presence/
│   │   ├── verify.js         # POST /api/presence/verify
│   │   ├── heartbeat.js      # POST /api/presence/heartbeat
│   │   ├── match.js          # POST /api/presence/match
│   │   └── catalog/
│   │       └── apis.js       # GET /api/presence/catalog/apis
│   ├── voucher/
│   │   ├── issue.js          # POST /api/voucher/issue
│   │   ├── book.js           # POST /api/voucher/book
│   │   ├── bookings.js       # GET /api/voucher/bookings
│   │   └── cancel.js         # POST /api/voucher/cancel
│   ├── telbank/
│   │   └── transfers.js      # GET/POST /api/telbank/transfers
│   └── telemetry.js          # POST /api/telemetry
├── ws.js                     # WebSocket-Server für /ws
└── 404.js                    # Fallback
```

### Standard-Funktions-Template

Jede Function folgt diesem Muster:

```javascript
// Cloudflare Pages Function: [METHOD] /api/[route]
function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function checkApiKey(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get('X-TS-APIKEY');
  if (!provided || provided !== required) {
    return json(401, { ok: false, error: 'invalid api key' });
  }
  return null;
}

async function checkRateLimit(env, key, limit = 60, windowMs = 60_000) {
  // Rate-Limiting-Logik (siehe Code-Beispiele)
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // 1. API-Key prüfen
  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;
  
  // 2. Rate-Limiting prüfen
  const allowed = await checkRateLimit(env, `route|${ip}`);
  if (!allowed) return json(429, { ok: false, error: 'rate limit exceeded' });
  
  // 3. Request-Body parsen
  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }
  
  // 4. Business-Logik
  // ...
  
  // 5. Event loggen
  await insertEvent(env, 'event.type', actorId, 'subject', subjectId, meta);
  
  // 6. Response
  return json(200, { ok: true, data: result });
}
```

---

## 💻 Frontend-Struktur

### API-Base-URL-Erkennung

Frontend erkennt automatisch verfügbare APIs:

```javascript
// manifest-portal.html
function detectVoucherApiBase() {
  if (location.hostname.includes('github.io')) {
    return null; // Keine API auf GitHub Pages
  }
  // Test ob API verfügbar
  return '/api'; // Relative URL für Cloudflare Pages
}

let VOUCHER_API_BASE = detectVoucherApiBase();
let PRESENCE_API_BASE = (location.hostname.includes('github.io')) 
  ? null 
  : '/api/presence';
```

### LocalStorage-Datenstruktur

```javascript
// manifest-forum.html
function loadDB() {
  const raw = localStorage.getItem('manifest.db');
  return raw ? JSON.parse(raw) : { posts: [] };
}

function saveDB(db) {
  localStorage.setItem('manifest.db', JSON.stringify(db));
  localStorage.setItem('manifest.db.updated', new Date().toISOString());
}

// Struktur:
{
  posts: [
    {
      id: "uuid",
      title: "Titel",
      content: "Inhalt",
      tags: ["tag1", "tag2"],
      logoUrl: "data:image/...", // Base64 oder URL
      reactions: { like: 5 },
      comments: [],
      createdAt: 1234567890
    }
  ]
}
```

### Offline → Online Flow

```javascript
// manifest-forum.html: Portal öffnen (verifiziert)
const openPortalBtn = document.getElementById('openPortalBtn');
openPortalBtn.addEventListener('click', () => {
  const token = localStorage.getItem('MOT_ACCESS_TOKEN') || 'default-token';
  const ts = Date.now();
  const base = `${token}.${ts}`;
  
  // HMAC-Signatur generieren
  crypto.subtle.importKey('raw', new TextEncoder().encode(token), 
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(key => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(base)))
    .then(sig => {
      const sigHex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
      const url = `manifest-portal.html#mot=${token}&ts=${ts}&sig=${sigHex}`;
      window.open(url, '_blank');
    });
});
```

---

## 🔌 Datenfluss & API-Verdrahtungen

### 1. Voucher erstellen

```
Frontend (business-admin.html)
  ↓ POST /api/voucher/issue
  {
    issuerUid: "user-123",
    serviceType: "consulting.session",
    title: "Beratung",
    durationMinutes: 60,
    validFrom: "2024-01-01T00:00:00Z",
    validUntil: "2024-12-31T23:59:59Z",
    price: { amount: 100, currency: "EUR" }
  }
  ↓
Backend (functions/api/voucher/issue.js)
  ↓ INSERT INTO vouchers
  ↓ INSERT INTO events (type: 'voucher.issue')
  ↓
D1 Database
  ↓
Response: { ok: true, voucher: {...} }
```

### 2. Voucher buchen

```
Frontend (manifest-portal.html)
  ↓ POST /api/voucher/book
  {
    voucherId: "v-abc123",
    slotId: "slot-2024-01-15T10:00:00Z",
    holderUid: "user-456"
  }
  ↓
Backend (functions/api/voucher/book.js)
  ↓ SELECT vouchers WHERE id = ?
  ↓ Prüfe Status & Verfügbarkeit
  ↓ INSERT INTO voucher_bookings
  ↓ UPDATE vouchers SET status = 'booked'
  ↓ INSERT INTO events
  ↓
Response: { ok: true, booking: {...} }
```

### 3. Presence & Matching

```
Frontend (manifest-portal.html)
  ↓ POST /api/presence/verify
  { token: "mot-token", ts: 1234567890, sig: "abc..." }
  ↓
Backend (functions/api/presence/verify.js)
  ↓ HMAC-Signatur prüfen
  ↓ thinker_id ableiten (HMAC-SHA256)
  ↓ In-Memory Store aktualisieren
  ↓
Response: { thinker_id: "thinker-abc123", pair_code: "projekt_alpha" }

  ↓ POST /api/presence/heartbeat (alle 25s)
  { thinker_id: "thinker-abc123", pair_code: "projekt_alpha", status: "online" }
  ↓
Backend (functions/api/presence/heartbeat.js)
  ↓ In-Memory Store aktualisieren (last_seen)

  ↓ POST /api/presence/match
  { thinker_id: "thinker-abc123", pair_code: "projekt_alpha" }
  ↓
Backend (functions/api/presence/match.js)
  ↓ Suche alle online Thinker mit gleichem pair_code
  ↓ Wenn ≥ 2 gefunden → room_id zuweisen
  ↓
Response: { room_id: "room-projekt_alpha-xyz" }
```

### 4. WebSocket Live-Chat

```
Frontend (manifest-portal.html)
  ↓ new WebSocket('wss://domain.com/ws')
  ↓ ws.send({ type: 'join', room_id: 'room-123' })
  ↓
Backend (functions/ws.js)
  ↓ globalThis.__signalRooms Map
  ↓ Room-Verwaltung (join/leave)
  ↓ Broadcast an alle im Room
  ↓
Frontend: ws.onmessage → Nachricht anzeigen
```

### 5. AI Gateway

```
Frontend (neural-network-console.html)
  ↓ POST /api/ai/gateway
  {
    operation: "manifest.assist",
    input: { content: "Text..." },
    options: {}
  }
  ↓
Backend (functions/api/ai/gateway.js)
  ↓ switch (operation)
  ↓ handleManifestAssist() → OpenAI GPT-4 oder Fallback
  ↓ INSERT INTO events
  ↓
Response: { ok: true, result: { suggestedTitle: "...", tags: [...] } }
```

---

## 🗄️ Datenbank-Schema (D1)

### Tabellen

```sql
-- Vouchers
CREATE TABLE vouchers (
  id TEXT PRIMARY KEY,
  issuer_uid TEXT NOT NULL,
  holder_uid TEXT,
  service_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  price_amount REAL,
  price_currency TEXT,
  status TEXT NOT NULL,
  transferable INTEGER NOT NULL,
  terms TEXT, -- JSON
  created_at TEXT NOT NULL
);

-- Buchungen
CREATE TABLE voucher_bookings (
  id TEXT PRIMARY KEY,
  voucher_id TEXT NOT NULL,
  issuer_uid TEXT NOT NULL,
  holder_uid TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  slot_start TEXT NOT NULL,
  slot_end TEXT NOT NULL,
  status TEXT NOT NULL,
  cancel_reason TEXT,
  created_at TEXT NOT NULL,
  cancelled_at TEXT
);

-- Events (Audit-Log)
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  actor_id TEXT,
  subject_type TEXT,
  subject_id TEXT,
  meta TEXT, -- JSON
  created_at TEXT NOT NULL
);

-- Rate Limiting
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL
);

-- Telbank Transfers
CREATE TABLE transfers (
  id TEXT PRIMARY KEY,
  direction TEXT NOT NULL,
  label TEXT,
  wallet_address TEXT,
  network TEXT,
  crypto_amount REAL NOT NULL,
  crypto_symbol TEXT NOT NULL,
  fiat_amount REAL NOT NULL,
  fiat_currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

---

## 💡 Wichtige Code-Beispiele

### Rate Limiting (Backend)

```javascript
async function checkRateLimit(env, key, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();

  const row = await env.DB.prepare(
    'SELECT key, window_start, count FROM rate_limits WHERE key = ?'
  ).bind(key).first();

  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false; // Limit überschritten
  }

  const newWindowStart = row && row.window_start >= windowStartCutoff
    ? row.window_start
    : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff 
    ? row.count + 1 
    : 1;

  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();

  return true;
}
```

### Event-Logging (Backend)

```javascript
async function insertEvent(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, 
    type, 
    actorId || null, 
    subjectType || null, 
    subjectId || null, 
    JSON.stringify(meta || {}), 
    createdAt
  ).run();
}
```

### Voucher erstellen (Frontend)

```javascript
async function createVoucher(data) {
  if (!VOUCHER_API_BASE) {
    console.warn('API nicht verfügbar');
    return null;
  }
  
  const response = await fetch(`${VOUCHER_API_BASE}/voucher/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-TS-APIKEY': API_KEY // Falls erforderlich
    },
    body: JSON.stringify({
      issuerUid: getUserId(),
      serviceType: data.serviceType,
      title: data.title,
      durationMinutes: data.durationMinutes,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      price: data.price
    })
  });
  
  const result = await response.json();
  return result.ok ? result.voucher : null;
}
```

### Presence Heartbeat (Frontend)

```javascript
function startPresenceHeartbeat(thinkerId, pairCode) {
  if (!PRESENCE_API_BASE) return;
  
  const interval = setInterval(async () => {
    try {
      await fetch(`${PRESENCE_API_BASE}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thinker_id: thinkerId,
          pair_code: pairCode,
          status: 'online'
        })
      });
    } catch (err) {
      console.error('Heartbeat failed:', err);
    }
  }, 25000); // Alle 25 Sekunden
  
  return () => clearInterval(interval);
}
```

### WebSocket Live-Chat (Frontend)

```javascript
function connectToRoom(roomId, thinkerId) {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${location.host}/ws`);
  
  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({
      type: 'join',
      room_id: roomId,
      thinker_id: thinkerId
    }));
  });
  
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'message') {
      appendMessage(msg.payload.text, msg.from);
    }
  });
  
  function sendMessage(text) {
    ws.send(JSON.stringify({
      type: 'message',
      room_id: roomId,
      thinker_id: thinkerId,
      payload: { text }
    }));
  }
  
  return { ws, sendMessage };
}
```

---

## 🚀 Deployment

### Cloudflare Pages

1. **Repository verbinden:**
   ```bash
   # GitHub Repository → Cloudflare Pages
   # Automatisches Deploy bei Push
   ```

2. **D1 Database erstellen:**
   ```bash
   wrangler d1 create togethersystems-db
   ```

3. **Schema initialisieren:**
   ```bash
   wrangler d1 execute togethersystems-db --file=d1-schema.sql
   ```

4. **Environment Variables (wrangler.toml):**
   ```toml
   [env.production]
   name = "ts-portal"
   compatibility_date = "2024-01-01"
   
   [[env.production.d1_databases]]
   binding = "DB"
   database_name = "togethersystems-db"
   database_id = "your-db-id"
   
   [env.production.vars]
   TS_API_KEY = "your-api-key"
   ```

5. **Deploy:**
   ```bash
   wrangler pages deploy . --project-name=ts-portal
   ```

### GitHub Pages (Frontend-only)

```bash
# Einfach Push zu main branch
git push origin main

# GitHub Pages wird automatisch aktualisiert
# URL: https://myopenai.github.io/togethersystems/
```

---

## 📚 Weiterführende Dokumentation

- `api-specification.yaml` - OpenAPI 3.0.3 Spezifikation
- `d1-schema.sql` - Vollständiges Datenbank-Schema
- `COMMUNICATION-HUB-ARCHITECTURE.md` - Presence & Matching Details
- `DEVELOPMENT-GUIDE-TEL-PORTAL.md` - Telbank-Implementierung

---

**Motto:** "Wir bewegen die Welt. Die Welt bewegt uns. Ihnen kostet das Geld. Uns ist das egal."

**Branding:** MYOPENAi(C)R {MOAi(C)T,.&T,,.&T,,,.(C)INTERNATIONAL TTT,.}



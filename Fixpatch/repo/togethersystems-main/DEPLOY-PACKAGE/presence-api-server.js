// Minimal Presence-Backend + API-Katalog für Manifest-Portal
// Endpunkte (unter BASE_PATH):
//   POST {BASE_PATH}/verify       { token, ts?, sig? }
//   POST {BASE_PATH}/heartbeat    { thinker_id, pair_code, status }
//   POST {BASE_PATH}/match        { thinker_id, pair_code }
//   GET  {BASE_PATH}/catalog/apis  (statischer API-Katalog)
//
// Konfiguration über Umgebungsvariablen:
//   PORT                     - HTTP-Port (Standard: 3000)
//   PRESENCE_API_BASE_PATH   - Basis-Pfad, z.B. "/api/presence"
//   TOKEN_SECRET_OPTIONAL    - optionaler Zusatz-Secret für Token-Ableitung
// Statischer API-Katalog (Beispiele / Platzhalter)
const apiCatalog = [
  {
    id: 'doc-verify-example',
    name: 'Dokument-Verifikation (Beispiel)',
    category: 'verification',
    base_url: 'https://api.example.com/v1/documents',
    auth_type: 'bearer',
    doc_url: 'https://docs.example.com/doc-verify',
    example_payload: { file_id: '123', mode: 'basic' }
  },
  {
    id: 'ai-summary-example',
    name: 'KI-Textzusammenfassung (Beispiel)',
    category: 'ai',
    base_url: 'https://api.example.com/v1/summarize',
    auth_type: 'bearer',
    doc_url: 'https://docs.example.com/ai-summary',
    example_payload: { text: '...', max_tokens: 256 }
  },
  {
    id: 'webhook-generic',
    name: 'Eigenes Webhook-Backend',
    category: 'custom',
    base_url: 'https://deine-seite.tld/api/manifest/submit',
    auth_type: 'none',
    doc_url: null,
    example_payload: { source: 'manifest-of-thinkers-offline', version: 1, posts: [] }
  }
];


const express = require('express');
const crypto = require('crypto');

const app = express();
const router = express.Router();

const PORT = Number(process.env.PORT) || 3000;
const BASE_PATH = process.env.PRESENCE_API_BASE_PATH || '/api/presence';

app.use(express.json());

// In-Memory Präsenzspeicher:
// Map<thinker_id, { thinker_id, token, pair_code, status, last_seen, room_id }>
const presence = new Map();

// Helper: HMAC-SHA256 als Hex
function hmacSha256Hex(key, data) {
  return crypto.createHmac('sha256', String(key)).update(String(data)).digest('hex');
}

// Helper: einfachen, stabilen "thinker_id" aus Token ableiten (falls nicht anderweitig vergeben)
function deriveThinkerIdFromToken(token) {
  const base = String(token) + (process.env.TOKEN_SECRET_OPTIONAL || '');
  const hash = crypto.createHash('sha256').update(base).digest('hex');
  return `thinker-${hash.slice(0, 12)}`;
}

// POST {BASE_PATH}/verify
// Erwartet: { token, ts?, sig? } oder ein Objekt aus dem Offline-Manifest
// Antwort:  { thinker_id, pair_code? }
router.post('/verify', (req, res) => {
  const body = req.body || {};
  const token = body.token || body.mot || body.thinker_token;

  if (!token) {
    return res.status(400).json({ error: 'token fehlt' });
  }

  // Optional: Signatur prüfen, wenn ts + sig vorhanden sind
  if (body.ts && body.sig) {
    const ts = Number(body.ts);
    const skew = Math.abs(Date.now() - ts);
    // 5 Minuten Zeitfenster
    if (!Number.isFinite(skew) || skew > 5 * 60 * 1000) {
      return res.status(401).json({ error: 'Token abgelaufen' });
    }
    const expected = hmacSha256Hex(token, `${token}.${ts}`);
    if (expected !== String(body.sig)) {
      return res.status(401).json({ error: 'Signatur ungültig' });
    }
  }

  // In einem "echten" System würdest du hier in einer DB nachschlagen,
  // ob das Token zu einem registrierten Thinker gehört.
  const thinker_id = deriveThinkerIdFromToken(token);

  // Falls bereits Präsenz mit diesem Token existiert, übernehmen wir den pair_code
  let pair_code = null;
  for (const entry of presence.values()) {
    if (entry.token === token && entry.pair_code) {
      pair_code = entry.pair_code;
      break;
    }
  }

  // Token im Präsenzspeicher merken, damit wir es später wiederfinden können
  const existing = presence.get(thinker_id) || {};
  presence.set(thinker_id, {
    thinker_id,
    token,
    pair_code: pair_code || existing.pair_code || null,
    status: existing.status || 'online',
    last_seen: existing.last_seen || Date.now(),
    room_id: existing.room_id || null,
  });

  return res.json({ thinker_id, pair_code });
});

// POST {BASE_PATH}/heartbeat
// Erwartet: { thinker_id, pair_code, status }
// Aktualisiert Präsenzzustand und Zeitstempel.
router.post('/heartbeat', (req, res) => {
  const { thinker_id, pair_code, status } = req.body || {};
  if (!thinker_id) {
    return res.status(400).json({ error: 'thinker_id fehlt' });
  }

  const now = Date.now();
  const existing = presence.get(thinker_id) || {};

  presence.set(thinker_id, {
    thinker_id,
    token: existing.token,
    pair_code: pair_code || existing.pair_code || null,
    status: status || existing.status || 'online',
    last_seen: now,
    room_id: existing.room_id || null,
  });

  return res.json({ ok: true, last_seen: now });
});

// POST {BASE_PATH}/match
// Erwartet: { thinker_id, pair_code }
// Sucht nach mindestens zwei "online" Thinkern mit gleichem pair_code und frischem last_seen.
// Gibt eine room_id zurück (neu erzeugt oder bestehend).
router.post('/match', (req, res) => {
  const { thinker_id, pair_code } = req.body || {};
  if (!thinker_id) {
    return res.status(400).json({ error: 'thinker_id fehlt' });
  }
  if (!pair_code) {
    return res.json({ room_id: null });
  }

  const now = Date.now();
  const ONLINE_WINDOW_MS = 60 * 1000; // 60 Sekunden

  // Kandidaten finden
  const candidates = [];
  for (const entry of presence.values()) {
    if (
      entry.pair_code === pair_code &&
      entry.status === 'online' &&
      typeof entry.last_seen === 'number' &&
      now - entry.last_seen <= ONLINE_WINDOW_MS
    ) {
      candidates.push(entry);
    }
  }

  if (candidates.length < 2) {
    return res.json({ room_id: null });
  }

  // Existiert bereits ein Raum für diesen pair_code?
  let room_id = null;
  for (const entry of candidates) {
    if (entry.room_id) {
      room_id = entry.room_id;
      break;
    }
  }

  // Wenn nicht, neuen Raum erzeugen
  if (!room_id) {
    const suffix = crypto.randomBytes(4).toString('hex');
    room_id = `room-${pair_code}-${suffix}`;
  }

  // Raum allen Kandidaten zuweisen
  for (const entry of candidates) {
    presence.set(entry.thinker_id, {
      ...entry,
      room_id,
    });
  }

  return res.json({ room_id });
});

// Optional: einfache Debug-Route, um aktuellen Präsenzzustand zu sehen
router.get('/debug', (req, res) => {
  res.json({
    count: presence.size,
    items: Array.from(presence.values()),
  });
});

// API-Katalog-Endpunkt
router.get('/catalog/apis', (req, res) => {
  res.json({ items: apiCatalog });
});

// Router unter konfigurierbarem Basis-Pfad mounten
app.use(BASE_PATH, router);

app.listen(PORT, () => {
  console.log(`Presence API Server läuft auf Port ${PORT} (Basis-Pfad: ${BASE_PATH})`);
});



// Cloudflare Pages Function: /api/presence/verify
// Verifies a token (optionally with HMAC signature) and derives a stable thinker_id.

const presenceStore = globalThis.__presenceStore || (globalThis.__presenceStore = new Map());

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function hmacSha256Hex(key, data) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(String(key)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(String(data)));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function deriveThinkerIdFromToken(token, secretOptional) {
  // Quick hash using SubtleCrypto (sha-256)
  const base = String(token) + (secretOptional || '');
  // We cannot use Node's crypto here; instead we approximate with a deterministic key.
  // For simplicity we reuse HMAC with a fixed key to derive a hash-like ID.
  return base; // will be replaced below in handler with real hash
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'invalid JSON body' });
  }

  const token = body.token || body.mot || body.thinker_token;
  if (!token) {
    return json(400, { error: 'token fehlt' });
  }

  // Optional: Signatur prüfen, wenn ts + sig vorhanden sind
  if (body.ts && body.sig) {
    const ts = Number(body.ts);
    const skew = Math.abs(Date.now() - ts);
    if (!Number.isFinite(skew) || skew > 5 * 60 * 1000) {
      return json(401, { error: 'Token abgelaufen' });
    }
    const expected = await hmacSha256Hex(token, `${token}.${ts}`);
    if (expected !== String(body.sig)) {
      return json(401, { error: 'Signatur ungültig' });
    }
  }

  const secretOpt = env?.TOKEN_SECRET_OPTIONAL || '';
  const hashKey = env?.PRESENCE_HASH_KEY || 'mot-presence';
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(hashKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(String(token) + secretOpt));
  const hash = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const thinker_id = `thinker-${hash.slice(0, 12)}`;

  // pair_code suchen, falls schon bekannt
  let pair_code = null;
  for (const entry of presenceStore.values()) {
    if (entry.token === token && entry.pair_code) {
      pair_code = entry.pair_code;
      break;
    }
  }

  const existing = presenceStore.get(thinker_id) || {};
  presenceStore.set(thinker_id, {
    thinker_id,
    token,
    pair_code: pair_code || existing.pair_code || null,
    status: existing.status || 'online',
    last_seen: existing.last_seen || Date.now(),
    room_id: existing.room_id || null,
  });

  return json(200, { thinker_id, pair_code });
}



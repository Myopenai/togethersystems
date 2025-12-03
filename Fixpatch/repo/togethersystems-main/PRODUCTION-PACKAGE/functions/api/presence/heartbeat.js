// Cloudflare Pages Function: /api/presence/heartbeat
// Updates presence state (status, pair_code, last_seen) for a thinker.

const presenceStore = globalThis.__presenceStore || (globalThis.__presenceStore = new Map());

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestPost(context) {
  const { request } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'invalid JSON body' });
  }

  const { thinker_id, pair_code, status } = body || {};
  if (!thinker_id) {
    return json(400, { error: 'thinker_id fehlt' });
  }

  const now = Date.now();
  const existing = presenceStore.get(thinker_id) || {};

  presenceStore.set(thinker_id, {
    thinker_id,
    token: existing.token,
    pair_code: pair_code || existing.pair_code || null,
    status: status || existing.status || 'online',
    last_seen: now,
    room_id: existing.room_id || null,
  });

  return json(200, { ok: true, last_seen: now });
}



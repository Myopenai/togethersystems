// Cloudflare Pages Function: /api/presence/match
// Matches at least two online thinkers with the same pair_code and returns a room_id.

const presenceStore = globalThis.__presenceStore || (globalThis.__presenceStore = new Map());

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeRoomId(pair_code) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `room-${pair_code}-${rand}`;
}

export async function onRequestPost(context) {
  const { request } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'invalid JSON body' });
  }

  const { thinker_id, pair_code } = body || {};
  if (!thinker_id) {
    return json(400, { error: 'thinker_id fehlt' });
  }
  if (!pair_code) {
    return json(200, { room_id: null });
  }

  const now = Date.now();
  const ONLINE_WINDOW_MS = 60 * 1000;

  const candidates = [];
  for (const entry of presenceStore.values()) {
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
    return json(200, { room_id: null });
  }

  let room_id = null;
  for (const entry of candidates) {
    if (entry.room_id) {
      room_id = entry.room_id;
      break;
    }
  }

  if (!room_id) {
    room_id = makeRoomId(pair_code);
  }

  for (const entry of candidates) {
    presenceStore.set(entry.thinker_id, {
      ...entry,
      room_id,
    });
  }

  return json(200, { room_id });
}



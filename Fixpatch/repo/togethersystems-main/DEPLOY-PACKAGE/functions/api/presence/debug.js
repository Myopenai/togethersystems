// Cloudflare Pages Function: /api/presence/debug
// Returns the current in-memory presence store (for debugging only).

const presenceStore = globalThis.__presenceStore || (globalThis.__presenceStore = new Map());

export async function onRequestGet() {
  const items = Array.from(presenceStore.values());
  return new Response(JSON.stringify({ count: items.length, items }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}



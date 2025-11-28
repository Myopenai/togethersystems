// Cloudflare Pages Function: WebSocket Signaling Server
// Route: /ws
//
// This is a minimal room-based signaling server for the Manifest-Portal live chat.
// It keeps rooms in memory per worker instance.

const rooms = globalThis.__signalRooms || (globalThis.__signalRooms = new Map());

function broadcast(roomId, msg, exclude) {
  const set = rooms.get(roomId);
  if (!set) return;
  for (const client of set) {
    if (client === exclude) continue;
    try {
      client.send(JSON.stringify(msg));
    } catch {}
  }
}

export default {
  async fetch(request, env, ctx) {
    const upgradeHeader = request.headers.get('Upgrade') || '';
    if (upgradeHeader.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    server.accept();

    let currentRoom = null;

    server.addEventListener('message', (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (!data || typeof data !== 'object') return;

      if (data.type === 'join' && data.room_id) {
        const roomId = String(data.room_id);
        currentRoom = roomId;
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(server);
        broadcast(roomId, { type: 'system', room_id: roomId, event: 'join' }, server);
        return;
      }

      if (data.type === 'message' && currentRoom && data.payload && data.payload.text) {
        const msg = {
          type: 'message',
          room_id: currentRoom,
          from: data.thinker_id || null,
          payload: { text: String(data.payload.text) },
          at: Date.now(),
        };
        broadcast(currentRoom, msg, server);
        return;
      }
    });

    server.addEventListener('close', () => {
      if (currentRoom && rooms.has(currentRoom)) {
        rooms.get(currentRoom).delete(server);
        broadcast(
          currentRoom,
          { type: 'system', room_id: currentRoom, event: 'leave' },
          server
        );
      }
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  },
};



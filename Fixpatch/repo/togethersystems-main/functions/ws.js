// Cloudflare Pages Function: WebSocket Signaling Server
// Route: /ws
//
// This is a minimal room-based signaling server for the Manifest-Portal live chat.
// It keeps rooms in memory per worker instance.

const rooms = globalThis.__signalRooms || (globalThis.__signalRooms = new Map());
// User-ID → WebSocket-Server-Mapping für direkte Nachrichten
const userConnections = globalThis.__userConnections || (globalThis.__userConnections = new Map());

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

function sendToUser(userId, msg) {
  const client = userConnections.get(userId);
  if (client) {
    try {
      client.send(JSON.stringify(msg));
      return true;
    } catch {}
  }
  return false;
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
    let currentUserId = null;

    server.addEventListener('message', async (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (!data || typeof data !== 'object') return;

      // User-ID registrieren (für direkte Nachrichten)
      if (data.type === 'register_user' && data.user_id) {
        currentUserId = String(data.user_id);
        userConnections.set(currentUserId, server);
        return;
      }

      if (data.type === 'join' && data.room_id) {
        const roomId = String(data.room_id);
        currentRoom = roomId;
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(server);
        
        // User-ID aus thinker_id ableiten
        if (data.thinker_id) {
          currentUserId = String(data.thinker_id);
          userConnections.set(currentUserId, server);
        }
        
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

      // Direkte Nachricht (User-zu-User)
      if (data.type === 'direct_message' && data.to_user_id && data.from_user_id) {
        const toUserId = String(data.to_user_id);
        const fromUserId = String(data.from_user_id);
        
        // Speichere Nachricht in DB (über API, hier vereinfacht: nur push)
        // In Produktion sollte dies über die messages-API laufen
        
        const notification = {
          type: 'message_notification',
          message_id: data.message_id || `msg-temp-${Date.now()}`,
          from_user_id: fromUserId,
          subject: data.payload?.subject || null,
          preview: data.payload?.preview || null,
          body: data.payload?.body || null,
          created_at: new Date().toISOString(),
        };
        
        // Versuche direkt zu pushen
        const pushed = sendToUser(toUserId, notification);
        
        if (!pushed) {
          // Empfänger ist offline, Nachricht bleibt in DB (wird über /api/messages/pending abgeholt)
        }
        return;
      }
    });

    server.addEventListener('close', () => {
      // User-Verbindung entfernen
      if (currentUserId) {
        userConnections.delete(currentUserId);
      }
      
      // Aus Room entfernen
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



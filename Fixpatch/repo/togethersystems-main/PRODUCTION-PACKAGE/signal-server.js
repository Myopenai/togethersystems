// Minimal Signaling-Server für den Communication Hub
// Aufgabengebiet:
//   - WebSocket-Endpunkt für Text-/Signaling-Nachrichten
//   - Raumverwaltung auf Basis von room_id
//   - Broadcast an alle Teilnehmer eines Raums
//
// Konfiguration per Env:
//   SIGNAL_PORT      - HTTP-Port (Standard: 3100)
//   SIGNAL_PATH      - WebSocket-Pfad (Standard: "/ws")
//
// Beispiel-Client (im Browser):
//   const ws = new WebSocket('wss://deine-domain.tld/ws');
//   ws.send(JSON.stringify({ type:"join", room_id:"room-xyz", thinker_id:"abc123" }));
//   ws.send(JSON.stringify({ type:"message", room_id:"room-xyz", payload:{ text:"Hallo" }}));

const http = require('http');
const WebSocket = require('ws');

const SIGNAL_PORT = Number(process.env.SIGNAL_PORT) || 3100;
const SIGNAL_PATH = process.env.SIGNAL_PATH || '/ws';

// rooms: Map<room_id, Set<WebSocket>>
const rooms = new Map();

function addToRoom(roomId, ws) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(ws);
}

function removeFromAllRooms(ws) {
  for (const [roomId, set] of rooms.entries()) {
    if (set.has(ws)) {
      set.delete(ws);
      if (set.size === 0) {
        rooms.delete(roomId);
      }
    }
  }
}

function broadcastToRoom(roomId, message, exceptWs = null) {
  const set = rooms.get(roomId);
  if (!set) return;
  for (const client of set) {
    if (client !== exceptWs && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

const server = http.createServer();
const wss = new WebSocket.Server({ server, path: SIGNAL_PATH });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    const type = msg.type;
    const roomId = msg.room_id;

    if (!type || !roomId) {
      return;
    }

    if (type === 'join') {
      addToRoom(roomId, ws);
      const info = {
        type: 'system',
        room_id: roomId,
        event: 'joined',
        thinker_id: msg.thinker_id || null,
        at: Date.now()
      };
      broadcastToRoom(roomId, JSON.stringify(info));
      return;
    }

    if (type === 'leave') {
      removeFromAllRooms(ws);
      return;
    }

    // Generische Nachrichten (Text, Signaling, Datei-Metadaten, etc.)
    if (type === 'message' || type === 'signal') {
      const envelope = {
        type,
        room_id: roomId,
        from: msg.thinker_id || null,
        payload: msg.payload || null,
        at: Date.now()
      };
      broadcastToRoom(roomId, JSON.stringify(envelope), ws);
    }
  });

  ws.on('close', () => {
    removeFromAllRooms(ws);
  });
});

server.listen(SIGNAL_PORT, () => {
  console.log(`Signaling-Server läuft auf Port ${SIGNAL_PORT}, Pfad ${SIGNAL_PATH}`);
});



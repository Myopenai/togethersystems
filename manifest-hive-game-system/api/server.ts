// Manifest-Hive Game System - API Server
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import nblockbusterRouter from '../nblockbuster/api/nblockbuster-api';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/manifest_hive',
});

app.use(cors());
app.use(express.json());

// Inject db into request for nblockbuster routes
app.use((req, res, next) => {
  (req as any).db = pool;
  next();
});

// nBlockbuster Routes
app.use('/nb', nblockbusterRouter);

// ============================================
// RITUAL-FLOW ENDPOINTS
// ============================================

// POST /ritual/start
app.post('/ritual/start', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const ritualId = uuidv4();
    await pool.query(
      'INSERT INTO rituals (id, user_id, created_at) VALUES ($1, $2, NOW())',
      [ritualId, user_id]
    );

    res.json({
      ritual_id: ritualId,
      steps: [
        { step: 1, name: 'intro', description: 'Frieden & Spiel - Friedenspfeife, Schach statt Krieg' },
        { step: 2, name: 'lucky_number', description: 'Wähle deine Glückszahl' },
        { step: 3, name: 'style', description: 'Wähle deinen Wabenstil' },
        { step: 4, name: 'promise', description: 'Friedensversprechen bestätigen' },
        { step: 5, name: 'complete', description: 'Raum wird erstellt' }
      ]
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /ritual/confirm_intro
app.post('/ritual/confirm_intro', async (req, res) => {
  try {
    const { ritual_id } = req.body;
    await pool.query(
      'UPDATE rituals SET intro_confirmed = TRUE WHERE id = $1',
      [ritual_id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /ritual/set_lucky_number
app.post('/ritual/set_lucky_number', async (req, res) => {
  try {
    const { ritual_id, lucky_number } = req.body;
    await pool.query(
      'UPDATE rituals SET lucky_number = $1 WHERE id = $2',
      [lucky_number, ritual_id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /ritual/select_style
app.post('/ritual/select_style', async (req, res) => {
  try {
    const { ritual_id, style } = req.body;
    await pool.query(
      'UPDATE rituals SET style = $1 WHERE id = $2',
      [style, ritual_id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /ritual/confirm_promise
app.post('/ritual/confirm_promise', async (req, res) => {
  try {
    const { ritual_id } = req.body;
    await pool.query(
      'UPDATE rituals SET promise_confirmed = TRUE WHERE id = $1',
      [ritual_id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /ritual/complete
app.post('/ritual/complete', async (req, res) => {
  try {
    const { ritual_id } = req.body;
    
    // Hole Ritual-Daten
    const ritualResult = await pool.query(
      'SELECT * FROM rituals WHERE id = $1',
      [ritual_id]
    );
    
    if (ritualResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ritual not found' });
    }
    
    const ritual = ritualResult.rows[0];
    
    // Erstelle HiveRoom
    const roomId = uuidv4();
    const publicNumber = Math.floor(Math.random() * 1000000) + 100000;
    
    await pool.query(
      `INSERT INTO hive_rooms (id, owner_id, visibility, public_number, lucky_number, style, is_game_room, created_at)
       VALUES ($1, $2, 'PUBLIC_NUMBER', $3, $4, $5, TRUE, NOW())`,
      [roomId, ritual.user_id, publicNumber, ritual.lucky_number, ritual.style]
    );
    
    // Füge Owner als Member hinzu
    await pool.query(
      'INSERT INTO room_members (hive_room_id, user_id, role) VALUES ($1, $2, $3)',
      [roomId, ritual.user_id, 'OWNER']
    );
    
    // Markiere Ritual als completed
    await pool.query(
      'UPDATE rituals SET completed_at = NOW(), hive_room_id = $1 WHERE id = $2',
      [roomId, ritual_id]
    );
    
    res.json({
      ok: true,
      hive_room_id: roomId,
      public_number: publicNumber,
      lucky_number: ritual.lucky_number,
      style: ritual.style
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// HIVEROOMS ENDPOINTS
// ============================================

// POST /hive/create
app.post('/hive/create', async (req, res) => {
  try {
    const { owner_id, title, description, visibility, max_participants } = req.body;
    const roomId = uuidv4();
    const publicNumber = visibility === 'PUBLIC_NUMBER' ? Math.floor(Math.random() * 1000000) + 100000 : null;
    
    await pool.query(
      `INSERT INTO hive_rooms (id, owner_id, visibility, public_number, title, description, max_participants, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [roomId, owner_id, visibility, publicNumber, title, description, max_participants || 10]
    );
    
    await pool.query(
      'INSERT INTO room_members (hive_room_id, user_id, role) VALUES ($1, $2, $3)',
      [roomId, owner_id, 'OWNER']
    );
    
    res.json({ hive_room_id: roomId, public_number: publicNumber });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /hive/public?theme=...&number=...&seriousness=...
app.get('/hive/public', async (req, res) => {
  try {
    const { theme, style, number, seriousness, max_participants } = req.query;
    let query = 'SELECT h.*, COUNT(rm.user_id) as current_participants FROM hive_rooms h LEFT JOIN room_members rm ON h.id = rm.hive_room_id WHERE h.visibility = $1';
    const params: any[] = ['PUBLIC_NUMBER'];
    let paramCount = 1;
    
    if (style) {
      paramCount++;
      query += ` AND h.style = $${paramCount}`;
      params.push(style);
    }
    
    if (number) {
      paramCount++;
      query += ` AND h.public_number = $${paramCount}`;
      params.push(parseInt(number as string));
    }
    
    if (seriousness) {
      // In Produktion: seriousness als Feld in hive_rooms
      // query += ` AND h.seriousness = $${++paramCount}`;
      // params.push(seriousness);
    }
    
    query += ' GROUP BY h.id';
    
    if (max_participants) {
      query += ` HAVING COUNT(rm.user_id) < $${++paramCount}`;
      params.push(parseInt(max_participants as string));
    }
    
    query += ' ORDER BY h.created_at DESC LIMIT 50';
    
    const result = await pool.query(query, params);
    res.json({ rooms: result.rows, total: result.rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /hive/public/numbers - Liste aller öffentlichen Nummern
app.get('/hive/public/numbers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT public_number, style, title, COUNT(rm.user_id) as participants FROM hive_rooms h LEFT JOIN room_members rm ON h.id = rm.hive_room_id WHERE h.visibility = $1 GROUP BY h.id, h.public_number, h.style, h.title ORDER BY h.public_number',
      ['PUBLIC_NUMBER']
    );
    res.json({ numbers: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /hive/join
app.post('/hive/join', async (req, res) => {
  try {
    const { hive_room_id, user_id, public_number } = req.body;
    
    // Prüfe ob Raum existiert
    let roomQuery = 'SELECT * FROM hive_rooms WHERE id = $1';
    let roomParams: any[] = [hive_room_id];
    
    if (public_number) {
      roomQuery = 'SELECT * FROM hive_rooms WHERE public_number = $1';
      roomParams = [public_number];
    }
    
    const roomResult = await pool.query(roomQuery, roomParams);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const room = roomResult.rows[0];
    
    // Prüfe ob bereits Member
    const memberCheck = await pool.query(
      'SELECT * FROM room_members WHERE hive_room_id = $1 AND user_id = $2',
      [room.id, user_id]
    );
    
    if (memberCheck.rows.length > 0) {
      return res.json({ ok: true, already_member: true });
    }
    
    // Prüfe max_participants
    const memberCount = await pool.query(
      'SELECT COUNT(*) FROM room_members WHERE hive_room_id = $1',
      [room.id]
    );
    
    if (parseInt(memberCount.rows[0].count) >= room.max_participants) {
      return res.status(403).json({ error: 'Room is full' });
    }
    
    // Füge Member hinzu
    await pool.query(
      'INSERT INTO room_members (hive_room_id, user_id, role) VALUES ($1, $2, $3)',
      [room.id, user_id, 'PLAYER']
    );
    
    res.json({ ok: true, hive_room_id: room.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /hive/leave
app.post('/hive/leave', async (req, res) => {
  try {
    const { hive_room_id, user_id } = req.body;
    await pool.query(
      'DELETE FROM room_members WHERE hive_room_id = $1 AND user_id = $2',
      [hive_room_id, user_id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// GAMES ENDPOINTS
// ============================================

// GET /games/catalog?epoch=...&category=...&players=...&communication=...
app.get('/games/catalog', async (req, res) => {
  try {
    const { epoch, category, players, communication, seriousness } = req.query;
    let query = 'SELECT * FROM games WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;
    
    if (epoch) {
      paramCount++;
      params.push(epoch);
      query += ` AND epoch = $${paramCount}`;
    }
    
    if (category) {
      paramCount++;
      params.push(category);
      query += ` AND category = $${paramCount}`;
    }
    
    if (players) {
      const playerCount = parseInt(players);
      paramCount++;
      params.push(playerCount);
      query += ` AND min_players <= $${paramCount} AND max_players >= $${paramCount}`;
    }
    
    if (communication === 'true') {
      query += ` AND ui_hints->>'communication_focus' = 'true'`;
    }
    
    if (seriousness) {
      query += ` AND ui_hints->>'seriousness' = $${++paramCount}`;
      params.push(seriousness);
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json({ games: result.rows, total: result.rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /games/suggest - Spielvorschläge basierend auf Kontext
app.get('/games/suggest', async (req, res) => {
  try {
    const { context, player_count, seriousness } = req.query;
    
    let suggestions: any[] = [];
    
    // Kontext-basierte Vorschläge
    if (context === 'silence' || context === 'conversation_starter') {
      // Kommunikationsspiele für Gesprächsanregung
      const commGames = await pool.query(
        `SELECT * FROM games WHERE ui_hints->>'communication_focus' = 'true' ORDER BY RANDOM() LIMIT 5`
      );
      suggestions = commGames.rows;
    } else if (context === 'conflict') {
      // Seriöse Spiele für Konfliktlösung
      const seriousGames = await pool.query(
        `SELECT * FROM games WHERE ui_hints->>'seriousness' IN ('high', 'very_high') ORDER BY RANDOM() LIMIT 5`
      );
      suggestions = seriousGames.rows;
    } else if (context === 'celebration') {
      // Partyspiele
      const partyGames = await pool.query(
        `SELECT * FROM games WHERE category IN ('SOCIAL', 'COMMUNICATION') AND ui_hints->>'seriousness' = 'low' ORDER BY RANDOM() LIMIT 5`
      );
      suggestions = partyGames.rows;
    } else {
      // Zufällige Vorschläge
      const randomGames = await pool.query(
        `SELECT * FROM games ORDER BY RANDOM() LIMIT 5`
      );
      suggestions = randomGames.rows;
    }
    
    res.json({ suggestions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /games/start
app.post('/games/start', async (req, res) => {
  try {
    const { hive_room_id, game_id } = req.body;
    
    // Prüfe ob Spiel existiert
    const gameResult = await pool.query('SELECT * FROM games WHERE id = $1', [game_id]);
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = gameResult.rows[0];
    
    // Erstelle Session
    const sessionId = uuidv4();
    const initialState = game.mechanics?.start_state || {};
    
    await pool.query(
      'INSERT INTO game_sessions (id, hive_room_id, game_id, state, started_at) VALUES ($1, $2, $3, $4, NOW())',
      [sessionId, hive_room_id, game_id, JSON.stringify(initialState)]
    );
    
    res.json({
      session_id: sessionId,
      game: game,
      state: initialState
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /games/session/:id
app.get('/games/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM game_sessions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ session: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /games/action
app.post('/games/action', async (req, res) => {
  try {
    const { session_id, user_id, action_type, action_data } = req.body;
    
    // Speichere Aktion
    await pool.query(
      'INSERT INTO game_actions (game_session_id, user_id, action_type, action_data) VALUES ($1, $2, $3, $4)',
      [session_id, user_id, action_type, JSON.stringify(action_data)]
    );
    
    // Broadcast via WebSocket (wird in WebSocket-Handler gemacht)
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// SMOKE-FREE JOURNEY SPECIFIC ENDPOINTS
// ============================================

// POST /games/smoke-free/init - Initialisiere Spiel mit User-Profil
app.post('/games/smoke-free/init', async (req, res) => {
  try {
    const { user_id, profile } = req.body;
    
    // Speichere/Update User-Profil in Human Identity DB (simuliert)
    // In Produktion: echte DB-Integration
    
    const gameSession = {
      user_id,
      profile,
      current_stage: 'awareness',
      progress: { awareness: 0, knowledge: 0, planning: 0, action: 0, maintenance: 0 },
      created_at: new Date()
    };
    
    res.json({ 
      ok: true, 
      game_session: gameSession,
      message: 'Spiel initialisiert. Starte mit der Bewusstseins-Phase.'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /games/smoke-free/data/:user_id - Hole multidisziplinäre Daten
app.get('/games/smoke-free/data/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // In Produktion: Lade aus echten Datenquellen
    const data = {
      medical: {
        health_effects: {
          immediate: [
            "20 Minuten: Herzfrequenz normalisiert",
            "12 Stunden: Kohlenmonoxid-Level sinkt",
            "24 Stunden: Herzinfarkt-Risiko beginnt zu sinken"
          ]
        }
      },
      psychological: {
        coping_strategies: [
          "Atemübungen (4-7-8 Technik)",
          "Achtsamkeitsmeditation",
          "Kognitive Umstrukturierung"
        ]
      },
      pharmacological: {
        natural_alternatives: {
          rhodiola: "Stressreduktion",
          l_theanine: "Entspannung ohne Rausch"
        }
      }
    };
    
    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /games/smoke-free/recommendations - Generiere personalisierte Empfehlungen
app.post('/games/smoke-free/recommendations', async (req, res) => {
  try {
    const { user_id, profile, answers } = req.body;
    
    const recommendations = [];
    
    // Basierend auf Profil
    if (profile?.stress_level > 7) {
      recommendations.push({
        source: "psychology",
        recommendation: "Stressbewältigungstechniken: Atemübungen, Meditation, Bewegung",
        priority: "high"
      });
    }
    
    if (profile?.cigarettes_per_day > 20) {
      recommendations.push({
        source: "pharmacology",
        recommendation: "Kombinierte Nikotinersatztherapie: Pflaster + Bedarfsmittel",
        priority: "high"
      });
    }
    
    if (profile?.cannabis_use) {
      recommendations.push({
        source: "medical",
        recommendation: "Cannabis-Reduktion parallel planen, um Suchtverlagerung zu vermeiden",
        priority: "medium"
      });
    }
    
    res.json({ recommendations });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /games/smoke-free/stats/:user_id - Hole Statistiken
app.get('/games/smoke-free/stats/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { days_smoke_free } = req.query;
    
    const days = parseInt(days_smoke_free) || 0;
    
    // Berechne Einsparungen (Beispielwerte)
    const cigarettesPerDay = 20;
    const pricePerPack = 7.50;
    const cigarettesPerPack = 20;
    
    const cigarettesSaved = days * cigarettesPerDay;
    const packsSaved = cigarettesSaved / cigarettesPerPack;
    const moneySaved = packsSaved * pricePerPack;
    
    // Generiere Gesundheitsverbesserungen
    const healthImprovements = [];
    if (days >= 1) healthImprovements.push("Herzinfarkt-Risiko beginnt zu sinken");
    if (days >= 14) healthImprovements.push("Lungenfunktion verbessert sich");
    if (days >= 30) healthImprovements.push("Husten und Kurzatmigkeit nehmen ab");
    if (days >= 365) healthImprovements.push("Herzinfarkt-Risiko halbiert");
    
    res.json({
      days_smoke_free: days,
      cigarettes_saved: Math.round(cigarettesSaved),
      money_saved: Math.round(moneySaved * 100) / 100,
      health_improvements: healthImprovements
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// WEBSOCKET HANDLER
// ============================================

const roomConnections = new Map<string, Set<any>>();

wss.on('connection', (ws, req) => {
  let currentRoom: string | null = null;
  let userId: string | null = null;
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'join_room') {
        currentRoom = data.hive_room_id;
        userId = data.user_id;
        
        if (!roomConnections.has(currentRoom)) {
          roomConnections.set(currentRoom, new Set());
        }
        roomConnections.get(currentRoom)!.add(ws);
        
        // Sende Willkommensnachricht
        ws.send(JSON.stringify({
          type: 'system_event',
          message: 'Du bist dem Raum beigetreten'
        }));
      }
      
      if (data.type === 'chat_message') {
        // Speichere Nachricht
        await pool.query(
          'INSERT INTO chat_messages (hive_room_id, user_id, message, message_type) VALUES ($1, $2, $3, $4)',
          [currentRoom, userId, data.message, 'TEXT']
        );
        
        // Broadcast an alle im Raum
        if (currentRoom && roomConnections.has(currentRoom)) {
          const roomWs = roomConnections.get(currentRoom)!;
          roomWs.forEach((client: any) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'chat_message',
                user_id: userId,
                message: data.message,
                timestamp: new Date().toISOString()
              }));
            }
          });
        }
      }
      
      if (data.type === 'game_action') {
        // Speichere Aktion
        await pool.query(
          'INSERT INTO game_actions (game_session_id, user_id, action_type, action_data) VALUES ($1, $2, $3, $4)',
          [data.session_id, userId, data.action_type, JSON.stringify(data.action_data)]
        );
        
        // Broadcast an alle im Raum
        if (currentRoom && roomConnections.has(currentRoom)) {
          const roomWs = roomConnections.get(currentRoom)!;
          roomWs.forEach((client: any) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'game_action',
                session_id: data.session_id,
                user_id: userId,
                action_type: data.action_type,
                action_data: data.action_data
              }));
            }
          });
        }
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: e.message }));
    }
  });
  
  ws.on('close', () => {
    if (currentRoom && roomConnections.has(currentRoom)) {
      roomConnections.get(currentRoom)!.delete(ws);
      if (roomConnections.get(currentRoom)!.size === 0) {
        roomConnections.delete(currentRoom);
      }
    }
  });
});

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[FABRIKAGE] Manifest-Hive Game System API running on port ${PORT}`);
  console.log(`[FABRIKAGE] BRANDING: .T. TogetherSystems - ModularFlux Architecture`);
  console.log(`[FABRIKAGE] VERSION: 3.0.0`);
  console.log(`[FABRIKAGE] STANDARD: IBM STANDARD - PERMANENT AKTIV`);
});



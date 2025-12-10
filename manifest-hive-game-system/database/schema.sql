-- Manifest-Hive Game System - Datenbankstruktur
-- BRANDING: .T. TogetherSystems - ModularFlux Architecture
-- VERSION: 3.0.0
-- STANDARD: IBM STANDARD - PERMANENT AKTIV

-- User-Daten
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias VARCHAR(64) NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wabenräume
CREATE TABLE IF NOT EXISTS hive_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  visibility VARCHAR(16) CHECK (visibility IN ('PRIVATE','GROUP_LINK','PUBLIC_NUMBER')),
  public_number INT,
  lucky_number INT,
  style VARCHAR(32),
  title VARCHAR(128),
  description TEXT,
  max_participants INT DEFAULT 10,
  is_game_room BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Spiele-Definitionen
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(128) NOT NULL,
  description TEXT,
  min_players INT DEFAULT 2,
  max_players INT DEFAULT 4,
  duration_estimate INT, -- in Minuten
  category VARCHAR(32),
  epoch VARCHAR(64),
  culture VARCHAR(64),
  mechanics JSONB,
  ui_hints JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Laufende Spiel-Sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_room_id UUID REFERENCES hive_rooms(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  state JSONB,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  winner_id UUID REFERENCES users(id)
);

-- Ritual-Dokumentation
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hive_room_id UUID REFERENCES hive_rooms(id) ON DELETE CASCADE,
  intro_confirmed BOOLEAN DEFAULT FALSE,
  lucky_number INT,
  style VARCHAR(32),
  promise_confirmed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Raum-Mitglieder
CREATE TABLE IF NOT EXISTS room_members (
  hive_room_id UUID REFERENCES hive_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(16) CHECK (role IN ('OWNER','PLAYER','MODERATOR','AUDITOR','GUEST')) DEFAULT 'PLAYER',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (hive_room_id, user_id)
);

-- Chat-Nachrichten
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_room_id UUID REFERENCES hive_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(16) CHECK (message_type IN ('TEXT','SYSTEM','GAME')) DEFAULT 'TEXT',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Spiel-Aktionen
CREATE TABLE IF NOT EXISTS game_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(64) NOT NULL,
  action_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_hive_rooms_owner ON hive_rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_hive_rooms_public_number ON hive_rooms(public_number);
CREATE INDEX IF NOT EXISTS idx_hive_rooms_visibility ON hive_rooms(visibility);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_room ON room_members(hive_room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room ON game_sessions(hive_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(hive_room_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_session ON game_actions(game_session_id);

-- Initiale Spiele-Daten
INSERT INTO games (name, description, min_players, max_players, category, epoch, culture, mechanics, ui_hints) VALUES
('Schach', 'Klassisches Schachspiel', 2, 2, 'STRATEGY', 'MEDIEVAL', 'EUROPEAN', 
 '{"start_state": "standard_board", "actions": ["move_piece","castle","en_passant","promotion"], "win": ["checkmate"], "draw": ["stalemate","threefold_repetition","fifty_move_rule"]}',
 '{"board": "grid", "style": "serious"}'),
('Wabenstrategie', 'Futuristisches Strategiespiel auf Wabenbasis', 2, 6, 'STRATEGY', 'FUTURE', 'UNIVERSAL',
 '{"start_state": "empty_hive", "actions": ["connect_cells","upgrade_cell","block_path"], "win": ["largest_cluster"]}',
 '{"board": "hex", "style": "futuristic"}'),
('Friedenspfeife', 'Kooperatives Ritual-Spiel', 2, 8, 'RITUAL', 'ANCIENT', 'NATIVE_AMERICAN',
 '{"start_state": "circle", "actions": ["pass_pipe","share_story","make_promise"], "win": ["harmony_achieved"]}',
 '{"board": "circle", "style": "ceremonial"}')
ON CONFLICT DO NOTHING;



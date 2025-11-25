-- Gleichgewichts-Börse: Real-Bilanz & Instrumente
-- Erweitert d1-schema.sql um Real-Bilanz-System

-- Entities: Reale Einheiten (Unternehmen, Projekte, Genossenschaften)
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,                 -- 'company', 'project', 'cooperative', ...
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entities_kind ON entities(kind);

-- Real Transactions: Jede reale Bewegung (Material, Energie, Zeit, Geld, Schaden, Nutzen)
CREATE TABLE IF NOT EXISTS real_transactions (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  category TEXT NOT NULL,             -- 'income','expense','damage','benefit','risk'
  label TEXT,
  amount REAL NOT NULL,
  unit TEXT NOT NULL,                 -- 'EUR','kWh','tCO2e','h','index'
  direction TEXT NOT NULL,            -- 'positive' oder 'negative'
  weight REAL NOT NULL,               -- Bewertungsfaktor (z.B. CO2-Bepreisung)
  occurred_at TEXT NOT NULL,
  meta TEXT,                          -- JSON für Details
  created_at TEXT NOT NULL,
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);

CREATE INDEX IF NOT EXISTS idx_real_transactions_entity ON real_transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_real_transactions_category ON real_transactions(category);
CREATE INDEX IF NOT EXISTS idx_real_transactions_occurred_at ON real_transactions(occurred_at);

-- Real Balances: Aggregierte Real-Bilanzen (pro Zeitraum)
CREATE TABLE IF NOT EXISTS real_balances (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  total_income REAL NOT NULL,
  total_expense REAL NOT NULL,
  total_damage REAL NOT NULL,
  total_benefit REAL NOT NULL,
  total_risk REAL NOT NULL,
  net_value REAL NOT NULL,            -- Netto-Wert = benefit + income - expense - damage - risk
  currency TEXT NOT NULL,
  meta TEXT,                          -- JSON: Annahmen, Methoden
  created_at TEXT NOT NULL,
  FOREIGN KEY (entity_id) REFERENCES entities(id)
);

CREATE INDEX IF NOT EXISTS idx_real_balances_entity ON real_balances(entity_id);
CREATE INDEX IF NOT EXISTS idx_real_balances_period ON real_balances(period_start, period_end);

-- Instruments: Handelbare Titel auf Basis positiver Real-Bilanz
CREATE TABLE IF NOT EXISTS instruments (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  balance_id TEXT NOT NULL,
  symbol TEXT NOT NULL UNIQUE,        -- Kurzzeichen, z.B. "GEB-25Q1"
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,               -- 'draft','active','suspended','retired'
  net_value REAL NOT NULL,
  currency TEXT NOT NULL,
  units_issued REAL NOT NULL,
  creation_reason TEXT,
  created_at TEXT NOT NULL,
  activated_at TEXT,
  FOREIGN KEY (entity_id) REFERENCES entities(id),
  FOREIGN KEY (balance_id) REFERENCES real_balances(id)
);

CREATE INDEX IF NOT EXISTS idx_instruments_entity ON instruments(entity_id);
CREATE INDEX IF NOT EXISTS idx_instruments_status ON instruments(status);
CREATE INDEX IF NOT EXISTS idx_instruments_symbol ON instruments(symbol);

-- Instrument Quotes: Marktpreise / Spekulations-Ebene
CREATE TABLE IF NOT EXISTS instrument_quotes (
  id TEXT PRIMARY KEY,
  instrument_id TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  source TEXT,                        -- 'internal-exchange','oracle','import'
  meta TEXT,
  FOREIGN KEY (instrument_id) REFERENCES instruments(id)
);

CREATE INDEX IF NOT EXISTS idx_instrument_quotes_instrument ON instrument_quotes(instrument_id);
CREATE INDEX IF NOT EXISTS idx_instrument_quotes_recorded_at ON instrument_quotes(recorded_at);

-- Messages: User-zu-User-Nachrichten
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  content_preview TEXT,               -- Kurzer Auszug für Popup
  created_at TEXT NOT NULL,
  delivered_at TEXT,
  read_at TEXT,
  meta TEXT                           -- JSON: z.B. audio/video info, importance
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_delivered_at ON messages(delivered_at);

-- Message Delivery: Pro Manifest-Instance (Multi-Device)
CREATE TABLE IF NOT EXISTS message_delivery (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  manifest_instance_id TEXT,          -- Optional: Hash des MOT
  status TEXT NOT NULL,               -- 'pending','delivered','acked'
  updated_at TEXT NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id)
);

CREATE INDEX IF NOT EXISTS idx_message_delivery_user ON message_delivery(user_id);
CREATE INDEX IF NOT EXISTS idx_message_delivery_status ON message_delivery(status);

-- AV Sessions: High-End Audio/Video Sessions
CREATE TABLE IF NOT EXISTS av_sessions (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  initiator_id TEXT NOT NULL,
  participant_ids TEXT,               -- JSON Array
  audio_quality TEXT,                 -- 'standard','hifi','dolby'
  video_quality TEXT,                 -- 'none','sd','hd','full-hd','4k'
  status TEXT NOT NULL,               -- 'pending','active','ended'
  started_at TEXT,
  ended_at TEXT,
  meta TEXT                           -- JSON: WebRTC info, codecs, bandwidth
);

CREATE INDEX IF NOT EXISTS idx_av_sessions_room ON av_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_av_sessions_status ON av_sessions(status);



-- nBlockbuster Content Database Schema
-- BRANDING: .T. TogetherSystems - ModularFlux Architecture
-- VERSION: 3.0.0
-- STANDARD: IBM STANDARD - PERMANENT AKTIV

-- Content Items
CREATE TABLE IF NOT EXISTS nb_content (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  year INT NOT NULL,
  span_tag VARCHAR(8) CHECK (span_tag IN ('50+','50-')),
  type VARCHAR(32) NOT NULL, -- film, trailer, audiobook, tv, radio, print, event, music, game
  culture VARCHAR(64),
  language VARCHAR(16),
  country VARCHAR(64),
  license VARCHAR(64), -- public_domain, official_trailer, cc, archive
  synopsis TEXT,
  tags JSONB,
  embed JSONB, -- { player: 'archive_iframe', code: '<iframe...>' }
  media_hash VARCHAR(128), -- SHA-256 hash of embed code for verification
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sources/References
CREATE TABLE IF NOT EXISTS nb_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id VARCHAR(64) REFERENCES nb_content(id) ON DELETE CASCADE,
  ref_type VARCHAR(32) NOT NULL, -- archive, youtube, studio, library, museum, official_trailer, public_domain_text
  url TEXT NOT NULL,
  note TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Year Index
CREATE TABLE IF NOT EXISTS nb_year_index (
  year INT PRIMARY KEY,
  decade VARCHAR(16),
  span_tags JSONB, -- ["50+","50-"]
  highlights JSONB, -- [content_id...]
  collections JSONB, -- [collection_id...]
  editorial_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Collections (Dossiers)
CREATE TABLE IF NOT EXISTS nb_collections (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  years JSONB, -- [1911,1913,1914,1964]
  theme VARCHAR(32), -- dossier, decade, culture, event
  description TEXT,
  visibility VARCHAR(16) CHECK (visibility IN ('public','curated','private')) DEFAULT 'public',
  curator_alias VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Collection Items (Many-to-Many)
CREATE TABLE IF NOT EXISTS nb_collection_items (
  collection_id VARCHAR(64) REFERENCES nb_collections(id) ON DELETE CASCADE,
  content_id VARCHAR(64) REFERENCES nb_content(id) ON DELETE CASCADE,
  order_index INT DEFAULT 0,
  PRIMARY KEY (collection_id, content_id)
);

-- Nostalgia Contributions (User Memories)
CREATE TABLE IF NOT EXISTS nb_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias VARCHAR(64) NOT NULL,
  year INT,
  content_id VARCHAR(64) REFERENCES nb_content(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  media_url TEXT,
  moderation_status VARCHAR(16) CHECK (moderation_status IN ('pending','approved','rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cultural Games Mapping
CREATE TABLE IF NOT EXISTS nb_cultural_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id VARCHAR(64) REFERENCES nb_content(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  suggested_mode VARCHAR(16) CHECK (suggested_mode IN ('serious','casual','ritual')) DEFAULT 'casual',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, game_id)
);

-- Hive-Content Linkage
CREATE TABLE IF NOT EXISTS nb_hive_content (
  hive_room_id UUID REFERENCES hive_rooms(id) ON DELETE CASCADE,
  content_id VARCHAR(64) REFERENCES nb_content(id) ON DELETE CASCADE,
  mode VARCHAR(16) CHECK (mode IN ('watch','listen','read','play')) DEFAULT 'watch',
  started_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (hive_room_id, content_id)
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_nb_content_year ON nb_content(year);
CREATE INDEX IF NOT EXISTS idx_nb_content_span_tag ON nb_content(span_tag);
CREATE INDEX IF NOT EXISTS idx_nb_content_type ON nb_content(type);
CREATE INDEX IF NOT EXISTS idx_nb_content_culture ON nb_content(culture);
CREATE INDEX IF NOT EXISTS idx_nb_sources_content ON nb_sources(content_id);
CREATE INDEX IF NOT EXISTS idx_nb_memories_year ON nb_memories(year);
CREATE INDEX IF NOT EXISTS idx_nb_memories_content ON nb_memories(content_id);
CREATE INDEX IF NOT EXISTS idx_nb_memories_status ON nb_memories(moderation_status);



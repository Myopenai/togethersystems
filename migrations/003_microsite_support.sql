-- Migration: Mikro-Sites Support
-- Erweitert cms_sites um Mikro-Site-Felder

-- Füge Mikro-Site-Felder hinzu
ALTER TABLE cms_sites ADD COLUMN IF NOT EXISTS microsite_url TEXT;
ALTER TABLE cms_sites ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE cms_sites ADD COLUMN IF NOT EXISTS builder_mode TEXT DEFAULT 'simple'; -- 'simple' | 'developer'

-- Index für schnelle User-Suche
CREATE INDEX IF NOT EXISTS idx_cms_sites_user_id ON cms_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_cms_sites_microsite_url ON cms_sites(microsite_url);

-- URL-Rotation-Tracking (optional, für spätere Erweiterungen)
CREATE TABLE IF NOT EXISTS microsite_url_rotations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  url_pattern TEXT NOT NULL, -- T,userId.&T,,page.
  rotation_index INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES cms_sites(id)
);

CREATE INDEX IF NOT EXISTS idx_microsite_url_rotations_user ON microsite_url_rotations(user_id);
CREATE INDEX IF NOT EXISTS idx_microsite_url_rotations_site ON microsite_url_rotations(site_id);










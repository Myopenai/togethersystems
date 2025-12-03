-- D1 Schema für Social-Media & Rich-Media Posts
-- Erweitert das bestehende Schema um Timeline, Posts, Reaktionen, etc.

-- Posts (Timeline)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  title TEXT,
  media_urls TEXT, -- JSON Array: ["url1", "url2"]
  media_types TEXT, -- JSON Array: ["image", "video", "audio"]
  network_id TEXT, -- Zu welchem Netzwerk gehört der Post
  parent_id TEXT, -- Wenn Reply/Share
  visibility TEXT DEFAULT 'network', -- 'network', 'public', 'private'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_network ON posts(network_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- Reaktionen (Like, etc.)
CREATE TABLE IF NOT EXISTS reactions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL, -- 'like', 'love', 'share', etc.
  created_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

-- Kommentare
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id TEXT, -- Für Threads
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- Netzwerk-Verbindungen
CREATE TABLE IF NOT EXISTS network_connections (
  id TEXT PRIMARY KEY,
  network_id TEXT NOT NULL,
  user_a_id TEXT NOT NULL,
  user_b_id TEXT NOT NULL,
  connection_type TEXT DEFAULT 'invited', -- 'invited', 'connected', 'blocked'
  invited_by TEXT, -- Wer hat eingeladen
  created_at TEXT NOT NULL,
  UNIQUE(user_a_id, user_b_id, network_id)
);

CREATE INDEX IF NOT EXISTS idx_network_connections_network ON network_connections(network_id);
CREATE INDEX IF NOT EXISTS idx_network_connections_user_a ON network_connections(user_a_id);
CREATE INDEX IF NOT EXISTS idx_network_connections_user_b ON network_connections(user_b_id);

-- Netzwerke
CREATE TABLE IF NOT EXISTS networks (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  owner_id TEXT NOT NULL,
  visibility TEXT DEFAULT 'private', -- 'private', 'public'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_networks_owner ON networks(owner_id);

-- Events (Kalender)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  organizer_id TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT,
  network_id TEXT, -- Zu welchem Netzwerk gehört das Event
  invitee_ids TEXT, -- JSON Array: ["user1", "user2"]
  visibility TEXT DEFAULT 'network', -- 'network', 'public', 'private'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_network ON events(network_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);

-- Media-Storage (Referenzen zu R2/Cloudflare Storage)
CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY,
  post_id TEXT,
  user_id TEXT NOT NULL,
  storage_url TEXT NOT NULL, -- R2 URL oder Data URL
  mime_type TEXT,
  file_size INTEGER,
  width INTEGER, -- Für Bilder/Videos
  height INTEGER, -- Für Bilder/Videos
  duration INTEGER, -- Für Videos/Audio (Sekunden)
  hash_sha256 TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_media_files_post ON media_files(post_id);
CREATE INDEX IF NOT EXISTS idx_media_files_user ON media_files(user_id);

-- Rechnungen (Automatische Rechnungstellung)
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  issuer_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  voucher_id TEXT, -- Optional: Verknüpfung zu Voucher
  booking_id TEXT, -- Optional: Verknüpfung zu Booking
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'EUR',
  tax_rate REAL DEFAULT 0,
  items TEXT, -- JSON Array: [{"description": "...", "quantity": 1, "price": 100}]
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'cancelled'
  due_date TEXT,
  paid_at TEXT,
  invoice_number TEXT,
  pdf_url TEXT, -- URL zum generierten PDF
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_issuer ON invoices(issuer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_recipient ON invoices(recipient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Calendar-Synchronisation
CREATE TABLE IF NOT EXISTS calendar_syncs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  calendar_type TEXT NOT NULL, -- 'google', 'outlook', 'ical'
  calendar_id TEXT NOT NULL, -- Externe Calendar-ID
  sync_token TEXT,
  last_sync_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, calendar_type, calendar_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_syncs_user ON calendar_syncs(user_id);

-- Push-Notification-Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);










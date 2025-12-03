-- D1 Database Schema für Settings-OS
-- Settings Graph Persistierung

-- Settings Nodes Tabelle
CREATE TABLE IF NOT EXISTS settings_nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  version TEXT NOT NULL,
  scope TEXT NOT NULL, -- JSON Array
  tags TEXT, -- JSON Array
  meta TEXT NOT NULL, -- JSON Object
  dimensions TEXT, -- JSON Object
  dependencies TEXT, -- JSON Array
  semantics TEXT, -- JSON Array
  data TEXT, -- JSON Object (type-specific)
  created_at INTEGER NOT NULL,
  updated_at INTEGER
);

-- Settings Edges Tabelle
CREATE TABLE IF NOT EXISTS settings_edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  edge_type TEXT NOT NULL,
  constraints TEXT, -- JSON Object
  required INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (source_id) REFERENCES settings_nodes(id),
  FOREIGN KEY (target_id) REFERENCES settings_nodes(id)
);

-- Settings Versions Tabelle (für Versionierung)
CREATE TABLE IF NOT EXISTS settings_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id TEXT NOT NULL,
  version TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON Object (vollständiger Node)
  checksum TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  created_by TEXT,
  FOREIGN KEY (node_id) REFERENCES settings_nodes(id)
);

-- Settings Proposals Tabelle (für LLM Proposals)
CREATE TABLE IF NOT EXISTS settings_proposals (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL,
  changes TEXT NOT NULL, -- JSON Object
  rationale TEXT NOT NULL,
  proposed_by TEXT NOT NULL,
  llm_model TEXT,
  validation_result TEXT, -- JSON Object
  status TEXT NOT NULL, -- pending, approved, rejected
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER,
  reviewed_by TEXT,
  FOREIGN KEY (node_id) REFERENCES settings_nodes(id)
);

-- Audit Log Tabelle
CREATE TABLE IF NOT EXISTS settings_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL, -- create, update, delete, propose, approve, reject
  node_id TEXT,
  user_id TEXT,
  changes TEXT, -- JSON Object
  timestamp INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- User Distribution Tabelle (für User-Endprodukt)
CREATE TABLE IF NOT EXISTS user_distributions (
  id TEXT PRIMARY KEY, -- Unique Identifier
  user_key_hash TEXT NOT NULL UNIQUE, -- Hash des User-Keys
  settings_snapshot TEXT NOT NULL, -- JSON Object (verschlüsselt)
  version TEXT NOT NULL,
  portal_host TEXT NOT NULL,
  notary_signature TEXT,
  notary_timestamp INTEGER,
  created_at INTEGER NOT NULL,
  last_accessed INTEGER,
  access_count INTEGER DEFAULT 0
);

-- Notary Verifications Tabelle
CREATE TABLE IF NOT EXISTS notary_verifications (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL, -- node, proposal, distribution
  entity_id TEXT NOT NULL,
  verification_type TEXT NOT NULL, -- automatic, extended, personal
  status TEXT NOT NULL, -- pending, verified, rejected
  signature TEXT,
  verified_by TEXT,
  verified_at INTEGER,
  expires_at INTEGER,
  metadata TEXT -- JSON Object
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_settings_nodes_type ON settings_nodes(type);
CREATE INDEX IF NOT EXISTS idx_settings_nodes_scope ON settings_nodes(scope);
CREATE INDEX IF NOT EXISTS idx_settings_edges_source ON settings_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_settings_edges_target ON settings_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_settings_versions_node ON settings_versions(node_id);
CREATE INDEX IF NOT EXISTS idx_settings_proposals_node ON settings_proposals(node_id);
CREATE INDEX IF NOT EXISTS idx_settings_proposals_status ON settings_proposals(status);
CREATE INDEX IF NOT EXISTS idx_settings_audit_node ON settings_audit_log(node_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_timestamp ON settings_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_distributions_key ON user_distributions(user_key_hash);
CREATE INDEX IF NOT EXISTS idx_notary_verifications_entity ON notary_verifications(entity_type, entity_id);









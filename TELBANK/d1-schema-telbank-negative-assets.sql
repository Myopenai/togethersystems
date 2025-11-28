-- ============================================================================
-- TELBANK NEGATIVE ASSETS POOL - DATENBANKMODELL
-- IBM-Standard: Zero-Defect, Industrial Fabrication Software
-- Version: 1.0.0-XXXL
-- Branding: T,.&T,,.&T,,,.TELBANK(C)(R)
-- ============================================================================

-- 1. BANKEN / MONETÄRE SYSTEME
CREATE TABLE IF NOT EXISTS bank (
  bank_id           TEXT PRIMARY KEY, -- UUID als TEXT für D1
  legal_name        TEXT NOT NULL,
  short_name        TEXT,
  country_code      TEXT(2),
  city              TEXT,
  bic_swift         TEXT,
  lei               TEXT, -- Legal Entity Identifier
  website           TEXT,
  contact_email     TEXT,
  contact_form_url  TEXT,
  api_base_url      TEXT,
  sftp_host         TEXT,
  public_key        TEXT, -- Für Verschlüsselung
  role              TEXT CHECK (role IN ('provider', 'observer', 'telbank')),
  onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'active', 'suspended', 'terminated')),
  is_active         INTEGER NOT NULL DEFAULT 1, -- BOOLEAN als INTEGER
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_bank_country ON bank(country_code);
CREATE INDEX idx_bank_role ON bank(role);
CREATE INDEX idx_bank_active ON bank(is_active);

-- 2. ASSET-KATEGORIEN
CREATE TABLE IF NOT EXISTS asset_class (
  asset_class_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  code              TEXT UNIQUE NOT NULL, -- z.B. DIGITAL_CURRENCY, LOAN, BOND, NPL, CHARGE_OFF, FRAUD_CASE
  description       TEXT,
  currency_default  TEXT(3),
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Initiale Asset-Klassen
INSERT OR IGNORE INTO asset_class (code, description, currency_default) VALUES
  ('DIGITAL_CURRENCY', 'Digitale Währungen (Crypto, Stablecoins)', 'USD'),
  ('LOAN', 'Kredite / Darlehen', 'EUR'),
  ('BOND', 'Anleihen', 'EUR'),
  ('NPL', 'Non-Performing Loans (faule Kredite)', 'EUR'),
  ('CHARGE_OFF', 'Abgeschriebene Forderungen', 'EUR'),
  ('FRAUD_CASE', 'Betrugsfälle', 'EUR'),
  ('OVERDRAFT', 'Überziehungen', 'EUR'),
  ('PENALTY', 'Strafen / Gebühren', 'EUR');

-- 3. INSTRUMENTE (Handelbare Assets)
CREATE TABLE IF NOT EXISTS instrument (
  instrument_id     TEXT PRIMARY KEY, -- UUID
  asset_class_id    INTEGER NOT NULL REFERENCES asset_class(asset_class_id),
  symbol_or_isin   TEXT,
  currency          TEXT(3) NOT NULL,
  metadata_json     TEXT, -- JSON als TEXT für D1
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_instrument_asset_class ON instrument(asset_class_id);
CREATE INDEX idx_instrument_currency ON instrument(currency);

-- 4. NEGATIV-ASSETS (wie sie von Banken gemeldet werden)
CREATE TABLE IF NOT EXISTS negative_asset (
  neg_asset_id      TEXT PRIMARY KEY, -- UUID
  provider_bank_id TEXT NOT NULL REFERENCES bank(bank_id),
  external_ref      TEXT, -- bankinterne ID / Ticket / Case
  asset_class_id    INTEGER NOT NULL REFERENCES asset_class(asset_class_id),
  instrument_id     TEXT REFERENCES instrument(instrument_id),
  currency_code     TEXT(3) NOT NULL,
  nominal_amount    REAL NOT NULL, -- IMMER als NEGATIV interpretiert (< 0)
  event_date        TEXT NOT NULL, -- DATE als TEXT
  status            TEXT CHECK (status IN ('reported', 'validated', 'in_transformation', 'resolved', 'invalid', 'archived')),
  risk_score        REAL, -- 0-100
  anonymized_hash   TEXT, -- Hash von (Kunde, Konto, etc.) für Matching
  meta_json         TEXT, -- JSONB als TEXT
  source_system     TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_negative_asset_bank ON negative_asset(provider_bank_id);
CREATE INDEX idx_negative_asset_status ON negative_asset(status);
CREATE INDEX idx_negative_asset_date ON negative_asset(event_date);
CREATE INDEX idx_negative_asset_currency ON negative_asset(currency_code);
CREATE INDEX idx_negative_asset_hash ON negative_asset(anonymized_hash);

-- 5. TRANSFORMATIONEN (Minus -> Maßnahmen -> ggf. Plus)
CREATE TABLE IF NOT EXISTS transformation_action (
  transform_id      TEXT PRIMARY KEY, -- UUID
  neg_asset_id      TEXT NOT NULL REFERENCES negative_asset(neg_asset_id),
  action_type       TEXT NOT NULL, -- z.B. 'restructuring', 'debt_purchase', 'writeoff', 'swap', 'netting'
  description       TEXT,
  scheduled_at      TEXT, -- TIMESTAMP als TEXT
  executed_at       TEXT, -- TIMESTAMP als TEXT
  result_state      TEXT CHECK (result_state IN ('planned', 'executed', 'failed', 'cancelled')),
  effect_amount     REAL, -- wie stark Minus reduziert/neutralisiert wurde
  notes             TEXT,
  approved_by       TEXT, -- User/System ID
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_transformation_asset ON transformation_action(neg_asset_id);
CREATE INDEX idx_transformation_state ON transformation_action(result_state);
CREATE INDEX idx_transformation_type ON transformation_action(action_type);

-- 6. TELBANK-LEDGER (Bilanzierung von Minus-Assets)
CREATE TABLE IF NOT EXISTS telbank_ledger (
  ledger_entry_id   TEXT PRIMARY KEY, -- UUID
  neg_asset_id      TEXT REFERENCES negative_asset(neg_asset_id),
  transform_id      TEXT REFERENCES transformation_action(transform_id),
  entry_type        TEXT CHECK (entry_type IN ('minus_in', 'operational_cost', 'plus_out', 'neutral', 'netting')),
  currency_code     TEXT(3) NOT NULL,
  amount            REAL NOT NULL, -- signed
  booked_at         TEXT NOT NULL DEFAULT (datetime('now')),
  description       TEXT,
  reference_id      TEXT, -- externe Deal-ID, Batch-ID, etc.
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_ledger_asset ON telbank_ledger(neg_asset_id);
CREATE INDEX idx_ledger_transform ON telbank_ledger(transform_id);
CREATE INDEX idx_ledger_type ON telbank_ledger(entry_type);
CREATE INDEX idx_ledger_date ON telbank_ledger(booked_at);

-- 7. TEILNAHMEVERTRAG Banken <-> Telbank (10-Jahres-Modell)
CREATE TABLE IF NOT EXISTS participation_agreement (
  agreement_id      TEXT PRIMARY KEY, -- UUID
  bank_id           TEXT NOT NULL REFERENCES bank(bank_id),
  start_date        TEXT NOT NULL, -- DATE als TEXT
  end_date          TEXT, -- DATE als TEXT
  term_years        INTEGER,
  revenue_share_pct REAL DEFAULT 0, -- bei dir: für andere Banken 0
  can_access_pool   INTEGER NOT NULL DEFAULT 1, -- BOOLEAN
  status            TEXT CHECK (status IN ('draft', 'active', 'suspended', 'terminated')),
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_agreement_bank ON participation_agreement(bank_id);
CREATE INDEX idx_agreement_status ON participation_agreement(status);

-- 8. POSITION (aktuellster Zustand je Bank/Instrument)
CREATE TABLE IF NOT EXISTS position (
  position_id       TEXT PRIMARY KEY, -- UUID
  bank_id           TEXT NOT NULL REFERENCES bank(bank_id),
  instrument_id     TEXT REFERENCES instrument(instrument_id),
  asset_class_id    INTEGER NOT NULL REFERENCES asset_class(asset_class_id),
  quantity          REAL, -- signed
  mtm_value         REAL, -- Mark-to-Market, signed (< 0 = Negativ-Asset)
  valuation_currency TEXT(3) NOT NULL,
  value_date        TEXT NOT NULL, -- DATE als TEXT
  source_system     TEXT,
  status            TEXT CHECK (status IN ('ACTIVE', 'CLOSED', 'ERROR', 'ARCHIVED')),
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_position_bank ON position(bank_id);
CREATE INDEX idx_position_instrument ON position(instrument_id);
CREATE INDEX idx_position_status ON position(status);
CREATE INDEX idx_position_negative ON position(mtm_value) WHERE mtm_value < 0;

-- 9. POSITION_LEDGER_ENTRY (Event-/Buchungsebene)
CREATE TABLE IF NOT EXISTS position_ledger_entry (
  entry_id          TEXT PRIMARY KEY, -- UUID
  position_id       TEXT REFERENCES position(position_id),
  bank_id           TEXT NOT NULL REFERENCES bank(bank_id),
  instrument_id     TEXT REFERENCES instrument(instrument_id),
  direction         TEXT CHECK (direction IN ('DEBIT', 'CREDIT')),
  amount            REAL NOT NULL,
  currency          TEXT(3) NOT NULL,
  value_date        TEXT NOT NULL, -- DATE als TEXT
  booking_date      TEXT NOT NULL DEFAULT (datetime('now')),
  event_type        TEXT NOT NULL, -- IMPORT, ADJUSTMENT, DEAL, NETTING, WRITE_OFF, TRANSFORMATION
  reference_id      TEXT, -- externe Deal-ID, Batch-ID
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_ledger_entry_position ON position_ledger_entry(position_id);
CREATE INDEX idx_ledger_entry_bank ON position_ledger_entry(bank_id);
CREATE INDEX idx_ledger_entry_event ON position_ledger_entry(event_type);
CREATE INDEX idx_ledger_entry_date ON position_ledger_entry(booking_date);

-- 10. LIMIT_AGREEMENT (für Geschäftsmodell)
CREATE TABLE IF NOT EXISTS limit_agreement (
  limit_id          TEXT PRIMARY KEY, -- UUID
  bank_id           TEXT NOT NULL REFERENCES bank(bank_id),
  asset_class_id    INTEGER REFERENCES asset_class(asset_class_id),
  limit_amount      REAL NOT NULL,
  currency          TEXT(3) NOT NULL,
  valid_from        TEXT NOT NULL, -- DATE als TEXT
  valid_to          TEXT, -- DATE als TEXT
  status            TEXT CHECK (status IN ('draft', 'active', 'expired', 'cancelled')),
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_limit_bank ON limit_agreement(bank_id);
CREATE INDEX idx_limit_status ON limit_agreement(status);

-- 11. IMPORT_BATCH (für CSV-Imports)
CREATE TABLE IF NOT EXISTS import_batch (
  batch_id          TEXT PRIMARY KEY, -- UUID
  bank_id           TEXT REFERENCES bank(bank_id),
  source_type       TEXT CHECK (source_type IN ('CSV_CONTACT', 'CSV_POSITION', 'CSV_NEGATIVE_ASSET', 'API', 'SFTP')),
  received_at       TEXT NOT NULL DEFAULT (datetime('now')),
  status            TEXT CHECK (status IN ('RECEIVED', 'VALIDATED', 'APPLIED', 'FAILED', 'PARTIAL')),
  error_summary     TEXT,
  total_lines       INTEGER DEFAULT 0,
  processed_lines   INTEGER DEFAULT 0,
  failed_lines      INTEGER DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_batch_bank ON import_batch(bank_id);
CREATE INDEX idx_batch_status ON import_batch(status);
CREATE INDEX idx_batch_type ON import_batch(source_type);

-- 12. IMPORT_LINE (Einzelne Zeilen aus Import-Batches)
CREATE TABLE IF NOT EXISTS import_line (
  line_id           TEXT PRIMARY KEY, -- UUID
  batch_id           TEXT NOT NULL REFERENCES import_batch(batch_id),
  line_number       INTEGER NOT NULL,
  raw_payload       TEXT, -- Original CSV-Zeile oder JSON
  parsed_ok          INTEGER NOT NULL DEFAULT 0, -- BOOLEAN
  validation_error_code TEXT,
  processed_at      TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_import_line_batch ON import_line(batch_id);
CREATE INDEX idx_import_line_parsed ON import_line(parsed_ok);

-- 13. SOFTWARE_NEGATIVE_ASSET (Fehler/Incidents als "Minus-Assets" der Software)
CREATE TABLE IF NOT EXISTS software_negative_asset (
  software_neg_id   TEXT PRIMARY KEY, -- UUID
  component         TEXT NOT NULL, -- z.B. 'telbank-core', 'bank-connector-xyz', 'portal-ui'
  severity          TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  impact_money      REAL, -- geschätzter finanzieller Schaden
  impact_reputation REAL, -- 0-100
  root_cause        TEXT,
  error_code        TEXT,
  error_message     TEXT,
  stack_trace       TEXT,
  status            TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'archived')),
  autofix_applied   INTEGER DEFAULT 0, -- BOOLEAN
  autofix_result    TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at       TEXT
);

CREATE INDEX idx_software_neg_component ON software_negative_asset(component);
CREATE INDEX idx_software_neg_severity ON software_negative_asset(severity);
CREATE INDEX idx_software_neg_status ON software_negative_asset(status);

-- ============================================================================
-- VIEWS (Materialisierte Sichten für Performance)
-- ============================================================================

-- View: Negative Asset Nullpoint Status
-- Prüft, ob der Nullpunkt erreicht wurde (aus dem Dunkeln ins Licht)
CREATE VIEW IF NOT EXISTS negative_asset_nullpoint_status AS
SELECT
  n.neg_asset_id,
  n.nominal_amount,
  COALESCE(SUM(t.effect_amount), 0) AS total_effect,
  (n.nominal_amount + COALESCE(SUM(t.effect_amount), 0)) AS residual_amount,
  CASE
    WHEN (n.nominal_amount + COALESCE(SUM(t.effect_amount), 0)) >= 0
      THEN 'beyond_nullpoint' -- aus dem Dunkeln raus
    WHEN (n.nominal_amount + COALESCE(SUM(t.effect_amount), 0)) > n.nominal_amount
      THEN 'improving'
    ELSE 'worse_or_unchanged'
  END AS status,
  n.provider_bank_id,
  n.currency_code,
  n.event_date
FROM negative_asset n
LEFT JOIN transformation_action t ON t.neg_asset_id = n.neg_asset_id
WHERE n.status != 'archived'
GROUP BY n.neg_asset_id, n.nominal_amount, n.provider_bank_id, n.currency_code, n.event_date;

-- View: Bank Exposure (wieviel negativer Bestand pro Bank)
CREATE VIEW IF NOT EXISTS bank_exposure AS
SELECT
  b.bank_id,
  b.legal_name,
  b.country_code,
  n.currency_code,
  COUNT(n.neg_asset_id) AS total_negative_assets,
  SUM(n.nominal_amount) AS total_exposure,
  AVG(n.risk_score) AS avg_risk_score,
  MAX(n.event_date) AS latest_asset_date
FROM bank b
LEFT JOIN negative_asset n ON n.provider_bank_id = b.bank_id
WHERE b.is_active = 1 AND (n.status IS NULL OR n.status != 'archived')
GROUP BY b.bank_id, b.legal_name, b.country_code, n.currency_code;

-- View: Global Negative Asset Pool (Aggregation)
CREATE VIEW IF NOT EXISTS global_negative_asset_pool AS
SELECT
  ac.code AS asset_class,
  n.currency_code,
  COUNT(n.neg_asset_id) AS asset_count,
  SUM(n.nominal_amount) AS total_negative_value,
  AVG(n.risk_score) AS avg_risk_score,
  MIN(n.event_date) AS earliest_date,
  MAX(n.event_date) AS latest_date
FROM negative_asset n
JOIN asset_class ac ON ac.asset_class_id = n.asset_class_id
WHERE n.status IN ('reported', 'validated', 'in_transformation')
GROUP BY ac.code, n.currency_code;

-- ============================================================================
-- TRIGGERS (Automatische Updates)
-- ============================================================================

-- Trigger: Update updated_at bei Änderungen
CREATE TRIGGER IF NOT EXISTS update_bank_timestamp 
  AFTER UPDATE ON bank
  FOR EACH ROW
BEGIN
  UPDATE bank SET updated_at = datetime('now') WHERE bank_id = NEW.bank_id;
END;

CREATE TRIGGER IF NOT EXISTS update_negative_asset_timestamp 
  AFTER UPDATE ON negative_asset
  FOR EACH ROW
BEGIN
  UPDATE negative_asset SET updated_at = datetime('now') WHERE neg_asset_id = NEW.neg_asset_id;
END;

CREATE TRIGGER IF NOT EXISTS update_position_timestamp 
  AFTER UPDATE ON position
  FOR EACH ROW
BEGIN
  UPDATE position SET updated_at = datetime('now') WHERE position_id = NEW.position_id;
END;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================


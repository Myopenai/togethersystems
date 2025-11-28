-- ============================================================================
-- TELADIA ASSET EXCHANGE SPHERE - DATENBANKMODELL
-- IBM-Standard: Zero-Defect, Industrial Fabrication Software
-- Version: 1.0.0-XXXL
-- Branding: T,.&T,,.&T,,,.TELADIA(C)(R) x Deutsche Bank
-- ============================================================================

-- TELADIA verwendet das gleiche Schema wie TELBANK, aber mit separater Bank-ID
-- Alle Tabellen sind identisch, nur die bank_id unterscheidet sich

-- 1. TELADIA BANK-EINTRAG
INSERT OR IGNORE INTO bank (
  bank_id,
  legal_name,
  short_name,
  country_code,
  city,
  bic_swift,
  website,
  contact_email,
  contact_form_url,
  api_base_url,
  role,
  onboarding_status,
  is_active,
  created_at,
  updated_at
) VALUES (
  'TELADIA-BANK-001',
  'TELADIA Asset Exchange Sphere',
  'TELADIA',
  'DE',
  'Frankfurt',
  'TELADIAXXX',
  'https://teladia.togethersystems.com',
  'contact@teladia.togethersystems.com',
  'https://teladia.togethersystems.com/contact',
  'https://api.teladia.togethersystems.com',
  'telbank',
  'active',
  1,
  datetime('now'),
  datetime('now')
);

-- 2. TELADIA ASSET TYPES (zusätzlich zu TELBANK)
INSERT OR IGNORE INTO asset_class (code, description, currency_default) VALUES
  ('REAL_ESTATE', 'Immobilien / Real Estate', 'EUR'),
  ('STOCKS', 'Aktien / Stocks', 'EUR'),
  ('BONDS', 'Anleihen / Bonds', 'EUR'),
  ('COMMODITIES', 'Rohstoffe / Commodities', 'USD'),
  ('FOREX', 'Devisen / Foreign Exchange', 'USD');

-- 3. TELADIA EXCHANGE RATES (für sekündlichen Austausch)
CREATE TABLE IF NOT EXISTS teladia_exchange_rate (
  rate_id          TEXT PRIMARY KEY, -- UUID
  from_currency    TEXT(3) NOT NULL,
  to_currency      TEXT(3) NOT NULL,
  rate             REAL NOT NULL,
  source           TEXT, -- 'db', 'crypto_exchange', 'manual'
  valid_from       TEXT NOT NULL DEFAULT (datetime('now')),
  valid_to         TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_exchange_rate_from ON teladia_exchange_rate(from_currency);
CREATE INDEX idx_exchange_rate_to ON teladia_exchange_rate(to_currency);
CREATE INDEX idx_exchange_rate_valid ON teladia_exchange_rate(valid_from, valid_to);

-- 4. TELADIA EXCHANGE TRANSACTIONS
CREATE TABLE IF NOT EXISTS teladia_exchange_transaction (
  transaction_id   TEXT PRIMARY KEY, -- UUID
  bank_id          TEXT NOT NULL REFERENCES bank(bank_id),
  from_currency    TEXT(3) NOT NULL,
  from_amount      REAL NOT NULL,
  to_currency      TEXT(3) NOT NULL,
  to_amount        REAL NOT NULL,
  exchange_rate    REAL NOT NULL,
  fee_amount       REAL DEFAULT 0,
  fee_currency     TEXT(3),
  status           TEXT CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
  executed_at      TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_exchange_trans_bank ON teladia_exchange_transaction(bank_id);
CREATE INDEX idx_exchange_trans_status ON teladia_exchange_transaction(status);
CREATE INDEX idx_exchange_trans_date ON teladia_exchange_transaction(executed_at);

-- 5. TELADIA REAL ESTATE ASSETS
CREATE TABLE IF NOT EXISTS teladia_real_estate (
  property_id      TEXT PRIMARY KEY, -- UUID
  bank_id          TEXT NOT NULL REFERENCES bank(bank_id),
  property_type    TEXT, -- 'residential', 'commercial', 'land'
  address          TEXT,
  city             TEXT,
  country_code     TEXT(2),
  valuation_amount REAL NOT NULL,
  valuation_currency TEXT(3) NOT NULL,
  valuation_date   TEXT NOT NULL,
  status           TEXT CHECK (status IN ('active', 'pending', 'sold', 'archived')),
  db_partnership   INTEGER DEFAULT 0, -- BOOLEAN
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_real_estate_bank ON teladia_real_estate(bank_id);
CREATE INDEX idx_real_estate_status ON teladia_real_estate(status);

-- 6. TELADIA ASSET PORTFOLIO (Aggregation)
CREATE VIEW IF NOT EXISTS teladia_asset_portfolio AS
SELECT
  b.bank_id,
  b.legal_name AS bank_name,
  ac.code AS asset_class,
  n.currency_code,
  COUNT(n.neg_asset_id) AS asset_count,
  SUM(n.nominal_amount) AS total_value,
  AVG(n.risk_score) AS avg_risk_score
FROM bank b
LEFT JOIN negative_asset n ON n.provider_bank_id = b.bank_id AND n.status != 'archived'
LEFT JOIN asset_class ac ON ac.asset_class_id = n.asset_class_id
WHERE b.bank_id = 'TELADIA-BANK-001'
GROUP BY b.bank_id, b.legal_name, ac.code, n.currency_code;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================


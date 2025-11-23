-- D1 schema for TogetherSystems backend (minimal subset for Telbank & Voucher/Hypothek)

-- Telbank transfers
CREATE TABLE IF NOT EXISTS transfers (
  id TEXT PRIMARY KEY,
  direction TEXT NOT NULL,
  label TEXT,
  wallet_address TEXT,
  network TEXT,
  crypto_amount REAL NOT NULL,
  crypto_symbol TEXT NOT NULL,
  fiat_amount REAL NOT NULL,
  fiat_currency TEXT NOT NULL,
  external_account TEXT,
  meta TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transfers_wallet ON transfers(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transfers_direction ON transfers(direction);

-- Voucher core
CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY,
  issuer_uid TEXT NOT NULL,
  holder_uid TEXT,
  service_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  price_amount REAL,
  price_currency TEXT,
  status TEXT NOT NULL,
  transferable INTEGER NOT NULL,
  terms TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vouchers_issuer ON vouchers(issuer_uid);
CREATE INDEX IF NOT EXISTS idx_vouchers_holder ON vouchers(holder_uid);
CREATE INDEX IF NOT EXISTS idx_vouchers_service_type ON vouchers(service_type);

CREATE TABLE IF NOT EXISTS voucher_bookings (
  id TEXT PRIMARY KEY,
  voucher_id TEXT NOT NULL,
  issuer_uid TEXT NOT NULL,
  holder_uid TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  slot_start TEXT NOT NULL,
  slot_end TEXT NOT NULL,
  status TEXT NOT NULL,
  cancel_reason TEXT,
  created_at TEXT NOT NULL,
  cancelled_at TEXT,
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
);

CREATE INDEX IF NOT EXISTS idx_voucher_bookings_voucher ON voucher_bookings(voucher_id);

-- Minimal mortgage tables (Demo)
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  address TEXT,
  meta TEXT
);

CREATE TABLE IF NOT EXISTS mortgage_applications (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  borrower_uid TEXT NOT NULL,
  desired_loan REAL NOT NULL,
  currency TEXT NOT NULL,
  duration_years INTEGER NOT NULL,
  rate_type TEXT NOT NULL,
  max_interest REAL,
  status TEXT NOT NULL,
  meta TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS mortgage_offers (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  lender_uid TEXT NOT NULL,
  interest_rate REAL NOT NULL,
  monthly_payment REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (application_id) REFERENCES mortgage_applications(id)
);



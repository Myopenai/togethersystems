-- THYNK ORDNER - Orders Database Schema
-- Extract from d1-schema-cms.sql - Orders Section

-- Orders: Bestellungen
CREATE TABLE IF NOT EXISTS cms_orders (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, shipped, cancelled, refunded
  total_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  customer_json TEXT, -- JSON: Name, Adresse, Email
  created_at TEXT NOT NULL,
  paid_at TEXT,
  shipped_at TEXT,
  FOREIGN KEY (site_id) REFERENCES cms_sites(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_orders_site ON cms_orders(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_orders_status ON cms_orders(status);
CREATE INDEX IF NOT EXISTS idx_cms_orders_order_number ON cms_orders(order_number);

-- Order Items
CREATE TABLE IF NOT EXISTS cms_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT,
  product_snapshot_json TEXT NOT NULL, -- JSON-Snapshot zum Zeitpunkt der Bestellung
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES cms_orders(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_order_items_order ON cms_order_items(order_id);

-- Products: E-Commerce Produkte (vereist voor Orders)
CREATE TABLE IF NOT EXISTS cms_products (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  sku TEXT UNIQUE,
  price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  stock_quantity INTEGER,
  status TEXT NOT NULL DEFAULT 'active', -- active, hidden, archived
  vat_rate REAL NOT NULL DEFAULT 21.0,
  meta_json TEXT, -- JSON: Varianten, Attribute
  created_at TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES cms_sites(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_products_site ON cms_products(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_products_sku ON cms_products(sku);

-- Product Locales (vereist voor Products)
CREATE TABLE IF NOT EXISTS cms_product_locales (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES cms_products(id),
  UNIQUE(product_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_cms_product_locales_product ON cms_product_locales(product_id);


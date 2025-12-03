-- CMS-Datenbank-Schema für Together Systems Portal
-- Multi-Tenant, Block-basiertes CMS mit E-Commerce

-- Tenants: Mandanten/Organisationen
CREATE TABLE IF NOT EXISTS cms_tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free', -- free, pro, enterprise
  settings TEXT, -- JSON
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_tenants_plan ON cms_tenants(plan);

-- Sites: Websites pro Tenant
CREATE TABLE IF NOT EXISTS cms_sites (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  default_locale TEXT NOT NULL DEFAULT 'de',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, online, archived
  settings TEXT, -- JSON: Theme, SEO-Defaults, Tracking
  created_at TEXT NOT NULL,
  published_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES cms_tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_sites_tenant ON cms_sites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cms_sites_slug ON cms_sites(slug);
CREATE INDEX IF NOT EXISTS idx_cms_sites_status ON cms_sites(status);

-- Domains: Domain-Zuordnungen
CREATE TABLE IF NOT EXISTS cms_domains (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  domain_name TEXT NOT NULL UNIQUE,
  is_primary INTEGER NOT NULL DEFAULT 0,
  dns_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, error
  ssl_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES cms_sites(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_domains_site ON cms_domains(site_id);

-- Pages: Seiten
CREATE TABLE IF NOT EXISTS cms_pages (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  parent_page_id TEXT, -- für Menü-Baum
  path TEXT NOT NULL, -- "/", "/about", "/shop/product-x"
  type TEXT NOT NULL DEFAULT 'standard', -- standard, landing, product, blog_post
  is_home INTEGER NOT NULL DEFAULT 0,
  layout TEXT NOT NULL DEFAULT 'default',
  seo_index INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES cms_sites(id),
  FOREIGN KEY (parent_page_id) REFERENCES cms_pages(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_site ON cms_pages(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_pages_path ON cms_pages(site_id, path);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);

-- Page Locales: Mehrsprachige Seiten-Inhalte
CREATE TABLE IF NOT EXISTS cms_page_locales (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT,
  meta TEXT, -- JSON
  FOREIGN KEY (page_id) REFERENCES cms_pages(id),
  UNIQUE(page_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_cms_page_locales_page ON cms_page_locales(page_id);

-- Block Types: Definiert verfügbare Block-Komponenten
CREATE TABLE IF NOT EXISTS cms_block_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL, -- "text", "image", "hero", ...
  category TEXT NOT NULL, -- "basic", "ecommerce", "plugin"
  schema_json TEXT NOT NULL, -- JSON-Schema für data
  component_ref TEXT NOT NULL, -- z.B. "blocks/TextBlock"
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_block_types_category ON cms_block_types(category);

-- Blocks: Content-Bausteine auf Seiten
CREATE TABLE IF NOT EXISTS cms_blocks (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  locale TEXT, -- optional
  block_type_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  zone TEXT NOT NULL DEFAULT 'main', -- main, sidebar, footer, header
  data_json TEXT NOT NULL, -- JSON: Block-Daten
  visibility_json TEXT, -- JSON: Segmentierung
  created_at TEXT NOT NULL,
  FOREIGN KEY (page_id) REFERENCES cms_pages(id),
  FOREIGN KEY (block_type_id) REFERENCES cms_block_types(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_blocks_page ON cms_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_blocks_position ON cms_blocks(page_id, position);

-- Collections: Generische Inhalts-Sammlungen (Blog, Produkte, Events)
CREATE TABLE IF NOT EXISTS cms_collections (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  schema_json TEXT NOT NULL, -- Felder-Definition
  settings_json TEXT, -- JSON: URL-Template, Sortierung
  created_at TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES cms_sites(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_collections_site ON cms_collections(site_id);

-- Collection Items
CREATE TABLE IF NOT EXISTS cms_collection_items (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  published_at TEXT,
  created_by TEXT,
  updated_by TEXT,
  FOREIGN KEY (collection_id) REFERENCES cms_collections(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_collection_items_collection ON cms_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_cms_collection_items_status ON cms_collection_items(status);

-- Collection Item Locales
CREATE TABLE IF NOT EXISTS cms_collection_item_locales (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  data_json TEXT NOT NULL,
  slug TEXT NOT NULL,
  FOREIGN KEY (item_id) REFERENCES cms_collection_items(id),
  UNIQUE(item_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_cms_collection_item_locales_item ON cms_collection_item_locales(item_id);

-- Media Items
CREATE TABLE IF NOT EXISTS cms_media_items (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL, -- z.B. S3-Key oder R2-Key
  alt_text TEXT,
  meta TEXT, -- JSON: EXIF, Thumbnails, Tags
  created_at TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES cms_sites(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_media_items_site ON cms_media_items(site_id);

-- Products: E-Commerce Produkte
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

-- Product Locales
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

-- API Keys
CREATE TABLE IF NOT EXISTS cms_api_keys (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  site_id TEXT, -- optional
  token_hash TEXT NOT NULL UNIQUE,
  scopes TEXT NOT NULL, -- JSON: ["read:content","write:orders"]
  created_at TEXT NOT NULL,
  last_used_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES cms_tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_api_keys_tenant ON cms_api_keys(tenant_id);

-- Webhook Subscriptions
CREATE TABLE IF NOT EXISTS cms_webhook_subscriptions (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- "page.published", "order.created", ...
  target_url TEXT NOT NULL,
  secret TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES cms_sites(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_webhook_subscriptions_site ON cms_webhook_subscriptions(site_id);

-- Audit Logs
CREATE TABLE IF NOT EXISTS cms_audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  entity_type TEXT NOT NULL, -- "Page","Block","Product"
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL, -- "created","updated","deleted","published"
  timestamp TEXT NOT NULL,
  data_before TEXT, -- JSON
  data_after TEXT, -- JSON
  FOREIGN KEY (tenant_id) REFERENCES cms_tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_cms_audit_logs_tenant ON cms_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cms_audit_logs_entity ON cms_audit_logs(entity_type, entity_id);










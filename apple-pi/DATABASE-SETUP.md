# Datenbank-Setup - PostgreSQL/MariaDB
## Vollständige Anleitung für Apple-Pi System

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 🗄️ DATENBANK-AUSWAHL

### PostgreSQL (Empfohlen)

**Vorteile:**
- Sehr robust und performant
- Gute JSON-Unterstützung
- Umfangreiche Features

**Nachteile:**
- Etwas mehr Ressourcen-Verbrauch

### MariaDB (Alternative)

**Vorteile:**
- Leichtgewichtiger
- MySQL-kompatibel
- Gute Performance

**Nachteile:**
- Weniger Features als PostgreSQL

**Empfehlung:** PostgreSQL für Apple-Pi System

---

## 📦 POSTGRESQL INSTALLATION

### Schritt 1: PostgreSQL installieren

```bash
# Auf Raspberry Pi
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL starten
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Schritt 2: Datenbank erstellen

```bash
# Als postgres-User einloggen
sudo -u postgres psql

# Datenbank erstellen
CREATE DATABASE apple_pi;

# User erstellen
CREATE USER apple_pi_user WITH PASSWORD 'IHR_SICHERES_PASSWORT';

# Rechte vergeben
GRANT ALL PRIVILEGES ON DATABASE apple_pi TO apple_pi_user;

# Verlassen
\q
```

### Schritt 3: Tabellen erstellen

```bash
# Als apple_pi_user einloggen
psql -U apple_pi_user -d apple_pi

# Tabellen erstellen
```

```sql
-- AA Identity
CREATE TABLE aa_identity (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    roles TEXT[],
    tokens JSONB,
    webauthn JSONB,
    client_cert JSONB,
    meta JSONB
);

-- BA Bank Transactions
CREATE TABLE ba_transactions (
    id VARCHAR(20) PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    balance DECIMAL(10,2),
    meta JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- EE Energy
CREATE TABLE ee_energy (
    id VARCHAR(20) PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(50) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    efficiency DECIMAL(5,2),
    cost DECIMAL(10,2),
    cost_unit VARCHAR(3),
    sensor_id VARCHAR(255),
    location VARCHAR(255),
    meta JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- NN Notary
CREATE TABLE nn_notary (
    id VARCHAR(20) PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    hash VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    data TEXT,
    signature JSONB,
    notar_id VARCHAR(255),
    hessen_number VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    meta JSONB
);

-- PP Products
CREATE TABLE pp_products (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    startup_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    perfected_at TIMESTAMP,
    verified_at TIMESTAMP,
    manifest JSONB,
    verification JSONB,
    meta JSONB
);

-- Indizes erstellen
CREATE INDEX idx_ba_transactions_date ON ba_transactions(date);
CREATE INDEX idx_ba_transactions_account ON ba_transactions(account_id);
CREATE INDEX idx_ee_energy_timestamp ON ee_energy(timestamp);
CREATE INDEX idx_ee_energy_source ON ee_energy(source);
CREATE INDEX idx_nn_notary_hash ON nn_notary(hash);
CREATE INDEX idx_nn_notary_type ON nn_notary(type);
CREATE INDEX idx_pp_products_startup ON pp_products(startup_id);
CREATE INDEX idx_pp_products_status ON pp_products(status);
```

### Schritt 4: Docker-Container für PostgreSQL

```yaml
# infra/docker-compose.yml - PostgreSQL hinzufügen
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: apple_pi
      POSTGRES_USER: apple_pi_user
      POSTGRES_PASSWORD: IHR_SICHERES_PASSWORT
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - apple-pi

volumes:
  postgres-data:
```

---

## 🔐 SICHERHEIT

### Verschlüsselung aktivieren

```sql
-- PostgreSQL-Verschlüsselung (automatisch aktiv)
-- Zusätzlich: Datenbank-Level-Verschlüsselung
ALTER DATABASE apple_pi SET encryption = on;
```

### Backup-Strategie

```bash
# Tägliches Backup
pg_dump -U apple_pi_user -d apple_pi > backup_$(date +%Y%m%d).sql

# Automatisches Backup (Cron)
0 2 * * * pg_dump -U apple_pi_user -d apple_pi > /backups/apple_pi_$(date +\%Y\%m\%d).sql
```

---

## 📊 MONITORING

### Datenbank-Status prüfen

```bash
# Verbindungen prüfen
psql -U apple_pi_user -d apple_pi -c "SELECT count(*) FROM pg_stat_activity;"

# Tabellen-Größen
psql -U apple_pi_user -d apple_pi -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV


---

## 🏢 Unternehmens-Branding & OCR

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

| Information | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |
| **Businessplan** | [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf) |

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---

-- Apple-Pi Database Schema
-- BRANDING: .T. TogetherSystems - ModularFlux Architecture
-- VERSION: 3.0.0

-- PostgreSQL/MariaDB kompatibel

-- AA: Identity
CREATE TABLE IF NOT EXISTS aa_identity (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    roles JSONB,  -- PostgreSQL
    -- roles JSON,  -- MariaDB
    tokens JSONB,
    webauthn JSONB,
    client_cert JSONB,
    meta JSONB
);

-- BA: Bank Transactions
CREATE TABLE IF NOT EXISTS ba_transactions (
    id VARCHAR(20) PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    balance DECIMAL(15,2),
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EE: Energy
CREATE TABLE IF NOT EXISTS ee_energy (
    id VARCHAR(20) PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(50) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    efficiency DECIMAL(5,2),
    cost DECIMAL(10,2),
    cost_unit VARCHAR(3),
    sensor_id VARCHAR(255),
    location VARCHAR(255),
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NN: Notary
CREATE TABLE IF NOT EXISTS nn_notary (
    id VARCHAR(20) PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    hash VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    data TEXT,
    signature JSONB,
    notar_id VARCHAR(50),
    hessen_number VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    meta JSONB
);

-- PP: Products
CREATE TABLE IF NOT EXISTS pp_products (
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

-- Indizes
CREATE INDEX IF NOT EXISTS idx_ba_date ON ba_transactions(date);
CREATE INDEX IF NOT EXISTS idx_ee_timestamp ON ee_energy(timestamp);
CREATE INDEX IF NOT EXISTS idx_nn_hash ON nn_notary(hash);
CREATE INDEX IF NOT EXISTS idx_pp_startup ON pp_products(startup_id);



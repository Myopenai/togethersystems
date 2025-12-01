# ============================================================================
# AUTO-SETUP-SYSTEM - Vollautomatische Entwicklungsumgebung
# ============================================================================
# Version: 1.0.0
# Erstellt: 2025-01-27
# Zweck: 100% automatisierte Setup ohne User-Aktionen
# ============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# ============================================================================
# KONFIGURATION
# ============================================================================

$PROJECT_NAME = "customer-engagement-platform"
$BASE_DIR = Get-Location
$PROJECT_DIR = Join-Path $BASE_DIR $PROJECT_NAME

# Farben für Output
function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

function Write-Progress-Bar {
    param([int]$Percent, [string]$Message)
    Write-Progress -Activity "Auto-Setup" -Status $Message -PercentComplete $Percent
}

# ============================================================================
# PHASE 1: PROJEKT-STRUKTUR ERSTELLEN
# ============================================================================

Write-Step "=" * 80 "INFO"
Write-Step "STARTE VOLLAUTOMATISCHES SETUP" "INFO"
Write-Step "=" * 80 "INFO"
Write-Step ""

Write-Progress-Bar 0 "Erstelle Projekt-Struktur..."

try {
    # Projekt-Verzeichnis erstellen
    if (-not (Test-Path $PROJECT_DIR)) {
        New-Item -ItemType Directory -Path $PROJECT_DIR -Force | Out-Null
        Write-Step "✅ Projekt-Verzeichnis erstellt: $PROJECT_DIR" "SUCCESS"
    } else {
        Write-Step "ℹ️  Projekt-Verzeichnis existiert bereits: $PROJECT_DIR" "INFO"
    }

    # Unterverzeichnisse erstellen
    $DIRECTORIES = @(
        "src/api/routes",
        "src/api/handlers",
        "src/api/middleware",
        "src/models",
        "src/services",
        "src/services/journey",
        "src/services/messaging",
        "src/services/segments",
        "src/utils",
        "src/config",
        "tests/unit",
        "tests/integration",
        "tests/e2e",
        "docs",
        "migrations",
        "scripts",
        "i18n/templates",
        "i18n/errors",
        "i18n/validation",
        "i18n/status"
    )

    foreach ($dir in $DIRECTORIES) {
        $fullPath = Join-Path $PROJECT_DIR $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Step "✅ Verzeichnis erstellt: $dir" "SUCCESS"
        }
    }

    Write-Progress-Bar 10 "Projekt-Struktur erstellt"
    Write-Step "✅ Phase 1 abgeschlossen: Projekt-Struktur" "SUCCESS"
} catch {
    Write-Step "❌ Fehler beim Erstellen der Projekt-Struktur: $_" "ERROR"
    exit 1
}

# ============================================================================
# PHASE 2: KONFIGURATIONSDATEIEN GENERIEREN
# ============================================================================

Write-Progress-Bar 15 "Generiere Konfigurationsdateien..."

try {
    # package.json für Node.js
    $packageJson = @{
        name = $PROJECT_NAME
        version = "1.0.0"
        description = "Customer Engagement & Messaging Platform"
        main = "src/index.js"
        scripts = @{
            start = "node src/index.js"
            dev = "nodemon src/index.js"
            test = "jest"
            lint = "eslint src/"
            format = "prettier --write src/"
        }
        dependencies = @{
            express = "^4.18.0"
            uuid = "^9.0.0"
            pg = "^8.11.0"
            redis = "^4.6.0"
            i18next = "^23.0.0"
            joi = "^17.9.0"
            winston = "^3.10.0"
        }
        devDependencies = @{
            nodemon = "^3.0.0"
            jest = "^29.6.0"
            eslint = "^8.45.0"
            prettier = "^3.0.0"
        }
    } | ConvertTo-Json -Depth 10

    $packageJsonPath = Join-Path $PROJECT_DIR "package.json"
    $packageJson | Out-File -FilePath $packageJsonPath -Encoding UTF8
    Write-Step "✅ package.json erstellt" "SUCCESS"

    # .env.example
    $envExample = @"
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=customer_engagement
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API
API_PORT=3000
API_BASE_URL=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Workspace Defaults
DEFAULT_LOCALE=en
DEFAULT_TIMEZONE=UTC

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
"@

    $envExamplePath = Join-Path $PROJECT_DIR ".env.example"
    $envExample | Out-File -FilePath $envExamplePath -Encoding UTF8
    Write-Step "✅ .env.example erstellt" "SUCCESS"

    # .gitignore
    $gitignore = @"
node_modules/
.env
.env.local
*.log
logs/
dist/
build/
coverage/
.DS_Store
*.swp
*.swo
.vscode/
.idea/
"@

    $gitignorePath = Join-Path $PROJECT_DIR ".gitignore"
    $gitignore | Out-File -FilePath $gitignorePath -Encoding UTF8
    Write-Step "✅ .gitignore erstellt" "SUCCESS"

    Write-Progress-Bar 30 "Konfigurationsdateien generiert"
    Write-Step "✅ Phase 2 abgeschlossen: Konfigurationsdateien" "SUCCESS"
} catch {
    Write-Step "❌ Fehler beim Generieren der Konfigurationsdateien: $_" "ERROR"
    exit 1
}

# ============================================================================
# PHASE 3: BASIS-CODE GENERIEREN
# ============================================================================

Write-Progress-Bar 35 "Generiere Basis-Code..."

try {
    # src/index.js - Main Entry Point
    $indexJs = @"
const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');

const app = express();
const PORT = config.API_PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

module.exports = app;
"@

    $indexJsPath = Join-Path $PROJECT_DIR "src/index.js"
    $indexJs | Out-File -FilePath $indexJsPath -Encoding UTF8
    Write-Step "✅ src/index.js erstellt" "SUCCESS"

    # src/config/index.js
    $configJs = @"
require('dotenv').config();

module.exports = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'customer_engagement',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  api: {
    port: process.env.API_PORT || 3000,
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  defaults: {
    locale: process.env.DEFAULT_LOCALE || 'en',
    timezone: process.env.DEFAULT_TIMEZONE || 'UTC',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
};
"@

    $configJsPath = Join-Path $PROJECT_DIR "src/config/index.js"
    $configJs | Out-File -FilePath $configJsPath -Encoding UTF8
    Write-Step "✅ src/config/index.js erstellt" "SUCCESS"

    # src/utils/logger.js
    $loggerJs = @"
const winston = require('winston');
const config = require('../config');

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: config.logging.file }),
  ],
});

module.exports = logger;
"@

    $loggerJsPath = Join-Path $PROJECT_DIR "src/utils/logger.js"
    $loggerJs | Out-File -FilePath $loggerJsPath -Encoding UTF8
    Write-Step "✅ src/utils/logger.js erstellt" "SUCCESS"

    Write-Progress-Bar 50 "Basis-Code generiert"
    Write-Step "✅ Phase 3 abgeschlossen: Basis-Code" "SUCCESS"
} catch {
    Write-Step "❌ Fehler beim Generieren des Basis-Codes: $_" "ERROR"
    exit 1
}

# ============================================================================
# PHASE 4: DATENBANK-SCHEMA ERSTELLEN
# ============================================================================

Write-Progress-Bar 55 "Erstelle Datenbank-Schema..."

try {
    # migrations/001_initial_schema.sql
    $schemaSql = @"
-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    quotas JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, email)
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_workspace_id ON contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_attributes_email ON contacts USING GIN ((attributes->>'email'));

-- Events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    event_type VARCHAR(255) NOT NULL,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_properties JSONB DEFAULT '{}',
    source VARCHAR(255),
    session_id VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_events_workspace_contact_time ON events(workspace_id, contact_id, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_events_workspace_type_time ON events(workspace_id, event_type, event_time DESC);

-- Channels
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    kind VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    config JSONB DEFAULT '{}'
);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    channel_kind VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft'
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    journey_instance_id UUID,
    body TEXT NOT NULL,
    subject TEXT,
    status VARCHAR(50) DEFAULT 'queued',
    external_message_id VARCHAR(255),
    error_message TEXT,
    queued_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_workspace_contact ON messages(workspace_id, contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status_queued ON messages(workspace_id, status, queued_at);

-- Segments
CREATE TABLE IF NOT EXISTS segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    segment_query JSONB NOT NULL,
    is_dynamic BOOLEAN DEFAULT false,
    contact_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMP
);

-- Journeys
CREATE TABLE IF NOT EXISTS journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journey Nodes
CREATE TABLE IF NOT EXISTS journey_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL,
    label VARCHAR(255),
    config JSONB DEFAULT '{}',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0
);

-- Journey Edges
CREATE TABLE IF NOT EXISTS journey_edges (
    from_node_id UUID NOT NULL REFERENCES journey_nodes(id) ON DELETE CASCADE,
    to_node_id UUID NOT NULL REFERENCES journey_nodes(id) ON DELETE CASCADE,
    condition VARCHAR(255),
    PRIMARY KEY (from_node_id, to_node_id)
);

-- Journey Instances
CREATE TABLE IF NOT EXISTS journey_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    current_node_id UUID REFERENCES journey_nodes(id),
    status VARCHAR(50) DEFAULT 'active',
    state_data JSONB DEFAULT '{}',
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journey_instances_workspace_contact ON journey_instances(workspace_id, contact_id, status);
CREATE INDEX IF NOT EXISTS idx_journey_instances_status_updated ON journey_instances(status, last_updated);
"@

    $schemaSqlPath = Join-Path $PROJECT_DIR "migrations/001_initial_schema.sql"
    $schemaSql | Out-File -FilePath $schemaSqlPath -Encoding UTF8
    Write-Step "✅ Datenbank-Schema erstellt: migrations/001_initial_schema.sql" "SUCCESS"

    Write-Progress-Bar 70 "Datenbank-Schema erstellt"
    Write-Step "✅ Phase 4 abgeschlossen: Datenbank-Schema" "SUCCESS"
} catch {
    Write-Step "❌ Fehler beim Erstellen des Datenbank-Schemas: $_" "ERROR"
    exit 1
}

# ============================================================================
# PHASE 5: PROGRESS-TRACKER ERSTELLEN
# ============================================================================

Write-Progress-Bar 80 "Erstelle Progress-Tracker..."

try {
    # scripts/progress-tracker.json
    $progressTracker = @{
        version = "1.0.0"
        created = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        phases = @(
            @{
                name = "Setup"
                status = "completed"
                steps = @(
                    @{ name = "Projekt-Struktur erstellen"; status = "completed" }
                    @{ name = "Konfigurationsdateien generieren"; status = "completed" }
                    @{ name = "Basis-Code generieren"; status = "completed" }
                    @{ name = "Datenbank-Schema erstellen"; status = "completed" }
                )
            },
            @{
                name = "Entwicklung"
                status = "pending"
                steps = @(
                    @{ name = "Models implementieren"; status = "pending" }
                    @{ name = "Services implementieren"; status = "pending" }
                    @{ name = "API-Endpoints implementieren"; status = "pending" }
                    @{ name = "Tests schreiben"; status = "pending" }
                )
            }
        )
        overallProgress = 20
    } | ConvertTo-Json -Depth 10

    $progressTrackerPath = Join-Path $PROJECT_DIR "scripts/progress-tracker.json"
    $progressTracker | Out-File -FilePath $progressTrackerPath -Encoding UTF8
    Write-Step "✅ Progress-Tracker erstellt" "SUCCESS"

    Write-Progress-Bar 90 "Progress-Tracker erstellt"
    Write-Step "✅ Phase 5 abgeschlossen: Progress-Tracker" "SUCCESS"
} catch {
    Write-Step "❌ Fehler beim Erstellen des Progress-Trackers: $_" "ERROR"
    exit 1
}

# ============================================================================
# ABSCHLUSS
# ============================================================================

Write-Progress-Bar 100 "Setup abgeschlossen"

Write-Step "" "INFO"
Write-Step "=" * 80 "SUCCESS"
Write-Step "✅ VOLLAUTOMATISCHES SETUP ERFOLGREICH ABGESCHLOSSEN!" "SUCCESS"
Write-Step "=" * 80 "SUCCESS"
Write-Step "" "INFO"
Write-Step "📁 Projekt-Verzeichnis: $PROJECT_DIR" "INFO"
Write-Step "" "INFO"
Write-Step "Nächste Schritte:" "INFO"
Write-Step "  1. cd $PROJECT_NAME" "INFO"
Write-Step "  2. npm install" "INFO"
Write-Step "  3. npm run dev" "INFO"
Write-Step "" "INFO"
Write-Step "Oder führe aus: scripts/auto-continue.ps1" "INFO"
Write-Step "" "INFO"

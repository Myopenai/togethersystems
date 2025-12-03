#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  PROMPT-DB INITIALISIERUNG                                                ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Erstellt die Prompt-Datenbank mit Starter-Rezepten                       ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
set -euo pipefail

# Farben
GREEN='\033[0;32m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

ROOT="${1:-.}"
DB_DIR="$ROOT/system/registry"
DB="$DB_DIR/prompt_db.json"
PROMPTS_DIR="$ROOT/system/prompts"
FORMULAS_DIR="$ROOT/system/formulas"
MIXES_DIR="$ROOT/system/mixes"

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  🗄️  PROMPT-DB INITIALISIERUNG                                            ║"
echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verzeichnisse erstellen
mkdir -p "$DB_DIR"
mkdir -p "$PROMPTS_DIR"
mkdir -p "$FORMULAS_DIR"
mkdir -p "$MIXES_DIR"

echo -e "${CYAN}[1/4] Erstelle Datenbank-Struktur...${NC}"

# Haupt-Datenbank
cat > "$DB" << 'JSON'
{
  "version": "1.0.0",
  "created": "2025-12-02T00:00:00Z",
  "branding": "[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS",
  "prompts": [],
  "formulas": [],
  "mixes": [],
  "stats": {
    "totalPrompts": 0,
    "totalFormulas": 0,
    "totalMixes": 0,
    "generations": 0
  }
}
JSON

echo -e "  ${GREEN}✓${NC} Datenbank erstellt: $DB"

# ═══════════════════════════════════════════════════════════════════════════════
# STARTER PROMPTS (10 Archetypen)
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[2/4] Erstelle Starter-Prompts...${NC}"

# 1. REST API (Node/Express)
cat > "$PROMPTS_DIR/prog.web.api.rest.node.express.json" << 'JSON'
{
  "id": "prog.web.api.rest.node.express",
  "title": "REST API (Node/Express)",
  "domain": "web_backend",
  "language": "TypeScript",
  "framework": "Express",
  "inputs": ["OpenAPI spec", "Env config"],
  "outputs": ["src/", "tests/", "Dockerfile", "ci.yml"],
  "archetype": "service",
  "prompt": {
    "system": "Erzeuge eine produktionsreife REST API in TypeScript mit Express. Halte dich strikt an die vorgegebene OpenAPI-Spezifikation.",
    "instructions": [
      "Generiere kompilierbaren Code (tsconfig, eslint, jest).",
      "Implementiere die Endpunkte exakt wie in OpenAPI.",
      "Füge Health-Check /health hinzu.",
      "Erzeuge CI-Workflow (build, test).",
      "Keine Fantasie-Bibliotheken; nutze nur genehmigte."
    ],
    "constraints": {
      "license": "MIT",
      "dependencies": ["express", "zod", "jest", "typescript"],
      "security": ["no-dangerous-content", "no-realworld-hazard"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "src/index.ts", "engine": "mustache", "vars": ["PORT", "ROUTES"]},
    {"path": "src/routes/health.ts", "engine": "mustache", "vars": []},
    {"path": "tests/health.test.ts", "engine": "mustache", "vars": []},
    {"path": "Dockerfile", "engine": "mustache", "vars": ["NODE_VERSION"]},
    {"path": ".github/workflows/ci.yml", "engine": "mustache", "vars": []}
  ],
  "tags": ["api", "node", "typescript", "openapi", "express"],
  "version": "1.0.0"
}
JSON

# 2. FastAPI (Python)
cat > "$PROMPTS_DIR/prog.web.api.rest.python.fastapi.json" << 'JSON'
{
  "id": "prog.web.api.rest.python.fastapi",
  "title": "REST API (Python/FastAPI)",
  "domain": "web_backend",
  "language": "Python",
  "framework": "FastAPI",
  "inputs": ["OpenAPI spec", "Env config"],
  "outputs": ["app/", "tests/", "Dockerfile", "requirements.txt"],
  "archetype": "service",
  "prompt": {
    "system": "Erzeuge eine produktionsreife REST API in Python mit FastAPI. Nutze Pydantic für Validierung.",
    "instructions": [
      "Generiere typisierte Endpoints mit Pydantic Models.",
      "Implementiere Health-Check und OpenAPI Docs.",
      "Füge pytest Tests hinzu.",
      "Erzeuge Docker + CI Workflow."
    ],
    "constraints": {
      "license": "MIT",
      "dependencies": ["fastapi", "uvicorn", "pydantic", "pytest"],
      "security": ["no-dangerous-content"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "app/main.py", "engine": "mustache", "vars": ["APP_NAME"]},
    {"path": "app/routes/__init__.py", "engine": "mustache", "vars": []},
    {"path": "tests/test_health.py", "engine": "mustache", "vars": []},
    {"path": "requirements.txt", "engine": "mustache", "vars": []}
  ],
  "tags": ["api", "python", "fastapi", "openapi"],
  "version": "1.0.0"
}
JSON

# 3. React Frontend
cat > "$PROMPTS_DIR/prog.web.frontend.react.typescript.json" << 'JSON'
{
  "id": "prog.web.frontend.react.typescript",
  "title": "React Frontend (TypeScript)",
  "domain": "web_frontend",
  "language": "TypeScript",
  "framework": "React",
  "inputs": ["Component specs", "Design tokens"],
  "outputs": ["src/", "public/", "tests/", "package.json"],
  "archetype": "webapp",
  "prompt": {
    "system": "Erzeuge eine moderne React-Anwendung mit TypeScript, Vite und TailwindCSS.",
    "instructions": [
      "Nutze funktionale Komponenten mit Hooks.",
      "Implementiere responsive Design mit Tailwind.",
      "Füge Jest + React Testing Library Tests hinzu.",
      "PWA-ready mit Service Worker."
    ],
    "constraints": {
      "license": "MIT",
      "dependencies": ["react", "react-dom", "vite", "tailwindcss"],
      "security": ["no-dangerous-content"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "src/App.tsx", "engine": "mustache", "vars": ["APP_NAME"]},
    {"path": "src/main.tsx", "engine": "mustache", "vars": []},
    {"path": "index.html", "engine": "mustache", "vars": ["TITLE"]}
  ],
  "tags": ["frontend", "react", "typescript", "tailwind", "pwa"],
  "version": "1.0.0"
}
JSON

# 4. CLI Tool (Go)
cat > "$PROMPTS_DIR/prog.cli.tool.go.cobra.json" << 'JSON'
{
  "id": "prog.cli.tool.go.cobra",
  "title": "CLI Tool (Go/Cobra)",
  "domain": "cli",
  "language": "Go",
  "framework": "Cobra",
  "inputs": ["Command spec", "Flags"],
  "outputs": ["cmd/", "internal/", "go.mod", "Makefile"],
  "archetype": "cli",
  "prompt": {
    "system": "Erzeuge ein produktionsreifes CLI-Tool in Go mit Cobra für Commands und Viper für Config.",
    "instructions": [
      "Strukturiere Commands in cmd/.",
      "Implementiere --help, --version, --verbose Flags.",
      "Füge Unit-Tests hinzu.",
      "Cross-Platform Build mit Makefile."
    ],
    "constraints": {
      "license": "MIT",
      "dependencies": ["cobra", "viper"],
      "security": ["no-dangerous-content"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "cmd/root.go", "engine": "mustache", "vars": ["APP_NAME"]},
    {"path": "main.go", "engine": "mustache", "vars": []},
    {"path": "go.mod", "engine": "mustache", "vars": ["MODULE"]}
  ],
  "tags": ["cli", "go", "cobra", "cross-platform"],
  "version": "1.0.0"
}
JSON

# 5. Tauri Desktop App
cat > "$PROMPTS_DIR/prog.desktop.app.tauri.typescript.json" << 'JSON'
{
  "id": "prog.desktop.app.tauri.typescript",
  "title": "Desktop App (Tauri/TypeScript)",
  "domain": "desktop",
  "language": "TypeScript",
  "framework": "Tauri",
  "inputs": ["UI spec", "Features"],
  "outputs": ["src/", "src-tauri/", "package.json"],
  "archetype": "desktop",
  "prompt": {
    "system": "Erzeuge eine Cross-Platform Desktop-App mit Tauri und TypeScript Frontend.",
    "instructions": [
      "Konfiguriere Tauri für Windows/macOS/Linux.",
      "Implementiere Auto-Updater.",
      "Füge CI/CD für Release-Builds hinzu.",
      "Native System-Integration (Tray, Notifications)."
    ],
    "constraints": {
      "license": "MIT",
      "dependencies": ["tauri", "vite", "typescript"],
      "security": ["no-dangerous-content"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "src-tauri/tauri.conf.json", "engine": "mustache", "vars": ["APP_NAME"]},
    {"path": "src-tauri/src/main.rs", "engine": "mustache", "vars": []},
    {"path": "src/App.tsx", "engine": "mustache", "vars": []}
  ],
  "tags": ["desktop", "tauri", "typescript", "cross-platform"],
  "version": "1.0.0"
}
JSON

# 6. ETL Pipeline (Python/Airflow)
cat > "$PROMPTS_DIR/prog.data.etl.python.airflow.json" << 'JSON'
{
  "id": "prog.data.etl.python.airflow",
  "title": "ETL Pipeline (Python/Airflow)",
  "domain": "data",
  "language": "Python",
  "framework": "Airflow",
  "inputs": ["DAG spec", "Data sources"],
  "outputs": ["dags/", "plugins/", "docker-compose.yml"],
  "archetype": "pipeline",
  "prompt": {
    "system": "Erzeuge eine produktionsreife ETL-Pipeline mit Apache Airflow.",
    "instructions": [
      "Definiere DAGs mit klaren Dependencies.",
      "Implementiere Error-Handling und Retries.",
      "Füge Monitoring und Alerting hinzu.",
      "Docker-Compose für lokale Entwicklung."
    ],
    "constraints": {
      "license": "Apache-2.0",
      "dependencies": ["airflow", "pandas", "sqlalchemy"],
      "security": ["no-dangerous-content"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "dags/example_dag.py", "engine": "mustache", "vars": ["DAG_ID"]},
    {"path": "plugins/__init__.py", "engine": "mustache", "vars": []},
    {"path": "docker-compose.yml", "engine": "mustache", "vars": []}
  ],
  "tags": ["data", "etl", "airflow", "python", "pipeline"],
  "version": "1.0.0"
}
JSON

# 7. Terraform Module
cat > "$PROMPTS_DIR/prog.infra.terraform.aws.json" << 'JSON'
{
  "id": "prog.infra.terraform.aws",
  "title": "Terraform Module (AWS)",
  "domain": "infrastructure",
  "language": "HCL",
  "framework": "Terraform",
  "inputs": ["Resource spec", "Variables"],
  "outputs": ["main.tf", "variables.tf", "outputs.tf", "README.md"],
  "archetype": "iac",
  "prompt": {
    "system": "Erzeuge ein wiederverwendbares Terraform-Modul für AWS.",
    "instructions": [
      "Definiere klare Input-Variables mit Descriptions.",
      "Implementiere sinnvolle Outputs.",
      "Füge terraform-docs README hinzu.",
      "Best Practices für State und Locking."
    ],
    "constraints": {
      "license": "MIT",
      "dependencies": [],
      "security": ["no-dangerous-content", "no-hardcoded-secrets"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "main.tf", "engine": "mustache", "vars": ["RESOURCE_TYPE"]},
    {"path": "variables.tf", "engine": "mustache", "vars": []},
    {"path": "outputs.tf", "engine": "mustache", "vars": []}
  ],
  "tags": ["infrastructure", "terraform", "aws", "iac"],
  "version": "1.0.0"
}
JSON

# 8. Documentation Site
cat > "$PROMPTS_DIR/prog.docs.site.mkdocs.json" << 'JSON'
{
  "id": "prog.docs.site.mkdocs",
  "title": "Documentation Site (MkDocs)",
  "domain": "documentation",
  "language": "Markdown",
  "framework": "MkDocs",
  "inputs": ["Content structure", "Theme config"],
  "outputs": ["docs/", "mkdocs.yml", ".github/workflows/docs.yml"],
  "archetype": "docs",
  "prompt": {
    "system": "Erzeuge eine professionelle Dokumentations-Website mit MkDocs Material.",
    "instructions": [
      "Strukturiere Docs nach Diátaxis (Tutorial, How-To, Reference, Explanation).",
      "Implementiere Suche und Navigation.",
      "Füge CI für Auto-Deploy hinzu.",
      "Dark/Light Mode Support."
    ],
    "constraints": {
      "license": "MIT",
      "dependencies": ["mkdocs", "mkdocs-material"],
      "security": ["no-dangerous-content"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "mkdocs.yml", "engine": "mustache", "vars": ["SITE_NAME"]},
    {"path": "docs/index.md", "engine": "mustache", "vars": []},
    {"path": "docs/getting-started.md", "engine": "mustache", "vars": []}
  ],
  "tags": ["documentation", "mkdocs", "markdown"],
  "version": "1.0.0"
}
JSON

# 9. Testing Framework
cat > "$PROMPTS_DIR/prog.testing.e2e.playwright.json" << 'JSON'
{
  "id": "prog.testing.e2e.playwright",
  "title": "E2E Testing (Playwright)",
  "domain": "testing",
  "language": "TypeScript",
  "framework": "Playwright",
  "inputs": ["Test scenarios", "Base URL"],
  "outputs": ["tests/", "playwright.config.ts", "package.json"],
  "archetype": "testing",
  "prompt": {
    "system": "Erzeuge ein E2E-Testing-Framework mit Playwright.",
    "instructions": [
      "Implementiere Page Object Model.",
      "Füge Visual Regression Tests hinzu.",
      "CI-Integration mit Parallelisierung.",
      "HTML-Reports und Screenshots bei Failure."
    ],
    "constraints": {
      "license": "MIT",
      "dependencies": ["playwright", "@playwright/test"],
      "security": ["no-dangerous-content"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "playwright.config.ts", "engine": "mustache", "vars": ["BASE_URL"]},
    {"path": "tests/example.spec.ts", "engine": "mustache", "vars": []},
    {"path": "tests/pages/BasePage.ts", "engine": "mustache", "vars": []}
  ],
  "tags": ["testing", "e2e", "playwright", "typescript"],
  "version": "1.0.0"
}
JSON

# 10. PWA Starter
cat > "$PROMPTS_DIR/prog.web.pwa.vanilla.json" << 'JSON'
{
  "id": "prog.web.pwa.vanilla",
  "title": "PWA Starter (Vanilla JS)",
  "domain": "web_frontend",
  "language": "JavaScript",
  "framework": "Vanilla",
  "inputs": ["App spec", "Icons"],
  "outputs": ["index.html", "sw.js", "manifest.json", "app.js"],
  "archetype": "pwa",
  "prompt": {
    "system": "Erzeuge eine minimale Progressive Web App ohne Frameworks.",
    "instructions": [
      "Implementiere Service Worker für Offline-Fähigkeit.",
      "Füge Web App Manifest hinzu.",
      "Responsive Design mit CSS Grid/Flexbox.",
      "Lighthouse-Score optimiert."
    ],
    "constraints": {
      "license": "MIT",
      "dependencies": [],
      "security": ["no-dangerous-content"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "index.html", "engine": "mustache", "vars": ["APP_NAME", "THEME_COLOR"]},
    {"path": "sw.js", "engine": "mustache", "vars": ["CACHE_VERSION"]},
    {"path": "manifest.json", "engine": "mustache", "vars": ["APP_NAME", "ICONS"]}
  ],
  "tags": ["pwa", "offline", "vanilla", "javascript"],
  "version": "1.0.0"
}
JSON

echo -e "  ${GREEN}✓${NC} 10 Starter-Prompts erstellt"

# ═══════════════════════════════════════════════════════════════════════════════
# STARTER FORMELN (10 abstrakte Formeln)
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[3/4] Erstelle Starter-Formeln...${NC}"

# 1. Zeitreihen-Inkrement
cat > "$FORMULAS_DIR/formula.time.series.increment.json" << 'JSON'
{
  "id": "formula.time.series.increment",
  "title": "Zeitreihen-Inkrement",
  "type": "equation",
  "expression": "x_{t+1} = x_t + step",
  "invariants": ["monotonic", "bounded"],
  "inputs": ["x0", "step", "n"],
  "outputs": ["series"],
  "safety": ["abstract-only", "no-realworld-lab", "no-hazard"],
  "archetypes": ["Simulator", "Visualizer", "Validator"]
}
JSON

# 2. Constraint Range
cat > "$FORMULAS_DIR/formula.constraint.range.json" << 'JSON'
{
  "id": "formula.constraint.range",
  "title": "Range Constraint",
  "type": "constraint",
  "expression": "min <= x <= max",
  "invariants": ["bounded"],
  "inputs": ["x", "min", "max"],
  "outputs": ["valid", "clamped"],
  "safety": ["abstract-only", "no-hazard"],
  "archetypes": ["Validator", "Sanitizer"]
}
JSON

# 3. Exponential Growth
cat > "$FORMULAS_DIR/formula.growth.exponential.json" << 'JSON'
{
  "id": "formula.growth.exponential",
  "title": "Exponential Growth",
  "type": "equation",
  "expression": "y = a * e^(r * t)",
  "invariants": ["positive", "monotonic"],
  "inputs": ["a", "r", "t"],
  "outputs": ["y"],
  "safety": ["abstract-only", "no-hazard"],
  "archetypes": ["Predictor", "Visualizer"]
}
JSON

# 4. Moving Average
cat > "$FORMULAS_DIR/formula.stats.moving.average.json" << 'JSON'
{
  "id": "formula.stats.moving.average",
  "title": "Moving Average",
  "type": "aggregation",
  "expression": "MA_n = (1/n) * Σ(x_{t-i}) for i=0 to n-1",
  "invariants": ["smoothing", "lag"],
  "inputs": ["series", "window_size"],
  "outputs": ["smoothed_series"],
  "safety": ["abstract-only", "no-hazard"],
  "archetypes": ["Analyzer", "Visualizer"]
}
JSON

# 5. Hash Function
cat > "$FORMULAS_DIR/formula.crypto.hash.sha256.json" << 'JSON'
{
  "id": "formula.crypto.hash.sha256",
  "title": "SHA-256 Hash",
  "type": "transform",
  "expression": "hash = SHA256(input)",
  "invariants": ["deterministic", "collision-resistant"],
  "inputs": ["input"],
  "outputs": ["hash"],
  "safety": ["abstract-only", "no-hazard"],
  "archetypes": ["Verifier", "Auditor"]
}
JSON

# 6. Linear Interpolation
cat > "$FORMULAS_DIR/formula.math.lerp.json" << 'JSON'
{
  "id": "formula.math.lerp",
  "title": "Linear Interpolation",
  "type": "equation",
  "expression": "y = a + (b - a) * t, where t ∈ [0, 1]",
  "invariants": ["continuous", "bounded"],
  "inputs": ["a", "b", "t"],
  "outputs": ["y"],
  "safety": ["abstract-only", "no-hazard"],
  "archetypes": ["Animator", "Visualizer"]
}
JSON

# 7. Pagination
cat > "$FORMULAS_DIR/formula.data.pagination.json" << 'JSON'
{
  "id": "formula.data.pagination",
  "title": "Pagination Calculator",
  "type": "utility",
  "expression": "offset = (page - 1) * pageSize; totalPages = ceil(totalItems / pageSize)",
  "invariants": ["non-negative", "bounded"],
  "inputs": ["page", "pageSize", "totalItems"],
  "outputs": ["offset", "totalPages", "hasNext", "hasPrev"],
  "safety": ["abstract-only", "no-hazard"],
  "archetypes": ["DataFetcher", "UIComponent"]
}
JSON

# 8. Rate Limiter
cat > "$FORMULAS_DIR/formula.system.rate.limiter.json" << 'JSON'
{
  "id": "formula.system.rate.limiter",
  "title": "Token Bucket Rate Limiter",
  "type": "algorithm",
  "expression": "tokens = min(capacity, tokens + (now - lastRefill) * rate); allowed = tokens >= cost",
  "invariants": ["fair", "bounded"],
  "inputs": ["capacity", "rate", "cost"],
  "outputs": ["allowed", "remaining", "retryAfter"],
  "safety": ["abstract-only", "no-hazard"],
  "archetypes": ["Middleware", "APIGateway"]
}
JSON

# 9. Retry Backoff
cat > "$FORMULAS_DIR/formula.system.retry.backoff.json" << 'JSON'
{
  "id": "formula.system.retry.backoff",
  "title": "Exponential Backoff",
  "type": "algorithm",
  "expression": "delay = min(maxDelay, baseDelay * 2^attempt + random(0, jitter))",
  "invariants": ["bounded", "progressive"],
  "inputs": ["baseDelay", "maxDelay", "jitter", "attempt"],
  "outputs": ["delay", "shouldRetry"],
  "safety": ["abstract-only", "no-hazard"],
  "archetypes": ["NetworkClient", "QueueWorker"]
}
JSON

# 10. Visualizer Line Chart
cat > "$FORMULAS_DIR/formula.visualizer.linechart.json" << 'JSON'
{
  "id": "formula.visualizer.linechart",
  "title": "Line Chart Renderer",
  "type": "visualizer",
  "expression": "SVG path from [(x_i, y_i)] with scaling to viewport",
  "invariants": ["responsive", "accessible"],
  "inputs": ["data", "width", "height", "colors"],
  "outputs": ["svg", "legend"],
  "safety": ["abstract-only", "no-hazard"],
  "archetypes": ["Dashboard", "Report"]
}
JSON

echo -e "  ${GREEN}✓${NC} 10 Starter-Formeln erstellt"

# ═══════════════════════════════════════════════════════════════════════════════
# STARTER MIXES (5 Kombinationen)
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[4/4] Erstelle Starter-Mixes...${NC}"

# 1. Simulation Pipeline
cat > "$MIXES_DIR/mix.simulation.pipeline.json" << 'JSON'
{
  "mixId": "mix.simulation.pipeline",
  "title": "Simulation Pipeline (abstrakt)",
  "description": "Zeitreihen-Simulation mit Validierung und Visualisierung",
  "steps": [
    {"ref": "formula.time.series.increment", "order": 1},
    {"ref": "formula.constraint.range", "order": 2},
    {"ref": "formula.visualizer.linechart", "order": 3}
  ],
  "io": {
    "inputs": ["x0", "step", "n", "min", "max"],
    "outputs": ["series", "valid", "chart"]
  },
  "safetyGate": "no-hazard-all-steps",
  "preview": "graph-only"
}
JSON

# 2. Data Analysis Mix
cat > "$MIXES_DIR/mix.data.analysis.json" << 'JSON'
{
  "mixId": "mix.data.analysis",
  "title": "Data Analysis Pipeline",
  "description": "Datenanalyse mit Glättung und Visualisierung",
  "steps": [
    {"ref": "formula.stats.moving.average", "order": 1},
    {"ref": "formula.growth.exponential", "order": 2},
    {"ref": "formula.visualizer.linechart", "order": 3}
  ],
  "io": {
    "inputs": ["series", "window_size"],
    "outputs": ["smoothed_series", "trend", "chart"]
  },
  "safetyGate": "no-hazard-all-steps",
  "preview": "graph-only"
}
JSON

# 3. API Protection Mix
cat > "$MIXES_DIR/mix.api.protection.json" << 'JSON'
{
  "mixId": "mix.api.protection",
  "title": "API Protection Stack",
  "description": "Rate Limiting mit Retry-Logik",
  "steps": [
    {"ref": "formula.system.rate.limiter", "order": 1},
    {"ref": "formula.system.retry.backoff", "order": 2},
    {"ref": "formula.crypto.hash.sha256", "order": 3}
  ],
  "io": {
    "inputs": ["capacity", "rate", "cost", "request"],
    "outputs": ["allowed", "delay", "requestHash"]
  },
  "safetyGate": "no-hazard-all-steps",
  "preview": "flow-diagram"
}
JSON

# 4. Animation Mix
cat > "$MIXES_DIR/mix.animation.smooth.json" << 'JSON'
{
  "mixId": "mix.animation.smooth",
  "title": "Smooth Animation Pipeline",
  "description": "Interpolation für UI-Animationen",
  "steps": [
    {"ref": "formula.math.lerp", "order": 1},
    {"ref": "formula.constraint.range", "order": 2}
  ],
  "io": {
    "inputs": ["start", "end", "duration", "min", "max"],
    "outputs": ["currentValue", "valid"]
  },
  "safetyGate": "no-hazard-all-steps",
  "preview": "animation-preview"
}
JSON

# 5. Data Fetcher Mix
cat > "$MIXES_DIR/mix.data.fetcher.json" << 'JSON'
{
  "mixId": "mix.data.fetcher",
  "title": "Paginated Data Fetcher",
  "description": "Paginierung mit Retry-Logik",
  "steps": [
    {"ref": "formula.data.pagination", "order": 1},
    {"ref": "formula.system.retry.backoff", "order": 2}
  ],
  "io": {
    "inputs": ["page", "pageSize", "totalItems"],
    "outputs": ["offset", "totalPages", "delay"]
  },
  "safetyGate": "no-hazard-all-steps",
  "preview": "table-view"
}
JSON

echo -e "  ${GREEN}✓${NC} 5 Starter-Mixes erstellt"

# Datenbank mit Starter-Daten befüllen
echo -e "\n${CYAN}Befülle Datenbank...${NC}"

# Prompts laden
for f in "$PROMPTS_DIR"/*.json; do
    jq '.prompts += [input]' "$DB" "$f" > "$DB.tmp" && mv "$DB.tmp" "$DB"
done

# Formeln laden
for f in "$FORMULAS_DIR"/*.json; do
    jq '.formulas += [input]' "$DB" "$f" > "$DB.tmp" && mv "$DB.tmp" "$DB"
done

# Mixes laden
for f in "$MIXES_DIR"/*.json; do
    jq '.mixes += [input]' "$DB" "$f" > "$DB.tmp" && mv "$DB.tmp" "$DB"
done

# Stats aktualisieren
PROMPT_COUNT=$(jq '.prompts | length' "$DB")
FORMULA_COUNT=$(jq '.formulas | length' "$DB")
MIX_COUNT=$(jq '.mixes | length' "$DB")

jq ".stats.totalPrompts = $PROMPT_COUNT | .stats.totalFormulas = $FORMULA_COUNT | .stats.totalMixes = $MIX_COUNT" "$DB" > "$DB.tmp" && mv "$DB.tmp" "$DB"

# Artifacts Log erstellen
touch "$DB_DIR/artifacts.log"

echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ PROMPT-DB INITIALISIERT                                                ║${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Prompts:  $PROMPT_COUNT${NC}"
echo -e "${GREEN}║  Formeln:  $FORMULA_COUNT${NC}"
echo -e "${GREEN}║  Mixes:    $MIX_COUNT${NC}"
echo -e "${GREEN}║  Pfad:     $DB${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${PURPLE}[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"


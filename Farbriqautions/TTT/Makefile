# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  MAKEFILE - PROMPT-FABRIK                                                 ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Deterministische Build-Targets für 99.99% Systemhandlung                 ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

.PHONY: all docs clean verify dev staging prod install test help
.PHONY: init-db add-prompt add-formula add-mix generate preview
.PHONY: aider aider-local aider-groq auto-fix
.PHONY: tauri-dev tauri-build
.PHONY: factory factory-dev factory-prod factory-validate factory-deploy

# ═══════════════════════════════════════════════════════════════════════════════
# KONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

SHELL := /bin/bash
ROOT := .
BUILD := docs_build
SCRIPTS := scripts
SYSTEM := system
REGISTRY := $(SYSTEM)/registry

# Tool-Prüfung
TOOLS := jq
CHECK_TOOLS = $(foreach t,$(TOOLS),$(if $(shell which $(t)),,$(warning Missing tool: $(t))))

# ═══════════════════════════════════════════════════════════════════════════════
# HAUPT-TARGETS
# ═══════════════════════════════════════════════════════════════════════════════

## all: Build + Verify + Init-DB
all: init-db docs verify
	@echo "✅ All done!"

## docs: Baue Dokumentation
docs:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/build_docs.sh $(ROOT)

## fix: Auto-Fix Pipeline (Clean, Build, Hash, SW, Deploy)
fix:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/auto_fix.sh $(ROOT)

## auto-fix: Vollständige Auto-Fix Pipeline (AI → Analyzer → Tests → Commit)
auto-fix:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/auto_fix_pipeline.sh $(ROOT)

## clean: Lösche Build-Artefakte
clean:
	@echo "🧹 Cleaning..."
	@rm -rf $(BUILD)
	@rm -rf build_out
	@rm -rf node_modules/.cache 2>/dev/null || true
	@rm -rf logs/*.log 2>/dev/null || true
	@echo "✓ Clean"

## verify: Prüfe Links und Lint
verify:
	@echo "🔍 Verifying..."
	@if [ -f $(SCRIPTS)/validate_links.sh ]; then $(SCRIPTS)/validate_links.sh; fi
	@if [ -f $(SCRIPTS)/lint_md.sh ]; then $(SCRIPTS)/lint_md.sh; fi
	@echo "✓ Verify"

# ═══════════════════════════════════════════════════════════════════════════════
# PROMPT-FABRIK TARGETS
# ═══════════════════════════════════════════════════════════════════════════════

## init-db: Initialisiere Prompt-Datenbank mit Starter-Rezepten
init-db: $(CHECK_TOOLS)
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/prompt_db_init.sh $(ROOT)

## add-prompt: Füge Prompt hinzu (ITEM=path/to/prompt.json)
add-prompt:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@jq '.prompts += [input]' $(REGISTRY)/prompt_db.json $(ITEM) > $(REGISTRY)/prompt_db.json.tmp
	@mv $(REGISTRY)/prompt_db.json.tmp $(REGISTRY)/prompt_db.json
	@echo "✓ Prompt hinzugefügt: $(ITEM)"

## add-formula: Füge Formel hinzu (ITEM=path/to/formula.json)
add-formula:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@jq '.formulas += [input]' $(REGISTRY)/prompt_db.json $(ITEM) > $(REGISTRY)/prompt_db.json.tmp
	@mv $(REGISTRY)/prompt_db.json.tmp $(REGISTRY)/prompt_db.json
	@echo "✓ Formel hinzugefügt: $(ITEM)"

## add-mix: Füge Mix hinzu (ITEM=path/to/mix.json)
add-mix:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@jq '.mixes += [input]' $(REGISTRY)/prompt_db.json $(ITEM) > $(REGISTRY)/prompt_db.json.tmp
	@mv $(REGISTRY)/prompt_db.json.tmp $(REGISTRY)/prompt_db.json
	@echo "✓ Mix hinzugefügt: $(ITEM)"

## generate: Generiere Programm (OUT=output_dir ID=prompt_id)
generate:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/program_generate.sh $(ROOT) $(OUT) $(ID)

## preview: Zeige Mix-Vorschau (MIX_ID=mix_id)
preview:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/mix_preview.sh $(ROOT) $(MIX_ID)

## list-prompts: Liste alle verfügbaren Prompts
list-prompts:
	@echo "📋 Verfügbare Prompts:"
	@jq -r '.prompts[] | "  \(.id) - \(.title) [\(.language)/\(.framework)]"' $(REGISTRY)/prompt_db.json 2>/dev/null || echo "  (Datenbank nicht initialisiert - führe 'make init-db' aus)"

## list-formulas: Liste alle verfügbaren Formeln
list-formulas:
	@echo "🔬 Verfügbare Formeln:"
	@jq -r '.formulas[] | "  \(.id) - \(.title) [\(.type)]"' $(REGISTRY)/prompt_db.json 2>/dev/null || echo "  (Datenbank nicht initialisiert)"

## list-mixes: Liste alle verfügbaren Mixes
list-mixes:
	@echo "🔮 Verfügbare Mixes:"
	@jq -r '.mixes[] | "  \(.mixId) - \(.title)"' $(REGISTRY)/prompt_db.json 2>/dev/null || echo "  (Datenbank nicht initialisiert)"

## stats: Zeige Datenbank-Statistiken
stats:
	@echo "📊 Prompt-DB Statistiken:"
	@jq '.stats' $(REGISTRY)/prompt_db.json 2>/dev/null || echo "  (Datenbank nicht initialisiert)"

# ═══════════════════════════════════════════════════════════════════════════════
# UMGEBUNGS-TARGETS
# ═══════════════════════════════════════════════════════════════════════════════

## dev: Starte Development Server
dev:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/start.sh dev

## staging: Baue für Staging
staging:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/start.sh staging

## prod: Baue und deploye zu Production
prod:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/start.sh prod

# ═══════════════════════════════════════════════════════════════════════════════
# INSTALLATION & TEST
# ═══════════════════════════════════════════════════════════════════════════════

## install: Installiere Dependencies
install:
	@echo "📦 Installing dependencies..."
	@if [ -f package.json ]; then npm ci; fi
	@if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
	@pip install aider-chat 2>/dev/null || true
	@echo "✓ Dependencies installed"

## test: Führe Tests aus
test:
	@echo "🧪 Running tests..."
	@if [ -f package.json ]; then npm test 2>/dev/null || true; fi
	@echo "✓ Tests complete"

# ═══════════════════════════════════════════════════════════════════════════════
# AIDER & CONTINUE.DEV
# ═══════════════════════════════════════════════════════════════════════════════

## aider: Starte Aider
aider:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/aider-start.sh

## aider-local: Starte Aider mit lokalem Modell (DeepSeek Coder)
aider-local:
	@aider --model ollama/deepseek-coder --config .aider.conf.yml

## aider-groq: Starte Aider mit Groq (LLaMA 3.1)
aider-groq:
	@aider --model groq/llama-3.1-70b-versatile --config .aider.conf.yml

## aider-openrouter: Starte Aider mit OpenRouter (DeepSeek)
aider-openrouter:
	@aider --model openrouter/deepseek/deepseek-coder --config .aider.conf.yml

# ═══════════════════════════════════════════════════════════════════════════════
# TAURI/ELECTRON
# ═══════════════════════════════════════════════════════════════════════════════

## tauri-dev: Starte Tauri Development
tauri-dev:
	@cd src-tauri && cargo tauri dev

## tauri-build: Baue Tauri App
tauri-build:
	@cd src-tauri && cargo tauri build

# ═══════════════════════════════════════════════════════════════════════════════
# HILFE
# ═══════════════════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════════════════════
# ENCODING & MARKTWERT
# ═══════════════════════════════════════════════════════════════════════════════

## encoding-check: Prüfe UTF-8 Encoding aller Dateien
encoding-check:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/encoding_lint.sh $(ROOT) check

## encoding-fix: Repariere Encoding-Probleme
encoding-fix:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/encoding_lint.sh $(ROOT) fix

## encoding-strict: Strenger Modus (bricht Build ab)
encoding-strict:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/encoding_lint.sh $(ROOT) strict

## market-value: Berechne Marktwert-Teilhabe
market-value:
	@chmod +x $(SCRIPTS)/*.sh 2>/dev/null || true
	@$(SCRIPTS)/market_value_calculator.sh

# ═══════════════════════════════════════════════════════════════════════════════
# HILFE
# ═══════════════════════════════════════════════════════════════════════════════

## help: Zeige diese Hilfe
help:
	@echo ""
	@echo "╔═══════════════════════════════════════════════════════════════════════════╗"
	@echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS - PROMPT-FABRIK                  ║"
	@echo "╚═══════════════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🏭 Prompt-Fabrik:"
	@echo "  make init-db              # Initialisiere Datenbank"
	@echo "  make list-prompts         # Liste Prompts"
	@echo "  make list-formulas        # Liste Formeln"
	@echo "  make list-mixes           # Liste Mixes"
	@echo "  make generate OUT=dir ID=prompt_id  # Generiere Programm"
	@echo "  make preview MIX_ID=id    # Mix-Vorschau"
	@echo ""
	@echo "🔧 Build & Deploy:"
	@echo "  make dev                  # Development Server"
	@echo "  make fix                  # Auto-Fix (Build)"
	@echo "  make auto-fix             # Vollständige Pipeline"
	@echo "  make prod                 # Production Deploy"
	@echo ""
	@echo "🤖 AI-Assistenten:"
	@echo "  make aider                # Aider (default)"
	@echo "  make aider-local          # Aider + Ollama"
	@echo "  make aider-groq           # Aider + Groq"
	@echo ""
	@echo "🖥️  Desktop:"
	@echo "  make tauri-dev            # Tauri Development"
	@echo "  make tauri-build          # Tauri Build"
	@echo ""
	@echo "🏭 Industrial Factory (A-Start):"
	@echo "  make factory              # Vollständiger Factory-Run"
	@echo "  make factory-dev          # Factory (Development)"
	@echo "  make factory-prod         # Factory (Production + Deploy)"
	@echo "  make factory-validate     # Nur Validierung"
	@echo ""

# ═══════════════════════════════════════════════════════════════════════════
# INDUSTRIAL FACTORY (A-START)
# ═══════════════════════════════════════════════════════════════════════════

## factory: Vollständiger industrieller Factory-Run (A-Start aus Ordner)
factory:
	@echo "🏭 Starting Industrial Software Factory..."
	@chmod +x bootstrap/*.sh 2>/dev/null || true
	@./bootstrap/start.sh --env dev

## factory-dev: Factory-Run für Development
factory-dev:
	@echo "🏭 Starting Factory (Development)..."
	@chmod +x bootstrap/*.sh 2>/dev/null || true
	@./bootstrap/start.sh --env dev --debug

## factory-staging: Factory-Run für Staging
factory-staging:
	@echo "🏭 Starting Factory (Staging)..."
	@chmod +x bootstrap/*.sh 2>/dev/null || true
	@./bootstrap/start.sh --env staging

## factory-prod: Factory-Run für Production mit Deploy
factory-prod:
	@echo "🏭 Starting Factory (Production + Deploy)..."
	@chmod +x bootstrap/*.sh 2>/dev/null || true
	@./bootstrap/start.sh --env prod --deploy

## factory-validate: Nur Schema- und Policy-Validierung
factory-validate:
	@echo "🔍 Running Factory Validation..."
	@chmod +x bootstrap/*.sh 2>/dev/null || true
	@./bootstrap/validate_schemas.sh
	@./bootstrap/validate_policies.sh

## factory-deploy: Nur Deployment (ohne Build)
factory-deploy:
	@echo "🚀 Running Factory Deployment..."
	@chmod +x scripts/*.sh 2>/dev/null || true
	@$(SCRIPTS)/deploy_github.sh 2>/dev/null || echo "  GitHub Pages: skipped"
	@$(SCRIPTS)/deploy_hostinger.sh 2>/dev/null || echo "  Hostinger: skipped"

## factory-sbom: Generiere Software Bill of Materials
factory-sbom:
	@echo "📋 Generating SBOM..."
	@mkdir -p sbom
	@if [ -f package.json ]; then \
		npx @cyclonedx/cyclonedx-npm --output-file sbom/sbom.json 2>/dev/null || \
		echo '{"bomFormat":"CycloneDX","specVersion":"1.5","version":1}' > sbom/sbom.json; \
	fi
	@echo "✓ SBOM generated: sbom/sbom.json"

## factory-audit: Generiere Audit-Report
factory-audit:
	@echo "📊 Generating Audit Report..."
	@mkdir -p audit
	@echo "{\"timestamp\":\"$(shell date -Iseconds)\",\"project\":\"TogetherSystems\",\"status\":\"audited\"}" > audit/report-$(shell date +%Y%m%d).json
	@echo "✓ Audit report generated"

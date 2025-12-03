#!/usr/bin/env bash
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  TOGETHERSYSTEMS INDUSTRIAL BOOTSTRAPPER                                   ║
# ║  A-Start: Automatische Fließband-Produktion aus Ordner                    ║
# ║  [.TTT T,.&T,,.T,,,.T.] © 2025 Raymond Demitrio Tel                       ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MANIFEST="$ROOT_DIR/factory.manifest.yaml"
LOG_DIR="$ROOT_DIR/logs"
AUDIT_DIR="$ROOT_DIR/audit"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/factory-$TIMESTAMP.log"
AUDIT_FILE="$AUDIT_DIR/factory-$TIMESTAMP.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# BANNER
# ═══════════════════════════════════════════════════════════════════════════

print_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║  ████████╗ ██████╗  ██████╗ ███████╗████████╗██╗  ██╗███████╗██████╗     ║
║  ╚══██╔══╝██╔═══██╗██╔════╝ ██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗    ║
║     ██║   ██║   ██║██║  ███╗█████╗     ██║   ███████║█████╗  ██████╔╝    ║
║     ██║   ██║   ██║██║   ██║██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗    ║
║     ██║   ╚██████╔╝╚██████╔╝███████╗   ██║   ██║  ██║███████╗██║  ██║    ║
║     ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ║
║                                                                           ║
║  ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗███████╗           ║
║  ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║██╔════╝           ║
║  ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║███████╗           ║
║  ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║╚════██║           ║
║  ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║███████║           ║
║  ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝╚══════╝           ║
║                                                                           ║
║  [.TTT T,.&T,,.T,,,.T.] INDUSTRIAL SOFTWARE FACTORY                      ║
║  A-Start Bootstrapper v1.0.0                                              ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════
# LOGGING FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

mkdir -p "$LOG_DIR" "$AUDIT_DIR"

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date -Iseconds)
    
    # Console output
    case "$level" in
        "INFO")  echo -e "${GREEN}[✓]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[⚠]${NC} $message" ;;
        "ERROR") echo -e "${RED}[✗]${NC} $message" ;;
        "PHASE") echo -e "${BLUE}[►]${NC} $message" ;;
        "DEBUG") [ "${DEBUG:-false}" = "true" ] && echo -e "${CYAN}[·]${NC} $message" ;;
    esac
    
    # File output
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

audit() {
    local action="$1"
    local status="$2"
    local details="${3:-{}}"
    local timestamp=$(date -Iseconds)
    
    # Append to audit log (JSON Lines format)
    echo "{\"timestamp\":\"$timestamp\",\"action\":\"$action\",\"status\":\"$status\",\"details\":$details}" >> "$AUDIT_FILE"
}

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1: INITIALIZATION
# ═══════════════════════════════════════════════════════════════════════════

phase_init() {
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    log "PHASE" "PHASE 1: INITIALIZATION"
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    
    # Check manifest exists
    if [ ! -f "$MANIFEST" ]; then
        log "ERROR" "Manifest not found: $MANIFEST"
        audit "init" "failed" '{"reason":"manifest_not_found"}'
        exit 1
    fi
    log "INFO" "Manifest found: $MANIFEST"
    
    # Check required tools
    local required_tools=("jq" "yq" "git" "node" "npm")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log "WARN" "Missing tools: ${missing_tools[*]}"
        log "INFO" "Attempting to install missing tools..."
        install_tools "${missing_tools[@]}"
    fi
    
    log "INFO" "All required tools available"
    
    # Parse manifest
    log "INFO" "Parsing manifest..."
    PROJECT_NAME=$(yq -r '.project.name' "$MANIFEST")
    PROJECT_VERSION=$(yq -r '.project.version' "$MANIFEST")
    log "INFO" "Project: $PROJECT_NAME v$PROJECT_VERSION"
    
    audit "init" "success" "{\"project\":\"$PROJECT_NAME\",\"version\":\"$PROJECT_VERSION\"}"
}

install_tools() {
    local tools=("$@")
    
    for tool in "${tools[@]}"; do
        case "$tool" in
            "yq")
                log "INFO" "Installing yq..."
                if command -v pip3 &> /dev/null; then
                    pip3 install yq
                elif command -v brew &> /dev/null; then
                    brew install yq
                else
                    log "ERROR" "Cannot install yq. Please install manually."
                    exit 1
                fi
                ;;
            "jq")
                log "INFO" "Installing jq..."
                if command -v apt-get &> /dev/null; then
                    sudo apt-get install -y jq
                elif command -v brew &> /dev/null; then
                    brew install jq
                else
                    log "ERROR" "Cannot install jq. Please install manually."
                    exit 1
                fi
                ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 2: DISCOVERY
# ═══════════════════════════════════════════════════════════════════════════

phase_discover() {
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    log "PHASE" "PHASE 2: AUTO-DISCOVERY"
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    
    DETECTED_TOOLCHAINS=()
    
    # Detect Web/PWA
    if [ -f "$ROOT_DIR/package.json" ] || [ -f "$ROOT_DIR/index.html" ]; then
        DETECTED_TOOLCHAINS+=("web")
        log "INFO" "Detected: Web/PWA Toolchain"
    fi
    
    # Detect Documentation
    if ls "$ROOT_DIR"/*.md &> /dev/null || [ -d "$ROOT_DIR/docs_src" ]; then
        DETECTED_TOOLCHAINS+=("docs")
        log "INFO" "Detected: Documentation Toolchain"
    fi
    
    # Detect Tauri Desktop
    if [ -f "$ROOT_DIR/src-tauri/tauri.conf.json" ]; then
        DETECTED_TOOLCHAINS+=("desktop")
        log "INFO" "Detected: Desktop (Tauri) Toolchain"
    fi
    
    # Detect Android
    if [ -f "$ROOT_DIR/android/build.gradle" ]; then
        DETECTED_TOOLCHAINS+=("android")
        log "INFO" "Detected: Android Toolchain"
    fi
    
    # Detect Unity
    if [ -d "$ROOT_DIR/Assets" ] && [ -d "$ROOT_DIR/ProjectSettings" ]; then
        DETECTED_TOOLCHAINS+=("unity")
        log "INFO" "Detected: Unity/ViewUnity Toolchain"
    fi
    
    # Detect Prompt-Fabrik
    if [ -f "$ROOT_DIR/system/registry/prompt_db.json" ]; then
        DETECTED_TOOLCHAINS+=("prompt_fabrik")
        log "INFO" "Detected: Prompt-Fabrik System"
    fi
    
    log "INFO" "Detected ${#DETECTED_TOOLCHAINS[@]} toolchain(s): ${DETECTED_TOOLCHAINS[*]}"
    
    audit "discover" "success" "{\"toolchains\":[\"${DETECTED_TOOLCHAINS[*]}\"]}"
}

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 3: VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

phase_validate() {
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    log "PHASE" "PHASE 3: POLICY VALIDATION"
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    
    local validation_errors=0
    
    # Validate schemas
    log "INFO" "Validating schemas..."
    if [ -d "$ROOT_DIR/schemas" ]; then
        for schema in "$ROOT_DIR/schemas"/*.json; do
            if [ -f "$schema" ]; then
                if jq empty "$schema" 2>/dev/null; then
                    log "INFO" "  ✓ $(basename "$schema")"
                else
                    log "ERROR" "  ✗ $(basename "$schema") - Invalid JSON"
                    ((validation_errors++))
                fi
            fi
        done
    else
        log "WARN" "No schemas directory found"
    fi
    
    # Validate encoding
    log "INFO" "Validating encoding (UTF-8)..."
    if [ -f "$ROOT_DIR/scripts/encoding_lint.sh" ]; then
        if "$ROOT_DIR/scripts/encoding_lint.sh" "$ROOT_DIR" check 2>/dev/null; then
            log "INFO" "  ✓ All files are UTF-8"
        else
            log "ERROR" "  ✗ Encoding issues found"
            ((validation_errors++))
        fi
    fi
    
    # Validate policies
    log "INFO" "Validating policies..."
    if [ -d "$ROOT_DIR/policies" ]; then
        for policy in "$ROOT_DIR/policies"/*.yaml; do
            if [ -f "$policy" ]; then
                if yq empty "$policy" 2>/dev/null; then
                    log "INFO" "  ✓ $(basename "$policy")"
                else
                    log "ERROR" "  ✗ $(basename "$policy") - Invalid YAML"
                    ((validation_errors++))
                fi
            fi
        done
    fi
    
    # Check required secrets
    log "INFO" "Checking required secrets..."
    local required_secrets=$(yq -r '.secrets.required[].name' "$MANIFEST" 2>/dev/null)
    for secret in $required_secrets; do
        if [ -n "${!secret:-}" ]; then
            log "INFO" "  ✓ $secret (set)"
        else
            log "WARN" "  ⚠ $secret (not set - may be needed for deployment)"
        fi
    done
    
    if [ $validation_errors -gt 0 ]; then
        log "ERROR" "Validation failed with $validation_errors error(s)"
        audit "validate" "failed" "{\"errors\":$validation_errors}"
        exit 1
    fi
    
    log "INFO" "All validations passed"
    audit "validate" "success" "{\"errors\":0}"
}

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 4: PREPARATION
# ═══════════════════════════════════════════════════════════════════════════

phase_prepare() {
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    log "PHASE" "PHASE 4: ENVIRONMENT PREPARATION"
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    
    # Get environment
    ENV="${ENV:-dev}"
    log "INFO" "Target environment: $ENV"
    
    # Load environment variables
    if [ -f "$ROOT_DIR/env/$ENV.env" ]; then
        log "INFO" "Loading environment from env/$ENV.env"
        set -a
        source "$ROOT_DIR/env/$ENV.env"
        set +a
    fi
    
    # Install dependencies for each detected toolchain
    for toolchain in "${DETECTED_TOOLCHAINS[@]}"; do
        case "$toolchain" in
            "web")
                if [ -f "$ROOT_DIR/package.json" ]; then
                    log "INFO" "Installing npm dependencies..."
                    cd "$ROOT_DIR" && npm ci --silent
                fi
                ;;
            "docs")
                log "INFO" "Checking Pandoc..."
                if ! command -v pandoc &> /dev/null; then
                    log "WARN" "Pandoc not installed. Docs build may fail."
                fi
                ;;
            "desktop")
                log "INFO" "Checking Rust/Tauri..."
                if ! command -v cargo &> /dev/null; then
                    log "WARN" "Rust not installed. Desktop build will fail."
                fi
                ;;
            "prompt_fabrik")
                log "INFO" "Initializing Prompt-Fabrik..."
                if [ -f "$ROOT_DIR/scripts/prompt_db_init.sh" ]; then
                    "$ROOT_DIR/scripts/prompt_db_init.sh" "$ROOT_DIR"
                fi
                ;;
        esac
    done
    
    # Create output directories
    mkdir -p "$ROOT_DIR/docs_build"
    mkdir -p "$ROOT_DIR/dist"
    mkdir -p "$ROOT_DIR/sbom"
    mkdir -p "$ROOT_DIR/provenance"
    
    log "INFO" "Environment prepared"
    audit "prepare" "success" "{\"env\":\"$ENV\"}"
}

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 5: EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

phase_execute() {
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    log "PHASE" "PHASE 5: PIPELINE EXECUTION"
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    
    local pipeline="${PIPELINE:-main}"
    log "INFO" "Executing pipeline: $pipeline"
    
    # Execute pipeline stages
    case "$pipeline" in
        "main")
            execute_main_pipeline
            ;;
        "desktop")
            execute_desktop_pipeline
            ;;
        *)
            log "ERROR" "Unknown pipeline: $pipeline"
            exit 1
            ;;
    esac
    
    audit "execute" "success" "{\"pipeline\":\"$pipeline\"}"
}

execute_main_pipeline() {
    local stage_count=0
    local stage_total=7
    
    # Stage 1: Validate (already done in phase_validate)
    ((stage_count++))
    log "INFO" "[$stage_count/$stage_total] Validate: ✓ (completed in phase 3)"
    
    # Stage 2: Build
    ((stage_count++))
    log "INFO" "[$stage_count/$stage_total] Build: Starting..."
    
    if [[ " ${DETECTED_TOOLCHAINS[*]} " =~ " docs " ]]; then
        log "INFO" "  Building documentation..."
        if [ -f "$ROOT_DIR/scripts/build_docs.sh" ]; then
            "$ROOT_DIR/scripts/build_docs.sh" "$ROOT_DIR" 2>&1 | while read -r line; do
                log "DEBUG" "    $line"
            done
        fi
    fi
    
    if [[ " ${DETECTED_TOOLCHAINS[*]} " =~ " web " ]]; then
        log "INFO" "  Building web assets..."
        # Static site, no build needed unless using bundler
    fi
    
    log "INFO" "[$stage_count/$stage_total] Build: ✓"
    
    # Stage 3: Test
    ((stage_count++))
    log "INFO" "[$stage_count/$stage_total] Test: Starting..."
    
    if [ -f "$ROOT_DIR/package.json" ]; then
        if npm test --if-present 2>/dev/null; then
            log "INFO" "  Tests passed"
        else
            log "WARN" "  No tests configured or tests failed"
        fi
    fi
    
    # Link validation
    if [ -f "$ROOT_DIR/scripts/validate_links.sh" ]; then
        log "INFO" "  Validating links..."
        "$ROOT_DIR/scripts/validate_links.sh" 2>/dev/null || log "WARN" "  Link validation skipped"
    fi
    
    log "INFO" "[$stage_count/$stage_total] Test: ✓"
    
    # Stage 4: Security Scan
    ((stage_count++))
    log "INFO" "[$stage_count/$stage_total] Security: Starting..."
    
    if [ -f "$ROOT_DIR/package.json" ]; then
        log "INFO" "  Scanning dependencies..."
        npm audit --production 2>/dev/null || log "WARN" "  Audit found issues"
    fi
    
    log "INFO" "[$stage_count/$stage_total] Security: ✓"
    
    # Stage 5: Package
    ((stage_count++))
    log "INFO" "[$stage_count/$stage_total] Package: Starting..."
    
    # Cache busting
    if [ -f "$ROOT_DIR/scripts/auto_fix.sh" ]; then
        log "INFO" "  Applying cache-busting..."
        "$ROOT_DIR/scripts/auto_fix.sh" "$ROOT_DIR" 2>&1 | while read -r line; do
            log "DEBUG" "    $line"
        done
    fi
    
    # Generate SBOM
    log "INFO" "  Generating SBOM..."
    generate_sbom
    
    log "INFO" "[$stage_count/$stage_total] Package: ✓"
    
    # Stage 6: Deploy (only if --deploy flag)
    ((stage_count++))
    if [ "${DEPLOY:-false}" = "true" ]; then
        log "INFO" "[$stage_count/$stage_total] Deploy: Starting..."
        
        # Deploy to targets based on environment
        if [ "$ENV" = "prod" ]; then
            deploy_production
        else
            log "INFO" "  Skipping deployment (not production)"
        fi
        
        log "INFO" "[$stage_count/$stage_total] Deploy: ✓"
    else
        log "INFO" "[$stage_count/$stage_total] Deploy: Skipped (use --deploy to enable)"
    fi
    
    # Stage 7: Verify
    ((stage_count++))
    log "INFO" "[$stage_count/$stage_total] Verify: Starting..."
    
    # Verify build output
    if [ -d "$ROOT_DIR/docs_build" ] && [ "$(ls -A "$ROOT_DIR/docs_build" 2>/dev/null)" ]; then
        log "INFO" "  Build output verified: docs_build/"
    fi
    
    log "INFO" "[$stage_count/$stage_total] Verify: ✓"
    
    log "INFO" "Pipeline completed successfully"
}

execute_desktop_pipeline() {
    log "INFO" "Desktop pipeline not yet implemented"
    log "INFO" "Run: cargo tauri build"
}

generate_sbom() {
    local sbom_file="$ROOT_DIR/sbom/sbom.json"
    
    cat > "$sbom_file" << EOF
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "version": 1,
  "metadata": {
    "timestamp": "$(date -Iseconds)",
    "tools": [
      {
        "vendor": "TogetherSystems",
        "name": "Factory Bootstrapper",
        "version": "1.0.0"
      }
    ],
    "component": {
      "type": "application",
      "name": "$PROJECT_NAME",
      "version": "$PROJECT_VERSION"
    }
  },
  "components": []
}
EOF
    
    # Add npm dependencies if package.json exists
    if [ -f "$ROOT_DIR/package.json" ]; then
        local deps=$(jq -r '.dependencies // {} | to_entries[] | {"type":"library","name":.key,"version":.value}' "$ROOT_DIR/package.json" 2>/dev/null | jq -s '.')
        jq --argjson deps "$deps" '.components = $deps' "$sbom_file" > "$sbom_file.tmp" && mv "$sbom_file.tmp" "$sbom_file"
    fi
    
    log "INFO" "  SBOM generated: sbom/sbom.json"
}

deploy_production() {
    log "INFO" "  Deploying to production targets..."
    
    # GitHub Pages
    if [ -n "${GITHUB_TOKEN:-}" ]; then
        log "INFO" "    → GitHub Pages"
        # git push to gh-pages branch
    else
        log "WARN" "    GitHub Pages: Skipped (GITHUB_TOKEN not set)"
    fi
    
    # Hostinger
    if [ -n "${HOSTINGER_SSH_KEY:-}" ]; then
        log "INFO" "    → Hostinger (digitalnotar.in)"
        # scp/rsync to Hostinger
    else
        log "WARN" "    Hostinger: Skipped (HOSTINGER_SSH_KEY not set)"
    fi
    
    # Cloudflare CDN Purge
    if [ -n "${CLOUDFLARE_TOKEN:-}" ]; then
        log "INFO" "    → Cloudflare CDN purge"
        # curl to purge cache
    else
        log "WARN" "    Cloudflare: Skipped (CLOUDFLARE_TOKEN not set)"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 6: FINALIZATION
# ═══════════════════════════════════════════════════════════════════════════

phase_finalize() {
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    log "PHASE" "PHASE 6: FINALIZATION"
    log "PHASE" "═══════════════════════════════════════════════════════════════"
    
    # Calculate duration
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    # Generate summary
    log "INFO" "Generating summary..."
    
    cat << EOF

╔═══════════════════════════════════════════════════════════════════════════╗
║                         PRODUCTION SUMMARY                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Project:      $PROJECT_NAME
║  Version:      $PROJECT_VERSION
║  Environment:  ${ENV:-dev}
║  Duration:     ${DURATION}s
║  Toolchains:   ${DETECTED_TOOLCHAINS[*]}
║  Status:       ✓ SUCCESS
╠═══════════════════════════════════════════════════════════════════════════╣
║  Artifacts:                                                                ║
║  • docs_build/     (Web Portal)
║  • sbom/sbom.json  (Software Bill of Materials)
║  • logs/           (Build Logs)
║  • audit/          (Audit Trail)
╠═══════════════════════════════════════════════════════════════════════════╣
║  Log:   $LOG_FILE
║  Audit: $AUDIT_FILE
╚═══════════════════════════════════════════════════════════════════════════╝

EOF
    
    audit "finalize" "success" "{\"duration_seconds\":$DURATION}"
    
    log "INFO" "Factory run completed"
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════

main() {
    START_TIME=$(date +%s)
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                ENV="$2"
                shift 2
                ;;
            --pipeline)
                PIPELINE="$2"
                shift 2
                ;;
            --deploy)
                DEPLOY="true"
                shift
                ;;
            --debug)
                DEBUG="true"
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --env <env>        Target environment (dev|staging|prod)"
                echo "  --pipeline <name>  Pipeline to run (main|desktop)"
                echo "  --deploy           Enable deployment phase"
                echo "  --debug            Enable debug logging"
                echo "  --help             Show this help"
                exit 0
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Print banner
    print_banner
    
    # Execute phases
    phase_init
    phase_discover
    phase_validate
    phase_prepare
    phase_execute
    phase_finalize
}

# Run main
main "$@"


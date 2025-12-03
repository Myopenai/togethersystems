#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  AUTO-FIX PIPELINE                                                        ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  AI → Analyzer → Tests → Fix → Commit (Deterministischer Zyklus)          ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
set -euo pipefail

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

ROOT="${1:-.}"
MAX_ITERATIONS="${2:-3}"

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  🔄 AUTO-FIX PIPELINE                                                     ║"
echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║"
echo "║                                                                           ║"
echo "║  AI → Analyzer → Tests → Fix → Commit                                     ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_DIR="$ROOT/logs"
LOG_FILE="$LOG_DIR/auto-fix-$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# ═══════════════════════════════════════════════════════════════════════════════
# [1/5] AI CODE GENERATION (Cursor/OpenRouter)
# ═══════════════════════════════════════════════════════════════════════════════

log "\n${CYAN}[1/5] AI Code-Generierung...${NC}"
log "  → Nutze Cursor/OpenRouter/Aider für Code-Änderungen"
log "  → Änderungen werden von Git getrackt"

# Prüfe ob uncommitted changes existieren
if git diff --quiet 2>/dev/null; then
    log "  ${YELLOW}⚠${NC} Keine uncommitted Änderungen"
else
    log "  ${GREEN}✓${NC} Uncommitted Änderungen gefunden"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# [2/5] STATIC ANALYZER
# ═══════════════════════════════════════════════════════════════════════════════

log "\n${CYAN}[2/5] Static Analyzer...${NC}"

LINT_ERRORS=0

# ESLint (JavaScript/TypeScript)
if command -v eslint &> /dev/null; then
    log "  ${CYAN}Running ESLint...${NC}"
    if eslint "$ROOT" --fix 2>&1 | tee -a "$LOG_FILE"; then
        log "  ${GREEN}✓${NC} ESLint passed"
    else
        log "  ${YELLOW}⚠${NC} ESLint found issues (auto-fixed where possible)"
        ((LINT_ERRORS++)) || true
    fi
else
    log "  ${YELLOW}⚠${NC} ESLint not installed"
fi

# Ruff (Python)
if command -v ruff &> /dev/null; then
    log "  ${CYAN}Running Ruff...${NC}"
    if ruff check "$ROOT" --fix 2>&1 | tee -a "$LOG_FILE"; then
        log "  ${GREEN}✓${NC} Ruff passed"
    else
        log "  ${YELLOW}⚠${NC} Ruff found issues"
        ((LINT_ERRORS++)) || true
    fi
else
    log "  ${YELLOW}⚠${NC} Ruff not installed"
fi

# Markdownlint
if command -v markdownlint &> /dev/null; then
    log "  ${CYAN}Running Markdownlint...${NC}"
    if markdownlint "$ROOT"/*.md --fix 2>&1 | tee -a "$LOG_FILE"; then
        log "  ${GREEN}✓${NC} Markdownlint passed"
    else
        log "  ${YELLOW}⚠${NC} Markdownlint found issues"
        ((LINT_ERRORS++)) || true
    fi
else
    log "  ${YELLOW}⚠${NC} Markdownlint not installed"
fi

# ShellCheck
if command -v shellcheck &> /dev/null; then
    log "  ${CYAN}Running ShellCheck...${NC}"
    if find "$ROOT/scripts" -name "*.sh" -exec shellcheck {} \; 2>&1 | tee -a "$LOG_FILE"; then
        log "  ${GREEN}✓${NC} ShellCheck passed"
    else
        log "  ${YELLOW}⚠${NC} ShellCheck found issues"
        ((LINT_ERRORS++)) || true
    fi
else
    log "  ${YELLOW}⚠${NC} ShellCheck not installed"
fi

log "  Lint-Fehler: $LINT_ERRORS"

# ═══════════════════════════════════════════════════════════════════════════════
# [3/5] TESTS
# ═══════════════════════════════════════════════════════════════════════════════

log "\n${CYAN}[3/5] Tests...${NC}"

TEST_ERRORS=0

# Jest (JavaScript/TypeScript)
if [ -f "$ROOT/package.json" ] && grep -q "jest" "$ROOT/package.json" 2>/dev/null; then
    log "  ${CYAN}Running Jest...${NC}"
    if npm test 2>&1 | tee -a "$LOG_FILE"; then
        log "  ${GREEN}✓${NC} Jest passed"
    else
        log "  ${YELLOW}⚠${NC} Jest found failures"
        ((TEST_ERRORS++)) || true
    fi
else
    log "  ${YELLOW}⚠${NC} Jest not configured"
fi

# Pytest (Python)
if command -v pytest &> /dev/null && [ -d "$ROOT/tests" ]; then
    log "  ${CYAN}Running Pytest...${NC}"
    if pytest "$ROOT/tests" 2>&1 | tee -a "$LOG_FILE"; then
        log "  ${GREEN}✓${NC} Pytest passed"
    else
        log "  ${YELLOW}⚠${NC} Pytest found failures"
        ((TEST_ERRORS++)) || true
    fi
else
    log "  ${YELLOW}⚠${NC} Pytest not configured"
fi

# Go Tests
if [ -f "$ROOT/go.mod" ]; then
    log "  ${CYAN}Running Go Tests...${NC}"
    if go test ./... 2>&1 | tee -a "$LOG_FILE"; then
        log "  ${GREEN}✓${NC} Go tests passed"
    else
        log "  ${YELLOW}⚠${NC} Go tests found failures"
        ((TEST_ERRORS++)) || true
    fi
else
    log "  ${YELLOW}⚠${NC} Go tests not configured"
fi

log "  Test-Fehler: $TEST_ERRORS"

# ═══════════════════════════════════════════════════════════════════════════════
# [4/5] FEEDBACK AN LLM (Fehlerlogs sammeln)
# ═══════════════════════════════════════════════════════════════════════════════

log "\n${CYAN}[4/5] Feedback für LLM...${NC}"

FEEDBACK_FILE="$LOG_DIR/llm-feedback-$TIMESTAMP.md"

cat > "$FEEDBACK_FILE" << EOF
# Auto-Fix Feedback

**Timestamp:** $TIMESTAMP

## Lint-Ergebnisse

- Fehler: $LINT_ERRORS

## Test-Ergebnisse

- Fehler: $TEST_ERRORS

## Detailliertes Log

\`\`\`
$(tail -100 "$LOG_FILE" 2>/dev/null || echo "Keine Logs verfügbar")
\`\`\`

## Empfehlungen

$(if [ "$LINT_ERRORS" -gt 0 ] || [ "$TEST_ERRORS" -gt 0 ]; then
    echo "- Bitte behebe die gefundenen Fehler"
    echo "- Führe 'make auto-fix' erneut aus"
else
    echo "- Alle Checks bestanden!"
    echo "- Code ist bereit für Commit"
fi)

---

[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS
EOF

log "  ${GREEN}✓${NC} Feedback gespeichert: $FEEDBACK_FILE"

# ═══════════════════════════════════════════════════════════════════════════════
# [5/5] COMMIT
# ═══════════════════════════════════════════════════════════════════════════════

log "\n${CYAN}[5/5] Git Commit...${NC}"

TOTAL_ERRORS=$((LINT_ERRORS + TEST_ERRORS))

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    # Stage all changes
    git add -A
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        log "  ${YELLOW}⚠${NC} Keine Änderungen zu committen"
    else
        # Commit with auto-fix message
        git commit -m "🔧 Auto-fix run ($TIMESTAMP)

- Lint errors: $LINT_ERRORS
- Test errors: $TEST_ERRORS
- All checks passed

[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS"
        
        log "  ${GREEN}✓${NC} Committed successfully"
    fi
else
    log "  ${YELLOW}⚠${NC} Commit übersprungen wegen $TOTAL_ERRORS Fehler(n)"
    log "  Behebe die Fehler und führe erneut aus."
fi

# ═══════════════════════════════════════════════════════════════════════════════
# ZUSAMMENFASSUNG
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
log "${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
log "${GREEN}║  📊 AUTO-FIX ZUSAMMENFASSUNG                                               ║${NC}"
log "${GREEN}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
log "${GREEN}║  Lint-Fehler:  $LINT_ERRORS${NC}"
log "${GREEN}║  Test-Fehler:  $TEST_ERRORS${NC}"
log "${GREEN}║  Gesamt:       $TOTAL_ERRORS${NC}"
log "${GREEN}║  Log:          $LOG_FILE${NC}"
log "${GREEN}║  Feedback:     $FEEDBACK_FILE${NC}"
log "${GREEN}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    log "${GREEN}║  ✅ ERFOLGREICH - Alle Checks bestanden!${NC}"
else
    log "${YELLOW}║  ⚠️  $TOTAL_ERRORS Fehler gefunden - Bitte beheben${NC}"
fi

log "${GREEN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
log "${PURPLE}[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"

# Exit mit Fehlercode wenn Fehler gefunden
exit $TOTAL_ERRORS


#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  AIDER START PIPELINE                                                     ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Startet Aider mit korrekter Konfiguration und Tests                      ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
set -euo pipefail

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  🤖 AIDER PIPELINE                                                        ║"
echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Konfiguration
MODEL="${1:-ollama/deepseek-coder}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ═══════════════════════════════════════════════════════════════════════════════
# PRÜFUNGEN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[1/5] Prüfe Voraussetzungen...${NC}"

# Prüfe Aider
if ! command -v aider &> /dev/null; then
    echo -e "${YELLOW}Aider nicht installiert. Installiere mit:${NC}"
    echo "  pip install aider-chat"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Aider installiert"

# Prüfe Git
if ! git rev-parse --git-dir &> /dev/null; then
    echo -e "${YELLOW}Kein Git-Repository. Initialisiere...${NC}"
    git init
fi
echo -e "  ${GREEN}✓${NC} Git-Repository"

# Prüfe Ollama (wenn lokal)
if [[ "$MODEL" == ollama/* ]]; then
    if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
        echo -e "${YELLOW}Ollama nicht erreichbar. Starte mit:${NC}"
        echo "  ollama serve"
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} Ollama läuft"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# LINT & TESTS
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[2/5] Führe Pre-Checks aus...${NC}"

# Markdown Lint (optional)
if command -v markdownlint &> /dev/null; then
    markdownlint "$ROOT"/*.md 2>/dev/null && echo -e "  ${GREEN}✓${NC} Markdown OK" || echo -e "  ${YELLOW}⚠${NC} Markdown Warnungen"
else
    echo -e "  ${YELLOW}⚠${NC} markdownlint nicht installiert"
fi

# Link Check (optional)
if [ -d "$ROOT/docs_build" ] && command -v lychee &> /dev/null; then
    lychee --no-progress "$ROOT/docs_build" 2>/dev/null && echo -e "  ${GREEN}✓${NC} Links OK" || echo -e "  ${YELLOW}⚠${NC} Link Warnungen"
else
    echo -e "  ${YELLOW}⚠${NC} Link-Check übersprungen"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# DATEIEN LADEN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[3/5] Sammle Projekt-Dateien...${NC}"

# Wichtige Dateien für Kontext
FILES=(
    "$ROOT/index.html"
    "$ROOT/SETUP-HANDBUCH-PORTAL.html"
    "$ROOT/INVESTOR-DASHBOARD-TPGA.html"
    "$ROOT/scripts/auto_fix.sh"
    "$ROOT/scripts/build_docs.sh"
    "$ROOT/Makefile"
    "$ROOT/integration-config.json"
)

FILE_ARGS=""
for f in "${FILES[@]}"; do
    if [ -f "$f" ]; then
        FILE_ARGS="$FILE_ARGS $f"
        echo -e "  ${GREEN}✓${NC} $(basename "$f")"
    fi
done

# ═══════════════════════════════════════════════════════════════════════════════
# UMGEBUNGSVARIABLEN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[4/5] Setze Umgebung...${NC}"

# API Keys (aus Umgebung oder .env)
if [ -f "$ROOT/.env" ]; then
    source "$ROOT/.env"
    echo -e "  ${GREEN}✓${NC} .env geladen"
fi

# Prüfe API Keys für Cloud-Modelle
if [[ "$MODEL" == openrouter/* ]]; then
    if [ -z "${OPENROUTER_API_KEY:-}" ]; then
        echo -e "  ${YELLOW}⚠${NC} OPENROUTER_API_KEY nicht gesetzt"
    else
        echo -e "  ${GREEN}✓${NC} OpenRouter API Key"
    fi
fi

if [[ "$MODEL" == groq/* ]]; then
    if [ -z "${GROQ_API_KEY:-}" ]; then
        echo -e "  ${YELLOW}⚠${NC} GROQ_API_KEY nicht gesetzt"
    else
        echo -e "  ${GREEN}✓${NC} Groq API Key"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
# AIDER STARTEN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[5/5] Starte Aider...${NC}"
echo -e "  Modell: ${GREEN}$MODEL${NC}"
echo ""

# Starte Aider mit Konfiguration
cd "$ROOT"
aider \
    --model "$MODEL" \
    --config "$ROOT/.aider.conf.yml" \
    --auto-commits \
    --dark-mode \
    $FILE_ARGS

echo ""
echo -e "${PURPLE}T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"


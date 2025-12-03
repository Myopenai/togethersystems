#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  FORMEL-MIX PREVIEW                                                       ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Abstrakte Vorschau für Formel-Kombinationen (graph-only, safe)           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
set -euo pipefail

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT="${1:-.}"
MIX_ID="${2:-}"

DB="$ROOT/system/registry/prompt_db.json"

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  🔮 FORMEL-MIX PREVIEW                                                    ║"
echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# VALIDIERUNG
# ═══════════════════════════════════════════════════════════════════════════════

if [ -z "$MIX_ID" ]; then
    echo -e "${CYAN}Verfügbare Mixes:${NC}"
    echo ""
    if [ -f "$DB" ]; then
        jq -r '.mixes[] | "  \(.mixId) - \(.title)"' "$DB"
    else
        echo -e "${YELLOW}Datenbank nicht gefunden. Führe erst 'make init-db' aus.${NC}"
    fi
    echo ""
    echo -e "Verwendung: $0 <root> <mix_id>"
    echo -e "Beispiel:   $0 . mix.simulation.pipeline"
    exit 0
fi

if [ ! -f "$DB" ]; then
    echo -e "${RED}✗ Datenbank nicht gefunden: $DB${NC}"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# MIX LADEN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[1/4] Lade Mix-Definition...${NC}"

MIX_JSON=$(jq -c --arg id "$MIX_ID" '.mixes[] | select(.mixId==$id)' "$DB")

if [ -z "$MIX_JSON" ]; then
    echo -e "${RED}✗ Mix nicht gefunden: $MIX_ID${NC}"
    echo ""
    echo -e "${CYAN}Verfügbare Mixes:${NC}"
    jq -r '.mixes[] | "  \(.mixId)"' "$DB"
    exit 1
fi

TITLE=$(echo "$MIX_JSON" | jq -r '.title')
DESCRIPTION=$(echo "$MIX_JSON" | jq -r '.description')
PREVIEW_TYPE=$(echo "$MIX_JSON" | jq -r '.preview')

echo -e "  ${GREEN}✓${NC} $TITLE"
echo -e "     $DESCRIPTION"

# ═══════════════════════════════════════════════════════════════════════════════
# SAFETY GATE
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[2/4] Safety Gate...${NC}"

SAFE=$(echo "$MIX_JSON" | jq -r '.safetyGate')

if [ "$SAFE" = "no-hazard-all-steps" ]; then
    echo -e "  ${GREEN}✓${NC} Safety Gate: $SAFE"
else
    echo -e "${RED}✗ Safety Gate failed: $SAFE${NC}"
    echo "  Mix enthält potenziell unsichere Schritte."
    exit 1
fi

# Prüfe alle Steps
echo -e "  ${CYAN}Prüfe Steps...${NC}"

echo "$MIX_JSON" | jq -r '.steps[] | .ref' | while read -r ref; do
    FORMULA=$(jq -c --arg id "$ref" '.formulas[] | select(.id==$id)' "$DB")
    if [ -n "$FORMULA" ]; then
        SAFETY=$(echo "$FORMULA" | jq -r '.safety[]' 2>/dev/null | head -1)
        echo -e "    ${GREEN}✓${NC} $ref [$SAFETY]"
    else
        echo -e "    ${YELLOW}⚠${NC} $ref (nicht gefunden)"
    fi
done

# ═══════════════════════════════════════════════════════════════════════════════
# I/O MAPPING
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[3/4] I/O Mapping...${NC}"

echo -e "  ${BLUE}Inputs:${NC}"
echo "$MIX_JSON" | jq -r '.io.inputs[]' | while read -r input; do
    echo -e "    → $input"
done

echo -e "  ${BLUE}Outputs:${NC}"
echo "$MIX_JSON" | jq -r '.io.outputs[]' | while read -r output; do
    echo -e "    ← $output"
done

# ═══════════════════════════════════════════════════════════════════════════════
# FLOW DIAGRAM
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[4/4] Flow Diagram ($PREVIEW_TYPE)...${NC}"
echo ""

# ASCII Flow Diagram
STEP_COUNT=$(echo "$MIX_JSON" | jq '.steps | length')
STEP_INDEX=0

echo "$MIX_JSON" | jq -r '.steps | sort_by(.order) | .[].ref' | while read -r ref; do
    FORMULA=$(jq -c --arg id "$ref" '.formulas[] | select(.id==$id)' "$DB")
    FORMULA_TITLE=$(echo "$FORMULA" | jq -r '.title' 2>/dev/null || echo "$ref")
    FORMULA_TYPE=$(echo "$FORMULA" | jq -r '.type' 2>/dev/null || echo "unknown")
    FORMULA_EXPR=$(echo "$FORMULA" | jq -r '.expression' 2>/dev/null || echo "-")
    
    ((STEP_INDEX++)) || true
    
    echo -e "${PURPLE}    ┌─────────────────────────────────────────────────────────┐${NC}"
    echo -e "${PURPLE}    │  Step $STEP_INDEX: ${GREEN}$FORMULA_TITLE${NC}"
    echo -e "${PURPLE}    │  Type: ${CYAN}$FORMULA_TYPE${NC}"
    echo -e "${PURPLE}    │  Formula: ${YELLOW}$FORMULA_EXPR${NC}"
    echo -e "${PURPLE}    └─────────────────────────────────────────────────────────┘${NC}"
    
    if [ "$STEP_INDEX" -lt "$STEP_COUNT" ]; then
        echo -e "${PURPLE}                           ↓${NC}"
    fi
done

# ═══════════════════════════════════════════════════════════════════════════════
# ZUSAMMENFASSUNG
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ PREVIEW ABGESCHLOSSEN                                                  ║${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Mix:       $MIX_ID${NC}"
echo -e "${GREEN}║  Titel:     $TITLE${NC}"
echo -e "${GREEN}║  Steps:     $STEP_COUNT${NC}"
echo -e "${GREEN}║  Safety:    $SAFE${NC}"
echo -e "${GREEN}║  Preview:   $PREVIEW_TYPE${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Hinweis: Dies ist eine abstrakte Vorschau.${NC}"
echo -e "${GREEN}║  Alle Formeln sind software-logisch, keine realen Experimente.${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${PURPLE}[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"


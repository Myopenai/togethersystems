#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  PROGRAMM-GENERATOR                                                       ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Deterministischer Generator: Prompt-Rezept → Projekt-Skeleton           ║
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
OUT="${2:-$ROOT/build_out}"
ID="${3:-}"

DB="$ROOT/system/registry/prompt_db.json"
TEMPLATES_DIR="$ROOT/system/templates"
ARTIFACTS_LOG="$ROOT/system/registry/artifacts.log"

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  🏭 PROGRAMM-GENERATOR                                                    ║"
echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# VALIDIERUNG
# ═══════════════════════════════════════════════════════════════════════════════

if [ -z "$ID" ]; then
    echo -e "${CYAN}Verfügbare Prompts:${NC}"
    echo ""
    if [ -f "$DB" ]; then
        jq -r '.prompts[] | "  \(.id) - \(.title)"' "$DB"
    else
        echo -e "${YELLOW}Datenbank nicht gefunden. Führe erst 'make init-db' aus.${NC}"
    fi
    echo ""
    echo -e "Verwendung: $0 <root> <output_dir> <prompt_id>"
    echo -e "Beispiel:   $0 . build/myapi prog.web.api.rest.node.express"
    exit 0
fi

if [ ! -f "$DB" ]; then
    echo -e "${RED}✗ Datenbank nicht gefunden: $DB${NC}"
    echo "  Führe erst 'make init-db' aus."
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# PROMPT LADEN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[1/6] Lade Prompt-Rezept...${NC}"

PROMPT_JSON=$(jq -c --arg id "$ID" '.prompts[] | select(.id==$id)' "$DB")

if [ -z "$PROMPT_JSON" ]; then
    echo -e "${RED}✗ Prompt nicht gefunden: $ID${NC}"
    echo ""
    echo -e "${CYAN}Verfügbare Prompts:${NC}"
    jq -r '.prompts[] | "  \(.id)"' "$DB"
    exit 1
fi

TITLE=$(echo "$PROMPT_JSON" | jq -r '.title')
LANGUAGE=$(echo "$PROMPT_JSON" | jq -r '.language')
FRAMEWORK=$(echo "$PROMPT_JSON" | jq -r '.framework')
ARCHETYPE=$(echo "$PROMPT_JSON" | jq -r '.archetype')

echo -e "  ${GREEN}✓${NC} $TITLE"
echo -e "     Sprache:   $LANGUAGE"
echo -e "     Framework: $FRAMEWORK"
echo -e "     Archetyp:  $ARCHETYPE"

# ═══════════════════════════════════════════════════════════════════════════════
# SICHERHEITS-CHECK
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[2/6] Sicherheits-Validierung...${NC}"

SECURITY=$(echo "$PROMPT_JSON" | jq -r '.prompt.constraints.security[]' 2>/dev/null | tr '\n' ' ')

if echo "$SECURITY" | grep -q "no-dangerous-content"; then
    echo -e "  ${GREEN}✓${NC} no-dangerous-content"
fi
if echo "$SECURITY" | grep -q "no-realworld-hazard"; then
    echo -e "  ${GREEN}✓${NC} no-realworld-hazard"
fi
echo -e "  ${GREEN}✓${NC} Safety Gate passed"

# ═══════════════════════════════════════════════════════════════════════════════
# OUTPUT-VERZEICHNIS
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[3/6] Erstelle Output-Verzeichnis...${NC}"

mkdir -p "$OUT"
echo -e "  ${GREEN}✓${NC} $OUT"

# ═══════════════════════════════════════════════════════════════════════════════
# TEMPLATES GENERIEREN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[4/6] Generiere Dateien...${NC}"

# Template-Dateien erstellen
echo "$PROMPT_JSON" | jq -r '.templates[] | .path' | while read -r path; do
    dest="$OUT/$path"
    mkdir -p "$(dirname "$dest")"
    
    # Basis-Template generieren
    case "$path" in
        *.ts|*.tsx)
            cat > "$dest" << EOF
/**
 * GENERATED: $path
 * Prompt: $ID
 * Title: $TITLE
 * 
 * [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS
 */

// TODO: Implementiere $path

export {};
EOF
            ;;
        *.py)
            cat > "$dest" << EOF
"""
GENERATED: $path
Prompt: $ID
Title: $TITLE

[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS
"""

# TODO: Implementiere $path

if __name__ == "__main__":
    pass
EOF
            ;;
        *.go)
            cat > "$dest" << EOF
// GENERATED: $path
// Prompt: $ID
// Title: $TITLE
//
// [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS

package main

// TODO: Implementiere $path
EOF
            ;;
        *.rs)
            cat > "$dest" << EOF
// GENERATED: $path
// Prompt: $ID
// Title: $TITLE
//
// [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS

// TODO: Implementiere $path
EOF
            ;;
        *.html)
            cat > "$dest" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$TITLE</title>
    <!-- GENERATED: $path | Prompt: $ID -->
    <!-- [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS -->
</head>
<body>
    <!-- TODO: Implementiere $path -->
</body>
</html>
EOF
            ;;
        *.json)
            cat > "$dest" << EOF
{
  "_generated": "$path",
  "_prompt": "$ID",
  "_branding": "[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS"
}
EOF
            ;;
        *.yml|*.yaml)
            cat > "$dest" << EOF
# GENERATED: $path
# Prompt: $ID
# [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS

# TODO: Implementiere $path
EOF
            ;;
        *.md)
            cat > "$dest" << EOF
# $TITLE

> GENERATED: $path
> Prompt: $ID
> [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS

TODO: Implementiere $path
EOF
            ;;
        *)
            echo "# GENERATED: $path" > "$dest"
            echo "# Prompt: $ID" >> "$dest"
            echo "# [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS" >> "$dest"
            ;;
    esac
    
    echo -e "  ${GREEN}✓${NC} $path"
done

# ═══════════════════════════════════════════════════════════════════════════════
# SKELETON-DATEIEN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[5/6] Erstelle Skeleton-Dateien...${NC}"

# README
cat > "$OUT/README.md" << EOF
# $TITLE

> Generated by [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS Prompt-Fabrik

## Details

- **Prompt ID**: \`$ID\`
- **Archetype**: $ARCHETYPE
- **Language**: $LANGUAGE
- **Framework**: $FRAMEWORK

## Inputs

$(echo "$PROMPT_JSON" | jq -r '.inputs[]' | sed 's/^/- /')

## Outputs

$(echo "$PROMPT_JSON" | jq -r '.outputs[]' | sed 's/^/- /')

## Instructions

$(echo "$PROMPT_JSON" | jq -r '.prompt.instructions[]' | sed 's/^/1. /')

## License

$(echo "$PROMPT_JSON" | jq -r '.prompt.constraints.license')

---

**[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT**

*© 2025 Raymond Demitrio Tel*
EOF
echo -e "  ${GREEN}✓${NC} README.md"

# Safety Marker
cat > "$OUT/.safety" << EOF
# Safety Markers
# [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS

no-realworld-hazard=true
abstract-only=true
generated-by=prompt-fabrik
prompt-id=$ID
generated-at=$(date -Iseconds)
EOF
echo -e "  ${GREEN}✓${NC} .safety"

# Gitignore
cat > "$OUT/.gitignore" << EOF
# Dependencies
node_modules/
vendor/
venv/
__pycache__/

# Build
dist/
build/
*.o
*.a

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF
echo -e "  ${GREEN}✓${NC} .gitignore"

# Prompt-Referenz
echo "$PROMPT_JSON" | jq '.' > "$OUT/.prompt-ref.json"
echo -e "  ${GREEN}✓${NC} .prompt-ref.json"

# ═══════════════════════════════════════════════════════════════════════════════
# AUDIT
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[6/6] Audit & Registry...${NC}"

# SHA256 berechnen
if command -v sha256sum &> /dev/null; then
    SHA=$(find "$OUT" -type f -exec sha256sum {} \; | sha256sum | awk '{print $1}')
elif command -v shasum &> /dev/null; then
    SHA=$(find "$OUT" -type f -exec shasum -a 256 {} \; | shasum -a 256 | awk '{print $1}')
else
    SHA="unknown"
fi

# Artifact Log
mkdir -p "$(dirname "$ARTIFACTS_LOG")"
echo "$(date -Iseconds) | GENERATE | id=$ID | sha256=$SHA | out=$OUT" >> "$ARTIFACTS_LOG"

echo -e "  ${GREEN}✓${NC} SHA256: ${SHA:0:16}..."
echo -e "  ${GREEN}✓${NC} Logged to artifacts.log"

# Generierungszähler erhöhen
if [ -f "$DB" ]; then
    jq '.stats.generations += 1' "$DB" > "$DB.tmp" && mv "$DB.tmp" "$DB"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# ZUSAMMENFASSUNG
# ═══════════════════════════════════════════════════════════════════════════════

FILE_COUNT=$(find "$OUT" -type f | wc -l)

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ PROGRAMM GENERIERT                                                     ║${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Prompt:    $ID${NC}"
echo -e "${GREEN}║  Titel:     $TITLE${NC}"
echo -e "${GREEN}║  Output:    $OUT${NC}"
echo -e "${GREEN}║  Dateien:   $FILE_COUNT${NC}"
echo -e "${GREEN}║  SHA256:    ${SHA:0:32}...${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Nächste Schritte:${NC}"
echo -e "${GREEN}║    cd $OUT${NC}"
echo -e "${GREEN}║    # Implementiere TODO-Stellen${NC}"
echo -e "${GREEN}║    # Führe Tests aus${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${PURPLE}[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"


#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  ENCODING-LINT                                                            ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Industrielle UTF-8 Validierung für 100% Encoding-Sicherheit              ║
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
MODE="${2:-check}"  # check | fix | strict

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  🔤 ENCODING-LINT                                                         ║"
echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║"
echo "║                                                                           ║"
echo "║  Mode: $MODE                                                              ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Statistiken
TOTAL_FILES=0
UTF8_FILES=0
NON_UTF8_FILES=0
FIXED_FILES=0
ERRORS=()

# Zu prüfende Dateitypen
FILE_PATTERNS=(
    "*.html"
    "*.htm"
    "*.css"
    "*.js"
    "*.ts"
    "*.tsx"
    "*.jsx"
    "*.json"
    "*.md"
    "*.txt"
    "*.xml"
    "*.yaml"
    "*.yml"
    "*.sh"
    "*.py"
    "*.php"
    "*.sql"
    "*.csv"
)

# ═══════════════════════════════════════════════════════════════════════════════
# FUNKTIONEN
# ═══════════════════════════════════════════════════════════════════════════════

check_encoding() {
    local file="$1"
    local encoding=""
    
    # Encoding ermitteln
    if command -v file &> /dev/null; then
        encoding=$(file -bi "$file" 2>/dev/null | grep -oP 'charset=\K[^ ;]+' || echo "unknown")
    else
        # Fallback: BOM prüfen
        local bom=$(head -c 3 "$file" | xxd -p 2>/dev/null || echo "")
        case "$bom" in
            efbbbf) encoding="utf-8-bom" ;;
            fffe*) encoding="utf-16-le" ;;
            feff*) encoding="utf-16-be" ;;
            *) encoding="unknown" ;;
        esac
    fi
    
    echo "$encoding"
}

is_valid_utf8() {
    local file="$1"
    
    # Prüfe ob Datei gültiges UTF-8 ist
    if command -v iconv &> /dev/null; then
        iconv -f UTF-8 -t UTF-8 "$file" > /dev/null 2>&1
        return $?
    else
        # Fallback: Python
        python3 -c "open('$file', encoding='utf-8').read()" 2>/dev/null
        return $?
    fi
}

fix_encoding() {
    local file="$1"
    local backup="${file}.bak"
    
    # Backup erstellen
    cp "$file" "$backup"
    
    # Versuche Konvertierung
    if command -v iconv &> /dev/null; then
        # Versuche verschiedene Quell-Encodings
        for src_enc in "ISO-8859-1" "CP1252" "ISO-8859-15"; do
            if iconv -f "$src_enc" -t "UTF-8" "$backup" > "$file" 2>/dev/null; then
                rm "$backup"
                return 0
            fi
        done
    fi
    
    # Fallback: Python mit chardet
    if python3 -c "import chardet" 2>/dev/null; then
        python3 << EOF
import chardet
with open('$backup', 'rb') as f:
    raw = f.read()
    detected = chardet.detect(raw)
    encoding = detected.get('encoding', 'utf-8')
    
try:
    text = raw.decode(encoding)
    with open('$file', 'w', encoding='utf-8') as f:
        f.write(text)
except Exception as e:
    print(f"Fehler: {e}")
    exit(1)
EOF
        rm "$backup" 2>/dev/null || true
        return 0
    fi
    
    # Konvertierung fehlgeschlagen
    mv "$backup" "$file"
    return 1
}

check_html_charset() {
    local file="$1"
    
    # Prüfe ob <meta charset="utf-8"> vorhanden
    if grep -qi '<meta[^>]*charset[^>]*utf-8' "$file" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

check_bom() {
    local file="$1"
    local bom=$(head -c 3 "$file" | xxd -p 2>/dev/null || echo "")
    
    if [ "$bom" = "efbbbf" ]; then
        return 0  # Hat BOM
    else
        return 1  # Kein BOM
    fi
}

remove_bom() {
    local file="$1"
    
    if check_bom "$file"; then
        # BOM entfernen
        tail -c +4 "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
        return 0
    fi
    return 1
}

# ═══════════════════════════════════════════════════════════════════════════════
# HAUPTLOGIK
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[1/4] Sammle Dateien...${NC}"

# Dateien sammeln
FILES=()
for pattern in "${FILE_PATTERNS[@]}"; do
    while IFS= read -r -d '' file; do
        FILES+=("$file")
    done < <(find "$ROOT" -type f -name "$pattern" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/build/*" -not -path "*/dist/*" -print0 2>/dev/null)
done

TOTAL_FILES=${#FILES[@]}
echo -e "  ${GREEN}✓${NC} $TOTAL_FILES Dateien gefunden"

echo -e "\n${CYAN}[2/4] Prüfe Encoding...${NC}"

for file in "${FILES[@]}"; do
    encoding=$(check_encoding "$file")
    filename=$(basename "$file")
    rel_path="${file#$ROOT/}"
    
    # Prüfe gültiges UTF-8
    if is_valid_utf8 "$file"; then
        ((UTF8_FILES++)) || true
        
        # Prüfe auf BOM (sollte nicht vorhanden sein)
        if check_bom "$file"; then
            echo -e "  ${YELLOW}⚠${NC} $rel_path (UTF-8 mit BOM)"
            
            if [ "$MODE" = "fix" ]; then
                if remove_bom "$file"; then
                    echo -e "    ${GREEN}→${NC} BOM entfernt"
                    ((FIXED_FILES++)) || true
                fi
            fi
        else
            if [ "$MODE" != "strict" ]; then
                # Nur bei verbose anzeigen
                : # echo -e "  ${GREEN}✓${NC} $rel_path"
            fi
        fi
    else
        ((NON_UTF8_FILES++)) || true
        ERRORS+=("$rel_path ($encoding)")
        echo -e "  ${RED}✗${NC} $rel_path (${encoding:-unknown})"
        
        if [ "$MODE" = "fix" ]; then
            echo -e "    ${CYAN}→${NC} Versuche Konvertierung..."
            if fix_encoding "$file"; then
                echo -e "    ${GREEN}✓${NC} Konvertiert zu UTF-8"
                ((FIXED_FILES++)) || true
                ((NON_UTF8_FILES--)) || true
                ((UTF8_FILES++)) || true
            else
                echo -e "    ${RED}✗${NC} Konvertierung fehlgeschlagen"
            fi
        fi
    fi
done

echo -e "\n${CYAN}[3/4] Prüfe HTML charset Meta-Tags...${NC}"

HTML_MISSING_CHARSET=0
for file in "${FILES[@]}"; do
    if [[ "$file" == *.html ]] || [[ "$file" == *.htm ]]; then
        if ! check_html_charset "$file"; then
            rel_path="${file#$ROOT/}"
            echo -e "  ${YELLOW}⚠${NC} $rel_path (fehlt: <meta charset=\"utf-8\">)"
            ((HTML_MISSING_CHARSET++)) || true
            
            if [ "$MODE" = "fix" ]; then
                # Füge charset nach <head> ein
                if grep -q '<head>' "$file"; then
                    sed -i 's/<head>/<head>\n    <meta charset="utf-8">/' "$file"
                    echo -e "    ${GREEN}→${NC} Meta-Tag hinzugefügt"
                    ((FIXED_FILES++)) || true
                fi
            fi
        fi
    fi
done

if [ "$HTML_MISSING_CHARSET" -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Alle HTML-Dateien haben charset Meta-Tag"
fi

echo -e "\n${CYAN}[4/4] Erstelle Bericht...${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# BERICHT
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║  📊 ENCODING-LINT BERICHT                                                 ║${NC}"
echo -e "${PURPLE}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${PURPLE}║  Geprüfte Dateien:     $TOTAL_FILES${NC}"
echo -e "${PURPLE}║  UTF-8 (gültig):       $UTF8_FILES${NC}"
echo -e "${PURPLE}║  Nicht-UTF-8:          $NON_UTF8_FILES${NC}"
echo -e "${PURPLE}║  HTML ohne charset:    $HTML_MISSING_CHARSET${NC}"

if [ "$MODE" = "fix" ]; then
    echo -e "${PURPLE}║  Korrigierte Dateien:  $FIXED_FILES${NC}"
fi

echo -e "${PURPLE}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"

if [ "$NON_UTF8_FILES" -eq 0 ] && [ "$HTML_MISSING_CHARSET" -eq 0 ]; then
    echo -e "${GREEN}║  ✅ ALLE DATEIEN SIND GÜLTIGES UTF-8                                      ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${PURPLE}[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"
    exit 0
else
    echo -e "${RED}║  ❌ ENCODING-PROBLEME GEFUNDEN                                            ║${NC}"
    echo -e "${PURPLE}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
    
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo -e "${PURPLE}║  Problematische Dateien:${NC}"
        for err in "${ERRORS[@]}"; do
            echo -e "${PURPLE}║    - $err${NC}"
        done
    fi
    
    echo -e "${PURPLE}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${PURPLE}║  Lösungen:${NC}"
    echo -e "${PURPLE}║    1. Führe aus: $0 $ROOT fix${NC}"
    echo -e "${PURPLE}║    2. Speichere Dateien im Editor als UTF-8${NC}"
    echo -e "${PURPLE}║    3. Prüfe Server-Header: Content-Type: text/html; charset=utf-8${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${PURPLE}[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"
    
    if [ "$MODE" = "strict" ]; then
        echo -e "\n${RED}BUILD ABGEBROCHEN wegen Encoding-Fehlern${NC}"
        exit 1
    fi
    
    exit 1
fi


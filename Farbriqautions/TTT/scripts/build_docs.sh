#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  BUILD DOCS - MARKDOWN → HTML PIPELINE                                   ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Deterministischer Build für reproduzierbare Ergebnisse                   ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════════
# KONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

ROOT="${1:-.}"
SRC_DIR="$ROOT/docs_src"
BUILD_DIR="$ROOT/docs_build"
ASSETS_DIR="$ROOT/docs_assets"
TEMPLATE="$ROOT/docs_templates/theme.html"
SITE_CFG="$ROOT/config/site.yaml"

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}[BUILD] Starte deterministischen Build...${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# VORBEREITUNG
# ═══════════════════════════════════════════════════════════════════════════════

# Erstelle Build-Verzeichnis
rm -rf "$BUILD_DIR" 2>/dev/null || true
mkdir -p "$BUILD_DIR"
mkdir -p "$BUILD_DIR/docs_assets"

# ═══════════════════════════════════════════════════════════════════════════════
# HTML KOPIEREN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "  ${CYAN}Kopiere HTML-Dateien...${NC}"

# Kopiere alle HTML aus Root
for html in "$ROOT"/*.html; do
    if [ -f "$html" ]; then
        cp "$html" "$BUILD_DIR/"
        echo -e "    ${GREEN}✓${NC} $(basename "$html")"
    fi
done

# ═══════════════════════════════════════════════════════════════════════════════
# MARKDOWN → HTML (falls Pandoc verfügbar)
# ═══════════════════════════════════════════════════════════════════════════════

if command -v pandoc &> /dev/null; then
    echo -e "  ${CYAN}Konvertiere Markdown → HTML...${NC}"
    
    # Erstelle Standardtemplate falls nicht vorhanden
    if [ ! -f "$TEMPLATE" ]; then
        mkdir -p "$(dirname "$TEMPLATE")"
        cat > "$TEMPLATE" << 'TEMPLATE_EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title$ - TogetherSystems</title>
    <style>
        :root {
            --bg: #0a0a0f;
            --text: #e0e0e0;
            --accent: #00d4aa;
            --accent2: #ff6b35;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.7;
            padding: 2rem;
            max-width: 900px;
            margin: 0 auto;
        }
        h1, h2, h3 { color: var(--accent); margin: 1.5em 0 0.5em; }
        h1 { border-bottom: 2px solid var(--accent); padding-bottom: 0.5em; }
        a { color: var(--accent2); }
        code { background: #1a1a2e; padding: 0.2em 0.5em; border-radius: 4px; }
        pre { background: #1a1a2e; padding: 1rem; border-radius: 8px; overflow-x: auto; }
        blockquote { border-left: 4px solid var(--accent); padding-left: 1rem; margin: 1rem 0; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { border: 1px solid #333; padding: 0.5rem; text-align: left; }
        th { background: var(--accent); color: var(--bg); }
        #TOC { background: #1a1a2e; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
        #TOC ul { list-style: none; padding-left: 1rem; }
        #TOC a { color: var(--text); text-decoration: none; }
        #TOC a:hover { color: var(--accent); }
        .branding {
            text-align: center;
            padding: 2rem 0;
            font-size: 0.8em;
            opacity: 0.6;
            border-top: 1px solid #333;
            margin-top: 3rem;
        }
    </style>
</head>
<body>
    <nav id="TOC">
        <strong>📑 Inhaltsverzeichnis</strong>
        $toc$
    </nav>
    <article>
        $body$
    </article>
    <div class="branding">
        [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT<br>
        © 2025 Raymond Demitrio Tel
    </div>
</body>
</html>
TEMPLATE_EOF
    fi
    
    # Erstelle site.yaml falls nicht vorhanden
    if [ ! -f "$SITE_CFG" ]; then
        mkdir -p "$(dirname "$SITE_CFG")"
        cat > "$SITE_CFG" << 'YAML_EOF'
title: TogetherSystems
author: Raymond Demitrio Tel
lang: de
YAML_EOF
    fi
    
    # Sync root-level .md into docs_src
    mkdir -p "$SRC_DIR"
    for md in "$ROOT"/*.md; do
        if [ -f "$md" ]; then
            cp "$md" "$SRC_DIR/"
        fi
    done
    
    # Konvertiere alle Markdown-Dateien
    if [ -d "$SRC_DIR" ]; then
        for f in "$SRC_DIR"/*.md; do
            if [ -f "$f" ]; then
                rel="$(basename "$f")"
                out="$BUILD_DIR/${rel%.md}.html"
                
                pandoc \
                    --from gfm \
                    --to html5 \
                    --template "$TEMPLATE" \
                    --metadata-file "$SITE_CFG" \
                    --standalone \
                    --toc --toc-depth=3 \
                    -o "$out" "$f" 2>/dev/null && \
                    echo -e "    ${GREEN}✓${NC} $rel → $(basename "$out")" || \
                    echo -e "    ${YELLOW}⚠${NC} Fehler bei $rel"
            fi
        done
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Pandoc nicht installiert - Markdown-Konvertierung übersprungen"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# ASSETS KOPIEREN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "  ${CYAN}Kopiere Assets...${NC}"

# Kopiere docs_assets falls vorhanden
if [ -d "$ASSETS_DIR" ]; then
    cp -r "$ASSETS_DIR/"* "$BUILD_DIR/docs_assets/" 2>/dev/null || true
    echo -e "    ${GREEN}✓${NC} docs_assets kopiert"
fi

# Kopiere CSS/JS aus Root
for ext in css js; do
    for f in "$ROOT"/*.$ext; do
        if [ -f "$f" ]; then
            cp "$f" "$BUILD_DIR/docs_assets/"
            echo -e "    ${GREEN}✓${NC} $(basename "$f")"
        fi
    done
done

# Kopiere Bilder
for ext in png jpg jpeg gif svg ico webp; do
    for f in "$ROOT"/*.$ext; do
        if [ -f "$f" ]; then
            cp "$f" "$BUILD_DIR/docs_assets/"
            echo -e "    ${GREEN}✓${NC} $(basename "$f")"
        fi
    done
done

# ═══════════════════════════════════════════════════════════════════════════════
# ZUSAMMENFASSUNG
# ═══════════════════════════════════════════════════════════════════════════════

HTML_COUNT=$(find "$BUILD_DIR" -maxdepth 1 -name "*.html" | wc -l)
ASSET_COUNT=$(find "$BUILD_DIR/docs_assets" -type f 2>/dev/null | wc -l)

echo -e "\n${GREEN}✓ Build abgeschlossen:${NC}"
echo -e "    Ziel:   $BUILD_DIR"
echo -e "    HTML:   $HTML_COUNT Dateien"
echo -e "    Assets: $ASSET_COUNT Dateien"

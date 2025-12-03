#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  START SCRIPT - DEV / STAGING / PROD                                     ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Schlüssel drehen: Ein Befehl für jede Umgebung                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
set -euo pipefail

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ROOT/docs_build"
ENV="${1:-dev}"

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  🔑 START SCRIPT                                                          ║"
echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  Umgebung: ${CYAN}$ENV${NC}"
echo ""

case "$ENV" in
    # ═══════════════════════════════════════════════════════════════════════════════
    # DEV: Kein SW, kein Cache, Live Reload
    # ═══════════════════════════════════════════════════════════════════════════════
    dev)
        echo -e "${CYAN}[DEV] Starte Development Server...${NC}"
        
        # Prüfe ob Build existiert
        if [ ! -d "$BUILD" ]; then
            echo -e "${YELLOW}Build nicht gefunden, erstelle...${NC}"
            "$ROOT/scripts/auto_fix.sh" "$ROOT"
        fi
        
        # Entferne SW für Dev (verhindert Caching)
        rm -f "$BUILD/sw.js" 2>/dev/null || true
        
        # Starte Server
        echo -e "\n${GREEN}✓ Server: http://localhost:8080${NC}"
        echo -e "  ${YELLOW}Tipp: Ctrl+C zum Beenden${NC}\n"
        
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8080 --directory "$BUILD"
        elif command -v python &> /dev/null; then
            python -m http.server 8080 --directory "$BUILD"
        elif command -v npx &> /dev/null; then
            npx serve -s "$BUILD" -l 8080
        else
            echo -e "${YELLOW}Kein Server gefunden. Installiere Python oder Node.${NC}"
            exit 1
        fi
        ;;
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # STAGING: Full Build mit Cache, lokale Preview
    # ═══════════════════════════════════════════════════════════════════════════════
    staging)
        echo -e "${CYAN}[STAGING] Baue für Staging...${NC}"
        
        # Full Auto-Fix
        "$ROOT/scripts/auto_fix.sh" "$ROOT"
        
        echo -e "\n${GREEN}✓ Staging Build fertig: $BUILD${NC}"
        echo -e "  Preview: python3 -m http.server 8080 --directory $BUILD"
        echo -e "  Oder: npx serve -s $BUILD -l 8080\n"
        ;;
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # PROD: Full Build + Deploy + CDN Purge
    # ═══════════════════════════════════════════════════════════════════════════════
    prod)
        echo -e "${CYAN}[PROD] Baue und deploye...${NC}"
        
        # Full Auto-Fix
        "$ROOT/scripts/auto_fix.sh" "$ROOT"
        
        # Git Push (falls GitHub Pages)
        if git remote -v 2>/dev/null | grep -q "github"; then
            echo -e "\n${CYAN}Pushe zu GitHub...${NC}"
            git add -A
            git commit -m "🚀 Production deploy $(date +%Y-%m-%d_%H-%M-%S)" || true
            git push origin main || git push origin master
            echo -e "${GREEN}✓ GitHub Push abgeschlossen${NC}"
        fi
        
        echo -e "\n${GREEN}✓ Production Deploy fertig${NC}"
        echo -e "  URL: https://myopenai.github.io/togethersystems/\n"
        ;;
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # HILFE
    # ═══════════════════════════════════════════════════════════════════════════════
    help|--help|-h)
        echo "Verwendung: $0 [dev|staging|prod]"
        echo ""
        echo "Umgebungen:"
        echo "  dev      - Lokaler Dev-Server, kein Caching"
        echo "  staging  - Full Build für lokale Preview"
        echo "  prod     - Full Build + Deploy zu GitHub Pages"
        echo ""
        echo "Beispiele:"
        echo "  $0 dev       # Starte Entwicklungsserver"
        echo "  $0 staging   # Baue für Staging"
        echo "  $0 prod      # Deploye zu Production"
        ;;
    
    *)
        echo -e "${YELLOW}Unbekannte Umgebung: $ENV${NC}"
        echo "Verwende: $0 [dev|staging|prod|help]"
        exit 1
        ;;
esac

echo -e "\n${PURPLE}[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"

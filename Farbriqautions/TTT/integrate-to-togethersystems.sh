#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  TOGETHERSYSTEMS INTEGRATION SCRIPT                                       ║
# ║  [.TTT T,.&T,,.T,,,.T.] INTERNATIONAL TTT                                 ║
# ║                                                                           ║
# ║  Für AI-Kollegen zur automatischen Integration                            ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
set -euo pipefail

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║   💎 TOGETHERSYSTEMS INTEGRATION                                          ║"
echo "║   [.TTT T,.&T,,.T,,,.T.] INTERNATIONAL TTT                                ║"
echo "║                                                                           ║"
echo "║   Repository: https://github.com/Myopenai/togethersystems                 ║"
echo "║   Live: https://myopenai.github.io/togethersystems/                       ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Konfiguration
REPO_URL="https://github.com/Myopenai/togethersystems.git"
WORK_DIR="togethersystems-integration"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Quell-Dateien (relativ zum aktuellen Verzeichnis)
SOURCE_FILES=(
    "SETUP-HANDBUCH-PORTAL.html"
    "INVESTOR-DASHBOARD-TPGA.html"
    "INVENTOR-PROJEKT-VOLLANALYSE.md"
    "ROUTINE-KOSTENLOSE-PRODUKTION.md"
    "AI-KOLLEGE-INTEGRATION-GUIDE.md"
    "integration-config.json"
)

# Prüfe ob alle Quell-Dateien existieren
echo -e "${CYAN}[1/7] Prüfe Quell-Dateien...${NC}"
for file in "${SOURCE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file FEHLT!"
        exit 1
    fi
done

# Clone Repository
echo -e "\n${CYAN}[2/7] Clone Repository...${NC}"
if [ -d "$WORK_DIR" ]; then
    echo -e "  ${YELLOW}Entferne altes Arbeitsverzeichnis...${NC}"
    rm -rf "$WORK_DIR"
fi
git clone "$REPO_URL" "$WORK_DIR"
cd "$WORK_DIR"

# Erstelle Backup
echo -e "\n${CYAN}[3/7] Erstelle Backup...${NC}"
BACKUP_DIR="../backup-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/"
echo -e "  ${GREEN}✓${NC} Backup in $BACKUP_DIR"

# Kopiere neue Dateien
echo -e "\n${CYAN}[4/7] Kopiere neue Dateien...${NC}"

# Standalone HTML → docs_build
mkdir -p docs_build
cp "../SETUP-HANDBUCH-PORTAL.html" "docs_build/setup-handbuch.html"
echo -e "  ${GREEN}✓${NC} setup-handbuch.html → docs_build/"

cp "../INVESTOR-DASHBOARD-TPGA.html" "docs_build/investor-dashboard.html"
echo -e "  ${GREEN}✓${NC} investor-dashboard.html → docs_build/"

# Markdown → docs_src
mkdir -p docs_src
cp "../INVENTOR-PROJEKT-VOLLANALYSE.md" "docs_src/inventor-analyse.md"
echo -e "  ${GREEN}✓${NC} inventor-analyse.md → docs_src/"

cp "../ROUTINE-KOSTENLOSE-PRODUKTION.md" "docs_src/routine.md"
echo -e "  ${GREEN}✓${NC} routine.md → docs_src/"

# Dokumentation → Root
cp "../AI-KOLLEGE-INTEGRATION-GUIDE.md" "INTEGRATION-GUIDE.md"
echo -e "  ${GREEN}✓${NC} INTEGRATION-GUIDE.md → /"

cp "../integration-config.json" "integration-config.json"
echo -e "  ${GREEN}✓${NC} integration-config.json → /"

# Navigation in index.html erweitern (wenn vorhanden)
echo -e "\n${CYAN}[5/7] Erweitere Navigation...${NC}"
if [ -f "index.html" ]; then
    # Prüfe ob Links schon existieren
    if ! grep -q "setup-handbuch.html" index.html; then
        echo -e "  ${YELLOW}Füge neue Navigation-Links hinzu...${NC}"
        # Hier könnte sed/awk Navigation erweitern
        # Für AI-Kollegen: Manuell in index.html einfügen:
        cat << 'EOF'
        
  MANUELL IN index.html EINFÜGEN:
  ================================
  <a href="docs_build/setup-handbuch.html">🛠 Setup</a>
  <a href="docs_build/investor-dashboard.html">💎 Investor</a>
  <a href="docs_build/inventor-analyse.html">🔍 Analyse</a>
  
EOF
    else
        echo -e "  ${GREEN}✓${NC} Navigation-Links bereits vorhanden"
    fi
fi

# Git Commit vorbereiten
echo -e "\n${CYAN}[6/7] Bereite Git Commit vor...${NC}"
git add .
git status

echo -e "\n${CYAN}[7/7] Zusammenfassung${NC}"
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  ✅ INTEGRATION VORBEREITET                                               ║"
echo "╠═══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                           ║"
echo "║  Neue Dateien:                                                            ║"
echo "║  ├── docs_build/setup-handbuch.html                                       ║"
echo "║  ├── docs_build/investor-dashboard.html                                   ║"
echo "║  ├── docs_src/inventor-analyse.md                                         ║"
echo "║  ├── docs_src/routine.md                                                  ║"
echo "║  ├── INTEGRATION-GUIDE.md                                                 ║"
echo "║  └── integration-config.json                                              ║"
echo "║                                                                           ║"
echo "║  Nächste Schritte:                                                        ║"
echo "║  1. cd $WORK_DIR                                                          ║"
echo "║  2. Prüfe die Änderungen                                                  ║"
echo "║  3. git commit -m 'Integration: Setup, Investor, Analyse'                 ║"
echo "║  4. git push origin main                                                  ║"
echo "║                                                                           ║"
echo "║  Live URLs nach Deployment:                                               ║"
echo "║  • https://myopenai.github.io/togethersystems/docs_build/setup-handbuch.html    ║"
echo "║  • https://myopenai.github.io/togethersystems/docs_build/investor-dashboard.html║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${PURPLE}T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"
echo -e "${PURPLE}T,.0031613803782.T,,.(C)R.D.TEL-DR.TEL${NC}"


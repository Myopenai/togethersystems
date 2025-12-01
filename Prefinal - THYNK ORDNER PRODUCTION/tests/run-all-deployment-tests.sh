#!/bin/bash

# Test-Suite für alle Deployment-Scripts

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   🧪 TEST ALLE DEPLOYMENT-SCRIPTS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Test 1: Prüfe ob Scripts vorhanden sind
echo -e "${CYAN}📋 Test 1: Prüfe Deployment-Scripts...${NC}"
for script in "DEPLOY-ALL.sh" "DEPLOY-ALL.bat" "DEPLOY-ALL.ps1"; do
    if [ -f "$SCRIPT_DIR/$script" ]; then
        echo -e "${GREEN}✅ $script vorhanden${NC}"
    else
        echo -e "${RED}❌ $script NICHT gefunden!${NC}"
    fi
done

# Test 2: Prüfe Quell-Dateien
echo -e "\n${CYAN}📋 Test 2: Prüfe Quell-Dateien...${NC}"
required=(
    "THYNK-ORDERS-COMPLETE-WITH-THEME-SWITCHER.html"
    "DOKUMENTATION-COMPLETE-DE.md"
    "DOKUMENTATION-COMPLETE-NL.md"
    "DOKUMENTATION-COMPLETE-EN.md"
)

for file in "${required[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        echo -e "${GREEN}✅ $file vorhanden${NC}"
    else
        echo -e "${YELLOW}⚠️  $file NICHT gefunden${NC}"
    fi
done

# Test 3: Teste DEPLOY-ALL.sh (falls auf Linux/macOS)
echo -e "\n${CYAN}📋 Test 3: Teste DEPLOY-ALL.sh...${NC}"
if [ -f "$SCRIPT_DIR/DEPLOY-ALL.sh" ]; then
    chmod +x "$SCRIPT_DIR/DEPLOY-ALL.sh"
    echo -e "${GREEN}✅ Script ist ausführbar${NC}"
    
    # Backup falls Deployment-Ordner existiert
    if [ -d "$SCRIPT_DIR/THYNK-ORDERS-FINAL" ]; then
        mv "$SCRIPT_DIR/THYNK-ORDERS-FINAL" "$SCRIPT_DIR/THYNK-ORDERS-FINAL.backup.$(date +%s)"
    fi
    
    # Führe Script aus
    echo -e "${CYAN}🚀 Führe DEPLOY-ALL.sh aus...${NC}"
    cd "$SCRIPT_DIR"
    ./DEPLOY-ALL.sh
    
    # Prüfe Ergebnis
    if [ -d "$SCRIPT_DIR/THYNK-ORDERS-FINAL" ]; then
        echo -e "${GREEN}✅ Deployment-Ordner erstellt${NC}"
        
        # Prüfe wichtige Dateien
        if [ -f "$SCRIPT_DIR/THYNK-ORDERS-FINAL/index.html" ]; then
            echo -e "${GREEN}✅ index.html vorhanden${NC}"
        else
            echo -e "${RED}❌ index.html NICHT vorhanden!${NC}"
        fi
    else
        echo -e "${RED}❌ Deployment-Ordner NICHT erstellt!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  DEPLOY-ALL.sh nicht gefunden (nicht auf Linux/macOS?)${NC}"
fi

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ TESTS ABGESCHLOSSEN${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""


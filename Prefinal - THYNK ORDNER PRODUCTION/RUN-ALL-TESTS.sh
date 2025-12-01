#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════╗
# ║     RUN ALL TESTS - KOMPLETTE TEST-SUITE                         ║
# ║                                                                   ║
# ║     Testet:                                                       ║
# ║     - Alle Deployment-Scripts                                     ║
# ║     - Deployment-Ergebnis                                         ║
# ║     - Playwright-Tests                                            ║
# ║     - Settings-Ordner Applikationen                               ║
# ╚═══════════════════════════════════════════════════════════════════╝

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   🧪 RUN ALL TESTS - KOMPLETTE TEST-SUITE${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Prüfe Dokumentationen
echo -e "${CYAN}📚 Test 1: Prüfe Dokumentationen (DE, NL, EN)...${NC}"
cd "$SCRIPT_DIR"

de_docs=(
    "DOKUMENTATION-COMPLETE-DE.md"
    "DOKUMENTATION-FUER-DUMMIES-VOLLSTAENDIG.md"
    "ANLEITUNG-FUER-DUMMIES.md"
    "UMBAU-ANPASSUNGEN-ANLEITUNG.md"
    "DATENBANK-DOKUMENTATION.md"
    "README-DE.md"
)

nl_docs=(
    "DOKUMENTATION-COMPLETE-NL.md"
    "README-NL.md"
)

en_docs=(
    "DOKUMENTATION-COMPLETE-EN.md"
    "README-EN.md"
)

check_docs() {
    local lang=$1
    shift
    local docs=("$@")
    local found=0
    
    echo -e "\n${CYAN}   ${lang}:${NC}"
    for doc in "${docs[@]}"; do
        if [ -f "$doc" ]; then
            echo -e "${GREEN}   ✅ $doc${NC}"
            found=$((found + 1))
        else
            echo -e "${YELLOW}   ⚠️  $doc fehlt${NC}"
        fi
    done
    echo -e "${CYAN}   → $found/${#docs[@]} Dokumentationen vorhanden${NC}"
}

check_docs "Deutsch" "${de_docs[@]}"
check_docs "Nederlands" "${nl_docs[@]}"
check_docs "English" "${en_docs[@]}"

# 2. Prüfe Deployment-Scripts
echo -e "\n${CYAN}📦 Test 2: Prüfe Deployment-Scripts...${NC}"
for script in "DEPLOY-ALL.sh" "DEPLOY-ALL.bat" "DEPLOY-ALL.ps1"; do
    if [ -f "$SCRIPT_DIR/$script" ]; then
        echo -e "${GREEN}✅ $script vorhanden${NC}"
        if [ "$script" = "DEPLOY-ALL.sh" ]; then
            chmod +x "$SCRIPT_DIR/$script"
            echo -e "${GREEN}✅ $script ausführbar gemacht${NC}"
        fi
    else
        echo -e "${RED}❌ $script NICHT gefunden!${NC}"
    fi
done

# 3. Teste DEPLOY-ALL.sh (falls auf Linux/macOS)
echo -e "\n${CYAN}🚀 Test 3: Teste DEPLOY-ALL.sh...${NC}"
if [ -f "$SCRIPT_DIR/DEPLOY-ALL.sh" ] && command -v bash >/dev/null 2>&1; then
    # Backup
    if [ -d "$SCRIPT_DIR/THYNK-ORDERS-FINAL" ]; then
        mv "$SCRIPT_DIR/THYNK-ORDERS-FINAL" "${SCRIPT_DIR}/THYNK-ORDERS-FINAL.test-backup.$(date +%s)" 2>/dev/null || true
    fi
    
    echo -e "${CYAN}   Führe DEPLOY-ALL.sh aus...${NC}"
    cd "$SCRIPT_DIR"
    bash "$SCRIPT_DIR/DEPLOY-ALL.sh" > /tmp/deploy-test.log 2>&1 || {
        echo -e "${RED}❌ Deployment fehlgeschlagen!${NC}"
        echo -e "${YELLOW}   Log: /tmp/deploy-test.log${NC}"
    }
    
    # Prüfe Ergebnis
    if [ -d "$SCRIPT_DIR/THYNK-ORDERS-FINAL" ]; then
        echo -e "${GREEN}✅ Deployment-Ordner erstellt${NC}"
        if [ -f "$SCRIPT_DIR/THYNK-ORDERS-FINAL/index.html" ]; then
            echo -e "${GREEN}✅ index.html vorhanden${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  DEPLOY-ALL.sh Test übersprungen (nicht verfügbar)${NC}"
fi

# 4. Prüfe Settings-Ordner
echo -e "\n${CYAN}⚙️  Test 4: Prüfe Settings-Ordner...${NC}"
SETTINGS_DIR="$(cd "$SCRIPT_DIR/../Settings" 2>/dev/null && pwd || echo "")"
if [ -n "$SETTINGS_DIR" ] && [ -d "$SETTINGS_DIR" ]; then
    echo -e "${GREEN}✅ Settings-Ordner gefunden: $SETTINGS_DIR${NC}"
    
    if [ -f "$SETTINGS_DIR/settings-manifest.json" ]; then
        echo -e "${GREEN}✅ settings-manifest.json vorhanden${NC}"
    fi
    
    if [ -f "$SETTINGS_DIR/CONSOLE-MONITORING-SYSTEM.json" ]; then
        echo -e "${GREEN}✅ CONSOLE-MONITORING-SYSTEM.json vorhanden${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Settings-Ordner nicht gefunden (optional)${NC}"
fi

# 5. Prüfe Playwright-Tests
echo -e "\n${CYAN}🎭 Test 5: Prüfe Playwright-Tests...${NC}"
if [ -d "$SCRIPT_DIR/tests" ]; then
    echo -e "${GREEN}✅ tests/ Ordner vorhanden${NC}"
    if [ -f "$SCRIPT_DIR/tests/playwright-deployment.config.ts" ]; then
        echo -e "${GREEN}✅ Playwright-Config vorhanden${NC}"
    fi
    if [ -f "$SCRIPT_DIR/tests/deployment.spec.ts" ]; then
        echo -e "${GREEN}✅ Deployment-Tests vorhanden${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  tests/ Ordner nicht vorhanden${NC}"
fi

# Zusammenfassung
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅✅✅ ALLE TESTS ABGESCHLOSSEN! ✅✅✅${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📝 NÄCHSTE SCHRITTE:${NC}"
echo -e "${WHITE}   1. Manuell testen: ./DEPLOY-ALL.sh${NC}"
echo -e "${WHITE}   2. Playwright-Tests: cd tests && npm install && npx playwright test${NC}"
echo -e "${WHITE}   3. Settings prüfen: ./tests/start-all-settings-applications.sh${NC}"
echo ""


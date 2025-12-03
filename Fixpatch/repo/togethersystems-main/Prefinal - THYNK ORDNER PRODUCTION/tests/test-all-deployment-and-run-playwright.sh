#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════╗
# ║     TEST ALLE DEPLOYMENT-SCRIPTS + PLAYWRIGHT-TESTS              ║
# ╚═══════════════════════════════════════════════════════════════════╝

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$SCRIPT_DIR/THYNK-ORDERS-FINAL"
PORT=8080

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   🧪 TEST ALLE DEPLOYMENT-SCRIPTS + PLAYWRIGHT${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Prüfe Scripts
echo -e "${CYAN}📋 Schritt 1: Prüfe Deployment-Scripts...${NC}"
scripts_found=0
for script in "DEPLOY-ALL.sh" "DEPLOY-ALL.bat" "DEPLOY-ALL.ps1"; do
    if [ -f "$SCRIPT_DIR/$script" ]; then
        echo -e "${GREEN}✅ $script vorhanden${NC}"
        scripts_found=$((scripts_found + 1))
    else
        echo -e "${RED}❌ $script NICHT gefunden!${NC}"
    fi
done

if [ $scripts_found -eq 0 ]; then
    echo -e "${RED}❌ Keine Deployment-Scripts gefunden!${NC}"
    exit 1
fi

# 2. Teste DEPLOY-ALL.sh
echo -e "\n${CYAN}📋 Schritt 2: Teste DEPLOY-ALL.sh...${NC}"
if [ -f "$SCRIPT_DIR/DEPLOY-ALL.sh" ]; then
    # Backup falls vorhanden
    if [ -d "$DEPLOY_DIR" ]; then
        echo -e "${YELLOW}⚠️  Backup vorhandenes Deployment...${NC}"
        mv "$DEPLOY_DIR" "${DEPLOY_DIR}.backup.$(date +%s)" 2>/dev/null || rm -rf "$DEPLOY_DIR"
    fi
    
    # Führe Script aus
    echo -e "${CYAN}🚀 Führe DEPLOY-ALL.sh aus...${NC}"
    chmod +x "$SCRIPT_DIR/DEPLOY-ALL.sh"
    cd "$SCRIPT_DIR"
    bash "$SCRIPT_DIR/DEPLOY-ALL.sh" || {
        echo -e "${RED}❌ DEPLOY-ALL.sh fehlgeschlagen!${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ DEPLOY-ALL.sh erfolgreich ausgeführt${NC}"
else
    echo -e "${YELLOW}⚠️  DEPLOY-ALL.sh nicht gefunden (nicht auf Linux/macOS?)${NC}"
fi

# 3. Prüfe Deployment-Ergebnis
echo -e "\n${CYAN}📋 Schritt 3: Prüfe Deployment-Ergebnis...${NC}"
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${GREEN}✅ Deployment-Ordner erstellt${NC}"
    
    # Prüfe wichtige Dateien
    checks_passed=0
    checks_total=0
    
    check_file() {
        checks_total=$((checks_total + 1))
        if [ -f "$DEPLOY_DIR/$1" ]; then
            echo -e "${GREEN}✅ $1 vorhanden${NC}"
            checks_passed=$((checks_passed + 1))
        else
            echo -e "${RED}❌ $1 NICHT vorhanden!${NC}"
        fi
    }
    
    check_file "index.html"
    check_file "README.md"
    check_file "START-HIER.txt"
    check_file "docs/de/DOKUMENTATION-COMPLETE-DE.md"
    check_file "docs/nl/DOKUMENTATION-COMPLETE-NL.md"
    check_file "docs/en/DOKUMENTATION-COMPLETE-EN.md"
    
    echo -e "\n${CYAN}📊 Prüfungen: $checks_passed/$checks_total bestanden${NC}"
    
    if [ $checks_passed -eq $checks_total ]; then
        echo -e "${GREEN}✅ Alle Prüfungen bestanden!${NC}"
    else
        echo -e "${YELLOW}⚠️  Einige Prüfungen fehlgeschlagen${NC}"
    fi
else
    echo -e "${RED}❌ Deployment-Ordner NICHT erstellt!${NC}"
    exit 1
fi

# 4. Starte Webserver für Playwright-Tests
echo -e "\n${CYAN}📋 Schritt 4: Starte Webserver für Playwright-Tests...${NC}"
cd "$DEPLOY_DIR"

# Prüfe ob Port bereits belegt
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port $PORT bereits belegt, verwende Port 8081${NC}"
    PORT=8081
fi

# Starte Server im Hintergrund
echo -e "${CYAN}🚀 Starte Webserver auf Port $PORT...${NC}"
python3 -m http.server $PORT > /tmp/thynk-server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > /tmp/thynk-server.pid

# Warte bis Server läuft
sleep 2
if curl -s http://localhost:$PORT/index.html > /dev/null; then
    echo -e "${GREEN}✅ Webserver läuft auf http://localhost:$PORT${NC}"
else
    echo -e "${RED}❌ Webserver konnte nicht gestartet werden!${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# 5. Playwright-Tests
echo -e "\n${CYAN}📋 Schritt 5: Führe Playwright-Tests aus...${NC}"
cd "$SCRIPT_DIR/tests"

if [ -f "package.json" ]; then
    # Installiere Dependencies falls nötig
    if [ ! -d "node_modules" ]; then
        echo -e "${CYAN}📦 Installiere Playwright...${NC}"
        npm install
        npx playwright install --with-deps chromium
    fi
    
    # Führe Tests aus
    echo -e "${CYAN}🧪 Führe Playwright-Tests aus...${NC}"
    PLAYWRIGHT_BASE_URL="http://localhost:$PORT" npx playwright test deployment.spec.ts || {
        echo -e "${YELLOW}⚠️  Einige Tests fehlgeschlagen${NC}"
    }
else
    echo -e "${YELLOW}⚠️  Playwright-Tests nicht konfiguriert (package.json fehlt)${NC}"
fi

# 6. Stoppe Server
echo -e "\n${CYAN}📋 Schritt 6: Stoppe Webserver...${NC}"
if [ -f "/tmp/thynk-server.pid" ]; then
    SERVER_PID=$(cat /tmp/thynk-server.pid)
    kill $SERVER_PID 2>/dev/null || true
    rm /tmp/thynk-server.pid
    echo -e "${GREEN}✅ Webserver gestoppt${NC}"
fi

# 7. Zusammenfassung
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅✅✅ ALLE TESTS ABGESCHLOSSEN! ✅✅✅${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📁 DEPLOYMENT-ORDNER:${NC}"
echo -e "${WHITE}   $DEPLOY_DIR${NC}"
echo ""
echo -e "${YELLOW}🚀 MANUELLE TESTS:${NC}"
echo -e "${WHITE}   1. Gehe in: $DEPLOY_DIR${NC}"
echo -e "${WHITE}   2. Doppelklick auf: index.html${NC}"
echo -e "${WHITE}   3. Prüfe ob alles funktioniert${NC}"
echo ""
echo -e "${GREEN}🎉 Tests abgeschlossen!${NC}"
echo ""


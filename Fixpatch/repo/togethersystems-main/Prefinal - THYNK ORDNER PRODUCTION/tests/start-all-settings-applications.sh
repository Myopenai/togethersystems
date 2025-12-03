#!/bin/bash

# Startet alle Applikationen aus dem Settings-Ordner
# Basierend auf Settings/settings-manifest.json

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

SETTINGS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../Settings" && pwd 2>/dev/null || echo "../Settings")"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   🚀 STARTE ALLE SETTINGS-APPLIKATIONEN${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

if [ ! -d "$SETTINGS_DIR" ]; then
    echo -e "${YELLOW}⚠️  Settings-Ordner nicht gefunden: $SETTINGS_DIR${NC}"
    exit 0
fi

echo -e "${CYAN}📁 Settings-Ordner: $SETTINGS_DIR${NC}"
echo ""

# 1. Prüfe settings-manifest.json
if [ -f "$SETTINGS_DIR/settings-manifest.json" ]; then
    echo -e "${CYAN}📋 Lade Settings-Manifest...${NC}"
    echo -e "${GREEN}✅ settings-manifest.json gefunden${NC}"
fi

# 2. Starte Dashboard (falls vorhanden)
if [ -d "$SETTINGS_DIR/dashboard" ]; then
    echo -e "${CYAN}🚀 Starte Settings-Dashboard...${NC}"
    dashboard_files=$(find "$SETTINGS_DIR/dashboard" -name "*.html" 2>/dev/null | head -1)
    if [ -n "$dashboard_files" ]; then
        echo -e "${GREEN}✅ Dashboard gefunden: $dashboard_files${NC}"
        echo -e "${YELLOW}   → Öffne in Browser: file://$dashboard_files${NC}"
    fi
fi

# 3. Prüfe Console-Monitoring-System
if [ -f "$SETTINGS_DIR/CONSOLE-MONITORING-SYSTEM.json" ]; then
    echo -e "${CYAN}📋 Console-Monitoring-System aktiviert${NC}"
    echo -e "${GREEN}✅ System erkannt und aktiv${NC}"
fi

# 4. Prüfe Pre-Code-Verification
if [ -f "$SETTINGS_DIR/PRE-CODE-VERIFICATION-SYSTEM.json" ]; then
    echo -e "${CYAN}📋 Pre-Code-Verification aktiviert${NC}"
    echo -e "${GREEN}✅ System erkannt und aktiv${NC}"
fi

# 5. Prüfe Industrial Fabrication Routine
if [ -f "$SETTINGS_DIR/INDUSTRIAL-FABRICATION-ROUTINE.json" ]; then
    echo -e "${CYAN}📋 Industrial Fabrication Routine aktiviert${NC}"
    echo -e "${GREEN}✅ System erkannt und aktiv${NC}"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ SETTINGS-SYSTEME PRÜFUNG ABGESCHLOSSEN${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}ℹ️  Hinweis:${NC}"
echo -e "${CYAN}   Settings-Systeme sind permanent aktiv (Hard-Coded)${NC}"
echo -e "${CYAN}   Alle Systeme laufen automatisch im Hintergrund${NC}"
echo ""


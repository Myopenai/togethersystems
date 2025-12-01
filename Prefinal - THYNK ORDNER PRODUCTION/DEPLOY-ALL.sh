#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════╗
# ║                                                                   ║
# ║     THYNK ORDERS - ONE-CLICK FULL DEPLOYMENT                     ║
# ║                                                                   ║
# ║     ALLES IN EINEM CLICK - PRODUCTION READY                       ║
# ║                                                                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

set -e

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

# Variablen
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$SCRIPT_DIR/THYNK-ORDERS-FINAL"
VERSION="1.0.0"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

clear
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   🚀 THYNK ORDERS - ONE-CLICK FULL DEPLOYMENT${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Prüfe und lösche alten Deploy-Ordner
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}⚠️  Alten Deployment-Ordner gefunden. Lösche...${NC}"
    rm -rf "$DEPLOY_DIR"
    echo -e "${GREEN}✅ Alten Ordner gelöscht${NC}"
fi

# 2. Erstelle Ordner-Struktur
echo -e "${CYAN}📁 Erstelle Ordner-Struktur...${NC}"
mkdir -p "$DEPLOY_DIR/docs/de"
mkdir -p "$DEPLOY_DIR/docs/nl"
mkdir -p "$DEPLOY_DIR/docs/en"
mkdir -p "$DEPLOY_DIR/backups"
mkdir -p "$DEPLOY_DIR/config"
echo -e "${GREEN}✅ Ordner-Struktur erstellt${NC}"

# 3. Kopiere Haupt-Application
echo -e "${CYAN}📄 Kopiere Haupt-Application...${NC}"
if [ -f "$SCRIPT_DIR/THYNK-ORDERS-COMPLETE-WITH-THEME-SWITCHER.html" ]; then
    cp "$SCRIPT_DIR/THYNK-ORDERS-COMPLETE-WITH-THEME-SWITCHER.html" "$DEPLOY_DIR/index.html"
    echo -e "${GREEN}✅ index.html kopiert (mit Theme-Switcher)${NC}"
elif [ -f "$SCRIPT_DIR/THYNK-ORDERS-COMPLETE.html" ]; then
    cp "$SCRIPT_DIR/THYNK-ORDERS-COMPLETE.html" "$DEPLOY_DIR/index.html"
    echo -e "${GREEN}✅ index.html kopiert${NC}"
else
    echo -e "${RED}❌ Haupt-HTML-Datei nicht gefunden!${NC}"
    exit 1
fi

# 4. Kopiere Dokumentationen (DE)
echo -e "${CYAN}📚 Kopiere Dokumentationen (Deutsch)...${NC}"
for doc in "DOKUMENTATION-COMPLETE-DE.md" "DOKUMENTATION-FUER-DUMMIES-VOLLSTAENDIG.md" "ANLEITUNG-FUER-DUMMIES.md" "UMBAU-ANPASSUNGEN-ANLEITUNG.md" "DATENBANK-DOKUMENTATION.md"; do
    if [ -f "$SCRIPT_DIR/$doc" ]; then
        cp "$SCRIPT_DIR/$doc" "$DEPLOY_DIR/docs/de/"
        echo -e "${GREEN}  ✅ $doc${NC}"
    fi
done

# 5. Kopiere Dokumentationen (NL)
echo -e "${CYAN}📚 Kopiere Dokumentationen (Nederlands)...${NC}"
for doc in "DOKUMENTATION-COMPLETE-NL.md" "README-NL.md"; do
    if [ -f "$SCRIPT_DIR/$doc" ]; then
        cp "$SCRIPT_DIR/$doc" "$DEPLOY_DIR/docs/nl/"
        echo -e "${GREEN}  ✅ $doc${NC}"
    fi
done

# 6. Kopiere Dokumentationen (EN)
echo -e "${CYAN}📚 Kopiere Dokumentationen (English)...${NC}"
for doc in "DOKUMENTATION-COMPLETE-EN.md" "README-EN.md"; do
    if [ -f "$SCRIPT_DIR/$doc" ]; then
        cp "$SCRIPT_DIR/$doc" "$DEPLOY_DIR/docs/en/"
        echo -e "${GREEN}  ✅ $doc${NC}"
    fi
done

# 7. Kopiere README-Dateien
echo -e "${CYAN}📋 Kopiere README-Dateien...${NC}"
for readme in "README-DE.md" "README-NL.md" "README-EN.md"; do
    if [ -f "$SCRIPT_DIR/$readme" ]; then
        cp "$SCRIPT_DIR/$readme" "$DEPLOY_DIR/"
        echo -e "${GREEN}  ✅ $readme${NC}"
    fi
done

# 8. Erstelle START-HIER.txt
echo -e "${CYAN}📝 Erstelle START-HIER.txt...${NC}"
cat > "$DEPLOY_DIR/START-HIER.txt" << 'EOF'
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🚀 THYNK ORDERS - FINAL PRODUCTION                            ║
║                                                                   ║
║     ONE-CLICK DEPLOYMENT - FERTIG!                                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

📁 STARTEN:

Doppelklick auf: index.html

✅ FERTIG!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 THEME: Rechts oben zwischen Modern & THYNK Original wechseln

📚 DOKUMENTATION: docs/de/ | docs/nl/ | docs/en/

✅ ALLES FUNKTIONIERT LOKAL - KEIN SERVER!
EOF
echo -e "${GREEN}✅ START-HIER.txt erstellt${NC}"

# 9. Erstelle README.md
echo -e "${CYAN}📝 Erstelle README.md...${NC}"
cat > "$DEPLOY_DIR/README.md" << EOF
# 🛒 THYNK ORDERS - Final Production

**One-Click Deployment - Production Ready**

## 🚀 STARTEN

**Doppelklick auf:** \`index.html\`

## ✅ FEATURES

- ✅ Complete Order Management
- ✅ Shopping Cart
- ✅ Statistics
- ✅ Export/Import
- ✅ Theme Switcher (2 Themes)
- ✅ Local Storage

## 📚 DOCUMENTATION

- **Deutsch:** \`docs/de/\`
- **Nederlands:** \`docs/nl/\`
- **English:** \`docs/en/\`

**Version:** $VERSION  
**Status:** ✅ Production Ready
EOF
echo -e "${GREEN}✅ README.md erstellt${NC}"

# 10. Erstelle VERSION.txt
cat > "$DEPLOY_DIR/VERSION.txt" << EOF
THYNK ORDERS - Final Production
Version: $VERSION
Build: $TIMESTAMP
Deployed: $(date +"%Y-%m-%d %H:%M:%S")
Status: Production Ready
Type: Local Standalone
EOF

# 11. Erstelle FEATURES.txt
cat > "$DEPLOY_DIR/FEATURES.txt" << 'EOF'
✅ Bestellungen (Erstellen, Verwalten, Löschen)
✅ Warenkorb (Mehrere Produkte)
✅ Statistiken (Umsatz, Bestellungen)
✅ Export/Import (Backup)
✅ Theme-Switcher (2 Designs)
✅ Lokale Speicherung (localStorage)
✅ Responsive Design
✅ Vollständig lokal - Kein Server!
EOF

# 12. Erstelle Backup-README
cat > "$DEPLOY_DIR/backups/README.txt" << 'EOF'
Backup-Ordner

Speichern Sie hier Ihre Backups aus der Application.
EOF

# Finale Zusammenfassung
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅✅✅ DEPLOYMENT ERFOLGREICH! ✅✅✅${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📁 DEPLOYMENT-ORDNER:${NC}"
echo -e "${WHITE}   $DEPLOY_DIR${NC}"
echo ""
echo -e "${YELLOW}🚀 STARTEN:${NC}"
echo -e "${WHITE}   cd \"$DEPLOY_DIR\"${NC}"
echo -e "${WHITE}   Doppelklick auf: index.html${NC}"
echo ""
echo -e "${GREEN}🎉 FERTIG! Alles bereit für den Einsatz!${NC}"
echo ""


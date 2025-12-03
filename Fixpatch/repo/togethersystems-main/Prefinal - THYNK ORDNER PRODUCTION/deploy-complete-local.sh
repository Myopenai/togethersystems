#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════╗
# ║                                                                   ║
# ║     THYNK ORDERS - COMPLETE LOCAL DEPLOYMENT                      ║
# ║                                                                   ║
# ║     Erstellt komplette lokale Application (OHNE SERVER)           ║
# ║     Click & Run - Funktioniert direkt im Browser                  ║
# ║                                                                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

set -e  # Stop bei Fehlern

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variablen
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$SCRIPT_DIR/thynk-orders-local"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   🚀 THYNK ORDERS - COMPLETE LOCAL DEPLOYMENT${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Prüfe ob Deploy-Ordner existiert, lösche wenn ja
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}⚠️  Deploy-Ordner existiert bereits. Lösche...${NC}"
    rm -rf "$DEPLOY_DIR"
fi

# 2. Erstelle Deploy-Ordner-Struktur
echo -e "${CYAN}📁 Erstelle Ordner-Struktur...${NC}"
mkdir -p "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/docs"
mkdir -p "$DEPLOY_DIR/config"
mkdir -p "$DEPLOY_DIR/backups"

# 3. Kopiere Haupt-HTML-Datei
echo -e "${CYAN}📄 Kopiere Haupt-Application...${NC}"
if [ -f "$SCRIPT_DIR/THYNK-ORDERS-COMPLETE.html" ]; then
    cp "$SCRIPT_DIR/THYNK-ORDERS-COMPLETE.html" "$DEPLOY_DIR/index.html"
    echo -e "${GREEN}✅ index.html kopiert${NC}"
else
    echo -e "${RED}❌ THYNK-ORDERS-COMPLETE.html nicht gefunden!${NC}"
    exit 1
fi

# 4. Kopiere Dokumentationen
echo -e "${CYAN}📚 Kopiere Dokumentationen...${NC}"

# Deutsch
if [ -f "$SCRIPT_DIR/DOKUMENTATION-COMPLETE-DE.md" ]; then
    cp "$SCRIPT_DIR/DOKUMENTATION-COMPLETE-DE.md" "$DEPLOY_DIR/docs/"
    echo -e "${GREEN}✅ DOKUMENTATION-COMPLETE-DE.md kopiert${NC}"
fi

if [ -f "$SCRIPT_DIR/ANLEITUNG-FUER-DUMMIES.md" ]; then
    cp "$SCRIPT_DIR/ANLEITUNG-FUER-DUMMIES.md" "$DEPLOY_DIR/docs/"
    echo -e "${GREEN}✅ ANLEITUNG-FUER-DUMMIES.md kopiert${NC}"
fi

# Nederlands
if [ -f "$SCRIPT_DIR/DOKUMENTATION-COMPLETE-NL.md" ]; then
    cp "$SCRIPT_DIR/DOKUMENTATION-COMPLETE-NL.md" "$DEPLOY_DIR/docs/"
    echo -e "${GREEN}✅ DOKUMENTATION-COMPLETE-NL.md kopiert${NC}"
fi

# English
if [ -f "$SCRIPT_DIR/DOKUMENTATION-COMPLETE-EN.md" ]; then
    cp "$SCRIPT_DIR/DOKUMENTATION-COMPLETE-EN.md" "$DEPLOY_DIR/docs/"
    echo -e "${GREEN}✅ DOKUMENTATION-COMPLETE-EN.md kopiert${NC}"
fi

# Technische Dokumentationen
if [ -f "$SCRIPT_DIR/DATENBANK-DOKUMENTATION.md" ]; then
    cp "$SCRIPT_DIR/DATENBANK-DOKUMENTATION.md" "$DEPLOY_DIR/docs/"
fi
if [ -f "$SCRIPT_DIR/UMBAU-ANPASSUNGEN-ANLEITUNG.md" ]; then
    cp "$SCRIPT_DIR/UMBAU-ANPASSUNGEN-ANLEITUNG.md" "$DEPLOY_DIR/docs/"
fi

# 5. Kopiere README-Dateien
echo -e "${CYAN}📋 Kopiere README-Dateien...${NC}"
for readme in README-DE.md README-NL.md README-EN.md; do
    if [ -f "$SCRIPT_DIR/$readme" ]; then
        cp "$SCRIPT_DIR/$readme" "$DEPLOY_DIR/"
        echo -e "${GREEN}✅ $readme kopiert${NC}"
    fi
done

# 6. Erstelle START-HIER.txt
echo -e "${CYAN}📝 Erstelle START-HIER.txt...${NC}"
cat > "$DEPLOY_DIR/START-HIER.txt" << 'EOF'
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🚀 THYNK ORDERS - LOCAL APPLICATION                           ║
║                                                                   ║
║     KEIN SERVER NÖTIG! - CLICK & RUN!                             ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

📁 STARTEN:

1. Doppelklick auf: index.html

ODER

2. Rechtsklick → "Öffnen mit" → Browser wählen

✅ FERTIG!

Die Application öffnet sich direkt im Browser.
Alles funktioniert lokal - kein Server nötig!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 DOKUMENTATION:

- docs/DOKUMENTATION-COMPLETE-DE.md (Deutsch)
- docs/DOKUMENTATION-COMPLETE-NL.md (Nederlands)
- docs/DOKUMENTATION-COMPLETE-EN.md (English)
- docs/ANLEITUNG-FUER-DUMMIES.md (Für Anfänger)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FUNKTIONEN:

✅ Bestellungen erstellen
✅ Bestellungen verwalten
✅ Warenkorb
✅ Statistiken
✅ Export/Import (Backup)
✅ Lokale Datenspeicherung

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ALLES FUNKTIONIERT LOKAL - KEIN SERVER NÖTIG!
EOF
echo -e "${GREEN}✅ START-HIER.txt erstellt${NC}"

# 7. Erstelle README.md für Deployment
echo -e "${CYAN}📝 Erstelle README.md...${NC}"
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# 🛒 THYNK ORDERS - Local Application

**Komplette lokale Bestellsystem-Application - KEIN SERVER NÖTIG!**

---

## 🚀 SCHNELLSTART

1. **Doppelklick** auf `index.html`
2. Fertig! ✅

Die Application öffnet sich direkt im Browser und funktioniert komplett lokal.

---

## ✅ FUNKTIONEN

- ✅ Bestellungen erstellen & verwalten
- ✅ Warenkorb-System
- ✅ Statistiken
- ✅ Export/Import (Backup)
- ✅ Lokale Datenspeicherung (localStorage)

---

## 📚 DOKUMENTATION

Alle Dokumentationen finden Sie im `docs/` Ordner:

- **Deutsch:** `docs/DOKUMENTATION-COMPLETE-DE.md`
- **Nederlands:** `docs/DOKUMENTATION-COMPLETE-NL.md`
- **English:** `docs/DOKUMENTATION-COMPLETE-EN.md`
- **Für Anfänger:** `docs/ANLEITUNG-FUER-DUMMIES.md`

---

## 💾 DATEN-SICHERUNG

**WICHTIG:** Regelmäßig Backups erstellen!

1. Gehen Sie in der Application zu "⚙️ Einstellungen"
2. Klicken Sie auf "💾 Backup erstellen"
3. Die JSON-Datei wird heruntergeladen
4. Bewahren Sie diese Datei sicher auf!

---

## 🔧 TECHNISCH

- **Sprache:** HTML, CSS, JavaScript (Vanilla)
- **Daten-Speicherung:** Browser localStorage
- **Server:** NICHT NÖTIG - komplett lokal!
- **Browser:** Alle modernen Browser (Chrome, Firefox, Edge, Safari)

---

## 📦 DEPLOYMENT

Dieser Ordner kann direkt verwendet werden:
- ✅ Auf USB-Stick kopieren
- ✅ In Cloud-Speicher hochladen
- ✅ Auf anderen Computer kopieren
- ✅ Auf Webserver hochladen (optional)

---

**Version:** 1.0.0  
**Status:** ✅ Vollständig funktionsfähig - Kein Server nötig!
EOF
echo -e "${GREEN}✅ README.md erstellt${NC}"

# 8. Erstelle VERSION-Datei
echo -e "${CYAN}📝 Erstelle VERSION-Datei...${NC}"
cat > "$DEPLOY_DIR/VERSION.txt" << EOF
THYNK ORDERS - Local Application
Version: 1.0.0
Build: $TIMESTAMP
Deployed: $(date +"%Y-%m-%d %H:%M:%S")
Type: Local Standalone (No Server)
EOF
echo -e "${GREEN}✅ VERSION.txt erstellt${NC}"

# 9. Erstelle Backup-Verzeichnis-Hinweis
cat > "$DEPLOY_DIR/backups/README.txt" << 'EOF'
BACKUP-ORDNER

Speichern Sie hier Ihre exportierten Backups aus der Application.

Um Backup zu erstellen:
1. Application öffnen
2. Zu "⚙️ Einstellungen" gehen
3. "💾 Backup erstellen" klicken
4. Datei hier speichern
EOF

# 10. Zusammenfassung
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅✅✅ DEPLOYMENT ERFOLGREICH ABGESCHLOSSEN! ✅✅✅${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📁 DEPLOYMENT-ORDNER:${NC}"
echo -e "   $DEPLOY_DIR"
echo ""
echo -e "${YELLOW}🚀 STARTEN:${NC}"
echo -e "   → Doppelklick auf: $DEPLOY_DIR/index.html"
echo ""
echo -e "${YELLOW}📚 DOKUMENTATION:${NC}"
echo -e "   → $DEPLOY_DIR/docs/"
echo ""
echo -e "${YELLOW}✅ ENTHALTEN:${NC}"
echo -e "   ✅ Haupt-Application (index.html)"
echo -e "   ✅ Komplette Dokumentation (3 Sprachen)"
echo -e "   ✅ README-Dateien"
echo -e "   ✅ Backup-Ordner"
echo -e "   ✅ Konfiguration"
echo ""
echo -e "${GREEN}🎉 FERTIG! Die Application ist bereit zum Verwenden!${NC}"
echo ""


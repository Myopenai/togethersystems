#!/bin/bash
# T,. OSOTOSOS Linux Installer Creator
# Erstellt DEB oder RPM Package

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}T,. OSOTOSOS Linux Installer Creator${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

BUILD_DIR="../build/linux-amd64"
INSTALLER_DIR="../installers/linux"
APP_NAME="ostosos-server"
VERSION="1.0.0"

# Prüfe ob Binary existiert
if [ ! -f "$BUILD_DIR/$APP_NAME" ]; then
    echo -e "${RED}FEHLER: Binary nicht gefunden${NC}"
    echo -e "${YELLOW}Bitte erst Build ausführen: ../build-all.sh${NC}"
    exit 1
fi

# Erstelle Installer-Verzeichnis
mkdir -p "$INSTALLER_DIR"

echo -e "${CYAN}Erstelle Linux Installer...${NC}"

# DEB Package erstellen
echo -e "${CYAN}Erstelle DEB Package...${NC}"

DEB_DIR="$INSTALLER_DIR/deb-package"
if [ -d "$DEB_DIR" ]; then
    rm -rf "$DEB_DIR"
fi

mkdir -p "$DEB_DIR/DEBIAN"
mkdir -p "$DEB_DIR/usr/bin"
mkdir -p "$DEB_DIR/usr/share/applications"
mkdir -p "$DEB_DIR/usr/share/doc/ostosos-server"

# Kopiere Binary
cp "$BUILD_DIR/$APP_NAME" "$DEB_DIR/usr/bin/$APP_NAME"
chmod +x "$DEB_DIR/usr/bin/$APP_NAME"

# Erstelle control file
cat > "$DEB_DIR/DEBIAN/control" <<EOF
Package: ostosos-server
Version: $VERSION
Section: net
Priority: optional
Architecture: amd64
Depends: libc6
Maintainer: Together Systems <support@tel1.nl>
Description: OSTOSOS Server - Universal Web Server
 T,. OSOTOSOS Server ist ein universeller Web-Server
 für alle Plattformen. Einfach, schnell und zuverlässig.
Homepage: https://tel1.nl
EOF

# Erstelle postinst script (Auto-Start nach Installation)
cat > "$DEB_DIR/DEBIAN/postinst" <<EOF
#!/bin/bash
echo "OSTOSOS Server $VERSION wurde installiert."
echo "Starten mit: $APP_NAME"
echo "Der Server läuft auf: http://localhost:8080"
exit 0
EOF
chmod +x "$DEB_DIR/DEBIAN/postinst"

# Erstelle Desktop Entry
cat > "$DEB_DIR/usr/share/applications/ostosos-server.desktop" <<EOF
[Desktop Entry]
Name=OSTOSOS Server
Comment=Universal Web Server
Exec=/usr/bin/$APP_NAME
Icon=application-default-icon
Terminal=true
Type=Application
Categories=Network;Server;
EOF

# Erstelle README
cat > "$DEB_DIR/usr/share/doc/ostosos-server/README" <<EOF
OSTOSOS Server $VERSION

Starten:
  $APP_NAME

Port ändern:
  $APP_NAME 8080

T,.&T,,.&T,,,.T. - Together Systems
EOF

# Erstelle DEB Package
DEB_FILE="$INSTALLER_DIR/ostosos-server_${VERSION}_amd64.deb"
dpkg-deb --build "$DEB_DIR" "$DEB_FILE" 2>/dev/null || {
    echo -e "${YELLOW}WARNUNG: dpkg-deb nicht verfügbar, erstelle TAR.GZ statt DEB${NC}"
    cd "$INSTALLER_DIR"
    tar -czf "ostosos-server-$VERSION-linux.tar.gz" \
        -C "$DEB_DIR" \
        usr/bin/$APP_NAME \
        usr/share/applications/ostosos-server.desktop \
        usr/share/doc/ostosos-server/README
    cd - > /dev/null
    echo -e "${GREEN}✓ TAR.GZ erstellt${NC}"
}

if [ -f "$DEB_FILE" ]; then
    echo -e "${GREEN}✓ DEB Package erstellt: $DEB_FILE${NC}"
fi

# Cleanup
rm -rf "$DEB_DIR"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Linux Installer erstellt!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Installer befindet sich in: $INSTALLER_DIR${NC}"
echo ""
echo -e "${YELLOW}Installation:" -ForegroundColor $YELLOW
echo -e "${CYAN}  sudo dpkg -i $DEB_FILE${NC}"
echo -e "${CYAN}  # oder mit TAR.GZ: tar -xzf ostosos-server-*.tar.gz -C /${NC}"


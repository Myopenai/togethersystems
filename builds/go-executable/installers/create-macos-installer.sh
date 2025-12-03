#!/bin/bash
# T,. OSOTOSOS macOS Installer Creator
# Erstellt DMG oder PKG Installer

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}T,. OSOTOSOS macOS Installer Creator${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

BUILD_DIR="../build/macos-arm64"
INSTALLER_DIR="../installers/macos"
APP_NAME="ostosos-server"
VERSION="1.0.0"
APP_BUNDLE="OSTOSOS Server.app"

# Prüfe ob Binary existiert (erst arm64, dann amd64)
if [ ! -f "$BUILD_DIR/$APP_NAME" ]; then
    BUILD_DIR="../build/macos-amd64"
    if [ ! -f "$BUILD_DIR/$APP_NAME" ]; then
        echo -e "${RED}FEHLER: Binary nicht gefunden${NC}"
        echo -e "${YELLOW}Bitte erst Build ausführen: ../build-all.sh${NC}"
        exit 1
    fi
fi

# Erstelle Installer-Verzeichnis
mkdir -p "$INSTALLER_DIR"

echo -e "${CYAN}Erstelle macOS Installer...${NC}"

# Erstelle App Bundle
APP_PATH="$INSTALLER_DIR/$APP_BUNDLE"
if [ -d "$APP_PATH" ]; then
    rm -rf "$APP_PATH"
fi

mkdir -p "$APP_PATH/Contents/MacOS"
mkdir -p "$APP_PATH/Contents/Resources"

# Kopiere Binary
cp "$BUILD_DIR/$APP_NAME" "$APP_PATH/Contents/MacOS/$APP_NAME"
chmod +x "$APP_PATH/Contents/MacOS/$APP_NAME"

# Erstelle Info.plist
cat > "$APP_PATH/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>$APP_NAME</string>
    <key>CFBundleIdentifier</key>
    <string>com.togethersystems.ostosos</string>
    <key>CFBundleName</key>
    <string>OSTOSOS Server</string>
    <key>CFBundleVersion</key>
    <string>$VERSION</string>
    <key>CFBundleShortVersionString</key>
    <string>$VERSION</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo -e "${GREEN}✓ App Bundle erstellt: $APP_PATH${NC}"

# Erstelle DMG
echo -e "${CYAN}Erstelle DMG...${NC}"

DMG_PATH="$INSTALLER_DIR/ostosos-server-$VERSION-macos.dmg"
DMG_DIR="$INSTALLER_DIR/dmg-temp"

if [ -d "$DMG_DIR" ]; then
    rm -rf "$DMG_DIR"
fi
mkdir -p "$DMG_DIR"

# Kopiere App Bundle
cp -R "$APP_PATH" "$DMG_DIR/"

# Erstelle README
cat > "$DMG_DIR/README.txt" <<EOF
OSTOSOS Server $VERSION

Installation:
1. Ziehe "OSTOSOS Server.app" in den "Applications" Ordner
2. Öffne "OSTOSOS Server.app" aus dem Applications Ordner
3. Der Server startet automatisch auf http://localhost:8080

T,.&T,,.&T,,,.T. - Together Systems
EOF

# Erstelle DMG
if [ -f "$DMG_PATH" ]; then
    rm "$DMG_PATH"
fi

hdiutil create -volname "OSTOSOS Server $VERSION" \
    -srcfolder "$DMG_DIR" \
    -ov -format UDZO \
    "$DMG_PATH" || {
    echo -e "${YELLOW}WARNUNG: hdiutil nicht verfügbar, erstelle ZIP statt DMG${NC}"
    cd "$INSTALLER_DIR"
    zip -r "ostosos-server-$VERSION-macos.zip" "$APP_BUNDLE" README.txt
    cd - > /dev/null
}

# Cleanup
rm -rf "$DMG_DIR"

echo -e "${GREEN}✓ DMG erstellt: $DMG_PATH${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ macOS Installer erstellt!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Installer befindet sich in: $INSTALLER_DIR${NC}"


#!/bin/bash
# ============================================
# FABRIKAGE STANDARD TÜV - Build All Platforms (Python)
# ============================================
# Bash Script für Linux/macOS
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}[.SYSTEMS.T.SYSTEMS.] FABRIKAGE BUILD${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${YELLOW}Fabrikation Standard TÜV MCP${NC}"
echo -e "${YELLOW}Python Builds für alle Plattformen${NC}"
echo ""

# Prüfe Python
echo -e "${CYAN}Prüfe Python Installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}FEHLER: Python3 ist nicht installiert!${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Python gefunden: $(python3 --version)${NC}"

# Prüfe PyInstaller
echo -e "${CYAN}Prüfe PyInstaller...${NC}"
if ! command -v pyinstaller &> /dev/null; then
    echo -e "${YELLOW}Installiere PyInstaller...${NC}"
    pip3 install pyinstaller
fi
echo -e "${GREEN}[OK] PyInstaller gefunden${NC}"
echo ""

# Build für aktuelle Plattform
BUILD_DIR="build"
APP_NAME="ostosos-server"
SCRIPT_PATH="python-server.py"

mkdir -p "$BUILD_DIR"

CURRENT_OS=$(uname -s | tr '[:upper:]' '[:lower:]')
CURRENT_ARCH=$(uname -m)

if [ "$CURRENT_ARCH" = "x86_64" ]; then
    CURRENT_ARCH="amd64"
elif [ "$CURRENT_ARCH" = "aarch64" ]; then
    CURRENT_ARCH="arm64"
fi

PLATFORM_DIR="$BUILD_DIR/${CURRENT_OS}-${CURRENT_ARCH}"
mkdir -p "$PLATFORM_DIR"

echo -e "${YELLOW}Building für: $CURRENT_OS ($CURRENT_ARCH)...${NC}"

pyinstaller --onefile \
    --name "$APP_NAME" \
    --distpath "$PLATFORM_DIR" \
    --workpath "$PLATFORM_DIR/build-temp" \
    --clean \
    --noconfirm \
    "$SCRIPT_PATH"

if [ $? -eq 0 ]; then
    OUTPUT_FILE="$PLATFORM_DIR/$APP_NAME"
    if [ -f "$OUTPUT_FILE" ]; then
        echo -e "${GREEN}[OK] Build erfolgreich: $OUTPUT_FILE${NC}"
    else
        echo -e "${RED}[FAIL] Binary nicht gefunden${NC}"
    fi
else
    echo -e "${RED}[FAIL] Build fehlgeschlagen${NC}"
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT${NC}"
echo -e "${CYAN}Original: https://tinyurl.com/BUGCOMPANY${NC}"
echo ""


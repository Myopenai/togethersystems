#!/bin/bash
# T,. OSOTOSOS Universal Go Build Pipeline - Bash Script
# One-Click Setup für alle Plattformen

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}T,. OSOTOSOS Universal Go Build Pipeline${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Prüfe ob Go installiert ist
echo -e "${CYAN}Prüfe Go Installation...${NC}"
if ! command -v go &> /dev/null; then
    echo -e "${RED}FEHLER: Go ist nicht installiert!${NC}"
    echo -e "${YELLOW}Bitte installiere Go von: https://golang.org/dl/${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Go gefunden: $(go version)${NC}"
echo ""

# Build-Verzeichnisse erstellen
BUILD_DIR="build"
INSTALLER_DIR="installers"

mkdir -p "$BUILD_DIR"
mkdir -p "$INSTALLER_DIR"

# Application Name
APP_NAME="ostosos-server"
VERSION="1.0.0"

echo -e "${CYAN}Building für alle Plattformen...${NC}"
echo ""

# Windows Builds
echo -e "${YELLOW}Building Windows Binaries...${NC}"

echo -e "${CYAN}  → Windows (amd64)...${NC}"
mkdir -p "$BUILD_DIR/windows-amd64"
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -H windowsgui" -o "$BUILD_DIR/windows-amd64/$APP_NAME.exe" main.go
echo -e "${GREEN}    ✓ Windows (amd64) Build erfolgreich${NC}"

echo -e "${CYAN}  → Windows (arm64)...${NC}"
mkdir -p "$BUILD_DIR/windows-arm64"
GOOS=windows GOARCH=arm64 go build -ldflags="-s -w -H windowsgui" -o "$BUILD_DIR/windows-arm64/$APP_NAME.exe" main.go
echo -e "${GREEN}    ✓ Windows (arm64) Build erfolgreich${NC}"

echo ""

# macOS Builds
echo -e "${YELLOW}Building macOS Binaries...${NC}"

echo -e "${CYAN}  → macOS (amd64)...${NC}"
mkdir -p "$BUILD_DIR/macos-amd64"
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o "$BUILD_DIR/macos-amd64/$APP_NAME" main.go
echo -e "${GREEN}    ✓ macOS (amd64) Build erfolgreich${NC}"

echo -e "${CYAN}  → macOS (arm64/Apple Silicon)...${NC}"
mkdir -p "$BUILD_DIR/macos-arm64"
GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o "$BUILD_DIR/macos-arm64/$APP_NAME" main.go
echo -e "${GREEN}    ✓ macOS (arm64) Build erfolgreich${NC}"

echo ""

# Linux Builds
echo -e "${YELLOW}Building Linux Binaries...${NC}"

echo -e "${CYAN}  → Linux (amd64)...${NC}"
mkdir -p "$BUILD_DIR/linux-amd64"
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o "$BUILD_DIR/linux-amd64/$APP_NAME" main.go
echo -e "${GREEN}    ✓ Linux (amd64) Build erfolgreich${NC}"

echo -e "${CYAN}  → Linux (arm64)...${NC}"
mkdir -p "$BUILD_DIR/linux-arm64"
GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o "$BUILD_DIR/linux-arm64/$APP_NAME" main.go
echo -e "${GREEN}    ✓ Linux (arm64) Build erfolgreich${NC}"

echo -e "${CYAN}  → Linux (386)...${NC}"
mkdir -p "$BUILD_DIR/linux-386"
GOOS=linux GOARCH=386 go build -ldflags="-s -w" -o "$BUILD_DIR/linux-386/$APP_NAME" main.go
echo -e "${GREEN}    ✓ Linux (386) Build erfolgreich${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Build Pipeline abgeschlossen!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Build-Artefakte befinden sich in: $BUILD_DIR${NC}"
echo ""

# Liste alle erstellten Binaries auf
echo -e "${YELLOW}Erstellte Binaries:${NC}"
find "$BUILD_DIR" -type f -executable | while read -r file; do
    size=$(du -h "$file" | cut -f1)
    echo -e "${CYAN}  → $file ($size)${NC}"
done

echo ""
echo -e "${GREEN}T,.&T,,.&T,,,.T. - Together Systems${NC}"


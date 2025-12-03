#!/bin/bash
# T,. OSTOSOS - Build für alle Plattformen
# MASTER SETTINGS aktiviert.

set -e

echo "T,. OSTOSOS - Build für alle Plattformen"
echo "MASTER SETTINGS aktiviert."
echo ""

# Prüfe Go-Installation
echo "🔍 Prüfe Go-Installation..."
if ! command -v go &> /dev/null; then
    echo "❌ Go ist nicht installiert!"
    echo "Bitte installiere Go von https://golang.org/dl/"
    exit 1
fi
GO_VERSION=$(go version)
echo "✅ Go gefunden: $GO_VERSION"
echo ""

# Erstelle Produktionsordner-Struktur
PRODUCTION_ROOT="Produktionsordner"
BUILD_DATE=$(date +"%Y%m%d-%H%M%S")
BUILD_FOLDER="$PRODUCTION_ROOT/OSTOSOS-Build-$BUILD_DATE"

echo "📁 Erstelle Produktionsordner-Struktur..."
mkdir -p "$BUILD_FOLDER/Windows"
mkdir -p "$BUILD_FOLDER/macOS"
mkdir -p "$BUILD_FOLDER/Linux"
mkdir -p "$BUILD_FOLDER/Universal"
mkdir -p "$BUILD_FOLDER/Source"
echo "✅ Ordner-Struktur erstellt"
echo ""

# Build-Flags
LDFLAGS="-s -w"

# Windows Build
echo "🔨 Erstelle Windows Build..."
GOOS=windows GOARCH=amd64 go build -ldflags="$LDFLAGS" -o "$BUILD_FOLDER/Windows/OSTOSOS-Setup.exe" OSTOSOS-SETUP.go
if [ $? -eq 0 ]; then
    echo "✅ Windows Build erfolgreich: $BUILD_FOLDER/Windows/OSTOSOS-Setup.exe"
else
    echo "⚠️ Windows Build fehlgeschlagen (wird übersprungen)"
fi
echo ""

# macOS Build
echo "🔨 Erstelle macOS Build..."
GOOS=darwin GOARCH=amd64 go build -ldflags="$LDFLAGS" -o "$BUILD_FOLDER/macOS/OSTOSOS-Setup.app" OSTOSOS-SETUP.go
if [ $? -eq 0 ]; then
    echo "✅ macOS Build erfolgreich: $BUILD_FOLDER/macOS/OSTOSOS-Setup.app"
else
    echo "⚠️ macOS Build fehlgeschlagen (wird übersprungen)"
fi
echo ""

# Linux Build
echo "🔨 Erstelle Linux Build..."
GOOS=linux GOARCH=amd64 go build -ldflags="$LDFLAGS" -o "$BUILD_FOLDER/Linux/OSTOSOS-Setup.bin" OSTOSOS-SETUP.go
if [ $? -eq 0 ]; then
    echo "✅ Linux Build erfolgreich: $BUILD_FOLDER/Linux/OSTOSOS-Setup.bin"
else
    echo "⚠️ Linux Build fehlgeschlagen (wird übersprungen)"
fi
echo ""

# Kopiere Source-Dateien
echo "📋 Kopiere Source-Dateien..."
cp OSTOSOS-SETUP.go "$BUILD_FOLDER/Source/"
cp BUILD-EXECUTABLE.md "$BUILD_FOLDER/Source/"
echo "✅ Source-Dateien kopiert"
echo ""

# Erstelle Build-Info
cat > "$BUILD_FOLDER/BUILD-INFO.json" <<EOF
{
  "buildDate": "$BUILD_DATE",
  "buildType": "release",
  "goVersion": "$GO_VERSION",
  "platforms": [
    {"name": "Windows", "file": "OSTOSOS-Setup.exe", "path": "$BUILD_FOLDER/Windows"},
    {"name": "macOS", "file": "OSTOSOS-Setup.app", "path": "$BUILD_FOLDER/macOS"},
    {"name": "Linux", "file": "OSTOSOS-Setup.bin", "path": "$BUILD_FOLDER/Linux"}
  ]
}
EOF

echo "✅ BUILD ABGESCHLOSSEN!"
echo ""
echo "📁 Build-Ordner: $BUILD_FOLDER"
echo ""
echo "📦 Erstellte Builds:"
find "$BUILD_FOLDER" -type f \( -name "*.exe" -o -name "*.app" -o -name "*.bin" \) -exec echo "  ✅ {}" \;


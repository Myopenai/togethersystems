#!/usr/bin/env bash
# ============================================
# [.SYSTEMS.T.SYSTEMS.] ostosos Pitch - Linux/macOS/Raspberry Pi
# ============================================
# Auto-Auswahl der richtigen Binary
# ============================================

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$ROOT/bin"

OS="$(uname -s)"
ARCH="$(uname -m)"

TARGET_DIR=""
BINARY_NAME="ostosos-server"

echo "========================================"
echo "[.SYSTEMS.T.SYSTEMS.] ostosos Pitch"
echo "========================================"
echo "OS: $OS"
echo "Arch: $ARCH"
echo "========================================"
echo ""

case "$OS" in
  Linux)
    case "$ARCH" in
      x86_64)   TARGET_DIR="linux-amd64" ;;
      i386|i686) TARGET_DIR="linux-386" ;;
      armv6l|armv7l) TARGET_DIR="linux-arm" ;;
      aarch64|arm64) TARGET_DIR="linux-arm64" ;;
      *) 
        echo "Unsupported Linux arch: $ARCH"
        echo "Supported: x86_64, i386/i686, armv6l/armv7l, aarch64/arm64"
        exit 1 
        ;;
    esac
    ;;
  Darwin)
    case "$ARCH" in
      x86_64) TARGET_DIR="macos-amd64" ;;
      arm64)  TARGET_DIR="macos-arm64" ;;
      *) 
        echo "Unsupported macOS arch: $ARCH"
        echo "Supported: x86_64, arm64"
        exit 1 
        ;;
    esac
    ;;
  *)
    echo "Unsupported OS: $OS"
    echo "Supported: Linux, Darwin (macOS)"
    exit 1
    ;;
esac

BINARY="$BIN_DIR/$TARGET_DIR/$BINARY_NAME"

if [ ! -f "$BINARY" ]; then
  echo "Binary not found: $BINARY"
  echo ""
  echo "Available binaries:"
  ls -la "$BIN_DIR"/*/ 2>/dev/null | grep "$BINARY_NAME" || echo "  (none found)"
  exit 1
fi

if [ ! -x "$BINARY" ]; then
  echo "Making binary executable: $BINARY"
  chmod +x "$BINARY"
fi

echo "Starting ostosos Pitch: $TARGET_DIR"
echo "Binary: $BINARY"
echo ""

# Server im Hintergrund starten
"$BINARY" &
SERVER_PID=$!

# Kurz warten, damit Server hochkommt
sleep 2

# Prüfe ob Server läuft
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "[FEHLER] Server konnte nicht gestartet werden"
  exit 1
fi

# Browser öffnen (Linux + macOS)
URL="http://127.0.0.1:9090"
echo "Opening browser: $URL"

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" &
elif command -v open >/dev/null 2>&1; then
  open "$URL" &
else
  echo "[WARN] Kein Browser-Launcher gefunden"
  echo "Bitte öffnen Sie manuell: $URL"
fi

echo ""
echo "========================================"
echo "Server läuft (PID $SERVER_PID)"
echo "URL: $URL"
echo ""
echo "Zum Stoppen: Ctrl+C"
echo "========================================"
echo ""

# Warte auf Server (wird durch Ctrl+C beendet)
trap "kill $SERVER_PID 2>/dev/null; exit" INT TERM
wait $SERVER_PID


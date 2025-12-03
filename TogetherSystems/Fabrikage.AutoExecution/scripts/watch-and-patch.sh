#!/bin/bash
# ============================================================================
# WATCH AND PATCH
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Watch and Patch - Überwacht Datei-Änderungen und triggert Auto-Fix
# ============================================================================

set -e

WATCH_DIR="."
DISPATCHER="Fabrikage.AutoExecution/scripts/dispatch-error-events.sh"

echo "T,. Watch and Patch: Überwache Datei-Änderungen..."

# Überwache Datei-Änderungen
if command -v fswatch &> /dev/null; then
  # macOS/Linux mit fswatch
  fswatch -o "$WATCH_DIR" | while read f; do
    echo "T,. Datei geändert: $f"
    # Trigger Error Event Processing
    bash "$DISPATCHER" &
  done
elif command -v inotifywait &> /dev/null; then
  # Linux mit inotifywait
  inotifywait -m -r -e modify,create,delete "$WATCH_DIR" | while read path action file; do
    echo "T,. Datei geändert: $path$file ($action)"
    # Trigger Error Event Processing
    bash "$DISPATCHER" &
  done
else
  echo "T,. Warnung: Kein File-Watcher verfügbar (fswatch oder inotifywait)"
  echo "T,. Verwende Polling-Modus..."
  
  # Polling-Modus
  LAST_CHECK=$(date +%s)
  while true; do
    CURRENT_CHECK=$(date +%s)
    if [ $((CURRENT_CHECK - LAST_CHECK)) -ge 5 ]; then
      # Prüfe auf Änderungen
      bash "$DISPATCHER" &
      LAST_CHECK=$CURRENT_CHECK
    fi
    sleep 1
  done
fi


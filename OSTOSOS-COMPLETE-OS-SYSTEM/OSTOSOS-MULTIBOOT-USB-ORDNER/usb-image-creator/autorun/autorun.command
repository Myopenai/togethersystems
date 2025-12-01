#!/bin/bash
# T,. OSTOSOS - macOS Auto-Start
# Startet Live-System oder zeigt Installationsoption

cd "$(dirname "$0")"

# Prüfe ob bereits installiert
if [ -d "/Applications/OSTOSOS" ]; then
    # Bereits installiert - Frage ob Live-System oder installierte Version
    osascript -e 'display dialog "OSTOSOS ist bereits installiert.\n\nWählen Sie eine Option:" buttons {"Live-System", "Installiert", "Abbrechen"} default button "Live-System"'
    BUTTON=$?
    if [ $BUTTON -eq 1 ]; then
        # Live-System
        open "./ostosos/LIVE-SYSTEM-INSTALLER.html"
    elif [ $BUTTON -eq 2 ]; then
        # Installiert
        open "/Applications/OSTOSOS/OSTOSOS-OS-COMPLETE-SYSTEM.html"
    fi
else
    # Nicht installiert - Zeige Installationsoption
    osascript -e 'display dialog "OSTOSOS Live-System vom USB-Stick\n\nMöchten Sie:" buttons {"Live-System", "Installieren", "Abbrechen"} default button "Live-System"'
    BUTTON=$?
    if [ $BUTTON -eq 1 ]; then
        # Live-System
        open "./ostosos/LIVE-SYSTEM-INSTALLER.html"
    elif [ $BUTTON -eq 2 ]; then
        # Installation
        open "./ostosos/LIVE-SYSTEM-INSTALLER.html?mode=install"
    fi
fi

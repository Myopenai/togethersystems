#!/bin/bash
# T,. OSTOSOS - Linux Auto-Start
# Startet Live-System oder zeigt Installationsoption

cd "$(dirname "$0")"

# Prüfe ob bereits installiert
if [ -d "/opt/ostosos" ] || [ -d "$HOME/.local/share/ostosos" ]; then
    # Bereits installiert - Frage ob Live-System oder installierte Version
    CHOICE=$(zenity --list --title="OSTOSOS" --text="OSTOSOS ist bereits installiert.\n\nWählen Sie eine Option:" --column="Option" "Live-System" "Installiert" "Abbrechen" --width=400 --height=200)
    
    case "$CHOICE" in
        "Live-System")
            xdg-open "./ostosos/LIVE-SYSTEM-INSTALLER.html" 2>/dev/null || firefox "./ostosos/LIVE-SYSTEM-INSTALLER.html" 2>/dev/null || chromium "./ostosos/LIVE-SYSTEM-INSTALLER.html" 2>/dev/null
            ;;
        "Installiert")
            if [ -f "/opt/ostosos/OSTOSOS-OS-COMPLETE-SYSTEM.html" ]; then
                xdg-open "/opt/ostosos/OSTOSOS-OS-COMPLETE-SYSTEM.html" 2>/dev/null
            elif [ -f "$HOME/.local/share/ostosos/OSTOSOS-OS-COMPLETE-SYSTEM.html" ]; then
                xdg-open "$HOME/.local/share/ostosos/OSTOSOS-OS-COMPLETE-SYSTEM.html" 2>/dev/null
            fi
            ;;
    esac
else
    # Nicht installiert - Zeige Installationsoption
    CHOICE=$(zenity --list --title="OSTOSOS Live System" --text="OSTOSOS Live-System vom USB-Stick\n\nMöchten Sie:" --column="Option" "Live-System" "Installieren" "Abbrechen" --width=400 --height=200)
    
    case "$CHOICE" in
        "Live-System")
            xdg-open "./ostosos/LIVE-SYSTEM-INSTALLER.html" 2>/dev/null || firefox "./ostosos/LIVE-SYSTEM-INSTALLER.html" 2>/dev/null || chromium "./ostosos/LIVE-SYSTEM-INSTALLER.html" 2>/dev/null
            ;;
        "Installieren")
            xdg-open "./ostosos/LIVE-SYSTEM-INSTALLER.html?mode=install" 2>/dev/null || firefox "./ostosos/LIVE-SYSTEM-INSTALLER.html?mode=install" 2>/dev/null || chromium "./ostosos/LIVE-SYSTEM-INSTALLER.html?mode=install" 2>/dev/null
            ;;
    esac
fi

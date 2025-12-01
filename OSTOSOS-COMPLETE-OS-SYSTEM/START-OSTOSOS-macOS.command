#!/bin/bash
# T,. OSTOSOS - macOS Starter
# Startet automatisch den macOS-Installer

echo "T,. OSTOSOS - macOS Setup"
echo "=========================="
echo ""
echo "Starte Installer..."

# Prüfe ob Installer existiert
if [ -f "OSTOSOS-Setup-macOS" ]; then
    chmod +x "OSTOSOS-Setup-macOS"
    open "OSTOSOS-Setup-macOS"
elif [ -f "OSTOSOS-MULTIBOOT-USB-ORDNER/builds/macos/OSTOSOS-macOS-Setup" ]; then
    chmod +x "OSTOSOS-MULTIBOOT-USB-ORDNER/builds/macos/OSTOSOS-macOS-Setup"
    open "OSTOSOS-MULTIBOOT-USB-ORDNER/builds/macos/OSTOSOS-macOS-Setup"
else
    echo "FEHLER: Installer nicht gefunden!"
    echo "Bitte stellen Sie sicher, dass OSTOSOS-Setup-macOS im selben Ordner liegt."
    read -p "Drücken Sie Enter zum Beenden..."
    exit 1
fi

echo ""
echo "Installer gestartet!"
sleep 2


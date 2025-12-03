#!/bin/bash
# T,. OSTOSOS - Linux Starter
# Startet automatisch den Linux-Installer

echo "T,. OSTOSOS - Linux Setup"
echo "=========================="
echo ""
echo "Starte Installer..."

# Prüfe ob Installer existiert
if [ -f "OSTOSOS-Setup-Linux.bin" ]; then
    chmod +x "OSTOSOS-Setup-Linux.bin"
    ./OSTOSOS-Setup-Linux.bin
elif [ -f "OSTOSOS-MULTIBOOT-USB-ORDNER/builds/linux/OSTOSOS-Linux-Setup.bin" ]; then
    chmod +x "OSTOSOS-MULTIBOOT-USB-ORDNER/builds/linux/OSTOSOS-Linux-Setup.bin"
    ./OSTOSOS-MULTIBOOT-USB-ORDNER/builds/linux/OSTOSOS-Linux-Setup.bin
else
    echo "FEHLER: Installer nicht gefunden!"
    echo "Bitte stellen Sie sicher, dass OSTOSOS-Setup-Linux.bin im selben Ordner liegt."
    read -p "Drücken Sie Enter zum Beenden..."
    exit 1
fi

echo ""
echo "Installer gestartet!"


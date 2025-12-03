#!/bin/bash
# T,.&T,,.&T,,,. OSTOSOS - LINUX/macOS START
# Funktioniert auf Linux und macOS

echo "========================================"
echo "OSTOSOS - LINUX/macOS"
echo "T,.&T,,.&T,,,. TOGETHERSYSTEMS"
echo "========================================"
echo ""

# Wechsle ins Script-Verzeichnis
cd "$(dirname "$0")"

# Prüfe Go-Server
if [ -f "builds/go-executable/ostosos-server" ]; then
    echo "Starte OSTOSOS Server..."
    echo ""
    echo "Server laeuft auf: http://localhost:8080"
    echo ""
    sleep 2
    
    # Öffne Browser
    if command -v xdg-open > /dev/null 2>&1; then
        xdg-open http://localhost:8080 &
    elif command -v open > /dev/null 2>&1; then
        open http://localhost:8080 &
    fi
    
    echo ""
    ./builds/go-executable/ostosos-server
elif [ -f "ostosos-server" ]; then
    echo "Starte OSTOSOS Server..."
    echo ""
    echo "Server laeuft auf: http://localhost:8080"
    echo ""
    sleep 2
    
    if command -v xdg-open > /dev/null 2>&1; then
        xdg-open http://localhost:8080 &
    elif command -v open > /dev/null 2>&1; then
        open http://localhost:8080 &
    fi
    
    echo ""
    ./ostosos-server
else
    echo "Server nicht gefunden!"
    echo "Oeffne index.html direkt..."
    if [ -f "index.html" ]; then
        if command -v xdg-open > /dev/null 2>&1; then
            xdg-open index.html
        elif command -v open > /dev/null 2>&1; then
            open index.html
        else
            echo "Bitte oeffne index.html manuell im Browser"
        fi
    else
        echo "index.html nicht gefunden!"
    fi
fi




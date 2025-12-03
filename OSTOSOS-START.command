#!/bin/bash
# T,.&T,,.&T,,,. OSTOSOS - macOS START
# Funktioniert auf macOS (Doppelklick-fähig)

cd "$(dirname "$0")"

echo "========================================"
echo "OSTOSOS - macOS"
echo "T,.&T,,.&T,,,. TOGETHERSYSTEMS"
echo "========================================"
echo ""

if [ -f "builds/go-executable/ostosos-server" ]; then
    echo "Starte OSTOSOS Server..."
    echo ""
    echo "Server laeuft auf: http://localhost:8080"
    echo ""
    sleep 2
    open http://localhost:8080
    echo ""
    ./builds/go-executable/ostosos-server
elif [ -f "ostosos-server" ]; then
    echo "Starte OSTOSOS Server..."
    echo ""
    echo "Server laeuft auf: http://localhost:8080"
    echo ""
    sleep 2
    open http://localhost:8080
    echo ""
    ./ostosos-server
else
    echo "Server nicht gefunden!"
    if [ -f "index.html" ]; then
        open index.html
    fi
fi




#/usr/bin/env bash 
cd "$(dirname "$0")" 
if [ -f "ostosos-server" ]; then 
    chmod +x ostosos-server 
    ./ostosos-server & 
    sleep 2 
    echo "Server gestartet: http://127.0.0.1:9090" 
else 
    echo "[FEHLER] Server nicht gefunden" 
    exit 1 
fi 

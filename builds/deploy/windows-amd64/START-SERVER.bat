@echo off 
cd /d "%~dp0" 
if exist "ostosos-server.exe" ( 
    start "" "ostosos-server.exe" 
    timeout /t 2 /nobreak >nul 
    start "" "http://127.0.0.1:9090" 
    echo Server gestartet: http://127.0.0.1:9090 
) else ( 
    echo [FEHLER] Server nicht gefunden 
    pause 
) 

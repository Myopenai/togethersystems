@echo off
cd builds\go-executable
start "OSTOSOS Server" ostosos-server.exe
timeout /t 2 /nobreak >nul
echo.
echo ========================================
echo SERVER GESTARTET
echo ========================================
echo.
echo Server laeuft im Hintergrund
echo Oeffne im Browser: http://localhost:8080
echo.
echo Zum Beenden: Task-Manager oeffnen und
echo "ostosos-server.exe" beenden
echo.
pause




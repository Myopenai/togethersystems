@echo off
REM T,.&T,,.&T,,,. OSTOSOS - WINDOWS START
REM Funktioniert auf Windows

title OSTOSOS
echo ========================================
echo OSTOSOS - WINDOWS
echo T,.&T,,.&T,,,. TOGETHERSYSTEMS
echo ========================================
echo.

cd /d "%~dp0"

REM Prüfe Go-Server
if exist "builds\go-executable\ostosos-server.exe" (
    echo Starte OSTOSOS Server...
    echo.
    echo Server laeuft auf: http://localhost:8080
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    echo.
    "builds\go-executable\ostosos-server.exe"
) else if exist "ostosos-server.exe" (
    echo Starte OSTOSOS Server...
    echo.
    echo Server laeuft auf: http://localhost:8080
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    echo.
    ostosos-server.exe
) else (
    echo Server nicht gefunden!
    echo Oeffne index.html direkt...
    if exist "index.html" (
        start index.html
    ) else (
        echo index.html nicht gefunden!
        pause
    )
)

@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] Deploy All Servers
REM ============================================
REM Deployed alle Server auf allen Plattformen
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] DEPLOY ALL SERVERS
echo ========================================
echo Deployed alle Server auf allen Plattformen
echo ========================================
echo.

REM In das Verzeichnis der Batch wechseln
cd /d "%~dp0"
set "ROOT=%CD%"
set "DEPLOY_DIR=%ROOT%\deploy"

echo Projekt-Root: %ROOT%
echo Deploy-Verzeichnis: %DEPLOY_DIR%
echo.

REM =================================================
REM DEPLOY-VERZEICHNIS ERSTELLEN
REM =================================================
echo Erstelle Deploy-Struktur...
if exist "%DEPLOY_DIR%" (
    echo Lösche altes Deploy-Verzeichnis...
    rmdir /s /q "%DEPLOY_DIR%"
)

mkdir "%DEPLOY_DIR%" 2>nul
mkdir "%DEPLOY_DIR%\windows-amd64" 2>nul
mkdir "%DEPLOY_DIR%\windows-arm64" 2>nul
mkdir "%DEPLOY_DIR%\linux-amd64" 2>nul
mkdir "%DEPLOY_DIR%\linux-386" 2>nul
mkdir "%DEPLOY_DIR%\linux-arm64" 2>nul
mkdir "%DEPLOY_DIR%\macos-amd64" 2>nul
mkdir "%DEPLOY_DIR%\macos-arm64" 2>nul

echo [OK] Deploy-Struktur erstellt
echo.

REM =================================================
REM GO SERVERS DEPLOYEN
REM =================================================
echo ========================================
echo GO SERVERS - ALLE PLATTFORMEN
echo ========================================
echo.

set "GO_BUILD=%ROOT%\go-executable\build"
set "DEPLOY_COUNT=0"

REM Windows
if exist "%GO_BUILD%\windows-amd64\ostosos-server.exe" (
    copy "%GO_BUILD%\windows-amd64\ostosos-server.exe" "%DEPLOY_DIR%\windows-amd64\" >nul
    set /a DEPLOY_COUNT+=1
    echo   [OK] Windows amd64 deployed
) else (
    echo   [WARN] Windows amd64 nicht gefunden
)

if exist "%GO_BUILD%\windows-arm64\ostosos-server.exe" (
    copy "%GO_BUILD%\windows-arm64\ostosos-server.exe" "%DEPLOY_DIR%\windows-arm64\" >nul
    set /a DEPLOY_COUNT+=1
    echo   [OK] Windows arm64 deployed
) else (
    echo   [WARN] Windows arm64 nicht gefunden
)

REM Linux
if exist "%GO_BUILD%\linux-amd64\ostosos-server" (
    copy "%GO_BUILD%\linux-amd64\ostosos-server" "%DEPLOY_DIR%\linux-amd64\" >nul
    set /a DEPLOY_COUNT+=1
    echo   [OK] Linux amd64 deployed
) else (
    echo   [WARN] Linux amd64 nicht gefunden
)

if exist "%GO_BUILD%\linux-386\ostosos-server" (
    copy "%GO_BUILD%\linux-386\ostosos-server" "%DEPLOY_DIR%\linux-386\" >nul
    set /a DEPLOY_COUNT+=1
    echo   [OK] Linux 386 deployed
) else (
    echo   [WARN] Linux 386 nicht gefunden
)

if exist "%GO_BUILD%\linux-arm64\ostosos-server" (
    copy "%GO_BUILD%\linux-arm64\ostosos-server" "%DEPLOY_DIR%\linux-arm64\" >nul
    set /a DEPLOY_COUNT+=1
    echo   [OK] Linux arm64 deployed
) else (
    echo   [WARN] Linux arm64 nicht gefunden
)

REM macOS
if exist "%GO_BUILD%\macos-amd64\ostosos-server" (
    copy "%GO_BUILD%\macos-amd64\ostosos-server" "%DEPLOY_DIR%\macos-amd64\" >nul
    set /a DEPLOY_COUNT+=1
    echo   [OK] macOS amd64 deployed
) else (
    echo   [WARN] macOS amd64 nicht gefunden
)

if exist "%GO_BUILD%\macos-arm64\ostosos-server" (
    copy "%GO_BUILD%\macos-arm64\ostosos-server" "%DEPLOY_DIR%\macos-arm64\" >nul
    set /a DEPLOY_COUNT+=1
    echo   [OK] macOS arm64 deployed
) else (
    echo   [WARN] macOS arm64 nicht gefunden
)

echo.
echo Go Servers deployed: !DEPLOY_COUNT! / 7
echo.

REM =================================================
REM PYTHON SERVERS DEPLOYEN
REM =================================================
echo ========================================
echo PYTHON SERVERS
echo ========================================
echo.

set "PYTHON_BUILD=%ROOT%\python-executable\build\windows-amd64"
set "PYTHON_COUNT=0"

if exist "%PYTHON_BUILD%\ostosos-server.exe" (
    copy "%PYTHON_BUILD%\ostosos-server.exe" "%DEPLOY_DIR%\windows-amd64\ostosos-server-python.exe" >nul
    set /a PYTHON_COUNT+=1
    echo   [OK] Python Windows amd64 deployed
) else (
    echo   [WARN] Python Windows amd64 nicht gefunden
)

echo.
echo Python Servers deployed: !PYTHON_COUNT! / 1
echo.

REM =================================================
REM DEPLOY-SCRIPTS ERSTELLEN
REM =================================================
echo ========================================
echo DEPLOY-SCRIPTS ERSTELLEN
echo ========================================
echo.

REM Windows Deploy-Script
(
    echo @echo off
    echo REM [.SYSTEMS.T.SYSTEMS.] Deploy Server - Windows
    echo cd /d "%%~dp0"
    echo if exist "ostosos-server.exe" ^(
    echo     echo Starte Server...
    echo     start "" "ostosos-server.exe"
    echo     timeout /t 2 /nobreak ^>nul
    echo     start "" "http://127.0.0.1:9090"
    echo     echo Server gestartet: http://127.0.0.1:9090
    echo ^) else ^(
    echo     echo [FEHLER] Server-Binary nicht gefunden
    echo     pause
    echo ^)
) > "%DEPLOY_DIR%\windows-amd64\START-SERVER.bat"

(
    echo @echo off
    echo REM [.SYSTEMS.T.SYSTEMS.] Deploy Server - Windows ARM64
    echo cd /d "%%~dp0"
    echo if exist "ostosos-server.exe" ^(
    echo     echo Starte Server...
    echo     start "" "ostosos-server.exe"
    echo     timeout /t 2 /nobreak ^>nul
    echo     start "" "http://127.0.0.1:9090"
    echo     echo Server gestartet: http://127.0.0.1:9090
    echo ^) else ^(
    echo     echo [FEHLER] Server-Binary nicht gefunden
    echo     pause
    echo ^)
) > "%DEPLOY_DIR%\windows-arm64\START-SERVER.bat"

REM Linux/macOS Deploy-Script
(
    echo #!/usr/bin/env bash
    echo # [.SYSTEMS.T.SYSTEMS.] Deploy Server - Linux/macOS
    echo cd "$(dirname "$0")"
    echo if [ -f "ostosos-server" ]; then
    echo     chmod +x ostosos-server
    echo     echo "Starte Server..."
    echo     ./ostosos-server ^&
    echo     SERVER_PID=$!
    echo     sleep 2
    echo     if command -v xdg-open ^> /dev/null 2^>^&1; then
    echo         xdg-open "http://127.0.0.1:9090" ^&
    echo     elif command -v open ^> /dev/null 2^>^&1; then
    echo         open "http://127.0.0.1:9090" ^&
    echo     fi
    echo     echo "Server gestartet (PID $SERVER_PID): http://127.0.0.1:9090"
    echo     echo "Zum Stoppen: kill $SERVER_PID"
    echo else
    echo     echo "[FEHLER] Server-Binary nicht gefunden"
    echo     exit 1
    echo fi
) > "%DEPLOY_DIR%\linux-amd64\START-SERVER.sh"

copy "%DEPLOY_DIR%\linux-amd64\START-SERVER.sh" "%DEPLOY_DIR%\linux-386\START-SERVER.sh" >nul
copy "%DEPLOY_DIR%\linux-amd64\START-SERVER.sh" "%DEPLOY_DIR%\linux-arm64\START-SERVER.sh" >nul
copy "%DEPLOY_DIR%\linux-amd64\START-SERVER.sh" "%DEPLOY_DIR%\macos-amd64\START-SERVER.sh" >nul
copy "%DEPLOY_DIR%\linux-amd64\START-SERVER.sh" "%DEPLOY_DIR%\macos-arm64\START-SERVER.sh" >nul

echo [OK] Deploy-Scripts erstellt
echo.

REM =================================================
REM README ERSTELLEN
REM =================================================
(
    echo [.SYSTEMS.T.SYSTEMS.] Deploy All Servers
    echo ========================================
    echo.
    echo Deployed Server für alle Plattformen
    echo.
    echo Verzeichnisstruktur:
    echo   deploy/
    echo     windows-amd64/
    echo       ostosos-server.exe
    echo       START-SERVER.bat
    echo     windows-arm64/
    echo       ostosos-server.exe
    echo       START-SERVER.bat
    echo     linux-amd64/
    echo       ostosos-server
    echo       START-SERVER.sh
    echo     linux-386/
    echo       ostosos-server
    echo       START-SERVER.sh
    echo     linux-arm64/
    echo       ostosos-server
    echo       START-SERVER.sh
    echo     macos-amd64/
    echo       ostosos-server
    echo       START-SERVER.sh
    echo     macos-arm64/
    echo       ostosos-server
    echo       START-SERVER.sh
    echo.
    echo Verwendung:
    echo   Windows: Doppelklick auf START-SERVER.bat
    echo   Linux/macOS: ./START-SERVER.sh
    echo.
    echo ========================================
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo Original: https://tinyurl.com/BUGCOMPANY
    echo ========================================
) > "%DEPLOY_DIR%\README.txt"

echo [OK] README.txt erstellt
echo.

REM =================================================
REM ZUSAMMENFASSUNG
REM =================================================
echo ========================================
echo DEPLOY ZUSAMMENFASSUNG
echo ========================================
echo.
echo Go Servers: !DEPLOY_COUNT! / 7
echo Python Servers: !PYTHON_COUNT! / 1
echo.
echo Deploy-Verzeichnis: %DEPLOY_DIR%
echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo ========================================
echo.

pause

endlocal


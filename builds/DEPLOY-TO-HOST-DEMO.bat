@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] Deploy to Host - DEMO
REM ============================================
REM Zeigt Deployment-Optionen ohne tatsächliches Deployment
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] DEPLOY TO HOST - DEMO
echo ========================================
echo Zeigt Deployment-Optionen
echo ========================================
echo.

cd /d "%~dp0"
set "ROOT=%CD%"
set "BUILD_DIR=%ROOT%\go-executable\build"

echo Verfuegbare Server-Binaries:
echo.

if exist "%BUILD_DIR%\windows-amd64\ostosos-server.exe" (
    echo [OK] Windows amd64: %BUILD_DIR%\windows-amd64\ostosos-server.exe
) else (
    echo [WARN] Windows amd64: NICHT GEFUNDEN
)

if exist "%BUILD_DIR%\windows-arm64\ostosos-server.exe" (
    echo [OK] Windows arm64: %BUILD_DIR%\windows-arm64\ostosos-server.exe
) else (
    echo [WARN] Windows arm64: NICHT GEFUNDEN
)

if exist "%BUILD_DIR%\linux-amd64\ostosos-server" (
    echo [OK] Linux amd64: %BUILD_DIR%\linux-amd64\ostosos-server
) else (
    echo [WARN] Linux amd64: NICHT GEFUNDEN
)

if exist "%BUILD_DIR%\linux-arm64\ostosos-server" (
    echo [OK] Linux arm64: %BUILD_DIR%\linux-arm64\ostosos-server
) else (
    echo [WARN] Linux arm64: NICHT GEFUNDEN
)

if exist "%BUILD_DIR%\linux-386\ostosos-server" (
    echo [OK] Linux 386: %BUILD_DIR%\linux-386\ostosos-server
) else (
    echo [WARN] Linux 386: NICHT GEFUNDEN
)

if exist "%BUILD_DIR%\macos-amd64\ostosos-server" (
    echo [OK] macOS amd64: %BUILD_DIR%\macos-amd64\ostosos-server
) else (
    echo [WARN] macOS amd64: NICHT GEFUNDEN
)

if exist "%BUILD_DIR%\macos-arm64\ostosos-server" (
    echo [OK] macOS arm64: %BUILD_DIR%\macos-arm64\ostosos-server
) else (
    echo [WARN] macOS arm64: NICHT GEFUNDEN
)

echo.
echo ========================================
echo Deployment-Optionen:
echo ========================================
echo.
echo 1. SSH/SCP Deployment:
echo    - Kopiert Server-Binary auf Remote-Host
echo    - Erstellt Start-Script
echo    - Beispiel: scp server pi@raspberrypi.local:/home/pi/ostosos
echo.
echo 2. FTP/SFTP Deployment:
echo    - Manuelles Deployment via FTP-Client
echo    - Script zeigt Datei und Ziel-Pfad
echo.
echo 3. Lokales Deployment:
echo    - Kopiert Server in lokales Verzeichnis
echo    - Beispiel: C:\inetpub\wwwroot
echo.
echo 4. Docker Deployment:
echo    - Erstellt Docker-Image
echo    - Startet Container
echo.
echo ========================================
echo Verwendung:
echo ========================================
echo.
echo Fuer interaktives Deployment:
echo   DEPLOY-TO-HOST.bat
echo.
echo Fuer mehrere Hosts (PowerShell):
echo   hosts\DEPLOY-TO-HOSTS.ps1
echo.
echo Host-Konfiguration bearbeiten:
echo   hosts\host-config.json
echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo ========================================
echo.
pause

endlocal


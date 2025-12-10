@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] Deploy to Host - AUTO
REM ============================================
REM Automatisches Deployment basierend auf host-config.json
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] DEPLOY TO HOST - AUTO
echo ========================================
echo Automatisches Deployment
echo ========================================
echo.

cd /d "%~dp0"
set "ROOT=%CD%"
set "BUILD_DIR=%ROOT%\go-executable\build"
set "CONFIG_FILE=%ROOT%\hosts\host-config.json"

if not exist "%CONFIG_FILE%" (
    echo [FEHLER] Host-Konfiguration nicht gefunden: %CONFIG_FILE%
    pause
    exit /b 1
)

echo Lade Host-Konfiguration...
echo.

REM Prüfe lokale Hosts
for /f "tokens=*" %%a in ('type "%CONFIG_FILE%" ^| findstr /i "Local Windows"') do (
    echo [INFO] Lokales Deployment gefunden
)

REM Prüfe verfügbare Server-Binaries
echo.
echo Verfuegbare Server-Binaries:
echo.

set "DEPLOY_COUNT=0"

if exist "%BUILD_DIR%\windows-amd64\ostosos-server.exe" (
    echo [OK] Windows amd64 vorhanden
    set /a DEPLOY_COUNT+=1
)

if exist "%BUILD_DIR%\windows-arm64\ostosos-server.exe" (
    echo [OK] Windows arm64 vorhanden
    set /a DEPLOY_COUNT+=1
)

if exist "%BUILD_DIR%\linux-amd64\ostosos-server" (
    echo [OK] Linux amd64 vorhanden
    set /a DEPLOY_COUNT+=1
)

if exist "%BUILD_DIR%\linux-arm64\ostosos-server" (
    echo [OK] Linux arm64 vorhanden
    set /a DEPLOY_COUNT+=1
)

if exist "%BUILD_DIR%\linux-386\ostosos-server" (
    echo [OK] Linux 386 vorhanden
    set /a DEPLOY_COUNT+=1
)

if exist "%BUILD_DIR%\macos-amd64\ostosos-server" (
    echo [OK] macOS amd64 vorhanden
    set /a DEPLOY_COUNT+=1
)

if exist "%BUILD_DIR%\macos-arm64\ostosos-server" (
    echo [OK] macOS arm64 vorhanden
    set /a DEPLOY_COUNT+=1
)

echo.
echo ========================================
echo [OK] %DEPLOY_COUNT% Server-Binaries gefunden
echo ========================================
echo.
echo Fuer vollstaendiges Deployment:
echo   1. Bearbeite hosts\host-config.json mit deinen Host-Daten
echo   2. Fuehre hosts\DEPLOY-TO-HOSTS.ps1 aus
echo.
echo Oder verwende DEPLOY-TO-HOST.bat fuer interaktives Deployment
echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo ========================================
echo.
pause

endlocal


@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] Deploy to Host - FABRIK
REM ============================================
REM VOLLSTAENDIG AUTOMATISCH - FABRIK UEBERNIMMT ALLES
REM Liest aus host-config.json - KEINE USER-INTERAKTION
REM ============================================

setlocal enabledelayedexpansion

set "ERROR=0"

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] DEPLOY TO HOST - FABRIK
echo ========================================
echo VOLLSTAENDIG AUTOMATISCH
echo FABRIK UEBERNIMMT ALLES
echo ========================================
echo.

cd /d "%~dp0"
set "ROOT=%CD%"
set "CONFIG_FILE=%ROOT%\host-config.json"
set "BUILD_DIR=%ROOT%\..\go-executable\build"

REM Pruefe Konfiguration
if not exist "%CONFIG_FILE%" (
    echo [FEHLER] Host-Konfiguration nicht gefunden: %CONFIG_FILE%
    set "ERROR=1"
    goto END
)

REM FABRIK liest automatisch aus host-config.json
echo [FABRIK] Lade Host-Konfiguration...
echo.

REM Starte automatisches Deployment-Script
set "DEPLOY_SCRIPT=%ROOT%\DEPLOY-ALL-HOSTS-MCP.ps1"
if not exist "%DEPLOY_SCRIPT%" (
    set "DEPLOY_SCRIPT=%ROOT%\DEPLOY-ALL-HOSTS-AUTO.ps1"
)

if not exist "%DEPLOY_SCRIPT%" (
    echo [FEHLER] Deployment-Script nicht gefunden
    set "ERROR=1"
    goto END
)

REM FABRIK startet automatisch - KEINE USER-INTERAKTION
powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command "$ErrorActionPreference='Continue'; cd '%ROOT%'; .\DEPLOY-ALL-HOSTS-MCP.ps1; exit $LASTEXITCODE"

if errorlevel 1 (
    set "ERROR=1"
)

:END
echo ========================================
if !ERROR! equ 0 (
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo [FABRIK-OK] Deployment abgeschlossen
) else (
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo [FABRIK-FEHLER] Deployment fehlgeschlagen
)
echo ========================================
echo.
REM FABRIK UEBERNIMMT ALLES - KEINE USER-INTERAKTION
endlocal
if "%ERROR%"=="1" exit /b 1
exit /b 0


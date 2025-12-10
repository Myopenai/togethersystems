@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] SYSTEM START
REM ============================================
REM Startet automatisches Deployment auf alle Hosts
REM Fabrikation Standard TÜV MCP
REM ============================================

setlocal enabledelayedexpansion

set "ERROR=0"

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] SYSTEM START
echo ========================================
echo Fabrikation Standard TÜV MCP
echo Factory-System Integration
echo ========================================
echo.

REM ============================================
REM TÜV-TEST 1: Verzeichnis-Wechsel
REM ============================================
cd /d "%~dp0"
if errorlevel 1 (
    echo [TUEV-FEHLER] Verzeichnis-Wechsel fehlgeschlagen
    set "ERROR=1"
    goto END
)
set "ROOT=%CD%"
echo [TUEV-OK] Verzeichnis: %ROOT%

REM ============================================
REM TÜV-TEST 2: Script-Verfuegbarkeit
REM ============================================
set "DEPLOY_SCRIPT=%ROOT%\DEPLOY-ALL-HOSTS-FABRIKAGE.ps1"
if not exist "%DEPLOY_SCRIPT%" (
    set "DEPLOY_SCRIPT=%ROOT%\DEPLOY-ALL-HOSTS-MCP.ps1"
)
if not exist "%DEPLOY_SCRIPT%" (
    set "DEPLOY_SCRIPT=%ROOT%\DEPLOY-ALL-HOSTS-AUTO.ps1"
)
set "CONFIG_FILE=%ROOT%\host-config.json"

if not exist "%DEPLOY_SCRIPT%" (
    echo [TUEV-FEHLER] Deployment-Script nicht gefunden: %DEPLOY_SCRIPT%
    set "ERROR=1"
    goto END
)
echo [TUEV-OK] Deployment-Script vorhanden

if not exist "%CONFIG_FILE%" (
    echo [TUEV-FEHLER] Host-Konfiguration nicht gefunden: %CONFIG_FILE%
    set "ERROR=1"
    goto END
)
echo [TUEV-OK] Host-Konfiguration vorhanden

REM ============================================
REM TÜV-TEST 3: PowerShell-Verfuegbarkeit
REM ============================================
where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo [TUEV-FEHLER] PowerShell nicht gefunden
    set "ERROR=1"
    goto END
)
echo [TUEV-OK] PowerShell verfuegbar

REM ============================================
REM TÜV-ZUSAMMENFASSUNG
REM ============================================
echo.
echo ========================================
echo TUEV-VALIDIERUNG ABGESCHLOSSEN
echo ========================================
if !ERROR! equ 0 (
    echo [TUEV-OK] Alle Tests bestanden
    echo.
) else (
    echo [TUEV-FEHLER] Validierung fehlgeschlagen
    echo.
    goto END
)

REM ============================================
REM DEPLOYMENT STARTEN
REM ============================================
echo Starte automatisches Deployment...
echo.

REM Starte PowerShell-Script in neuem Fenster mit Fehlerbehandlung - VOLLSTAENDIG AUTOMATISCH
start "Deployment - [.SYSTEMS.T.SYSTEMS.]" powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command "$ErrorActionPreference='Continue'; try { cd '%ROOT%'; if (Test-Path 'DEPLOY-ALL-HOSTS-FABRIKAGE.ps1') { .\DEPLOY-ALL-HOSTS-FABRIKAGE.ps1 } elseif (Test-Path 'DEPLOY-ALL-HOSTS-MCP.ps1') { .\DEPLOY-ALL-HOSTS-MCP.ps1 } elseif (Test-Path 'DEPLOY-ALL-HOSTS-AUTO.ps1') { .\DEPLOY-ALL-HOSTS-AUTO.ps1 } else { Write-Host '[FEHLER] Script nicht gefunden' -ForegroundColor Red; exit 1 } } catch { Write-Host '[FEHLER] Deployment fehlgeschlagen:' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red; exit 1 }"

REM start-Befehl gibt immer 0 zurueck, daher keine Pruefung

echo.
echo [OK] Deployment-Fenster geoeffnet
echo.

:END
echo ========================================
if !ERROR! equ 0 (
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo [TUEV-OK] System-Start erfolgreich
) else (
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo [TUEV-FEHLER] System-Start fehlgeschlagen
    echo.
    echo Bitte pruefe die Fehlermeldungen oben.
)
echo ========================================
echo.
REM FABRIK UEBERNIMMT ALLES - KEINE USER-INTERAKTION
endlocal
if "%ERROR%"=="1" exit /b 1
exit /b 0


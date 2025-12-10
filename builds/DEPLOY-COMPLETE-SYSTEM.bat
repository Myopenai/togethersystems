@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] DEPLOY COMPLETE SYSTEM
REM ============================================
REM Deployt DAS GANZE SYSTEM auf ALLE Server
REM Fabrikation Standard TÜV MCP
REM ============================================

setlocal enabledelayedexpansion

set "ERROR=0"

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] DEPLOY COMPLETE SYSTEM
echo ========================================
echo Deployt DAS GANZE SYSTEM auf ALLE Server
echo - Server-Binaries
echo - UI-Dateien
echo - Settings-Ordner
echo - Fabrikage-Module
echo - Factory-Manifest
echo - Assets
echo ========================================
echo.

cd /d "%~dp0"
if errorlevel 1 (
    echo [FEHLER] Konnte nicht ins Verzeichnis wechseln
    set "ERROR=1"
    goto END
)

set "HOSTS_DIR=%CD%\hosts"
set "DEPLOY_SCRIPT=%HOSTS_DIR%\DEPLOY-COMPLETE-SYSTEM.ps1"

if not exist "%DEPLOY_SCRIPT%" (
    echo [FEHLER] Deployment-Script nicht gefunden: %DEPLOY_SCRIPT%
    set "ERROR=1"
    goto END
)

echo [OK] Starte COMPLETE SYSTEM Deployment auf ALLEN Servern...
echo.

REM Starte PowerShell-Script - VOLLSTAENDIG AUTOMATISCH
powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command "$ErrorActionPreference='Continue'; try { cd '%HOSTS_DIR%'; .\DEPLOY-COMPLETE-SYSTEM.ps1 } catch { Write-Host '[FEHLER] Deployment fehlgeschlagen:' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red; exit 1 }"

if errorlevel 1 (
    echo [FEHLER] Deployment-Script fehlgeschlagen
    set "ERROR=1"
) else (
    echo [OK] COMPLETE SYSTEM Deployment abgeschlossen
)

:END
echo.
echo ========================================
if !ERROR! equ 0 (
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo [OK] COMPLETE SYSTEM Deployment erfolgreich
) else (
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo [FEHLER] Deployment fehlgeschlagen
)
echo ========================================
echo.
REM FABRIK UEBERNIMMT ALLES - KEINE USER-INTERAKTION
set "EXIT_CODE=!ERROR!"
endlocal
if "%EXIT_CODE%"=="1" exit /b 1
exit /b 0


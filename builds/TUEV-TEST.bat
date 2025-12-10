@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] TÜV-TEST
REM ============================================
REM Fabrikation Standard TÜV MCP
REM Fuehrt alle Validierungs-Tests durch
REM ============================================

setlocal enabledelayedexpansion

set "ERROR=0"
set "TEST_COUNT=0"
set "PASS_COUNT=0"
set "FAIL_COUNT=0"

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TUEV-TEST
echo ========================================
echo Fabrikation Standard TÜV MCP
echo Vollstaendige System-Validierung
echo ========================================
echo.

REM ============================================
REM TÜV-TEST 1: Verzeichnis-Wechsel
REM ============================================
set /a TEST_COUNT+=1
echo [TEST !TEST_COUNT!] Verzeichnis-Wechsel...
cd /d "%~dp0"
if errorlevel 1 (
    echo [FAIL] Verzeichnis-Wechsel fehlgeschlagen
    set /a FAIL_COUNT+=1
    set "ERROR=1"
) else (
    set "ROOT=%CD%"
    echo [PASS] Verzeichnis: %ROOT%
    set /a PASS_COUNT+=1
)
echo.

REM ============================================
REM TÜV-TEST 2: Hosts-Verzeichnis
REM ============================================
set /a TEST_COUNT+=1
echo [TEST !TEST_COUNT!] Hosts-Verzeichnis...
set "HOSTS_DIR=%ROOT%\hosts"
if not exist "%HOSTS_DIR%" (
    echo [FAIL] Hosts-Verzeichnis nicht gefunden: %HOSTS_DIR%
    set /a FAIL_COUNT+=1
    set "ERROR=1"
) else (
    echo [PASS] Hosts-Verzeichnis vorhanden
    set /a PASS_COUNT+=1
)
echo.

REM ============================================
REM TÜV-TEST 3: Deployment-Script
REM ============================================
set /a TEST_COUNT+=1
echo [TEST !TEST_COUNT!] Deployment-Script...
set "DEPLOY_SCRIPT=%HOSTS_DIR%\DEPLOY-ALL-HOSTS-FABRIKAGE.ps1"
if not exist "%DEPLOY_SCRIPT%" (
    set "DEPLOY_SCRIPT=%HOSTS_DIR%\DEPLOY-ALL-HOSTS-MCP.ps1"
    if not exist "%DEPLOY_SCRIPT%" (
        set "DEPLOY_SCRIPT=%HOSTS_DIR%\DEPLOY-ALL-HOSTS-AUTO.ps1"
    )
)
if not exist "%DEPLOY_SCRIPT%" (
    echo [FAIL] Deployment-Script nicht gefunden: %DEPLOY_SCRIPT%
    set /a FAIL_COUNT+=1
    set "ERROR=1"
) else (
    echo [PASS] Deployment-Script vorhanden
    set /a PASS_COUNT+=1
)
echo.

REM ============================================
REM TÜV-TEST 4: Host-Konfiguration
REM ============================================
set /a TEST_COUNT+=1
echo [TEST !TEST_COUNT!] Host-Konfiguration...
set "CONFIG_FILE=%HOSTS_DIR%\host-config.json"
if not exist "%CONFIG_FILE%" (
    echo [FAIL] Host-Konfiguration nicht gefunden: %CONFIG_FILE%
    set /a FAIL_COUNT+=1
    set "ERROR=1"
) else (
    echo [PASS] Host-Konfiguration vorhanden
    set /a PASS_COUNT+=1
)
echo.

REM ============================================
REM TÜV-TEST 5: PowerShell-Verfuegbarkeit
REM ============================================
set /a TEST_COUNT+=1
echo [TEST !TEST_COUNT!] PowerShell-Verfuegbarkeit...
where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo [FAIL] PowerShell nicht gefunden
    set /a FAIL_COUNT+=1
    set "ERROR=1"
) else (
    set "PS_VERSION=Unknown"
    for /f "tokens=*" %%v in ('powershell.exe -Command "Write-Host $PSVersionTable.PSVersion" 2^>nul') do set "PS_VERSION=%%v"
    if "!PS_VERSION!"=="Unknown" (
        echo [PASS] PowerShell verfuegbar (Version konnte nicht ermittelt werden)
    ) else (
        echo [PASS] PowerShell verfuegbar: !PS_VERSION!
    )
    set /a PASS_COUNT+=1
)
echo.

REM ============================================
REM TÜV-TEST 6: Build-Verzeichnis (optional)
REM ============================================
set /a TEST_COUNT+=1
echo [TEST !TEST_COUNT!] Build-Verzeichnis (optional)...
set "BUILD_DIR=%ROOT%\go-executable\build"
if not exist "%BUILD_DIR%" (
    echo [WARN] Build-Verzeichnis nicht gefunden: %BUILD_DIR%
    echo [INFO] Builds muessen erst erstellt werden
    set /a PASS_COUNT+=1
) else (
    echo [PASS] Build-Verzeichnis vorhanden
    set /a PASS_COUNT+=1
)
echo.

REM ============================================
REM TÜV-TEST 7: Factory-Manifest (optional)
REM ============================================
set /a TEST_COUNT+=1
echo [TEST !TEST_COUNT!] Factory-Manifest (optional)...
set "FACTORY_MANIFEST=%ROOT%\..\factory.manifest.yaml"
if not exist "%FACTORY_MANIFEST%" (
    set "FACTORY_MANIFEST=%ROOT%\..\..\factory.manifest.yaml"
    if not exist "%FACTORY_MANIFEST%" (
        echo [WARN] Factory-Manifest nicht gefunden
        echo [INFO] Factory-Integration optional
        set /a PASS_COUNT+=1
    ) else (
        echo [PASS] Factory-Manifest vorhanden
        set /a PASS_COUNT+=1
    )
) else (
    echo [PASS] Factory-Manifest vorhanden
    set /a PASS_COUNT+=1
)
echo.

REM ============================================
REM TÜV-TEST 8: Settings-Ordner (FABRIKAGE)
REM ============================================
set /a TEST_COUNT+=1
echo [TEST !TEST_COUNT!] Settings-Ordner (FABRIKAGE)...
set "SETTINGS_DIR=%ROOT%\..\..\settings"
if not exist "%SETTINGS_DIR%" (
    echo [WARN] Settings-Ordner nicht gefunden: %SETTINGS_DIR%
    echo [INFO] Settings-Integration optional
    set /a PASS_COUNT+=1
) else (
    echo [PASS] Settings-Ordner vorhanden
    set /a PASS_COUNT+=1
)
echo.

REM ============================================
REM TÜV-ZUSAMMENFASSUNG
REM ============================================
echo ========================================
echo TUEV-TEST ZUSAMMENFASSUNG
echo ========================================
echo Tests durchgefuehrt: !TEST_COUNT!
echo Tests bestanden: !PASS_COUNT!
echo Tests fehlgeschlagen: !FAIL_COUNT!
echo.

if !ERROR! equ 0 (
    echo [TUEV-OK] Alle Tests bestanden
    echo [TUEV-OK] System bereit fuer Deployment
    echo.
    echo ========================================
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo [TUEV-OK] System-Validierung erfolgreich
    echo ========================================
) else (
    echo [TUEV-FEHLER] Validierung fehlgeschlagen
    echo [TUEV-FEHLER] Bitte behebe die Fehler vor dem Deployment
    echo.
    echo ========================================
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo [TUEV-FEHLER] System-Validierung fehlgeschlagen
    echo ========================================
)
echo.
REM FABRIK UEBERNIMMT ALLES - KEINE USER-INTERAKTION
set "EXIT_CODE=!ERROR!"
endlocal
if "%EXIT_CODE%"=="1" exit /b 1
exit /b 0


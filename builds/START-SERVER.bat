@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] Start Server
REM ============================================
REM Startet den ostosos-server
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] START SERVER
echo ========================================
echo.

REM In das Verzeichnis der Batch wechseln
cd /d "%~dp0"
if errorlevel 1 (
    echo [FEHLER] Konnte nicht ins Projektverzeichnis wechseln
    exit /b 1
)

set "ROOT=%CD%"
set "GO_DIR=%ROOT%\go-executable\build"
set "PY_DIR=%ROOT%\python-executable"

set "PY_EXE=%PY_DIR%\build\windows-amd64\ostosos-server.exe"
set "GO_EXE=%GO_DIR%\windows-amd64\ostosos-server.exe"
set "PY_SCRIPT=%PY_DIR%\python-server.py"

set "SERVER_FOUND=0"
set "SERVER_CMD="

echo Suche nach Server-Binaries...
echo.

REM 1) Bevorzuge Python Executable
if exist "%PY_EXE%" (
    echo [OK] Python Executable gefunden:
    echo      %PY_EXE%
    set "SERVER_CMD=\"%PY_EXE%\""
    set "SERVER_FOUND=1"
)

REM 2) Falls nichts gefunden: Go Executable
if !SERVER_FOUND! equ 0 if exist "%GO_EXE%" (
    echo [OK] Go Executable gefunden:
    echo      %GO_EXE%
    set "SERVER_CMD=\"%GO_EXE%\""
    set "SERVER_FOUND=1"
)

REM 3) Falls immer noch nichts: Python Script direkt
if !SERVER_FOUND! equ 0 if exist "%PY_SCRIPT%" (
    echo [OK] Python Script gefunden:
    echo      %PY_SCRIPT%
    set "SERVER_CMD=python \"%PY_SCRIPT%\""
    set "SERVER_FOUND=1"
)

if !SERVER_FOUND! equ 0 (
    echo [FEHLER] Kein Server-Binary gefunden!
    echo   Erwartete Orte:
    echo     %PY_EXE%
    echo     %GO_EXE%
    echo     %PY_SCRIPT%
    echo.
    exit /b 1
)

echo.
echo Starte Server:
echo   %SERVER_CMD%
echo.
echo Server läuft normalerweise auf: http://127.0.0.1:9090
echo Druecken Sie Ctrl+C im Server-Fenster zum Beenden.
echo.

REM Neues Fenster mit dem Server starten
start "" %SERVER_CMD%

echo.
echo Server-Start ausgelöst.
echo.
REM FABRIK UEBERNIMMT ALLES - KEINE USER-INTERAKTION
endlocal


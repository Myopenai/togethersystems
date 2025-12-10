@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] START PITCH
REM ============================================
REM Startet Server und öffnet Browser
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] START PITCH
echo ========================================
echo.

cd /d "%~dp0"
if errorlevel 1 (
    echo [FEHLER] Konnte nicht ins Verzeichnis wechseln
    pause
    exit /b 1
)

set "ROOT=%CD%"
set "SERVER_EXE_GO=%ROOT%\server\ostosos-server.exe"
set "SERVER_EXE_PYTHON=%ROOT%\server\ostosos-python.exe"
set "SERVER_SCRIPT=%ROOT%\server\python-server.py"

set "SERVER_FOUND=0"
set "SERVER_CMD="

echo Suche nach Server...
echo.

REM 1) Python Executable
if exist "%SERVER_EXE_PYTHON%" (
    echo [OK] Python Executable gefunden
    set "SERVER_CMD=\"%SERVER_EXE_PYTHON%\""
    set "SERVER_FOUND=1"
)

REM 2) Go Executable
if !SERVER_FOUND! equ 0 if exist "%SERVER_EXE_GO%" (
    echo [OK] Go Executable gefunden
    set "SERVER_CMD=\"%SERVER_EXE_GO%\""
    set "SERVER_FOUND=1"
)

REM 3) Python Script
if !SERVER_FOUND! equ 0 if exist "%SERVER_SCRIPT%" (
    echo [OK] Python Script gefunden
    set "SERVER_CMD=python \"%SERVER_SCRIPT%\""
    set "SERVER_FOUND=1"
)

if !SERVER_FOUND! equ 0 (
    echo [FEHLER] Kein Server gefunden!
    echo.
    pause
    exit /b 1
)

echo.
echo Starte Server...
start "" %SERVER_CMD%

echo Warte 2 Sekunden...
timeout /t 2 /nobreak >nul

echo.
echo Öffne Browser...
start "" "http://127.0.0.1:9090"

echo.
echo ========================================
echo Server läuft auf: http://127.0.0.1:9090
echo Browser sollte sich geöffnet haben
echo.
echo Zum Beenden dieses Fensters schließen
echo ========================================
echo.

pause

endlocal


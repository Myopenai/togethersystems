@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] RUN ALL - Master Script
REM ============================================
REM Führt alles auf einmal aus:
REM   1. Baut alle OS (Go + Python)
REM   2. Zeigt alle Builds
REM   3. Startet Server (optional)
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] RUN ALL
echo ========================================
echo Master Script - Fuehrt alles aus
echo Fabrikation Standard TUEV MCP
echo ========================================
echo.

REM In das Verzeichnis der Batch wechseln
cd /d "%~dp0"
if errorlevel 1 (
    echo [FEHLER] Konnte nicht ins Build-Verzeichnis wechseln
    exit /b 1
)

set "BUILD_DIR=%CD%"
set "ERROR=0"

echo Aktuelles Verzeichnis: %BUILD_DIR%
echo.

REM =================================================
REM SCHRITT 1: ALLE BUILDS ERSTELLEN
REM =================================================
echo ========================================
echo SCHRITT 1: ALLE BUILDS ERSTELLEN
echo ========================================
echo.

call "%~dp0BUILD-ALL-OS.bat"
set "BUILD_ERROR=%ERRORLEVEL%"

if !BUILD_ERROR! neq 0 (
    echo.
    echo [WARN] Builds hatten Fehler (Exit-Code: !BUILD_ERROR!)
    set "ERROR=1"
) else (
    echo.
    echo [OK] Alle Builds erfolgreich abgeschlossen
)

echo.
REM FABRIK: Automatisch fortfahren
echo.

REM =================================================
REM SCHRITT 2: ALLE BUILDS ANZEIGEN
REM =================================================
echo ========================================
echo SCHRITT 2: ALLE BUILDS ANZEIGEN
echo ========================================
echo.

call "%~dp0SHOW-ALL-OS.bat"

echo.
REM FABRIK: Automatisch fortfahren
echo.

REM =================================================
REM SCHRITT 3: SERVER STARTEN (OPTIONAL)
REM =================================================
echo ========================================
echo SCHRITT 3: SERVER STARTEN
echo ========================================
echo.

REM FABRIK: Startet automatisch Server
set "START_SERVER=J"

if /i "!START_SERVER!"=="J" (
    echo.
    echo Starte Server...
    echo.
    call "%~dp0START-SERVER.bat"
) else (
    echo.
    echo Server-Start uebersprungen.
    echo Sie koennen den Server spaeter mit START-SERVER.bat starten.
)

echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] RUN ALL ABGESCHLOSSEN
echo ========================================
echo.

if !ERROR! equ 0 (
    echo [OK] Alle Schritte erfolgreich abgeschlossen
) else (
    echo [WARN] Es sind Fehler aufgetreten (ERROR=!ERROR!)
)

echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo Original: https://tinyurl.com/BUGCOMPANY
echo ========================================
echo.
REM FABRIK UEBERNIMMT ALLES - KEINE USER-INTERAKTION
endlocal & exit /b %ERROR%


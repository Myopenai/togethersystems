@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] RUN ALL AUTO - Vollautomatisch
REM ============================================
REM Führt alles automatisch aus ohne Pausen:
REM   1. Baut alle OS (Go + Python)
REM   2. Zeigt alle Builds
REM   3. Startet Server automatisch
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] RUN ALL AUTO
echo ========================================
echo Vollautomatischer Ablauf
echo Fabrikation Standard TUEV MCP
echo ========================================
echo.

REM In das Verzeichnis der Batch wechseln
cd /d "%~dp0"
if errorlevel 1 (
    echo [FEHLER] Konnte nicht ins Build-Verzeichnis wechseln
    pause
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
timeout /t 2 /nobreak >nul

REM =================================================
REM SCHRITT 2: ALLE BUILDS ANZEIGEN
REM =================================================
echo ========================================
echo SCHRITT 2: ALLE BUILDS ANZEIGEN
echo ========================================
echo.

call "%~dp0SHOW-ALL-OS.bat"

echo.
timeout /t 2 /nobreak >nul

REM =================================================
REM SCHRITT 3: SERVER AUTOMATISCH STARTEN
REM =================================================
echo ========================================
echo SCHRITT 3: SERVER AUTOMATISCH STARTEN
echo ========================================
echo.

echo Starte Server automatisch...
echo.

call "%~dp0START-SERVER.bat"

echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] RUN ALL AUTO ABGESCHLOSSEN
echo ========================================
echo.

if !ERROR! equ 0 (
    echo [OK] Alle Schritte erfolgreich abgeschlossen
    echo Server wurde gestartet
) else (
    echo [WARN] Es sind Fehler aufgetreten (ERROR=!ERROR!)
)

echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo Original: https://tinyurl.com/BUGCOMPANY
echo ========================================
echo.

pause

endlocal & exit /b %ERROR%


@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] RUN ALL QUICK - Schnellversion
REM ============================================
REM Führt nur die Builds aus (ohne Anzeige/Server)
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] RUN ALL QUICK
echo ========================================
echo Schnellversion - Nur Builds
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
REM NUR BUILDS AUSFUEHREN
REM =================================================
echo Starte Builds...
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
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] RUN ALL QUICK ABGESCHLOSSEN
echo ========================================
echo.

if !ERROR! equ 0 (
    echo [OK] Builds erfolgreich
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


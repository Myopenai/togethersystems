@echo off
setlocal enabledelayedexpansion
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TEST ALL BATS
echo ========================================
echo.
cd /d "%~dp0"
echo Aktuelles Verzeichnis: %CD%
echo.

echo ========================================
echo TEST 1: TUEV-TEST.bat
echo ========================================
if exist "TUEV-TEST.bat" (
    echo [OK] TUEV-TEST.bat gefunden
    call "TUEV-TEST.bat"
    if errorlevel 1 (
        echo [FEHLER] TUEV-TEST.bat fehlgeschlagen
    ) else (
        echo [OK] TUEV-TEST.bat erfolgreich
    )
) else (
    echo [FEHLER] TUEV-TEST.bat nicht gefunden
)
echo.

echo ========================================
echo TEST 2: SYSTEM-START.bat
echo ========================================
if exist "SYSTEM-START.bat" (
    echo [OK] SYSTEM-START.bat gefunden
    REM Nur testen, nicht wirklich starten
    echo [INFO] SYSTEM-START.bat wird uebersprungen (startet Deployment)
) else (
    echo [FEHLER] SYSTEM-START.bat nicht gefunden
)
echo.

echo ========================================
echo TEST 3: BUILD-ALL-OS.bat
echo ========================================
if exist "BUILD-ALL-OS.bat" (
    echo [OK] BUILD-ALL-OS.bat gefunden
    echo [INFO] BUILD-ALL-OS.bat wird uebersprungen (baut alle OS)
) else (
    echo [FEHLER] BUILD-ALL-OS.bat nicht gefunden
)
echo.

echo ========================================
echo TEST 4: SHOW-ALL-OS.bat
echo ========================================
if exist "SHOW-ALL-OS.bat" (
    echo [OK] SHOW-ALL-OS.bat gefunden
    call "SHOW-ALL-OS.bat"
    if errorlevel 1 (
        echo [FEHLER] SHOW-ALL-OS.bat fehlgeschlagen
    ) else (
        echo [OK] SHOW-ALL-OS.bat erfolgreich
    )
) else (
    echo [FEHLER] SHOW-ALL-OS.bat nicht gefunden
)
echo.

echo ========================================
echo ZUSAMMENFASSUNG
echo ========================================
echo Alle Tests abgeschlossen
echo.
endlocal


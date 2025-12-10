@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] CREATE ZIP - Erstellt Pitch-ZIP
REM ============================================
REM Erstellt ZIP-Datei aus Pitch-Paket
REM ============================================

setlocal

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] CREATE ZIP
echo ========================================
echo.

cd /d "%~dp0"
set "DIST=%CD%\dist"
set "PITCH_DIR=%DIST%\ostosos-pitch"
set "ZIP_FILE=%DIST%\ostosos-pitch.zip"

echo Prüfe Pitch-Verzeichnis...
if not exist "%PITCH_DIR%" (
    echo [FEHLER] Pitch-Verzeichnis nicht gefunden: %PITCH_DIR%
    echo Bitte zuerst MAKE-PITCH.bat ausführen!
    pause
    exit /b 1
)

echo [OK] Pitch-Verzeichnis gefunden
echo.

REM Alte ZIP löschen
if exist "%ZIP_FILE%" (
    echo Lösche alte ZIP-Datei...
    del "%ZIP_FILE%"
)

echo Erstelle ZIP-Datei...
echo   Quelle: %PITCH_DIR%
echo   Ziel: %ZIP_FILE%
echo.

REM ZIP erstellen (Windows 10+ hat tar)
cd "%DIST%"
tar -a -c -f "ostosos-pitch.zip" "ostosos-pitch"

if errorlevel 1 (
    echo [FEHLER] ZIP-Erstellung fehlgeschlagen
    echo.
    echo Alternative: Manuell ZIP erstellen aus:
    echo   %PITCH_DIR%
    pause
    exit /b 1
)

echo.
echo ========================================
echo ZIP-DATEI ERSTELLT
echo ========================================
echo.
echo Datei: %ZIP_FILE%
echo.

REM Dateigröße anzeigen
for %%F in ("%ZIP_FILE%") do (
    set "SIZE=%%~zF"
    set /a SIZE_MB=!SIZE!/1024/1024
    echo Größe: !SIZE_MB! MB
)

echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo ========================================
echo.

pause

endlocal


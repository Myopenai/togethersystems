@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] MAKE PITCH - Erstellt Pitch-Paket
REM ============================================
REM Sammelt alle Builds und erstellt ein Pitch-Paket
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] MAKE PITCH
echo ========================================
echo Erstellt Pitch-Paket für alle Plattformen
echo ========================================
echo.

REM In das Verzeichnis der Batch wechseln
cd /d "%~dp0"
set "ROOT=%CD%"
set "GO_BUILD=%ROOT%\go-executable\build"
set "DIST=%ROOT%\dist\ostosos-pitch"

echo Projekt-Root: %ROOT%
echo Go Builds: %GO_BUILD%
echo Ziel: %DIST%
echo.

REM Prüfe ob Builds vorhanden sind
if not exist "%GO_BUILD%" (
    echo [FEHLER] Go Build-Verzeichnis nicht gefunden: %GO_BUILD%
    echo Bitte zuerst BUILD-ALL-OS.bat ausführen!
    pause
    exit /b 1
)

REM Zielstruktur leeren/neu anlegen
echo Erstelle Zielstruktur...
if exist "%DIST%" (
    echo Lösche altes Pitch-Verzeichnis...
    rmdir /s /q "%DIST%"
)

mkdir "%DIST%" 2>nul
mkdir "%DIST%\bin" 2>nul
mkdir "%DIST%\bin\windows-amd64" 2>nul
mkdir "%DIST%\bin\windows-arm64" 2>nul
mkdir "%DIST%\bin\linux-amd64" 2>nul
mkdir "%DIST%\bin\linux-386" 2>nul
mkdir "%DIST%\bin\linux-arm" 2>nul
mkdir "%DIST%\bin\linux-arm64" 2>nul
mkdir "%DIST%\bin\macos-amd64" 2>nul
mkdir "%DIST%\bin\macos-arm64" 2>nul
mkdir "%DIST%\ui" 2>nul
mkdir "%DIST%\docs" 2>nul

echo [OK] Verzeichnisstruktur erstellt
echo.

REM =================================================
REM BINARIES KOPIEREN
REM =================================================
echo Kopiere Binaries...
set "COPY_COUNT=0"

REM Windows
if exist "%GO_BUILD%\windows-amd64\ostosos-server.exe" (
    copy "%GO_BUILD%\windows-amd64\ostosos-server.exe" "%DIST%\bin\windows-amd64\" >nul
    set /a COPY_COUNT+=1
    echo   [OK] Windows amd64
) else (
    echo   [WARN] Windows amd64 nicht gefunden
)

if exist "%GO_BUILD%\windows-arm64\ostosos-server.exe" (
    copy "%GO_BUILD%\windows-arm64\ostosos-server.exe" "%DIST%\bin\windows-arm64\" >nul
    set /a COPY_COUNT+=1
    echo   [OK] Windows arm64
) else (
    echo   [WARN] Windows arm64 nicht gefunden
)

REM Linux
if exist "%GO_BUILD%\linux-amd64\ostosos-server" (
    copy "%GO_BUILD%\linux-amd64\ostosos-server" "%DIST%\bin\linux-amd64\" >nul
    set /a COPY_COUNT+=1
    echo   [OK] Linux amd64
) else (
    echo   [WARN] Linux amd64 nicht gefunden
)

if exist "%GO_BUILD%\linux-386\ostosos-server" (
    copy "%GO_BUILD%\linux-386\ostosos-server" "%DIST%\bin\linux-386\" >nul
    set /a COPY_COUNT+=1
    echo   [OK] Linux 386
) else (
    echo   [WARN] Linux 386 nicht gefunden
)

if exist "%GO_BUILD%\linux-arm\ostosos-server" (
    copy "%GO_BUILD%\linux-arm\ostosos-server" "%DIST%\bin\linux-arm\" >nul
    set /a COPY_COUNT+=1
    echo   [OK] Linux arm
) else (
    echo   [WARN] Linux arm nicht gefunden (optional für Raspberry Pi)
)

if exist "%GO_BUILD%\linux-arm64\ostosos-server" (
    copy "%GO_BUILD%\linux-arm64\ostosos-server" "%DIST%\bin\linux-arm64\" >nul
    set /a COPY_COUNT+=1
    echo   [OK] Linux arm64
) else (
    echo   [WARN] Linux arm64 nicht gefunden
)

REM macOS
if exist "%GO_BUILD%\macos-amd64\ostosos-server" (
    copy "%GO_BUILD%\macos-amd64\ostosos-server" "%DIST%\bin\macos-amd64\" >nul
    set /a COPY_COUNT+=1
    echo   [OK] macOS amd64
) else (
    echo   [WARN] macOS amd64 nicht gefunden
)

if exist "%GO_BUILD%\macos-arm64\ostosos-server" (
    copy "%GO_BUILD%\macos-arm64\ostosos-server" "%DIST%\bin\macos-arm64\" >nul
    set /a COPY_COUNT+=1
    echo   [OK] macOS arm64
) else (
    echo   [WARN] macOS arm64 nicht gefunden
)

echo.
echo Kopiert: !COPY_COUNT! Binaries
echo.

REM =================================================
REM START-SCRIPTS KOPIEREN
REM =================================================
echo Kopiere Start-Scripts...

if exist "%ROOT%\pitch\run.bat" (
    copy "%ROOT%\pitch\run.bat" "%DIST%\" >nul
    echo   [OK] run.bat (Windows)
) else (
    echo   [WARN] run.bat nicht gefunden
)

if exist "%ROOT%\pitch\run.sh" (
    copy "%ROOT%\pitch\run.sh" "%DIST%\" >nul
    echo   [OK] run.sh (Linux/macOS/Raspberry Pi)
) else (
    echo   [WARN] run.sh nicht gefunden
)

echo.

REM =================================================
REM UI/DOCS KOPIEREN (falls vorhanden)
REM =================================================
echo Kopiere UI/Docs (falls vorhanden)...

if exist "%ROOT%\ui" (
    xcopy "%ROOT%\ui" "%DIST%\ui" /e /i /y >nul
    echo   [OK] UI-Verzeichnis
) else (
    echo   [INFO] UI-Verzeichnis nicht gefunden (optional)
)

if exist "%ROOT%\pdf" (
    xcopy "%ROOT%\pdf\*.pdf" "%DIST%\docs\" /y >nul 2>&1
    echo   [OK] PDFs kopiert
) else (
    echo   [INFO] PDF-Verzeichnis nicht gefunden (optional)
)

echo.

REM =================================================
REM README ERSTELLEN
REM =================================================
echo Erstelle README.txt...
(
    echo [.SYSTEMS.T.SYSTEMS.] ostosos Pitch
    echo ========================================
    echo.
    echo Installation:
    echo.
    echo Windows:
    echo   1. ZIP entpacken
    echo   2. Doppelklick auf run.bat
    echo.
    echo Linux / macOS / Raspberry Pi:
    echo   1. ZIP entpacken
    echo   2. Terminal öffnen im entpackten Ordner
    echo   3. chmod +x run.sh
    echo   4. ./run.sh
    echo.
    echo Der Browser öffnet sich automatisch.
    echo.
    echo ========================================
    echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
    echo Original: https://tinyurl.com/BUGCOMPANY
    echo ========================================
) > "%DIST%\README.txt"

echo   [OK] README.txt erstellt
echo.

REM =================================================
REM ZUSAMMENFASSUNG
REM =================================================
echo ========================================
echo PITCH-PAKET ERSTELLT
echo ========================================
echo.
echo Verzeichnis: %DIST%
echo Binaries: !COPY_COUNT!
echo.
echo Nächster Schritt:
echo   1. cd dist
echo   2. tar -a -c -f ostosos-pitch.zip ostosos-pitch
echo.
echo Oder manuell:
echo   ZIP erstellen aus: dist\ostosos-pitch
echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo ========================================
echo.

pause

endlocal


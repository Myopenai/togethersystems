@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] Build All OS
REM ============================================
REM Baut alle Betriebssysteme (Go + Python)
REM Fabrikation Standard TÜV MCP
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] BUILD ALL OS
echo ========================================
echo Fabrikation Standard TÜV MCP
echo Alle 7 Plattformen: Go + Python
echo.

REM -------------------------------------------------
REM Basisverzeichnisse setzen
REM -------------------------------------------------
set "ERROR=0"

REM In das Verzeichnis der Batch wechseln
cd /d "%~dp0"
if errorlevel 1 (
    echo [FEHLER] Konnte nicht ins Build-Verzeichnis wechseln
    exit /b 1
)

set "BUILD_DIR=%CD%"
set "GO_DIR=%BUILD_DIR%\go-executable"
set "PYTHON_DIR=%BUILD_DIR%\python-executable"

echo Aktuelles Verzeichnis: %BUILD_DIR%
echo GO-Verzeichnis:        %GO_DIR%
echo Python-Verzeichnis:    %PYTHON_DIR%
echo.

REM =================================================
REM GO BUILDS
REM =================================================
echo ========================================
echo GO BUILDS - ALLE 7 PLATTFORMEN
echo ========================================
echo.

if exist "%GO_DIR%\build-all.ps1" (
    echo Starte Go Builds...
    echo Prüfe Go Installation...

    go version >nul 2>&1
    if errorlevel 1 (
        echo [FEHLER] Go ist nicht installiert oder nicht im PATH
        echo Bitte installiere Go von: https://golang.org/dl/
        set "ERROR=1"
    ) else (
        echo [OK] Go gefunden
        echo Starte PowerShell Build-Script...

        pushd "%GO_DIR%"
        powershell.exe -ExecutionPolicy Bypass -NoProfile -Command "Set-Location '%GO_DIR%'; .\build-all.ps1; exit $LASTEXITCODE"
        set "GO_BUILD_RESULT=%ERRORLEVEL%"
        popd
        if !GO_BUILD_RESULT! neq 0 (
            echo [FEHLER] Go Builds fehlgeschlagen (Exit-Code: !GO_BUILD_RESULT!)
            set "ERROR=1"
        ) else (
            echo [OK] Go Builds erfolgreich
        )
    )
) else (
    echo [WARN] Go Build Script nicht gefunden:
    echo        "%GO_DIR%\build-all.ps1"
    set "ERROR=1"
)

REM =================================================
REM PYTHON BUILD (Windows Executable)
REM =================================================
echo.
echo ========================================
echo PYTHON BUILD - WINDOWS EXECUTABLE
echo ========================================
echo.

if exist "%PYTHON_DIR%\python-server.py" (
    echo Prüfe Python Installation...
    python --version >nul 2>&1
    if errorlevel 1 (
        echo [FEHLER] Python ist nicht installiert oder nicht im PATH
        echo Bitte installiere Python von:
        echo   https://www.python.org/downloads/
        set "ERROR=1"
    ) else (
        echo [OK] Python gefunden
        pushd "%PYTHON_DIR%"

        REM PyInstaller prüfen/ggf. installieren
        echo Installiere/Prüfe PyInstaller...
        python -m pip install pyinstaller --quiet
        if errorlevel 1 (
            echo [WARN] PyInstaller Installation fehlgeschlagen, versuche trotzdem Build...
        )

        REM Python Executable bauen
        echo Baue Python Executable...
        python -m PyInstaller --onefile --name ostosos-server ^
            --distpath build\windows-amd64 ^
            --workpath build\windows-amd64\build-temp ^
            --clean --noconfirm python-server.py

        if errorlevel 1 (
            echo [FEHLER] Python Build fehlgeschlagen
            set "ERROR=1"
        ) else (
            if exist "build\windows-amd64\ostosos-server.exe" (
                echo [OK] Python Build erfolgreich
            ) else (
                echo [WARN] Python Build nicht gefunden
                echo Prüfe ob PyInstaller korrekt installiert ist
                set "ERROR=1"
            )
        )

        popd
    )
) else (
    echo [WARN] Python Server Script nicht gefunden:
    echo        "%PYTHON_DIR%\python-server.py"
    set "ERROR=1"
)

REM =================================================
REM BUILD ZUSAMMENFASSUNG
REM =================================================
echo.
echo ========================================
echo BUILD ZUSAMMENFASSUNG
echo ========================================
echo.

echo GO BUILDS:
set "GO_COUNT=0"

if exist "%GO_DIR%\build\windows-amd64\ostosos-server.exe" (
    set /a GO_COUNT+=1
    echo   [OK] Windows amd64
) else (
    echo   [WARN] Windows amd64 nicht gefunden
)

if exist "%GO_DIR%\build\windows-arm64\ostosos-server.exe" (
    set /a GO_COUNT+=1
    echo   [OK] Windows arm64
) else (
    echo   [WARN] Windows arm64 nicht gefunden
)

if exist "%GO_DIR%\build\linux-amd64\ostosos-server" (
    set /a GO_COUNT+=1
    echo   [OK] Linux amd64
) else (
    echo   [WARN] Linux amd64 nicht gefunden
)

if exist "%GO_DIR%\build\linux-arm64\ostosos-server" (
    set /a GO_COUNT+=1
    echo   [OK] Linux arm64
) else (
    echo   [WARN] Linux arm64 nicht gefunden
)

if exist "%GO_DIR%\build\linux-386\ostosos-server" (
    set /a GO_COUNT+=1
    echo   [OK] Linux 386
) else (
    echo   [WARN] Linux 386 nicht gefunden
)

if exist "%GO_DIR%\build\macos-amd64\ostosos-server" (
    set /a GO_COUNT+=1
    echo   [OK] macOS amd64
) else (
    echo   [WARN] macOS amd64 nicht gefunden
)

if exist "%GO_DIR%\build\macos-arm64\ostosos-server" (
    set /a GO_COUNT+=1
    echo   [OK] macOS arm64
) else (
    echo   [WARN] macOS arm64 nicht gefunden
)

echo.
echo   Gesamt: !GO_COUNT! / 7 Plattformen
echo.

echo PYTHON BUILDS:
if exist "%PYTHON_DIR%\build\windows-amd64\ostosos-server.exe" (
    echo   [OK] Windows amd64
) else (
    echo   [WARN] Windows amd64 nicht gefunden
)

echo.
if !ERROR! equ 0 (
    echo [OK] Alle Builds erfolgreich abgeschlossen
) else (
    echo [WARN] Es sind Fehler aufgetreten (ERROR=!ERROR!)
)

echo.
REM FABRIK UEBERNIMMT ALLES - KEINE USER-INTERAKTION
endlocal & exit /b %ERROR%


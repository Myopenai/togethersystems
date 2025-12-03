@echo off
REM Think Orders - Tests ausführen (Batch Script)
REM Für Dummies: Doppelklick auf diese Datei!

echo =══════════════════════════════════════════════════════════════════
echo.
echo    Think Orders - Tests ausführen
echo.
echo =══════════════════════════════════════════════════════════════════
echo.

REM Zum richtigen Ordner wechseln
cd /d "%~dp0"
echo Aktueller Ordner: %CD%
echo.

REM Prüfe Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js nicht gefunden!
    echo.
    echo Bitte installieren Sie Node.js von: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js gefunden!
echo.

REM Prüfe package.json
if not exist "package.json" (
    echo ERROR: package.json nicht gefunden!
    echo.
    echo Bitte stellen Sie sicher, dass Sie im richtigen Ordner sind.
    echo.
    pause
    exit /b 1
)

REM Installiere Dependencies falls nötig
if not exist "node_modules" (
    echo Installiere Dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Installation fehlgeschlagen!
        pause
        exit /b 1
    )
)

REM Tests ausführen
echo.
echo =══════════════════════════════════════════════════════════════════
echo.
echo    Starte Tests...
echo.
echo =══════════════════════════════════════════════════════════════════
echo.

call npm test

echo.
echo =══════════════════════════════════════════════════════════════════
echo.
echo    Tests abgeschlossen!
echo.
echo =══════════════════════════════════════════════════════════════════
echo.
pause


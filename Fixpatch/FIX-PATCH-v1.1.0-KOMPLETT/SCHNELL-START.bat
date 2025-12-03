@echo off
chcp 65001 > nul
title TOGETHERSYSTEMS Fix-Patch Installer

echo.
echo ══════════════════════════════════════════════════════════════
echo   TOGETHERSYSTEMS - Fix-Patch v1.0.0 - Schnell-Installer
echo ══════════════════════════════════════════════════════════════
echo.

:: Prüfe ob Node.js installiert ist
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Node.js ist nicht installiert!
    echo.
    echo Bitte installiere Node.js von: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js gefunden: 
node --version
echo.

:: Prüfe ob wir im richtigen Ordner sind
if not exist "package.json" (
    echo [FEHLER] package.json nicht gefunden!
    echo.
    echo Bitte fuehre dieses Skript im FIX-PATCH-v1.0.0 Ordner aus.
    echo.
    pause
    exit /b 1
)

echo [OK] Richtiger Ordner
echo.

:: Dependencies installieren
echo ══════════════════════════════════════════════════════════════
echo   SCHRITT 1: Dependencies installieren...
echo ══════════════════════════════════════════════════════════════
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] npm install fehlgeschlagen!
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installiert
echo.

:: Playwright Browser installieren
echo ══════════════════════════════════════════════════════════════
echo   SCHRITT 2: Playwright Browser installieren...
echo ══════════════════════════════════════════════════════════════
echo.
call npx playwright install chromium
echo.
echo [OK] Browser installiert
echo.

:: Auto-Fix ausführen
echo ══════════════════════════════════════════════════════════════
echo   SCHRITT 3: Automatische Link-Reparatur...
echo ══════════════════════════════════════════════════════════════
echo.
call npm run fix
echo.

:: Frage ob Tests ausgeführt werden sollen
echo ══════════════════════════════════════════════════════════════
echo   SCHRITT 4: Tests ausfuehren?
echo ══════════════════════════════════════════════════════════════
echo.
set /p RUNTESTS="Moechtest du die Tests jetzt ausfuehren? (j/n): "
if /i "%RUNTESTS%"=="j" (
    echo.
    echo Starte Tests...
    call npm run test
)

echo.
echo ══════════════════════════════════════════════════════════════
echo   FERTIG!
echo ══════════════════════════════════════════════════════════════
echo.
echo Naechste Schritte:
echo   1. Pruefe die Aenderungen
echo   2. Kopiere die reparierten Dateien ins Hauptverzeichnis
echo   3. Committe und pushe auf GitHub
echo.
echo Befehle fuer GitHub:
echo   git add .
echo   git commit -m "Fix: Alle 404 Fehler behoben"
echo   git push
echo.
pause


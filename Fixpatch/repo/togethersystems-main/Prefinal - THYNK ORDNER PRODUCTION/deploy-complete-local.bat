@echo off
REM ╔═══════════════════════════════════════════════════════════════════╗
REM ║                                                                   ║
REM ║     THYNK ORDERS - COMPLETE LOCAL DEPLOYMENT (Windows)            ║
REM ║                                                                   ║
REM ║     Erstellt komplette lokale Application (OHNE SERVER)           ║
REM ║     Click & Run - Funktioniert direkt im Browser                  ║
REM ║                                                                   ║
REM ╚═══════════════════════════════════════════════════════════════════╝

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "DEPLOY_DIR=%SCRIPT_DIR%thynk-orders-local"
set "TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    🚀 THYNK ORDERS - COMPLETE LOCAL DEPLOYMENT
echo ═══════════════════════════════════════════════════════════════════
echo.

REM 1. Prüfe ob Deploy-Ordner existiert, lösche wenn ja
if exist "%DEPLOY_DIR%" (
    echo ⚠️  Deploy-Ordner existiert bereits. Lösche...
    rmdir /s /q "%DEPLOY_DIR%"
)

REM 2. Erstelle Deploy-Ordner-Struktur
echo 📁 Erstelle Ordner-Struktur...
mkdir "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%\docs"
mkdir "%DEPLOY_DIR%\config"
mkdir "%DEPLOY_DIR%\backups"

REM 3. Kopiere Haupt-HTML-Datei
echo 📄 Kopiere Haupt-Application...
if exist "%SCRIPT_DIR%THYNK-ORDERS-COMPLETE.html" (
    copy "%SCRIPT_DIR%THYNK-ORDERS-COMPLETE.html" "%DEPLOY_DIR%\index.html" >nul
    echo ✅ index.html kopiert
) else (
    echo ❌ THYNK-ORDERS-COMPLETE.html nicht gefunden!
    exit /b 1
)

REM 4. Kopiere Dokumentationen
echo 📚 Kopiere Dokumentationen...

if exist "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-DE.md" (
    copy "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-DE.md" "%DEPLOY_DIR%\docs\" >nul
    echo ✅ DOKUMENTATION-COMPLETE-DE.md kopiert
)

if exist "%SCRIPT_DIR%ANLEITUNG-FUER-DUMMIES.md" (
    copy "%SCRIPT_DIR%ANLEITUNG-FUER-DUMMIES.md" "%DEPLOY_DIR%\docs\" >nul
    echo ✅ ANLEITUNG-FUER-DUMMIES.md kopiert
)

if exist "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-NL.md" (
    copy "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-NL.md" "%DEPLOY_DIR%\docs\" >nul
    echo ✅ DOKUMENTATION-COMPLETE-NL.md kopiert
)

if exist "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-EN.md" (
    copy "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-EN.md" "%DEPLOY_DIR%\docs\" >nul
    echo ✅ DOKUMENTATION-COMPLETE-EN.md kopiert
)

if exist "%SCRIPT_DIR%DATENBANK-DOKUMENTATION.md" (
    copy "%SCRIPT_DIR%DATENBANK-DOKUMENTATION.md" "%DEPLOY_DIR%\docs\" >nul
)

if exist "%SCRIPT_DIR%UMBAU-ANPASSUNGEN-ANLEITUNG.md" (
    copy "%SCRIPT_DIR%UMBAU-ANPASSUNGEN-ANLEITUNG.md" "%DEPLOY_DIR%\docs\" >nul
)

REM 5. Kopiere README-Dateien
echo 📋 Kopiere README-Dateien...
if exist "%SCRIPT_DIR%README-DE.md" copy "%SCRIPT_DIR%README-DE.md" "%DEPLOY_DIR\" >nul
if exist "%SCRIPT_DIR%README-NL.md" copy "%SCRIPT_DIR%README-NL.md" "%DEPLOY_DIR\" >nul
if exist "%SCRIPT_DIR%README-EN.md" copy "%SCRIPT_DIR%README-EN.md" "%DEPLOY_DIR\" >nul

REM 6. Erstelle START-HIER.txt
echo 📝 Erstelle START-HIER.txt...
(
echo ═══════════════════════════════════════════════════════════════════
echo.
echo     🚀 THYNK ORDERS - LOCAL APPLICATION
echo.
echo     KEIN SERVER NÖTIG! - CLICK ^& RUN!
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo 📁 STARTEN:
echo.
echo 1. Doppelklick auf: index.html
echo.
echo ODER
echo.
echo 2. Rechtsklick → "Öffnen mit" → Browser wählen
echo.
echo ✅ FERTIG!
echo.
echo Die Application öffnet sich direkt im Browser.
echo Alles funktioniert lokal - kein Server nötig!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📚 DOKUMENTATION:
echo.
echo - docs\DOKUMENTATION-COMPLETE-DE.md (Deutsch^)
echo - docs\DOKUMENTATION-COMPLETE-NL.md (Nederlands^)
echo - docs\DOKUMENTATION-COMPLETE-EN.md (English^)
echo - docs\ANLEITUNG-FUER-DUMMIES.md (Für Anfänger^)
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ FUNKTIONEN:
echo.
echo ✅ Bestellungen erstellen
echo ✅ Bestellungen verwalten
echo ✅ Warenkorb
echo ✅ Statistiken
echo ✅ Export/Import (Backup^)
echo ✅ Lokale Datenspeicherung
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🎯 ALLES FUNKTIONIERT LOKAL - KEIN SERVER NÖTIG!
) > "%DEPLOY_DIR%\START-HIER.txt"

REM 7. Erstelle VERSION.txt
echo 📝 Erstelle VERSION.txt...
(
echo THYNK ORDERS - Local Application
echo Version: 1.0.0
echo Build: %TIMESTAMP%
echo Deployed: %date% %time%
echo Type: Local Standalone (No Server^)
) > "%DEPLOY_DIR%\VERSION.txt"

REM 8. Zusammenfassung
echo.
echo ═══════════════════════════════════════════════════════════════════
echo    ✅✅✅ DEPLOYMENT ERFOLGREICH ABGESCHLOSSEN! ✅✅✅
echo ═══════════════════════════════════════════════════════════════════
echo.
echo 📁 DEPLOYMENT-ORDNER:
echo    %DEPLOY_DIR%
echo.
echo 🚀 STARTEN:
echo    → Doppelklick auf: %DEPLOY_DIR%\index.html
echo.
echo 📚 DOKUMENTATION:
echo    → %DEPLOY_DIR%\docs\
echo.
echo ✅ ENTHALTEN:
echo    ✅ Haupt-Application (index.html^)
echo    ✅ Komplette Dokumentation (3 Sprachen^)
echo    ✅ README-Dateien
echo    ✅ Backup-Ordner
echo.
echo 🎉 FERTIG! Die Application ist bereit zum Verwenden!
echo.

pause


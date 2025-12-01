@echo off
REM ╔═══════════════════════════════════════════════════════════════════╗
REM ║     THYNK ORDERS - ONE-CLICK FULL DEPLOYMENT (Windows)            ║
REM ╚═══════════════════════════════════════════════════════════════════╝

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "DEPLOY_DIR=%SCRIPT_DIR%THYNK-ORDERS-FINAL"
set "VERSION=1.0.0"
set "TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"

cls
echo.
echo ═══════════════════════════════════════════════════════════════════
echo    🚀 THYNK ORDERS - ONE-CLICK FULL DEPLOYMENT
echo ═══════════════════════════════════════════════════════════════════
echo.

REM 1. Lösche alten Ordner
if exist "%DEPLOY_DIR%" (
    echo ⚠️  Alten Deployment-Ordner gefunden. Lösche...
    rmdir /s /q "%DEPLOY_DIR%"
    echo ✅ Alten Ordner gelöscht
)

REM 2. Erstelle Ordner-Struktur
echo 📁 Erstelle Ordner-Struktur...
mkdir "%DEPLOY_DIR%" 2>nul
mkdir "%DEPLOY_DIR%\docs" 2>nul
mkdir "%DEPLOY_DIR%\docs\de" 2>nul
mkdir "%DEPLOY_DIR%\docs\nl" 2>nul
mkdir "%DEPLOY_DIR%\docs\en" 2>nul
mkdir "%DEPLOY_DIR%\backups" 2>nul
mkdir "%DEPLOY_DIR%\config" 2>nul
echo ✅ Ordner-Struktur erstellt

REM 3. Kopiere Haupt-Application
echo 📄 Kopiere Haupt-Application...
if exist "%SCRIPT_DIR%THYNK-ORDERS-COMPLETE-WITH-THEME-SWITCHER.html" (
    copy "%SCRIPT_DIR%THYNK-ORDERS-COMPLETE-WITH-THEME-SWITCHER.html" "%DEPLOY_DIR%\index.html" >nul
    echo ✅ index.html kopiert (mit Theme-Switcher)
) else if exist "%SCRIPT_DIR%THYNK-ORDERS-COMPLETE.html" (
    copy "%SCRIPT_DIR%THYNK-ORDERS-COMPLETE.html" "%DEPLOY_DIR%\index.html" >nul
    echo ✅ index.html kopiert
) else (
    echo ❌ Haupt-HTML-Datei nicht gefunden!
    pause
    exit /b 1
)

REM 4-6. Kopiere Dokumentationen
echo 📚 Kopiere Dokumentationen...

if exist "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-DE.md" copy "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-DE.md" "%DEPLOY_DIR%\docs\de\" >nul
if exist "%SCRIPT_DIR%ANLEITUNG-FUER-DUMMIES.md" copy "%SCRIPT_DIR%ANLEITUNG-FUER-DUMMIES.md" "%DEPLOY_DIR%\docs\de\" >nul
if exist "%SCRIPT_DIR%DATENBANK-DOKUMENTATION.md" copy "%SCRIPT_DIR%DATENBANK-DOKUMENTATION.md" "%DEPLOY_DIR%\docs\de\" >nul

if exist "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-NL.md" copy "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-NL.md" "%DEPLOY_DIR%\docs\nl\" >nul
if exist "%SCRIPT_DIR%README-NL.md" copy "%SCRIPT_DIR%README-NL.md" "%DEPLOY_DIR%\docs\nl\" >nul

if exist "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-EN.md" copy "%SCRIPT_DIR%DOKUMENTATION-COMPLETE-EN.md" "%DEPLOY_DIR%\docs\en\" >nul
if exist "%SCRIPT_DIR%README-EN.md" copy "%SCRIPT_DIR%README-EN.md" "%DEPLOY_DIR%\docs\en\" >nul

if exist "%SCRIPT_DIR%README-DE.md" copy "%SCRIPT_DIR%README-DE.md" "%DEPLOY_DIR\" >nul
if exist "%SCRIPT_DIR%README-NL.md" copy "%SCRIPT_DIR%README-NL.md" "%DEPLOY_DIR\" >nul
if exist "%SCRIPT_DIR%README-EN.md" copy "%SCRIPT_DIR%README-EN.md" "%DEPLOY_DIR\" >nul

echo ✅ Dokumentationen kopiert

REM 7. Erstelle Dateien
echo 📝 Erstelle Info-Dateien...

(
echo ═══════════════════════════════════════════════════════════════════
echo.
echo     🚀 THYNK ORDERS - FINAL PRODUCTION
echo.
echo     ONE-CLICK DEPLOYMENT - FERTIG!
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo 📁 STARTEN:
echo.
echo Doppelklick auf: index.html
echo.
echo ✅ FERTIG!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🎨 THEME: Rechts oben zwischen Modern ^& THYNK Original wechseln
echo.
echo 📚 DOKUMENTATION: docs\de\ ^| docs\nl\ ^| docs\en\
echo.
echo ✅ ALLES FUNKTIONIERT LOKAL - KEIN SERVER!
) > "%DEPLOY_DIR%\START-HIER.txt"

(
echo THYNK ORDERS - Final Production
echo Version: %VERSION%
echo Build: %TIMESTAMP%
echo Deployed: %date% %time%
echo Status: Production Ready
echo Type: Local Standalone
) > "%DEPLOY_DIR%\VERSION.txt"

(
echo ✅ Bestellungen (Erstellen, Verwalten, Löschen^)
echo ✅ Warenkorb (Mehrere Produkte^)
echo ✅ Statistiken (Umsatz, Bestellungen^)
echo ✅ Export/Import (Backup^)
echo ✅ Theme-Switcher (2 Designs^)
echo ✅ Lokale Speicherung (localStorage^)
echo ✅ Responsive Design
echo ✅ Vollständig lokal - Kein Server!
) > "%DEPLOY_DIR%\FEATURES.txt"

REM Finale Zusammenfassung
echo.
echo ═══════════════════════════════════════════════════════════════════
echo    ✅✅✅ DEPLOYMENT ERFOLGREICH! ✅✅✅
echo ═══════════════════════════════════════════════════════════════════
echo.
echo 📁 DEPLOYMENT-ORDNER:
echo    %DEPLOY_DIR%
echo.
echo 🚀 STARTEN:
echo    Doppelklick auf: %DEPLOY_DIR%\index.html
echo.
echo 🎉 FERTIG! Alles bereit für den Einsatz!
echo.
pause


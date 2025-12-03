@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo   🔄 VOLLSTÄNDIGE HTML-KONVERTIERUNG
echo   ALLE .md DATEIEN → HTML (KEINE AUSLASSEN!)
echo ═══════════════════════════════════════════════════════════════════════
echo.
echo Bitte warten... Dies kann 1-3 Minuten dauern.
echo.

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File ".\KONVERTIERE-ALLE-zu-HTML-COMPLETE.ps1"

echo.
echo ═══════════════════════════════════════════════════════════════════════
echo   ✅ KONVERTIERUNG ABGESCHLOSSEN!
echo ═══════════════════════════════════════════════════════════════════════
echo.
echo 🌐 Öffnen Sie DOKU-INDEX-ALL.html im Browser für die vollständige Übersicht!
echo.
pause


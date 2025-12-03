@echo off
REM ================================================================
REM BUILD: SUPERSHINE HTML-GESAMTLÖSUNG
REM ================================================================
REM Erstellt THYNK-DOKU-COMPLETE-SUPERSHINE.html
REM Mit allen Dokumentationen + Da Vinci Style + Kino-Qualität
REM ================================================================

echo.
echo ════════════════════════════════════════════════════════════
echo   ✨ BUILD: SUPERSHINE HTML-GESAMTLÖSUNG
echo   🎬 Da Vinci Style - Kino-Qualität - Ultra-Animationen
echo ════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

REM Führe Build-Script aus
powershell -ExecutionPolicy Bypass -File "scripts\build-complete-supershine-final.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build fehlgeschlagen!
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo   ✅ BUILD ABGESCHLOSSEN!
echo   📄 Datei: THYNK-DOKU-COMPLETE-SUPERSHINE.html
echo ════════════════════════════════════════════════════════════
echo.

pause


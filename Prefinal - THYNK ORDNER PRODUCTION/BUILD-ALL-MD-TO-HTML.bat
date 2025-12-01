@echo off
echo.
echo ================================================================
echo   BUILD: ALLE MD-DATEIEN → HTML
echo ================================================================
echo.

cd /d "%~dp0"

powershell -ExecutionPolicy Bypass -File "scripts\build-docs-complete.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD ERFOLGREICH!
) else (
    echo.
    echo ❌ BUILD MIT FEHLERN ABGESCHLOSSEN
)

echo.
echo Fertig. Druecken Sie eine Taste zum Beenden...
pause >nul


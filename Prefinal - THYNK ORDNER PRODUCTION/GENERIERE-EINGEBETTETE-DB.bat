@echo off
echo.
echo ================================================================
echo   GENERIERE EINGEBETTETE DOKUMENTATIONS-DATENBANK
echo ================================================================
echo.

cd /d "%~dp0"

powershell -ExecutionPolicy Bypass -File "scripts\generate-embedded-docs-db.ps1"

echo.
echo Fertig! Druecken Sie eine Taste zum Beenden...
pause >nul


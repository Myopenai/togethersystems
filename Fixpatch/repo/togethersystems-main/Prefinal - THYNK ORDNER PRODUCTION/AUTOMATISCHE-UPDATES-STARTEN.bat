@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo   🔄 AUTOMATISCHE PRODUKTIONS-UPDATES
echo   OHNE USER-HANDLUNG - Läuft automatisch
echo ═══════════════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\production-tracker.ps1"

pause


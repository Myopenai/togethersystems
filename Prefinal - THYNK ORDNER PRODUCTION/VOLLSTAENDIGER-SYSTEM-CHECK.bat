@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo   🔍 VOLLSTÄNDIGER SYSTEM-CHECK
echo   Prüft: Tests, HTML-Konvertierung, Mehrsprachigkeit
echo   Bestätigt: Alles funktioniert 100%%
echo ═══════════════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\full-system-check.ps1"

pause


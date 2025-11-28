@echo off
REM Playwright Tests für TELCOMPETIOION automatisch starten (Windows Batch)

echo 🚀 Starte Playwright-Tests für TELCOMPETIOION...

REM PowerShell-Skript aufrufen
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-tests.ps1"

pause


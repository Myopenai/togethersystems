@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] SHOW ALL SERVERS
REM ============================================
REM Zeigt alle konfigurierten Server mit Namen
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] ALLE SERVER
echo ========================================
echo.

cd /d "%~dp0\hosts"
if errorlevel 1 (
    echo [FEHLER] Konnte nicht ins Hosts-Verzeichnis wechseln
    exit /b 1
)

powershell.exe -ExecutionPolicy Bypass -NoProfile -Command "$ErrorActionPreference='Continue'; $config = Get-Content 'host-config.json' | ConvertFrom-Json; Write-Host 'Konfigurierte Server:' -ForegroundColor Cyan; Write-Host ''; $count = 1; foreach ($host in $config.hosts) { Write-Host \"[$count] $($host.name)\" -ForegroundColor Yellow; Write-Host \"   Typ: $($host.type)\" -ForegroundColor Gray; if ($host.host) { Write-Host \"   Host: $($host.host)\" -ForegroundColor Gray }; Write-Host \"   Pfad: $($host.path)\" -ForegroundColor Gray; Write-Host \"   Platform: $($host.platform)\" -ForegroundColor Gray; if ($host.profile) { Write-Host \"   Profile: $($host.profile)\" -ForegroundColor Cyan }; if ($host.description) { Write-Host \"   Beschreibung: $($host.description)\" -ForegroundColor Gray }; Write-Host ''; $count++ }; Write-Host \"Gesamt: $($config.hosts.Count) Server\" -ForegroundColor White"

echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo ========================================
echo.

endlocal


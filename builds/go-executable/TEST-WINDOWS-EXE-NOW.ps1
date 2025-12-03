# Teste die Windows EXE jetzt richtig

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Windows EXE Test" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$exePath = "build\windows-amd64\ostosos-server.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "FEHLER: EXE nicht gefunden: $exePath" -ForegroundColor Red
    Write-Host "Bitte erst bauen: .\build-windows-console.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "EXE gefunden: $exePath" -ForegroundColor Green
Write-Host ""

# Test: Starte EXE direkt (mit Konsole sichtbar)
Write-Host "Starte Server auf Port 8080..." -ForegroundColor Cyan
Write-Host "Die Konsole bleibt sichtbar - du siehst alle Fehlermeldungen!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Zum Beenden: Ctrl+C druecken" -ForegroundColor Yellow
Write-Host ""

# Starte EXE - Konsole bleibt sichtbar
& $exePath 8080


# T,. OSOTOSOS - OBERSTER STEIN System Runner
# Führt die umfassende Schwachstellen-Analyse durch

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== T,. OBERSTER STEIN - Fundamentale System-Analyse ===" -ForegroundColor Cyan
Write-Host "Der oberste Stein, der die gesamte Fabrik durchleuchtet" -ForegroundColor Gray
Write-Host ""

# Prüfe Python
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "FEHLER: Python nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "Python gefunden: $($pythonCmd.Source)" -ForegroundColor Green
Write-Host ""

# Führe Analyse durch
Write-Host "Starte umfassende Analyse..." -ForegroundColor Yellow
Write-Host ""

python "$rootDir\OBERSTER-STEIN-SYSTEM.py" "$rootDir"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Analyse abgeschlossen ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Report wurde in artifacts/ gespeichert" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "=== Analyse mit Fehlern abgeschlossen ===" -ForegroundColor Yellow
    Write-Host "Bitte Report in artifacts/ prüfen" -ForegroundColor Gray
}


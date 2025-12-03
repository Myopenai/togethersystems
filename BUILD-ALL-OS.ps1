# ============================================================================
# BUILD ALL OS
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Erstellt Builds fuer alle Betriebssysteme
# ============================================================================

$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. BUILD ALL OS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Go Executable Builds
Write-Host "[1] Erstelle Go Executable Builds..." -ForegroundColor Yellow
$goBuildScript = Join-Path $rootDir "builds\go-executable\build-all.ps1"
if (Test-Path $goBuildScript) {
    Push-Location (Join-Path $rootDir "builds\go-executable")
    try {
        & .\build-all.ps1
        Write-Host "  [OK] Go Builds erfolgreich" -ForegroundColor Green
    } catch {
        Write-Host "  [FEHLER] Go Builds fehlgeschlagen: $_" -ForegroundColor Red
    }
    Pop-Location
} else {
    Write-Host "  [WARNUNG] Go Build Script nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""

# 2. OSOTOSOS Server Builds
Write-Host "[2] Erstelle OSOTOSOS Server Builds..." -ForegroundColor Yellow
$osBuildScript = Join-Path $rootDir "OSTOSOS-COMPLETE-OS-SYSTEM\build-server.ps1"
if (Test-Path $osBuildScript) {
    Push-Location (Join-Path $rootDir "OSTOSOS-COMPLETE-OS-SYSTEM")
    try {
        & .\build-server.ps1
        Write-Host "  [OK] OSOTOSOS Server Builds erfolgreich" -ForegroundColor Green
    } catch {
        Write-Host "  [FEHLER] OSOTOSOS Server Builds fehlgeschlagen: $_" -ForegroundColor Red
    }
    Pop-Location
} else {
    Write-Host "  [WARNUNG] OSOTOSOS Build Script nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. BUILD ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan


# ============================================================================
# RUN TESTS - VOM ROOT VERZEICHNIS
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Fuehrt alle Tests aus - Funktioniert vom Root-Verzeichnis
# ============================================================================

$ErrorActionPreference = "Continue"

# Berechne Pfade
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$togetherSystemsDir = Join-Path $rootDir "TogetherSystems"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. RUN TESTS - VOM ROOT" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,. Root-Verzeichnis: $rootDir" -ForegroundColor Cyan
Write-Host "T,. TogetherSystems-Verzeichnis: $togetherSystemsDir" -ForegroundColor Cyan
Write-Host ""

# Pruefe ob TogetherSystems existiert
if (-not (Test-Path $togetherSystemsDir)) {
    Write-Host "T,. FEHLER: TogetherSystems-Verzeichnis nicht gefunden!" -ForegroundColor Red
    Write-Host "T,. Erwartet: $togetherSystemsDir" -ForegroundColor Yellow
    exit 1
}

# Wechsle ins TogetherSystems-Verzeichnis
Set-Location $togetherSystemsDir
Write-Host "T,. Gewechselt nach: $togetherSystemsDir" -ForegroundColor Green
Write-Host ""

# Fuehre TEST-SIMPLE.ps1 aus
Write-Host "T,. Starte TEST-SIMPLE.ps1..." -ForegroundColor Yellow
$testSimplePath = Join-Path $togetherSystemsDir "TEST-SIMPLE.ps1"
if (Test-Path $testSimplePath) {
    & $testSimplePath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "T,. WARNUNG: Tests mit Fehlern abgeschlossen" -ForegroundColor Yellow
    } else {
        Write-Host "T,. Tests erfolgreich" -ForegroundColor Green
    }
} else {
    Write-Host "T,. FEHLER: TEST-SIMPLE.ps1 nicht gefunden!" -ForegroundColor Red
    Write-Host "T,. Erwartet: $testSimplePath" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. RUN TESTS ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""

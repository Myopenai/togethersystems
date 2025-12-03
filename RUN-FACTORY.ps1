# ============================================================================
# RUN FACTORY - VOM ROOT VERZEICHNIS
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Fuehrt Factory und Tests aus - Funktioniert vom Root-Verzeichnis
# ============================================================================

$ErrorActionPreference = "Continue"

# Berechne Pfade
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$togetherSystemsDir = Join-Path $rootDir "TogetherSystems"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. RUN FACTORY - VOM ROOT" -ForegroundColor Green
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

# Fuehre MAKE-FACTORY.ps1 aus
Write-Host "T,. Starte MAKE-FACTORY.ps1..." -ForegroundColor Yellow
$makeFactoryPath = Join-Path $togetherSystemsDir "MAKE-FACTORY.ps1"
if (Test-Path $makeFactoryPath) {
    & $makeFactoryPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "T,. WARNUNG: MAKE-FACTORY mit Fehlern abgeschlossen" -ForegroundColor Yellow
    } else {
        Write-Host "T,. MAKE-FACTORY erfolgreich" -ForegroundColor Green
    }
} else {
    Write-Host "T,. FEHLER: MAKE-FACTORY.ps1 nicht gefunden!" -ForegroundColor Red
    Write-Host "T,. Erwartet: $makeFactoryPath" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. RUN FACTORY ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""

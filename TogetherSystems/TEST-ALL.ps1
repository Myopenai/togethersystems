# ============================================================================
# TEST ALL
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Führt Make Factory und alle Tests aus
# ============================================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. MAKE FACTORY + TESTS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path "MAKE-FACTORY.ps1")) {
    Write-Host "T,. FEHLER: Nicht im TogetherSystems-Verzeichnis!" -ForegroundColor Red
    Write-Host "T,. Bitte wechsle ins TogetherSystems-Verzeichnis" -ForegroundColor Yellow
    exit 1
}

# 1. Make Factory
Write-Host "T,. Schritt 1: Make Factory..." -ForegroundColor Yellow
& "$PSScriptRoot\MAKE-FACTORY.ps1"
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
    Write-Host "T,. ⚠ Make Factory mit Fehlern" -ForegroundColor Yellow
}

Write-Host ""

# 2. TypeScript Compile Check
Write-Host "T,. Schritt 2: TypeScript Check..." -ForegroundColor Yellow
$tsOutput = npx tsc --noEmit 2>&1
$tsErrorCount = ($tsOutput | Select-String -Pattern "error TS").Count
if ($tsErrorCount -gt 0) {
    Write-Host "T,. ⚠ $tsErrorCount TypeScript-Fehler gefunden" -ForegroundColor Yellow
    $tsOutput | Select-String -Pattern "error TS" | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
} else {
    Write-Host "T,. ✓ TypeScript: Keine Fehler" -ForegroundColor Green
}

Write-Host ""

# 3. Jest Tests
Write-Host "T,. Schritt 3: Jest Tests..." -ForegroundColor Yellow
if (Test-Path "jest.config.js") {
    npm test 2>&1 | Select-Object -Last 15
} else {
    Write-Host "T,. - Jest nicht konfiguriert" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. TESTS ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""


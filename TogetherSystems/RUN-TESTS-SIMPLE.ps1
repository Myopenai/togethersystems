# ============================================================================
# RUN TESTS SIMPLE
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Einfache Version: Make Factory + Tests
# ============================================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. MAKE FACTORY + TESTS (SIMPLE)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Make Factory
Write-Host "T,. Schritt 1: Make Factory..." -ForegroundColor Yellow
& ".\MAKE-FACTORY.ps1" 2>&1 | Select-Object -Last 15

Write-Host ""

# 2. TypeScript Check
Write-Host "T,. Schritt 2: TypeScript Check..." -ForegroundColor Yellow
$tsResult = npx tsc --noEmit 2>&1
$tsErrors = $tsResult | Select-String -Pattern "error TS"
if ($tsErrors) {
    Write-Host "T,. ⚠ TypeScript-Fehler:" -ForegroundColor Yellow
    $tsErrors | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
} else {
    Write-Host "T,. ✓ TypeScript: OK" -ForegroundColor Green
}

Write-Host ""

# 3. Jest Tests
Write-Host "T,. Schritt 3: Jest Tests..." -ForegroundColor Yellow
if (Test-Path "jest.config.js") {
    npm test 2>&1 | Select-Object -Last 10
} else {
    Write-Host "T,. - Jest nicht konfiguriert" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. FERTIG" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""


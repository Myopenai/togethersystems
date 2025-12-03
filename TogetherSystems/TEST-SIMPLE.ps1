# ============================================================================
# TEST SIMPLE
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Einfacher System-Test - Direkt, ohne Jobs
# ============================================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. SYSTEM-TEST" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Pruefe Verzeichnis
if (-not (Test-Path "MAKE-FACTORY.ps1")) {
    Write-Host "T,. FEHLER: Nicht im TogetherSystems-Verzeichnis!" -ForegroundColor Red
    exit 1
}

# 1. Make Factory
Write-Host "T,. Test 1: Make Factory..." -ForegroundColor Yellow
& ".\MAKE-FACTORY.ps1" 2>&1 | Select-Object -Last 15
Write-Host "T,. Make Factory abgeschlossen" -ForegroundColor Green
Write-Host ""

# 2. TypeScript Check
Write-Host "T,. Test 2: TypeScript Check..." -ForegroundColor Yellow
$tsOutput = npx tsc --noEmit 2>&1
$tsErrors = $tsOutput | Select-String -Pattern "error TS"
if ($tsErrors) {
    Write-Host "T,. WARNUNG: TypeScript-Fehler:" -ForegroundColor Yellow
    $tsErrors | Select-Object -First 3 | ForEach-Object { 
        $line = $_.ToString()
        Write-Host "  $line" -ForegroundColor Yellow 
    }
} else {
    Write-Host "T,. TypeScript: Keine Fehler" -ForegroundColor Green
}
Write-Host ""

# 3. Jest Tests
Write-Host "T,. Test 3: Jest Tests..." -ForegroundColor Yellow
if (Test-Path "jest.config.js") {
    npm test 2>&1 | Select-Object -Last 10
    Write-Host "T,. Jest Tests abgeschlossen" -ForegroundColor Green
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

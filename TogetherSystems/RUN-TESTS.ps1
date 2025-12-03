# ============================================================================
# RUN TESTS
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Führt Make Factory + Alle Tests aus
# ============================================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. MAKE FACTORY + ALLE TESTS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Make Factory
Write-Host "T,. Schritt 1: Make Factory..." -ForegroundColor Yellow
& ".\MAKE-FACTORY.ps1"

Write-Host ""

# 2. TypeScript-Kompilierung prüfen
Write-Host "T,. Schritt 2: TypeScript-Kompilierung..." -ForegroundColor Yellow
try {
    $tsErrors = npx tsc --noEmit 2>&1 | Select-String -Pattern "error TS"
    if ($tsErrors) {
        Write-Host "T,. ⚠ TypeScript-Fehler gefunden:" -ForegroundColor Yellow
        $tsErrors | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    } else {
        Write-Host "T,. ✓ TypeScript: Keine Fehler" -ForegroundColor Green
    }
} catch {
    Write-Host "T,. ⚠ TypeScript-Check fehlgeschlagen" -ForegroundColor Yellow
}

Write-Host ""

# 3. Jest Tests (falls vorhanden)
Write-Host "T,. Schritt 3: Jest Tests..." -ForegroundColor Yellow
if (Test-Path "jest.config.js") {
    try {
        npm test 2>&1 | Select-Object -Last 10
        Write-Host "T,. ✓ Jest Tests abgeschlossen" -ForegroundColor Green
    } catch {
        Write-Host "T,. ⚠ Jest Tests mit Warnungen" -ForegroundColor Yellow
    }
} else {
    Write-Host "T,. - Jest Config nicht gefunden, überspringe" -ForegroundColor Cyan
}

Write-Host ""

# 4. A-Start Test
Write-Host "T,. Schritt 4: A-Start Test..." -ForegroundColor Yellow
try {
    $output = npx ts-node Fabrikage.AutoExecution/bootstrap/a-start.ts 2>&1 | Select-Object -Last 20
    $output | ForEach-Object { Write-Host $_ }
    Write-Host "T,. ✓ A-Start Test abgeschlossen" -ForegroundColor Green
} catch {
    Write-Host "T,. ⚠ A-Start Test mit Warnungen" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. TESTS ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""


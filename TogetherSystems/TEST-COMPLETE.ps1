# ============================================================================
# TEST COMPLETE
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Vollständiger System-Test ohne Hänger
# ============================================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. VOLLSTÄNDIGER SYSTEM-TEST" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe Verzeichnis
if (-not (Test-Path "MAKE-FACTORY.ps1")) {
    Write-Host "T,. FEHLER: Nicht im TogetherSystems-Verzeichnis!" -ForegroundColor Red
    exit 1
}

# 1. Make Factory (mit Timeout)
Write-Host "T,. Test 1: Make Factory..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    & ".\MAKE-FACTORY.ps1" 2>&1
}
$result = $job | Wait-Job -Timeout 60
if ($result) {
    $output = $job | Receive-Job
    $output | Select-Object -Last 20 | ForEach-Object { Write-Host $_ }
    $job | Remove-Job
    Write-Host "T,. ✓ Make Factory abgeschlossen" -ForegroundColor Green
} else {
    $job | Stop-Job
    $job | Remove-Job
    Write-Host "T,. ⚠ Make Factory Timeout (60s)" -ForegroundColor Yellow
}

Write-Host ""

# 2. TypeScript Check
Write-Host "T,. Test 2: TypeScript Check..." -ForegroundColor Yellow
$tsJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx tsc --noEmit 2>&1
}
$tsResult = $tsJob | Wait-Job -Timeout 30
if ($tsResult) {
    $tsOutput = $tsJob | Receive-Job
    $tsErrors = $tsOutput | Select-String -Pattern "error TS"
    if ($tsErrors) {
        Write-Host "T,. ⚠ TypeScript-Fehler gefunden:" -ForegroundColor Yellow
        $tsErrors | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    } else {
        Write-Host "T,. ✓ TypeScript: Keine Fehler" -ForegroundColor Green
    }
    $tsJob | Remove-Job
} else {
    $tsJob | Stop-Job
    $tsJob | Remove-Job
    Write-Host "T,. ⚠ TypeScript Check Timeout" -ForegroundColor Yellow
}

Write-Host ""

# 3. Jest Tests
Write-Host "T,. Test 3: Jest Tests..." -ForegroundColor Yellow
if (Test-Path "jest.config.js") {
    $jestJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm test 2>&1
    }
    $jestResult = $jestJob | Wait-Job -Timeout 60
    if ($jestResult) {
        $jestOutput = $jestJob | Receive-Job
        $jestOutput | Select-Object -Last 15 | ForEach-Object { Write-Host $_ }
        $jestJob | Remove-Job
        Write-Host "T,. ✓ Jest Tests abgeschlossen" -ForegroundColor Green
    } else {
        $jestJob | Stop-Job
        $jestJob | Remove-Job
        Write-Host "T,. ⚠ Jest Tests Timeout" -ForegroundColor Yellow
    }
} else {
    Write-Host "T,. - Jest nicht konfiguriert" -ForegroundColor Cyan
}

Write-Host ""

# 4. A-Start Test (mit Timeout)
Write-Host "T,. Test 4: A-Start Test..." -ForegroundColor Yellow
$astartJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx ts-node Fabrikage.AutoExecution/bootstrap/a-start.ts 2>&1
}
$astartResult = $astartJob | Wait-Job -Timeout 30
if ($astartResult) {
    $astartOutput = $astartJob | Receive-Job
    $astartOutput | Select-Object -Last 20 | ForEach-Object { Write-Host $_ }
    $astartJob | Remove-Job
    Write-Host "T,. ✓ A-Start Test abgeschlossen" -ForegroundColor Green
} else {
    $astartJob | Stop-Job
    $astartJob | Remove-Job
    Write-Host "T,. ⚠ A-Start Test Timeout (30s) - möglicher Hänger erkannt!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. SYSTEM-TEST ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""


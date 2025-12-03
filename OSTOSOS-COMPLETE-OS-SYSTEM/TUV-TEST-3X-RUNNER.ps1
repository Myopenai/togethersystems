# T,. OSOTOSOS - TUEV-Test 3x Runner
# Fuehrt TUEV-Test 3x hintereinander aus und prueft auf 100% Erfolg

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - TUEV-Test 3x Runner ===" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true
$results = @()

for ($i = 1; $i -le 3; $i++) {
    Write-Host "=== TUEV-Test Lauf $i von 3 ===" -ForegroundColor Yellow
    Write-Host ""
    
    $startTime = Get-Date
    $output = & powershell -ExecutionPolicy Bypass -File .\tuv.ps1 all 2>&1
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    $passed = $LASTEXITCODE -eq 0 -and ($output -match "PASSED|OK|Complete" -and $output -notmatch "FAILED|ERROR|FAIL")
    
    $results += @{
        Run = $i
        Passed = $passed
        Duration = $duration
        Output = $output
    }
    
    $durationText = $duration.ToString('F2') + "s"
    if ($passed) {
        Write-Host "OK Lauf ${i}: BESTANDEN $durationText" -ForegroundColor Green
    } else {
        Write-Host "FAIL Lauf ${i}: FEHLGESCHLAGEN $durationText" -ForegroundColor Red
        $allPassed = $false
        Write-Host "Letzte 20 Zeilen:" -ForegroundColor Yellow
        $output | Select-Object -Last 20 | ForEach-Object { Write-Host $_ }
    }
    
    Write-Host ""
    
    # Warte 2 Sekunden zwischen Laeufen
    if ($i -lt 3) {
        Start-Sleep -Seconds 2
    }
}

Write-Host "=== Zusammenfassung ===" -ForegroundColor Cyan
Write-Host ""

$passedCount = ($results | Where-Object { $_.Passed }).Count
Write-Host "Bestanden: $passedCount von 3" -ForegroundColor $(if ($passedCount -eq 3) { "Green" } else { "Red" })

foreach ($result in $results) {
    $status = if ($result.Passed) { "OK" } else { "FAIL" }
    $durText = $result.Duration.ToString('F2') + "s"
    Write-Host "$status Lauf $($result.Run): $durText" -ForegroundColor $(if ($result.Passed) { "Green" } else { "Red" })
}

Write-Host ""

if ($allPassed) {
    Write-Host "=== OK ALLE 3 TUEV-TESTS BESTANDEN ===" -ForegroundColor Green
    exit 0
} else {
    Write-Host "=== FAIL TUEV-TESTS FEHLGESCHLAGEN ===" -ForegroundColor Red
    exit 1
}

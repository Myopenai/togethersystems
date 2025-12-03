# VOLLSTÄNDIGES MASTER-TEST-SYSTEM
# Führt ALLE Tests aus und schreibt Portal-Info

$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host "`n🧪🧪🧪 VOLLSTÄNDIGES MASTER-TEST-SYSTEM 🧪🧪🧪`n" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "Testet ALLE Applikationen, Systeme, Code und Software" -ForegroundColor White
Write-Host "Settings-OS als Herz und Analyse-Engine" -ForegroundColor White
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Portal-Info schreiben
function Write-PortalInfo {
    param($Summary)
    
    $portalInfo = @{
        timestamp = (Get-Date).ToISOString()
        message = "Es wird kontinuierlich an der App gearbeitet"
        status = if ($Summary.totalErrors -eq 0) { 'success' } 
                 elseif ($Summary.totalErrors -lt 5) { 'warning' } 
                 else { 'error' }
        statistics = @{
            totalApplications = 30
            totalErrors = $Summary.totalErrors
            totalFixed = $Summary.totalFixed
            testsPassed = 0
            testsTotal = 7
        }
        progress = @{
            percentage = 0
            statusText = "Wird getestet..."
        }
    }
    
    $portalInfo | ConvertTo-Json -Depth 10 | Out-File "portal-test-info.json" -Encoding UTF8
    Write-Host "💾 Portal-Info geschrieben" -ForegroundColor Cyan
}

# Initiale Portal-Info
Write-PortalInfo @{ totalErrors = 0; totalFixed = 0 }

# Führe Tests aus
try {
    node RUN-ALL-TESTS-COMPLETE-MASTER.js
    $success = $LASTEXITCODE -eq 0
} catch {
    Write-Host "❌ Fehler: $_" -ForegroundColor Red
    $success = $false
}

# Finale Portal-Info
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host "`n⏱️  Dauer: $([math]::Round($duration, 2)) Sekunden" -ForegroundColor White

# Lade finales Ergebnis
if (Test-Path "COMPLETE-MASTER-TEST-REPORT.json") {
    $report = Get-Content "COMPLETE-MASTER-TEST-REPORT.json" | ConvertFrom-Json
    Write-PortalInfo @{ 
        totalErrors = $report.summary.totalErrors
        totalFixed = $report.summary.totalFixed
    }
} else {
    Write-PortalInfo @{ totalErrors = 0; totalFixed = 0 }
}

exit $(if ($success) { 0 } else { 1 })








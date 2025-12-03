# PowerShell Script: Startet Tests und fixt Fehler automatisch
# Läuft in einer Schleife bis alle Fehler behoben sind

Write-Host "🧪 Starte Test- und Fix-Zyklus..." -ForegroundColor Green
Write-Host ""

$maxIterations = 10
$iteration = 0
$allErrorsFixed = $false

while (-not $allErrorsFixed -and $iteration -lt $maxIterations) {
    $iteration++
    Write-Host "🔄 Iteration $iteration/$maxIterations" -ForegroundColor Yellow
    Write-Host ""
    
    # Führe Fix-System aus
    Write-Host "🔧 Automatische Fehlerbehebung..." -ForegroundColor Cyan
    node fix-all-errors-complete.js 2>&1 | Out-Null
    
    # Führe Tests aus
    Write-Host "🧪 Tests ausführen..." -ForegroundColor Cyan
    $testResult = node comprehensive-test-system.js 2>&1
    
    # Prüfe Ergebnis
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅✅✅ ALLE TESTS BESTANDEN! ✅✅✅" -ForegroundColor Green
        Write-Host ""
        $allErrorsFixed = $true
        break
    } else {
        Write-Host ""
        Write-Host "⚠️  Fehler gefunden. Weiter mit nächster Iteration..." -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 2
    }
}

if ($allErrorsFixed) {
    Write-Host "🎉 Alle Fehler behoben! Code ist fehlerfrei!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Maximal $maxIterations Iterationen erreicht." -ForegroundColor Yellow
    exit 1
}










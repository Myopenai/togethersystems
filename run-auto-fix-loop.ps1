# Automatisches Fehlerbehebungs-Loop
# Führt automatische Fehlerbehebung aus bis alles fehlerfrei ist

Write-Host "🚀 Starte automatische Fehlerbehebung..." -ForegroundColor Green
Write-Host ""

$maxIterations = 50
$iteration = 0
$consecutiveClean = 0
$totalErrors = 0
$totalFixes = 0

while ($maxIterations -gt 0) {
    $maxIterations--
    $iteration++
    
    Write-Host "🔄 Iteration $iteration" -ForegroundColor Cyan
    Write-Host ""
    
    # Führe comprehensive-error-fixer.js aus
    $result = node comprehensive-error-fixer.js 2>&1
    $exitCode = $LASTEXITCODE
    
    Write-Host $result
    
    # Prüfe ob Fehler vorhanden
    if ($exitCode -eq 0 -and $result -notmatch "Fehler gefunden|errors found|❌") {
        $consecutiveClean++
        if ($consecutiveClean -ge 2) {
            Write-Host ""
            Write-Host "✅✅✅ ALLE FEHLER BEHOBEN! ✅✅✅" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Zusammenfassung:" -ForegroundColor Yellow
            Write-Host "   - Iterationen: $iteration"
            Write-Host "   - Behobene Fehler: $totalFixes"
            Write-Host ""
            break
        }
    } else {
        $consecutiveClean = 0
        if ($result -match "behoben|fixed") {
            $totalFixes++
        }
    }
    
    Write-Host ""
    Write-Host "⏳ Warte 1 Sekunde..." -ForegroundColor Gray
    Start-Sleep -Seconds 1
    Write-Host ""
}

if ($maxIterations -le 0) {
    Write-Host ""
    Write-Host "⚠️  Maximale Iterationen erreicht" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "✅ Fehlerbehebung abgeschlossen" -ForegroundColor Green



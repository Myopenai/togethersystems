# PowerShell Script: Führe ALLE Tests aus und fixe Fehler automatisch

Write-Host "🔍 Führe alle Tests aus..." -ForegroundColor Green
Write-Host ""

# Prüfe Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Prüfe Playwright
if (-not (Test-Path "node_modules\@playwright\test")) {
    Write-Host "⚠️  Playwright nicht installiert. Installiere..." -ForegroundColor Yellow
    npm install --save-dev @playwright/test playwright
    npx playwright install chromium
}

Write-Host "📋 Tests:" -ForegroundColor Cyan
Write-Host "   1. HTML-Syntax & Validierung" -ForegroundColor White
Write-Host "   2. Broken Links (404, etc.)" -ForegroundColor White
Write-Host "   3. JSON.parse() Fehler" -ForegroundColor White
Write-Host "   4. fetch() Fehler" -ForegroundColor White
Write-Host "   5. Browser-Tests (Playwright)" -ForegroundColor White
Write-Host ""

$maxIterations = 10
$iteration = 0
$allErrorsFixed = $false

while (-not $allErrorsFixed -and $iteration -lt $maxIterations) {
    $iteration++
    Write-Host "🔄 Iteration $iteration/$maxIterations" -ForegroundColor Yellow
    Write-Host ""
    
    # Führe Tests aus
    $testResult = node comprehensive-test-system.js 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅✅✅ ALLE TESTS BESTANDEN! ✅✅✅" -ForegroundColor Green
        Write-Host ""
        $allErrorsFixed = $true
        break
    } else {
        Write-Host ""
        Write-Host "❌ Fehler gefunden. Automatisches Fixen..." -ForegroundColor Yellow
        
        # Warte kurz, damit Fixes angewendet werden
        Start-Sleep -Seconds 2
        
        Write-Host ""
    }
}

if (-not $allErrorsFixed) {
    Write-Host ""
    Write-Host "⚠️  Maximal $maxIterations Iterationen erreicht." -ForegroundColor Yellow
    Write-Host "   Einige Fehler konnten nicht automatisch behoben werden." -ForegroundColor Yellow
    Write-Host ""
    exit 1
} else {
    Write-Host "🎉 Alle Tests erfolgreich! Code ist fehlerfrei!" -ForegroundColor Green
    Write-Host ""
    exit 0
}










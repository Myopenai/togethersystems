# Startet den automatischen Test-Loop
# Dieser Script läuft unaufhörlich bis alles fehlerfrei ist

Write-Host "🚀 Starte automatisches Test-System..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Ziel: Alle Fehler beheben + Deployment" -ForegroundColor Yellow
Write-Host "⚠️  Dieser Prozess läuft automatisch ohne Unterbrechung!" -ForegroundColor Yellow
Write-Host ""

# Prüfe ob Node.js verfügbar ist
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js gefunden: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Prüfe ob Playwright installiert ist
try {
    $playwrightCheck = node -e "require('playwright')" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Playwright gefunden" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Playwright nicht gefunden, installiere..." -ForegroundColor Yellow
        npm install playwright
    }
} catch {
    Write-Host "⚠️  Installiere Playwright..." -ForegroundColor Yellow
    npm install playwright
    npx playwright install chromium
}

Write-Host ""
Write-Host "🔄 Starte automatischen Loop..." -ForegroundColor Cyan
Write-Host ""

# Starte den unaufhörlichen Loop
node infinite-test-loop.js



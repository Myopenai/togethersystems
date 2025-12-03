# Einfaches Test-Script für Think Orders
# Führt alle Tests aus und zeigt Ergebnis

Write-Host "🧪 Starte Think Orders Test-Suite..." -ForegroundColor Cyan
Write-Host ""

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Fehler: package.json nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte ausführen aus: THYNK ORDNER PRODUCTION/tests/think-orders" -ForegroundColor Yellow
    exit 1
}

# Prüfe ob Playwright installiert ist
if (-not (Test-Path "node_modules/playwright")) {
    Write-Host "📦 Installiere Playwright..." -ForegroundColor Yellow
    npm install
    npx playwright install --with-deps chromium
}

Write-Host "✅ Dependencies vorhanden" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starte Tests..." -ForegroundColor Cyan
Write-Host ""

# Führe Tests aus
try {
    npm test -- --project=chromium --reporter=list
    Write-Host ""
    Write-Host "✅ Tests abgeschlossen!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Fehler beim Ausführen der Tests" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""
Write-Host "📊 Test-Report sollte oben angezeigt worden sein" -ForegroundColor Cyan
Write-Host "Für detaillierten Report: npm test -- --reporter=html" -ForegroundColor Yellow


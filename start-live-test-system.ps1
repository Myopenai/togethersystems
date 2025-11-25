# PowerShell Script: Starte Live Auto-Test & Fix System
# Überwacht Code-Änderungen und testet/fixt automatisch

Write-Host "🚀 Starte Live Auto-Test & Fix System..." -ForegroundColor Green
Write-Host ""

# Prüfe ob Node.js installiert ist
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js nicht gefunden. Bitte installieren: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Prüfe ob Playwright installiert ist
if (-not (Test-Path "node_modules\@playwright\test")) {
    Write-Host "⚠️  Playwright nicht installiert. Installiere..." -ForegroundColor Yellow
    npm install --save-dev @playwright/test playwright
    npx playwright install chromium
}

# Prüfe ob comprehensive-test-system.js existiert
if (-not (Test-Path "comprehensive-test-system.js")) {
    Write-Host "❌ comprehensive-test-system.js nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Voraussetzungen erfüllt" -ForegroundColor Green
Write-Host ""
Write-Host "👁️  System überwacht jetzt alle Code-Änderungen..." -ForegroundColor Cyan
Write-Host "   - HTML-Dateien werden automatisch getestet" -ForegroundColor White
Write-Host "   - Links werden validiert (404, broken links)" -ForegroundColor White
Write-Host "   - JSON.parse() und fetch() werden geprüft" -ForegroundColor White
Write-Host "   - Fehler werden automatisch gefixt" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Drücke Ctrl+C zum Stoppen" -ForegroundColor Yellow
Write-Host ""

# Starte Live-Test-System
node live-auto-test-and-fix.js



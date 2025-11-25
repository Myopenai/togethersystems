# PowerShell Script: Startet Live-Test-Loop
# Testet kontinuierlich und fixt Fehler automatisch

Write-Host "🚀 Starte Live-Test-Loop (läuft kontinuierlich)..." -ForegroundColor Green
Write-Host ""

# Prüfe Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 System:" -ForegroundColor Cyan
Write-Host "   - Überwacht alle Code-Änderungen" -ForegroundColor White
Write-Host "   - Testet automatisch bei jeder Änderung" -ForegroundColor White
Write-Host "   - Fixt Fehler automatisch" -ForegroundColor White
Write-Host "   - Läuft kontinuierlich (keine Unterbrechung)" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Drücke Ctrl+C zum Stoppen" -ForegroundColor Yellow
Write-Host ""

# Starte Live-Test-System
node live-auto-test-and-fix.js



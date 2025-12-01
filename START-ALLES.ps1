# Startet alle automatischen Systeme
# Fix → Test → Fix → Test → ... bis perfekt → Deploy

Write-Host "🚀 Starte ALLES - Automatisches System..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Aktiviert:" -ForegroundColor Yellow
Write-Host "   1. Automatische Fehlerbehebung" -ForegroundColor Cyan
Write-Host "   2. Automatisches Testing" -ForegroundColor Cyan
Write-Host "   3. Automatisches Deployment" -ForegroundColor Cyan
Write-Host ""

# Prüfe Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Starte automatischen Fix- und Test-Loop..." -ForegroundColor Cyan
Write-Host "⚠️  Dieser Prozess läuft bis alles fehlerfrei ist!" -ForegroundColor Yellow
Write-Host ""

# Starte den Loop
node auto-fix-and-test-loop.js

Write-Host ""
Write-Host "✅ System gestartet!" -ForegroundColor Green










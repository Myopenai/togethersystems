# Git Commit und Push Skript
# Führt alle Änderungen aus: add, commit, push

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git Commit & Push - Alle Fehler behoben" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe Git-Status
Write-Host "1. Prüfe Git-Status..." -ForegroundColor Yellow
git status
Write-Host ""

# Alle Änderungen hinzufügen
Write-Host "2. Füge alle Änderungen hinzu..." -ForegroundColor Yellow
git add .
Write-Host "✅ Alle Dateien hinzugefügt" -ForegroundColor Green
Write-Host ""

# Commit erstellen
Write-Host "3. Erstelle Commit..." -ForegroundColor Yellow
$commitMessage = "Alle kritischen Fehler behoben: Autofix, Service Worker, Bilder, Farbsplashes, Telbank-Links"
git commit -m $commitMessage
Write-Host "✅ Commit erstellt" -ForegroundColor Green
Write-Host ""

# Push zu GitHub
Write-Host "4. Pushe zu GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host ""

# Prüfe ob Push erfolgreich war
if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ ERFOLGREICH!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Alle Änderungen wurden zu GitHub gepusht." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Nächste Schritte:" -ForegroundColor Yellow
    Write-Host "1. Browser-Cache leeren: Strg+Shift+R" -ForegroundColor White
    Write-Host "2. Service Worker aktualisieren:" -ForegroundColor White
    Write-Host "   - DevTools öffnen (F12)" -ForegroundColor White
    Write-Host "   - Application → Service Workers" -ForegroundColor White
    Write-Host "   - 'Unregister' klicken" -ForegroundColor White
    Write-Host "3. Seite neu laden" -ForegroundColor White
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ FEHLER BEIM PUSH!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Mögliche Ursachen:" -ForegroundColor Yellow
    Write-Host "- Keine Verbindung zu GitHub" -ForegroundColor White
    Write-Host "- Authentifizierungsfehler" -ForegroundColor White
    Write-Host "- Remote-Repository hat Änderungen" -ForegroundColor White
    Write-Host ""
    Write-Host "Lösung:" -ForegroundColor Yellow
    Write-Host "git pull origin main --allow-unrelated-histories" -ForegroundColor Cyan
    Write-Host "Dann erneut: git push origin main" -ForegroundColor Cyan
}

Write-Host ""


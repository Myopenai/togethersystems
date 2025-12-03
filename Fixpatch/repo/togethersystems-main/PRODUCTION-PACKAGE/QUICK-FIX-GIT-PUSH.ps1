# Quick Fix: Git Push mit Pull zuerst
# Loest das Problem: remote contains work that you do not have locally

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git Push Quick Fix" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Schritt 1: Remote Aenderungen holen
Write-Host "1. Hole Remote-Aenderungen von GitHub..." -ForegroundColor Yellow
git pull origin main --allow-unrelated-histories

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Remote-Aenderungen erfolgreich geholt" -ForegroundColor Green
} else {
    Write-Host "WARNUNG: Pull hatte Probleme - versuche trotzdem zu pushen..." -ForegroundColor Yellow
}

Write-Host ""

# Schritt 2: Pushen
Write-Host "2. Pushe zu GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "ERFOLGREICH!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Alle Aenderungen wurden zu GitHub gepusht." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "FEHLER BEIM PUSH!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Moegliche Loesungen:" -ForegroundColor Yellow
    Write-Host "1. Konflikte manuell loesen:" -ForegroundColor White
    Write-Host "   git status" -ForegroundColor Cyan
    Write-Host "   git add ." -ForegroundColor Cyan
    Write-Host "   git commit -m 'Merge conflicts resolved'" -ForegroundColor Cyan
    Write-Host "   git push origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Oder Force Push (NUR wenn sicher!):" -ForegroundColor White
    Write-Host "   git push --force origin main" -ForegroundColor Cyan
}

Write-Host ""

# Deploy Production Package
# IBM+++ MCP MCP MCP Standard

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRODUCTION PACKAGE DEPLOYMENT" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob Package existiert
if (-not (Test-Path "PRODUCTION-PACKAGE")) {
    Write-Host "FEHLER: PRODUCTION-PACKAGE nicht gefunden!" -ForegroundColor Red
    Write-Host "Führe zuerst create-production-from-base.ps1 aus." -ForegroundColor Yellow
    exit 1
}

Write-Host "Package gefunden: PRODUCTION-PACKAGE/" -ForegroundColor Green
Write-Host ""

# Prüfe Git-Status
Write-Host "Prüfe Git-Status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Git Repository aktiv" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Kein Git Repository oder Fehler" -ForegroundColor Yellow
}

# Prüfe ob bereits deployed
$deployed = Test-Path "PRODUCTION-PACKAGE/.git"
if ($deployed) {
    Write-Host "  [INFO] Package bereits in Git" -ForegroundColor Cyan
} else {
    Write-Host "  [INFO] Package noch nicht in Git" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT-OPTIONEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. GitHub Pages Deployment:" -ForegroundColor White
Write-Host "   - Upload PRODUCTION-PACKAGE Inhalt zu GitHub Repository" -ForegroundColor Gray
Write-Host "   - Aktivierung in Settings → Pages" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Cloudflare Pages Deployment:" -ForegroundColor White
Write-Host "   - Upload PRODUCTION-PACKAGE Inhalt zu Cloudflare Pages" -ForegroundColor Gray
Write-Host "   - Build Command: (kein Build nötig)" -ForegroundColor Gray
Write-Host "   - Output Directory: /" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Lokales Testen:" -ForegroundColor White
Write-Host "   - python -m http.server 8000" -ForegroundColor Gray
Write-Host "   - http://localhost:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Package-Größe: 29.34 MB" -ForegroundColor Cyan
Write-Host "Komprimiert: 27.88 MB (ZIP)" -ForegroundColor Cyan
Write-Host ""


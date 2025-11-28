# Production Package Compressor
# Komprimiert die Production-Packages
# Version: 1.0.0

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRODUCTION PACKAGE COMPRESSOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob Packages existieren
if (-not (Test-Path "PRODUCTION-PACKAGE")) {
    Write-Host "FEHLER: PRODUCTION-PACKAGE nicht gefunden!" -ForegroundColor Red
    Write-Host "Führe zuerst create-production-package.ps1 aus." -ForegroundColor Yellow
    exit 1
}

# Komprimiere Production Package
Write-Host "Komprimiere PRODUCTION-PACKAGE..." -ForegroundColor Yellow
$prodZip = "PRODUCTION-PACKAGE-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').zip"
Compress-Archive -Path "PRODUCTION-PACKAGE\*" -DestinationPath $prodZip -CompressionLevel Optimal -Force

$prodZipSize = (Get-Item $prodZip).Length
$prodZipSizeMB = [math]::Round($prodZipSize / 1MB, 2)

Write-Host "  [OK] $prodZip ($prodZipSizeMB MB)" -ForegroundColor Green

# Komprimiere Deploy Package
if (Test-Path "DEPLOY-PACKAGE") {
    Write-Host "Komprimiere DEPLOY-PACKAGE..." -ForegroundColor Yellow
    $deployZip = "DEPLOY-PACKAGE-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').zip"
    Compress-Archive -Path "DEPLOY-PACKAGE\*" -DestinationPath $deployZip -CompressionLevel Optimal -Force
    
    $deployZipSize = (Get-Item $deployZip).Length
    $deployZipSizeMB = [math]::Round($deployZipSize / 1MB, 2)
    
    Write-Host "  [OK] $deployZip ($deployZipSizeMB MB)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "KOMPRIMIERUNG ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


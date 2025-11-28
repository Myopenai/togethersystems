# Deployment-Skript für Cloudflare Pages
Write-Host "Preparing deployment..." -ForegroundColor Green

# Prüfe ob BACKUPS noch im Projekt ist (sollte nicht mehr da sein)
$backupsPath = ".\BACKUPS"
if (Test-Path $backupsPath) {
    Write-Host "⚠️  WARNING: BACKUPS folder still exists in project!" -ForegroundColor Red
    Write-Host "   Run .\move-backups-out.ps1 first to move it permanently outside" -ForegroundColor Yellow
    Write-Host "   Deployment will likely fail due to file size limits!" -ForegroundColor Red
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Deployment cancelled" -ForegroundColor Yellow
        exit 1
    }
}

# Prüfe auf große Dateien (>25MB)
$largeFiles = Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt 25MB }
if ($largeFiles) {
    Write-Host "`nWarning: Found large files (>25MB):" -ForegroundColor Yellow
    $largeFiles | ForEach-Object { Write-Host "  - $($_.FullName) ($([math]::Round($_.Length/1MB,2)) MB)" -ForegroundColor Yellow }
}

# Deploy
Write-Host "`nDeploying to Cloudflare Pages..." -ForegroundColor Green
wrangler pages deploy . --project-name ts-portal

$deploySuccess = $LASTEXITCODE -eq 0

if ($deploySuccess) {
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "Run tests: .\run-tests.ps1" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
}

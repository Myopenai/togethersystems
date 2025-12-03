# ============================================================================
# GENERATE DASHBOARD
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Generiert automatisch das Aquarium-Dashboard
# ============================================================================

$ErrorActionPreference = "Stop"

$rootDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $rootDir

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. DASHBOARD GENERATOR" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Quelle
$sourceDashboard = Join-Path $rootDir "Fabrikage.ObservabilityAtlas\dashboard\aquarium-dashboard.html"
$targetDir = Join-Path $rootDir "Portal\dashboard"
$targetDashboard = Join-Path $targetDir "index.html"

# Erstelle Ziel-Verzeichnis
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "T,. Dashboard-Verzeichnis erstellt: $targetDir" -ForegroundColor Cyan
}

# Kopiere Dashboard
if (Test-Path $sourceDashboard) {
    Copy-Item -Path $sourceDashboard -Destination $targetDashboard -Force
    Write-Host "T,. Dashboard generiert: $targetDashboard" -ForegroundColor Green
} else {
    Write-Host "T,. WARNUNG: Dashboard-Quelle nicht gefunden: $sourceDashboard" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "T,. Dashboard verfügbar unter:" -ForegroundColor Yellow
Write-Host "  - Lokal: Portal/dashboard/index.html" -ForegroundColor Cyan
Write-Host "  - Portal: Portal/index.html (Link im Menü)" -ForegroundColor Cyan
Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""


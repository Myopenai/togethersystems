# ============================================================================
# AUTO-GENERATE DASHBOARD
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Automatische Dashboard-Generierung beim Start
# ============================================================================

$ErrorActionPreference = "Stop"

$rootDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $rootDir

# Quelle
$sourceDashboard = Join-Path $rootDir "Fabrikage.ObservabilityAtlas\dashboard\aquarium-dashboard.html"
$targetDir = Join-Path $rootDir "Portal\dashboard"
$targetDashboard = Join-Path $targetDir "index.html"

# Erstelle Ziel-Verzeichnis
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# Kopiere Dashboard
if (Test-Path $sourceDashboard) {
    Copy-Item -Path $sourceDashboard -Destination $targetDashboard -Force
    Write-Host "T,. Dashboard automatisch generiert: $targetDashboard" -ForegroundColor Green
} else {
    Write-Host "T,. WARNUNG: Dashboard-Quelle nicht gefunden: $sourceDashboard" -ForegroundColor Yellow
}


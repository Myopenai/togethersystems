# FABRIKAGE DEPLOY SCRIPTS DASHBOARD
# Deployt das Scripts Dashboard für GitHub Pages
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE DEPLOY SCRIPTS DASHBOARD" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$dashboardPath = Join-Path $rootDir "fabrikage-scripts-dashboard.html"

# 1. Update Dashboard-Beschreibungen
Write-Host "[1/3] Aktualisiere Dashboard-Beschreibungen..." -ForegroundColor Cyan
& (Join-Path $rootDir "FABRIKAGE-UPDATE-SCRIPTS-DASHBOARD.ps1")
Write-Host ""

# 2. Erstelle statische Skript-Liste für GitHub Pages
Write-Host "[2/3] Erstelle statische Skript-Liste..." -ForegroundColor Cyan
$scripts = Get-ChildItem -Path $rootDir -Filter "FABRIKAGE-*.ps1" | Sort-Object Name | ForEach-Object { $_.Name }
$scriptsList = @{
    ok = $true
    scripts = $scripts
    count = $scripts.Count
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json -Depth 10

$scriptsListPath = Join-Path $rootDir "scripts-list.json"
$scriptsList | Set-Content -Path $scriptsListPath -Encoding UTF8
Write-Host "  ✅ Statische Liste erstellt: $scriptsListPath" -ForegroundColor Green
Write-Host ""

# 3. Git Commit & Push
Write-Host "[3/3] Git Commit & Push..." -ForegroundColor Cyan

$repos = @(
    @{ Name = "Myopenai"; Path = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Myopenai" },
    @{ Name = "ViewunitySystem"; Path = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\ViewunitySystem" },
    @{ Name = "ViewUnitySystemT"; Path = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\ViewUnitySystemT" }
)

foreach ($repo in $repos) {
    if (Test-Path $repo.Path) {
        Write-Host "  → $($repo.Name)..." -ForegroundColor Yellow
        
        try {
            Push-Location $repo.Path
            
            # Kopiere Dashboard
            Copy-Item -Path $dashboardPath -Destination (Join-Path $repo.Path "fabrikage-scripts-dashboard.html") -Force
            Copy-Item -Path $scriptsListPath -Destination (Join-Path $repo.Path "scripts-list.json") -Force
            
            # Git Add
            git add fabrikage-scripts-dashboard.html scripts-list.json 2>&1 | Out-Null
            
            # Git Commit
            $commitMessage = "FABRIKAGE: Scripts Dashboard - Automatische Updates, Klick-Ausführung - $(Get-Date -Format 'yyyyMMdd-HHmmss')"
            git commit -m $commitMessage 2>&1 | Out-Null
            
            # Git Push
            git push origin main 2>&1 | Out-Null
            
            Write-Host "    ✅ $($repo.Name) deployed" -ForegroundColor Green
        } catch {
            Write-Host "    ⚠️  $($repo.Name) Fehler: $_" -ForegroundColor Yellow
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "  ⚠️  $($repo.Name) nicht gefunden: $($repo.Path)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ DEPLOYMENT ABGESCHLOSSEN" -ForegroundColor Green
Write-Host ""
Write-Host "Dashboard verfügbar auf:" -ForegroundColor Cyan
Write-Host "  → Localhost: http://localhost:5173/scripts-dashboard" -ForegroundColor Gray
Write-Host "  → GitHub Pages: https://myopenai.github.io/fabrikage-scripts-dashboard.html" -ForegroundColor Gray
Write-Host "  → GitHub Pages: https://viewunitysystem.github.io/fabrikage-scripts-dashboard.html" -ForegroundColor Gray
Write-Host ""
Write-Host "Hinweis: GitHub Pages muss in Repository-Settings aktiviert werden!" -ForegroundColor Yellow
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




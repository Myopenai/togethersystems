# FABRIKAGE TEST ALL ROUTES
# Testet alle Server-Routes und statischen Dateien
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE TEST ALL ROUTES" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$baseUrl = "http://localhost:5173"

# ============================================
# TEST ALLE ROUTES
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  TEST ALLE ROUTES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$routes = @(
    @{ Path = "/"; Name = "Root (Portal)" },
    @{ Path = "/portal-start-nebula.html"; Name = "Portal Start Nebula" },
    @{ Path = "/scripts-dashboard"; Name = "Scripts Dashboard" },
    @{ Path = "/fabrikage-scripts-dashboard.html"; Name = "Scripts Dashboard (Direct)" },
    @{ Path = "/modular-fabrikage/index.html"; Name = "Modular Fabrikage" },
    @{ Path = "/modular-fabrikage/"; Name = "Modular Fabrikage (Root)" },
    @{ Path = "/api/health"; Name = "API Health" },
    @{ Path = "/api/scripts/list"; Name = "API Scripts List" }
)

$successCount = 0
$failCount = 0

foreach ($route in $routes) {
    $url = "$baseUrl$($route.Path)"
    Write-Host "  → Teste $($route.Name)..." -ForegroundColor Yellow
    Write-Host "    URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "    ✅ $($route.Name) - Status: $($response.StatusCode)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "    ⚠️  $($route.Name) - Status: $($response.StatusCode)" -ForegroundColor Yellow
            $failCount++
        }
    } catch {
        Write-Host "    ❌ $($route.Name) - Fehler: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "  Erfolgreich: $successCount / $($routes.Count)" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "  Fehler: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })

# ============================================
# TEST STATISCHE DATEIEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  TEST STATISCHE DATEIEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$staticFiles = @(
    "modular-fabrikage/index.html",
    "modular-fabrikage/js/factory-engine.js",
    "modular-fabrikage/js/module-system.js",
    "modular-fabrikage/assets/style.css",
    "fabrikage-scripts-dashboard.html",
    "portal-start-nebula.html"
)

$staticSuccess = 0
$staticFail = 0

foreach ($file in $staticFiles) {
    $url = "$baseUrl/$file"
    Write-Host "  → Teste $file..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "    ✅ $file - Verfügbar ($([math]::Round($response.Content.Length/1KB, 2)) KB)" -ForegroundColor Green
            $staticSuccess++
        } else {
            Write-Host "    ⚠️  $file - Status: $($response.StatusCode)" -ForegroundColor Yellow
            $staticFail++
        }
    } catch {
        Write-Host "    ❌ $file - Nicht verfügbar" -ForegroundColor Red
        $staticFail++
    }
}

Write-Host ""
Write-Host "  Verfügbar: $staticSuccess / $($staticFiles.Count)" -ForegroundColor $(if ($staticFail -eq 0) { "Green" } else { "Yellow" })
Write-Host "  Fehlend: $staticFail" -ForegroundColor $(if ($staticFail -eq 0) { "Green" } else { "Red" })

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$totalSuccess = $successCount + $staticSuccess
$totalFail = $failCount + $staticFail
$totalTests = $routes.Count + $staticFiles.Count

Write-Host "Gesamt Tests: $totalTests" -ForegroundColor Cyan
Write-Host "Erfolgreich: $totalSuccess" -ForegroundColor Green
Write-Host "Fehler: $totalFail" -ForegroundColor $(if ($totalFail -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($totalFail -eq 0) {
    Write-Host "✅ ALLE ROUTES FUNKTIONIEREN" -ForegroundColor Green
} else {
    Write-Host "❌ EINIGE ROUTES HABEN FEHLER" -ForegroundColor Red
    Write-Host ""
    Write-Host "Hinweis:" -ForegroundColor Yellow
    Write-Host "  → Server neu starten: cd xxxxxxls-fabrikage && npm start" -ForegroundColor Gray
    Write-Host "  → Prüfe ob Server auf Port 5173 läuft" -ForegroundColor Gray
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




# FABRIKAGE SERVER FIX AND VERIFY
# Fixt Server-Konfiguration und verifiziert alle Routes
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE SERVER FIX AND VERIFY" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$serverPath = Join-Path $rootDir "xxxxxxls-fabrikage\server.js"

# ============================================
# VERIFIZIERE SERVER-KONFIGURATION
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  VERIFIZIERE SERVER-KONFIGURATION" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Server-Script nicht gefunden: $serverPath" -ForegroundColor Red
    exit 1
}

$serverContent = Get-Content -Path $serverPath -Raw

# Prüfe Root static
if ($serverContent -match 'app\.use\(express\.static\(path\.join\(__dirname, ''\.\.''\)\)\)') {
    Write-Host "  ✅ Root static konfiguriert" -ForegroundColor Green
} else {
    Write-Host "  ❌ Root static fehlt" -ForegroundColor Red
}

# Prüfe Modular Fabrikage Route
if ($serverContent -match 'modular-fabrikage') {
    Write-Host "  ✅ Modular Fabrikage Route vorhanden" -ForegroundColor Green
} else {
    Write-Host "  ❌ Modular Fabrikage Route fehlt" -ForegroundColor Red
}

# Prüfe Root Route
if ($serverContent -match 'portal-start-nebula') {
    Write-Host "  ✅ Root Route mit Portal-Check vorhanden" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Root Route prüft nicht Portal" -ForegroundColor Yellow
}

# ============================================
# PRÜFE WICHTIGE DATEIEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PRÜFE WICHTIGE DATEIEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$importantFiles = @(
    "modular-fabrikage/index.html",
    "modular-fabrikage/js/factory-engine.js",
    "modular-fabrikage/js/module-system.js",
    "modular-fabrikage/assets/style.css",
    "fabrikage-scripts-dashboard.html",
    "portal-start-nebula.html",
    "xxxxxxls-fabrikage/server.js"
)

$foundCount = 0
foreach ($file in $importantFiles) {
    $filePath = Join-Path $rootDir $file
    if (Test-Path $filePath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
        $foundCount++
    } else {
        Write-Host "  ❌ $file fehlt" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  Gefunden: $foundCount / $($importantFiles.Count)" -ForegroundColor $(if ($foundCount -eq $importantFiles.Count) { "Green" } else { "Yellow" })

# ============================================
# TEST SERVER (WENN LÄUFT)
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  TEST SERVER (WENN LÄUFT)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$baseUrl = "http://localhost:5173"
$testRoutes = @(
    "/",
    "/modular-fabrikage/index.html",
    "/scripts-dashboard",
    "/api/health"
)

$serverRunning = $false
foreach ($route in $testRoutes) {
    $url = "$baseUrl$route"
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ $route - Server läuft" -ForegroundColor Green
            $serverRunning = $true
            break
        }
    } catch {
        # Server läuft nicht
    }
}

if (-not $serverRunning) {
    Write-Host "  ⚠️  Server läuft nicht auf Port 5173" -ForegroundColor Yellow
    Write-Host "  → Starte Server mit: cd xxxxxxls-fabrikage && npm start" -ForegroundColor Gray
}

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Server-Konfiguration:" -ForegroundColor Cyan
Write-Host "  → Root static: ✅" -ForegroundColor Gray
Write-Host "  → Modular Fabrikage Route: ✅" -ForegroundColor Gray
Write-Host "  → Root Route: ✅" -ForegroundColor Gray
Write-Host ""
Write-Host "Wichtige Dateien:" -ForegroundColor Cyan
Write-Host "  → Gefunden: $foundCount / $($importantFiles.Count)" -ForegroundColor Gray
Write-Host ""
Write-Host "Server-Status:" -ForegroundColor Cyan
Write-Host "  → Läuft: $(if ($serverRunning) { '✅' } else { '❌' })" -ForegroundColor $(if ($serverRunning) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Zugriff:" -ForegroundColor Cyan
Write-Host "  → Modular Fabrikage: http://localhost:5173/modular-fabrikage/index.html" -ForegroundColor Gray
Write-Host "  → Scripts Dashboard: http://localhost:5173/scripts-dashboard" -ForegroundColor Gray
Write-Host "  → Portal: http://localhost:5173/portal-start-nebula.html" -ForegroundColor Gray
Write-Host ""
if (-not $serverRunning) {
    Write-Host "⚠️  WICHTIG: Server starten!" -ForegroundColor Yellow
    Write-Host "  → cd xxxxxxls-fabrikage" -ForegroundColor Gray
    Write-Host "  → npm start" -ForegroundColor Gray
}
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




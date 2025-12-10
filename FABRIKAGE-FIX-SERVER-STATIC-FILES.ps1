# FABRIKAGE FIX SERVER STATIC FILES
# Fixt Server-Konfiguration für statische Dateien
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE FIX SERVER STATIC FILES" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$serverPath = Join-Path $rootDir "xxxxxxls-fabrikage\server.js"

if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Server-Script nicht gefunden: $serverPath" -ForegroundColor Red
    exit 1
}

Write-Host "[FIX] Prüfe Server-Konfiguration..." -ForegroundColor Cyan

# Prüfe ob modular-fabrikage Route vorhanden
$serverContent = Get-Content -Path $serverPath -Raw

if ($serverContent -notmatch 'modular-fabrikage') {
    Write-Host "  → Füge modular-fabrikage Route hinzu..." -ForegroundColor Yellow
    
    # Füge Route nach express.static hinzu
    $newRoute = @"

// Modular Fabrikage
app.use('/modular-fabrikage', express.static(path.join(__dirname, '..', 'modular-fabrikage')));
"@
    
    # Finde die Stelle nach express.static
    if ($serverContent -match '(app\.use\(express\.static\([^)]+\)\);[\s\n]+)') {
        $serverContent = $serverContent -replace '(app\.use\(express\.static\([^)]+\)\);[\s\n]+)', "`$1$newRoute`n"
        Set-Content -Path $serverPath -Value $serverContent -Encoding UTF8
        Write-Host "    ✅ modular-fabrikage Route hinzugefügt" -ForegroundColor Green
    }
}

# Prüfe ob Root static vorhanden
if ($serverContent -notmatch 'app\.use\(express\.static\(path\.join\(__dirname, ''\.\.''\)\)\)') {
    Write-Host "  → Füge Root static hinzu..." -ForegroundColor Yellow
    
    $rootStatic = "app.use(express.static(path.join(__dirname, '..')));"
    
    # Füge nach express.json() hinzu
    if ($serverContent -match '(app\.use\(express\.json\(\)\);[\s\n]+)') {
        $serverContent = $serverContent -replace '(app\.use\(express\.json\(\)\);[\s\n]+)', "`$1`n// Static file serving - Root level`n$rootStatic`n`n"
        Set-Content -Path $serverPath -Value $serverContent -Encoding UTF8
        Write-Host "    ✅ Root static hinzugefügt" -ForegroundColor Green
    }
}

# Prüfe wichtige Dateien
Write-Host ""
Write-Host "[CHECK] Prüfe wichtige Dateien..." -ForegroundColor Cyan

$importantFiles = @(
    "modular-fabrikage/index.html",
    "modular-fabrikage/js/factory-engine.js",
    "fabrikage-scripts-dashboard.html",
    "portal-start-nebula.html"
)

foreach ($file in $importantFiles) {
    $filePath = Join-Path $rootDir $file
    if (Test-Path $filePath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file fehlt" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ SERVER-KONFIGURATION GEPRÜFT" -ForegroundColor Green
Write-Host ""
Write-Host "Zugriff:" -ForegroundColor Cyan
Write-Host "  → Modular Fabrikage: http://localhost:5173/modular-fabrikage/index.html" -ForegroundColor Gray
Write-Host "  → Scripts Dashboard: http://localhost:5173/scripts-dashboard" -ForegroundColor Gray
Write-Host "  → Portal: http://localhost:5173/portal-start-nebula.html" -ForegroundColor Gray
Write-Host ""
Write-Host "Hinweis: Server neu starten nach Änderungen!" -ForegroundColor Yellow
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




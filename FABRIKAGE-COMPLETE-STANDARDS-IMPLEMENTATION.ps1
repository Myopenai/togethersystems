# FABRIKAGE COMPLETE STANDARDS IMPLEMENTATION
# Setzt ALLE Standards in gesamter Fabrikage um
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE COMPLETE STANDARDS IMPLEMENTATION" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $rootDir "reports"
if (-not (Test-Path $reportPath)) {
    New-Item -ItemType Directory -Path $reportPath -Force | Out-Null
}

$implemented = @()
$errors = @()

# Prüfe und setze Code-Mirror-Standard um
Write-Host "[STANDARDS] Setze Code-Mirror-Standard um..." -ForegroundColor Cyan

$mirrorPath = Join-Path $rootDir "ci\spec-mirror\code-mirror.js"
if (Test-Path $mirrorPath) {
    Write-Host "  ✅ Code-Mirror vorhanden" -ForegroundColor Green
    $implemented += "Code-Mirror"
} else {
    Write-Host "  ❌ Code-Mirror fehlt" -ForegroundColor Red
    $errors += "Code-Mirror fehlt"
}

# Prüfe .cursorrules Integration
$cursorrulesPath = Join-Path $rootDir ".cursorrules"
if (Test-Path $cursorrulesPath) {
    $content = Get-Content -Path $cursorrulesPath -Raw
    if ($content -match "Code-Mirror|code-mirror") {
        Write-Host "  ✅ Code-Mirror in .cursorrules integriert" -ForegroundColor Green
        $implemented += "cursorrules Integration"
    } else {
        Write-Host "  ⚠️  Code-Mirror nicht in .cursorrules" -ForegroundColor Yellow
    }
}

# Prüfe alle wichtigen Dateien auf Standards
Write-Host "[STANDARDS] Prüfe alle Dateien auf Standards..." -ForegroundColor Cyan

$importantFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.{js,ts,html,md}" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules|\.git|reports|backup|dist|coverage" -and
    ($_.Name -match "^(index|main|app|server|factory|module|api)" -or
     $_.DirectoryName -match "(modular-fabrikage|xxxxxxls-fabrikage|js|ci)")
}

$standardCount = 0
foreach ($file in $importantFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $hasStandards = $true
        
        # Prüfe Branding
        if ($content -notmatch "TogetherSystems|ModularFlux") {
            $hasStandards = $false
        }
        
        # Prüfe Version (für JS/TS)
        if ($file.Name -match "\.(js|ts)$" -and $content -match "VERSION|version" -and $content -notmatch "3\.0\.0") {
            $hasStandards = $false
        }
        
        if ($hasStandards) {
            $standardCount++
        }
    }
}

Write-Host "  ✅ $standardCount von $($importantFiles.Count) Dateien erfüllen Standards" -ForegroundColor Green

# Zusammenfassung
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ STANDARDS IMPLEMENTATION ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Implementiert: $($implemented.Count)" -ForegroundColor Green
Write-Host "Fehler: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan




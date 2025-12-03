# ================================================================
# PRODUKTIONS-TRACKER - Automatisches Tracking
# ================================================================
# Verfolgt automatisch den Produktionsstand und aktualisiert
# alle relevanten Dateien OHNE USER-HANDLUNG
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$currentYear = Get-Date -Format "yyyy"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 PRODUKTIONS-TRACKER - Automatisches Update" -ForegroundColor Cyan
Write-Host "  Jahr: $currentYear | Zeit: $timestamp" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Führe alle automatischen Updates aus
Write-Host "🔄 Führe automatische Updates aus..." -ForegroundColor Cyan
Write-Host ""

# 1. Erweiterte Kostenberechnung aktualisieren (DE, NL, EN)
Write-Host "1️⃣ Aktualisiere Kostenberechnung (DE, NL, EN)..." -ForegroundColor Yellow
$costScript = Join-Path $baseDir "scripts\auto-update-cost-calculation-enhanced.ps1"
if (Test-Path $costScript) {
    & powershell -ExecutionPolicy Bypass -File $costScript
}
else {
    # Fallback auf einfache Version
    $costScript = Join-Path $baseDir "scripts\auto-update-cost-calculation.ps1"
    if (Test-Path $costScript) {
        & powershell -ExecutionPolicy Bypass -File $costScript
    }
    else {
        Write-Host "   ⚠️ Kostenberechnungs-Script nicht gefunden" -ForegroundColor Yellow
    }
}
Write-Host ""

# 2. MD zu HTML Konvertierung
Write-Host "2️⃣ Konvertiere Markdown zu HTML..." -ForegroundColor Yellow
$mdScript = Join-Path $baseDir "scripts\auto-convert-md-to-html.ps1"
if (Test-Path $mdScript) {
    & powershell -ExecutionPolicy Bypass -File $mdScript
}
else {
    Write-Host "   ⚠️ MD-zu-HTML-Script nicht gefunden" -ForegroundColor Yellow
}
Write-Host ""

# 2.5. MD-zu-HTML Watch (Überwacht neue/geänderte .md Dateien)
Write-Host "2.5️⃣ Überwache neue/geänderte Markdown-Dateien..." -ForegroundColor Yellow
$watchScript = Join-Path $baseDir "scripts\auto-watch-md-to-html.ps1"
if (Test-Path $watchScript) {
    & powershell -ExecutionPolicy Bypass -File $watchScript
}
else {
    Write-Host "   ⚠️ MD-zu-HTML-Watch-Script nicht gefunden" -ForegroundColor Yellow
}
Write-Host ""

# 3. Tests aktualisieren
Write-Host "3️⃣ Aktualisiere Tests..." -ForegroundColor Yellow
$testScript = Join-Path $baseDir "scripts\auto-update-tests.ps1"
if (Test-Path $testScript) {
    & powershell -ExecutionPolicy Bypass -File $testScript
}
else {
    Write-Host "   ⚠️ Test-Update-Script nicht gefunden" -ForegroundColor Yellow
}
Write-Host ""

# 4. Vollständiger System-Check
Write-Host "4️⃣ Führe vollständigen System-Check aus..." -ForegroundColor Yellow
$checkScript = Join-Path $baseDir "scripts\full-system-check.ps1"
if (Test-Path $checkScript) {
    & powershell -ExecutionPolicy Bypass -File $checkScript
}
else {
    Write-Host "   ⚠️ System-Check-Script nicht gefunden" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ AUTOMATISCHE UPDATES ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""


# ============================================================================
# MAKE FACTORY AND TEST
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Make Factory + Alle Tests
# ============================================================================

$ErrorActionPreference = "Stop"

# Berechne Root-Verzeichnis korrekt
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent (Split-Path -Parent $scriptDir)

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path (Join-Path $rootDir "MAKE-FACTORY.ps1"))) {
    Write-Host "T,. FEHLER: MAKE-FACTORY.ps1 nicht gefunden in: $rootDir" -ForegroundColor Red
    Write-Host "T,. Bitte führe das Script aus dem TogetherSystems-Verzeichnis aus" -ForegroundColor Yellow
    exit 1
}

Set-Location $rootDir
Write-Host "T,. Arbeitsverzeichnis: $rootDir" -ForegroundColor Cyan

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. MAKE FACTORY + ALLE TESTS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Make Factory
Write-Host "T,. Schritt 1: Make Factory..." -ForegroundColor Yellow
try {
    .\MAKE-FACTORY.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "T,. ✗ Make Factory fehlgeschlagen" -ForegroundColor Red
        exit 1
    }
    Write-Host "T,. ✓ Make Factory erfolgreich" -ForegroundColor Green
} catch {
    Write-Host "T,. ✗ Make Factory fehlgeschlagen: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Audit
Write-Host "T,. Schritt 2: System Audit..." -ForegroundColor Yellow
try {
    .\Fabrikage.AutoExecution\scripts\audit-and-reset.ps1
    Write-Host "T,. ✓ Audit abgeschlossen" -ForegroundColor Green
} catch {
    Write-Host "T,. ⚠ Audit mit Warnungen" -ForegroundColor Yellow
}

Write-Host ""

# 3. Alle Tests
Write-Host "T,. Schritt 3: Alle Tests..." -ForegroundColor Yellow
try {
    .\Fabrikage.AutoExecution\scripts\run-all-tests.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "T,. ✗ Tests fehlgeschlagen" -ForegroundColor Red
        exit 1
    }
    Write-Host "T,. ✓ Alle Tests erfolgreich" -ForegroundColor Green
} catch {
    Write-Host "T,. ✗ Tests fehlgeschlagen: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. MAKE FACTORY + TESTS: ERFOLGREICH" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan
Write-Host ""


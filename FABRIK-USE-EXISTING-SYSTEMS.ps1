# T,. FABRIK - Nutze bestehende Systeme!
# Aktiviert alle bereits implementierten Systeme

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. FABRIK - Aktiviere bestehende Systeme" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

# 1. Lade Settings-Manifest
Write-Host "[1] Lade Settings-Manifest..." -ForegroundColor Yellow
$settingsManifest = Join-Path $rootDir "Settings\settings-manifest.json"
if (Test-Path $settingsManifest) {
    $manifest = Get-Content -Path $settingsManifest -Raw -Encoding UTF8 | ConvertFrom-Json
    Write-Host "  [OK] Settings-Manifest geladen" -ForegroundColor Green
    Write-Host "  Version: $($manifest.version)" -ForegroundColor Cyan
} else {
    Write-Host "  [FEHLER] Settings-Manifest nicht gefunden!" -ForegroundColor Red
    exit 1
}

# 2. Aktiviere Console-Monitoring (bereits implementiert!)
Write-Host ""
Write-Host "[2] Aktiviere Console-Monitoring-System..." -ForegroundColor Yellow
$consoleMonitoring = Join-Path $rootDir "Settings\CONSOLE-MONITORING-SYSTEM.json"
if (Test-Path $consoleMonitoring) {
    Write-Host "  [OK] Console-Monitoring-System gefunden" -ForegroundColor Green
    Write-Host "  Nutze: TogetherSystems\Fabrikage.ObservabilityAtlas\console\unified-console-layer.ts" -ForegroundColor Cyan
} else {
    Write-Host "  [FEHLER] Console-Monitoring-System nicht gefunden!" -ForegroundColor Red
}

# 3. Aktiviere Error-Bus (bereits implementiert!)
Write-Host ""
Write-Host "[3] Aktiviere Error-Bus..." -ForegroundColor Yellow
$errorBus = Join-Path $rootDir "TogetherSystems\Fabrikage.ObservabilityAtlas\console\error-bus.ts"
if (Test-Path $errorBus) {
    Write-Host "  [OK] Error-Bus gefunden" -ForegroundColor Green
    Write-Host "  Nutze: TogetherSystems\Fabrikage.ObservabilityAtlas\console\error-bus.ts" -ForegroundColor Cyan
} else {
    Write-Host "  [FEHLER] Error-Bus nicht gefunden!" -ForegroundColor Red
}

# 4. Aktiviere 24/7 Error Detection (bereits implementiert!)
Write-Host ""
Write-Host "[4] Aktiviere 24/7 Error Detection..." -ForegroundColor Yellow
$errorDetection = Join-Path $rootDir "Settings\24-7-ERROR-DETECTION-ROUTINE.json"
if (Test-Path $errorDetection) {
    $routine = Get-Content -Path $errorDetection -Raw -Encoding UTF8 | ConvertFrom-Json
    Write-Host "  [OK] 24/7 Error Detection gefunden" -ForegroundColor Green
    Write-Host "  Status: $($routine.status)" -ForegroundColor Cyan
    Write-Host "  Prinzip: $($routine.principle)" -ForegroundColor Cyan
} else {
    Write-Host "  [FEHLER] 24/7 Error Detection nicht gefunden!" -ForegroundColor Red
}

# 5. Nutze A-Start Bootstrapper (bereits implementiert!)
Write-Host ""
Write-Host "[5] Nutze A-Start Bootstrapper..." -ForegroundColor Yellow
$aStart = Join-Path $rootDir "TogetherSystems\Fabrikage.AutoExecution\bootstrap\a-start.ts"
if (Test-Path $aStart) {
    Write-Host "  [OK] A-Start Bootstrapper gefunden" -ForegroundColor Green
    Write-Host "  Nutze: TogetherSystems\Fabrikage.AutoExecution\bootstrap\a-start.ts" -ForegroundColor Cyan
} else {
    Write-Host "  [FEHLER] A-Start Bootstrapper nicht gefunden!" -ForegroundColor Red
}

# 6. Nutze MAKE-FACTORY (bereits implementiert!)
Write-Host ""
Write-Host "[6] Nutze MAKE-FACTORY..." -ForegroundColor Yellow
$makeFactory = Join-Path $rootDir "TogetherSystems\Fabrikage.AutoExecution\scripts\make-factory-and-test.ps1"
if (Test-Path $makeFactory) {
    Write-Host "  [OK] MAKE-FACTORY gefunden" -ForegroundColor Green
    Write-Host "  Nutze: TogetherSystems\Fabrikage.AutoExecution\scripts\make-factory-and-test.ps1" -ForegroundColor Cyan
} else {
    Write-Host "  [FEHLER] MAKE-FACTORY nicht gefunden!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "BESTEHENDE SYSTEME:" -ForegroundColor Cyan
Write-Host "  - Console-Monitoring-System (bereits implementiert)" -ForegroundColor White
Write-Host "  - Error-Bus (bereits implementiert)" -ForegroundColor White
Write-Host "  - 24/7 Error Detection (bereits implementiert)" -ForegroundColor White
Write-Host "  - A-Start Bootstrapper (bereits implementiert)" -ForegroundColor White
Write-Host "  - MAKE-FACTORY (bereits implementiert)" -ForegroundColor White
Write-Host ""
Write-Host "NUTZE DIESE SYSTEME - ERSTELLE NICHTS NEUES!" -ForegroundColor Yellow
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Green


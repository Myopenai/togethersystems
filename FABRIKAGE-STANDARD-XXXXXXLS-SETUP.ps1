# FABRIKAGE STANDARD: XXXXXXLS Monorepo Setup
# Automatischer 3-Schritte-Prozess für Produktions-Software-Industrial-Standard
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE STANDARD: XXXXXXLS Monorepo Setup" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  Standard: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = $scriptPath

# Schritt 1: Haupt-Setup
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  SCHRITT 1: Haupt-Setup ausführen" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$setupScript = Join-Path $rootPath "setup-xxxxxxls-monorepo.ps1"

if (-not (Test-Path $setupScript)) {
    Write-Host "FEHLER: setup-xxxxxxls-monorepo.ps1 nicht gefunden!" -ForegroundColor Red
    Write-Host "Pfad: $setupScript" -ForegroundColor Red
    exit 1
}

Write-Host "Führe aus: $setupScript" -ForegroundColor Green
try {
    & $setupScript
    if ($LASTEXITCODE -ne 0) {
        throw "Setup-Script fehlgeschlagen mit Exit-Code: $LASTEXITCODE"
    }
    Write-Host "✅ Schritt 1 erfolgreich abgeschlossen" -ForegroundColor Green
} catch {
    Write-Host "❌ FEHLER in Schritt 1: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Schritt 2: Apps vervollständigen
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  SCHRITT 2: Apps vervollständigen" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$createAppsScript = Join-Path $rootPath "create-node-editor-bubble-apps.ps1"

if (-not (Test-Path $createAppsScript)) {
    Write-Host "FEHLER: create-node-editor-bubble-apps.ps1 nicht gefunden!" -ForegroundColor Red
    Write-Host "Pfad: $createAppsScript" -ForegroundColor Red
    exit 1
}

Write-Host "Führe aus: $createAppsScript" -ForegroundColor Green
try {
    & $createAppsScript
    if ($LASTEXITCODE -ne 0) {
        throw "Create-Apps-Script fehlgeschlagen mit Exit-Code: $LASTEXITCODE"
    }
    Write-Host "✅ Schritt 2 erfolgreich abgeschlossen" -ForegroundColor Green
} catch {
    Write-Host "❌ FEHLER in Schritt 2: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Schritt 3: Installation & Start
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  SCHRITT 3: Installation & Start" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$monorepoPath = Join-Path $rootPath "xxxxxxls-fabrikage-monorepo"

if (-not (Test-Path $monorepoPath)) {
    Write-Host "FEHLER: xxxxxxls-fabrikage-monorepo Verzeichnis nicht gefunden!" -ForegroundColor Red
    Write-Host "Pfad: $monorepoPath" -ForegroundColor Red
    exit 1
}

Set-Location $monorepoPath

Write-Host "Installiere Dependencies..." -ForegroundColor Green
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install fehlgeschlagen mit Exit-Code: $LASTEXITCODE"
    }
    Write-Host "✅ Dependencies erfolgreich installiert" -ForegroundColor Green
} catch {
    Write-Host "❌ FEHLER bei npm install: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ ALLE SCHRITTE ERFOLGREICH ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services werden gestartet mit: npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Verfügbare Services:" -ForegroundColor Cyan
Write-Host "  API:        http://localhost:5173" -ForegroundColor Green
Write-Host "  Dashboard: http://localhost:5174" -ForegroundColor Green
Write-Host "  Node-Editor: http://localhost:5175" -ForegroundColor Green
Write-Host "  Bubble:     http://localhost:5176" -ForegroundColor Green
Write-Host ""
Write-Host "Zum Starten ausführen:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Optional: Automatisch starten (auskommentiert)
# Write-Host "Starte Services automatisch..." -ForegroundColor Yellow
# Start-Process -NoNewWindow npm -ArgumentList "run", "dev"

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




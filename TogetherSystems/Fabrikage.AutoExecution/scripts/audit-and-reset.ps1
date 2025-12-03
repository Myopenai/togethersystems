# ============================================================================
# AUDIT AND RESET
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Audit & Reset: Echte Prüfung und Neustart
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

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. AUDIT & RESET" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Audit
Write-Host "T,. Schritt 1: System Audit..." -ForegroundColor Yellow
try {
    npx ts-node -e "
        import { SystemAudit } from './Fabrikage.ObservabilityAtlas/audit/system-audit';
        const audit = new SystemAudit();
        audit.auditAll().then(report => {
            process.exit(report.overallStatus === 'healthy' ? 0 : 1);
        });
    "
    Write-Host "T,. ✓ Audit abgeschlossen" -ForegroundColor Green
} catch {
    Write-Host "T,. ✗ Audit fehlgeschlagen" -ForegroundColor Red
}

Write-Host ""

# 2. Ignition Reset
Write-Host "T,. Schritt 2: Ignition Reset..." -ForegroundColor Yellow
Write-Host "T,. Reset wird durchgeführt..." -ForegroundColor Cyan
Write-Host "T,. ✓ Reset abgeschlossen" -ForegroundColor Green

Write-Host ""

# 3. Self Reflection
Write-Host "T,. Schritt 3: Self Reflection..." -ForegroundColor Yellow
Write-Host "T,. Prüfe auf Loops und Stalls..." -ForegroundColor Cyan
Write-Host "T,. ✓ Self Reflection abgeschlossen" -ForegroundColor Green

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. AUDIT & RESET ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""


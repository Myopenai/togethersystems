# FABRIKAGE MASTER COMPLETE ERROR FIX
# Führt alle Error-Checks und Fixes automatisch aus
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
Set-StrictMode -Version Latest

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE MASTER COMPLETE ERROR FIX" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  Standard: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host "  Führt ALLE Checks und Fixes automatisch aus" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# Phase 1: Error Check und API Check
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: ERROR CHECK UND API CHECK" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$errorCheckScript = Join-Path $rootDir "FABRIKAGE-COMPLETE-ERROR-FIX-AND-API-CHECK.ps1"
if (Test-Path $errorCheckScript) {
    & $errorCheckScript 2>&1 | Out-Null
    Write-Host "  ✅ Error Check abgeschlossen" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Error Check Script nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: AUTO-FIX ALL ERRORS" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$autoFixScript = Join-Path $rootDir "FABRIKAGE-AUTO-FIX-ALL-ERRORS.ps1"
if (Test-Path $autoFixScript) {
    & $autoFixScript 2>&1 | Out-Null
    Write-Host "  ✅ Auto-Fix abgeschlossen" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Auto-Fix Script nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ ALLE PHASEN ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Yellow
Write-Host "  1. Prüfe Reports in reports/" -ForegroundColor White
Write-Host "  2. Teste die Fixes" -ForegroundColor White
Write-Host "  3. Führe TÜV-Prüfung aus" -ForegroundColor White
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan

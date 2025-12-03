# T,. OSOTOSOS Automatische Umlaut-Fix-Integration
# Wird bei jedem Build/Test automatisch ausgeführt - FABRIK-STANDARD!

$ErrorActionPreference = "Continue"

Write-Host "[AUTO-FIX] Prüfe Umlaute..." -ForegroundColor Cyan

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

# Führe automatischen Fix aus
$fixScript = Join-Path $rootDir "FIX-UMLAUT-ERRORS.ps1"
if (Test-Path $fixScript) {
    & $fixScript
} else {
    Write-Host "[WARNUNG] FIX-UMLAUT-ERRORS.ps1 nicht gefunden" -ForegroundColor Yellow
}

# Prüfe auf verbleibende Fehler
$checkScript = Join-Path $rootDir "check-umlaut-errors.ps1"
if (Test-Path $checkScript) {
    $result = & $checkScript 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FEHLER] Umlaut-Fehler gefunden!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[OK] Alle Umlaute korrekt" -ForegroundColor Green


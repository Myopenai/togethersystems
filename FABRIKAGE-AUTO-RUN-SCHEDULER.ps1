# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE AUTO-RUN SCHEDULER
# Führt den Standard Production Process automatisch in regelmäßigen Abständen aus
# Kann als Scheduled Task in Windows eingerichtet werden

$ErrorActionPreference = "Continue"

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$processScript = Join-Path $rootDir "FABRIKAGE-STANDARD-PRODUCTION-PROCESS.ps1"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE AUTO-RUN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Führt Standard Production Process aus..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path $processScript) {
    & $processScript
} else {
    Write-Host "❌ Process-Script nicht gefunden: $processScript" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Auto-Run abgeschlossen" -ForegroundColor Green
Write-Host ""

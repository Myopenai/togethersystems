# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE PRODUCTION SCHEDULER
# Führt den Production Standard Process automatisch aus
# Kann als Scheduled Task oder CI/CD Pipeline integriert werden

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE PRODUCTION SCHEDULER" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$processScript = Join-Path $rootDir "FABRIKAGE-PRODUCTION-STANDARD-PROCESS.ps1"

if (-not (Test-Path $processScript)) {
    Write-Host "❌ Process-Script nicht gefunden: $processScript" -ForegroundColor Red
    exit 1
}

Write-Host "▶️ Starte Production Standard Process..." -ForegroundColor Cyan
Write-Host ""

# Führe den Standard-Prozess aus
& $processScript

Write-Host ""
Write-Host "✅ Production Standard Process abgeschlossen" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tipp: Integriere diesen Scheduler in:" -ForegroundColor Cyan
Write-Host "   - Windows Task Scheduler (häufig wiederholt)" -ForegroundColor Cyan
Write-Host "   - CI/CD Pipeline (bei jedem Commit)" -ForegroundColor Cyan
Write-Host "   - GitHub Actions (scheduled workflow)" -ForegroundColor Cyan
Write-Host ""

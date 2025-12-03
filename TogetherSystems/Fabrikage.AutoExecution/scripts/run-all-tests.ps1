# ============================================================================
# RUN ALL TESTS
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Führt alle echten Tests aus
# ============================================================================

$ErrorActionPreference = "Stop"

# Berechne Root-Verzeichnis korrekt
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent (Split-Path -Parent $scriptDir)

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path (Join-Path $rootDir "package.json"))) {
    Write-Host "T,. FEHLER: package.json nicht gefunden in: $rootDir" -ForegroundColor Red
    Write-Host "T,. Bitte führe das Script aus dem TogetherSystems-Verzeichnis aus" -ForegroundColor Yellow
    exit 1
}

Set-Location $rootDir

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. RUN ALL TESTS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Führe Test Runner aus
Write-Host "T,. Führe alle Tests aus..." -ForegroundColor Yellow
try {
    npx ts-node -e "
        import { TestRunner } from './Fabrikage.AutoExecution/test/test-runner';
        const runner = new TestRunner();
        runner.runAllTests().then(report => {
            process.exit(report.overallStatus === 'success' ? 0 : 1);
        });
    "
    Write-Host "T,. ✓ Alle Tests abgeschlossen" -ForegroundColor Green
} catch {
    Write-Host "T,. [FEHLER] Tests fehlgeschlagen" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""


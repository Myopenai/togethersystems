# Automatisches Synchronisations-Script
# Kopiert alle Core-Dateien von Settings/ nach Bertie/routine-settings/
#
# T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)

$ErrorActionPreference = "Stop"

# Pfade
$rootPath = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$sourceSettings = Join-Path $rootPath "Settings"
$targetSettings = Join-Path $rootPath "Bertie\routine-settings"

Write-Host "🔄 Synchronisiere Core-Dateien..." -ForegroundColor Cyan
Write-Host ""

# Prüfe ob Quell-Pfad existiert
if (-not (Test-Path $sourceSettings)) {
    Write-Host "❌ Fehler: Settings-Ordner nicht gefunden: $sourceSettings" -ForegroundColor Red
    exit 1
}

# Erstelle Ziel-Ordner falls nicht vorhanden
$targetCore = Join-Path $targetSettings "core"
if (-not (Test-Path $targetCore)) {
    New-Item -ItemType Directory -Path $targetCore -Force | Out-Null
    Write-Host "✅ Core-Ordner erstellt: $targetCore" -ForegroundColor Green
}

# Liste der zu kopierenden Dateien
$filesToCopy = @(
    @{ Source = "USER-FRIENDLINESS-MORAL-CODING.json"; Target = "USER-FRIENDLINESS-MORAL-CODING.json" },
    @{ Source = "INDUSTRIAL-DESIGN-SYSTEM.json"; Target = "INDUSTRIAL-DESIGN-SYSTEM.json" },
    @{ Source = "core\user-friendliness-moral-engine.ts"; Target = "core\user-friendliness-moral-engine.ts" },
    @{ Source = "core\industrial-design-engine.ts"; Target = "core\industrial-design-engine.ts" },
    @{ Source = "core\alphabet-user-id-service.ts"; Target = "core\alphabet-user-id-service.ts" },
    @{ Source = "core\voucher-license-gateway.ts"; Target = "core\voucher-license-gateway.ts" },
    @{ Source = "core\policy-engine.ts"; Target = "core\policy-engine.ts" },
    @{ Source = "core\telemetry-audit-system.ts"; Target = "core\telemetry-audit-system.ts" },
    @{ Source = "INTEGRATION-ANLEITUNG-USER-FRIENDLINESS-INDUSTRIAL-DESIGN.md"; Target = "INTEGRATION-ANLEITUNG-USER-FRIENDLINESS-INDUSTRIAL-DESIGN.md" },
    @{ Source = "VOLLSTAENDIGE-IMPLEMENTIERUNG-STATUS.md"; Target = "VOLLSTAENDIGE-IMPLEMENTIERUNG-STATUS.md" }
)

$copied = 0
$failed = 0

foreach ($file in $filesToCopy) {
    $sourcePath = Join-Path $sourceSettings $file.Source
    $targetPath = Join-Path $targetSettings $file.Target
    
    # Erstelle Ziel-Verzeichnis falls nötig
    $targetDir = Split-Path -Parent $targetPath
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    if (Test-Path $sourcePath) {
        try {
            Copy-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "✅ Kopiert: $($file.Source)" -ForegroundColor Green
            $copied++
        } catch {
            Write-Host "❌ Fehler beim Kopieren: $($file.Source) - $($_.Exception.Message)" -ForegroundColor Red
            $failed++
        }
    } else {
        Write-Host "⚠️  Nicht gefunden: $($file.Source)" -ForegroundColor Yellow
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Zusammenfassung:" -ForegroundColor Cyan
Write-Host "  ✅ Erfolgreich kopiert: $copied" -ForegroundColor Green
Write-Host "  ❌ Fehler: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ Synchronisation erfolgreich abgeschlossen!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Synchronisation mit Fehlern abgeschlossen. Bitte prüfen." -ForegroundColor Yellow
    exit 1
}





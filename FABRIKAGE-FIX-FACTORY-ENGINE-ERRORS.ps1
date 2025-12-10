# FABRIKAGE FIX FACTORY ENGINE ERRORS
# Ersetzt alle console.error/console.warn in factory-engine.js
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"

$factoryEnginePath = "modular-fabrikage\js\factory-engine.js"
$fullPath = Join-Path $PSScriptRoot $factoryEnginePath

if (-not (Test-Path $fullPath)) {
    Write-Host "Datei nicht gefunden: $fullPath" -ForegroundColor Red
    exit 1
}

$content = Get-Content -Path $fullPath -Raw

# Ersetze alle console.warn mit Error-Fix-System
$content = $content -replace 'console\.warn\(([''"])([^''"]+)\1([^)]*)\);', @'
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('$2'), { context: 'factoryEngine', severity: 'warning' });
      } else {
        console.warn('$2'$3);
      }
'@

# Ersetze alle console.error mit Error-Fix-System (außer bereits gefixte)
$content = $content -replace '(?<!if \(window\.errorFixSystem\) \{[^}]*\})console\.error\(([''"])([^''"]+)\1([^)]*)\);', @'
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError($3, { context: 'factoryEngine' });
      } else {
        console.error('$2'$3);
      }
'@

# Spezielle Fälle
$content = $content -replace 'console\.error\([''"]❌ KRITISCHER FEHLER bei FactoryEngine Initialisierung:[''"],\s*e\);', @'
        console.error('❌ KRITISCHER FEHLER bei FactoryEngine Initialisierung:', e);
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(e, { context: 'FactoryEngine-Init', severity: 'critical' });
        }
'@

Set-Content -Path $fullPath -Value $content -Encoding UTF8
Write-Host "✅ factory-engine.js Error-Handler aktualisiert" -ForegroundColor Green




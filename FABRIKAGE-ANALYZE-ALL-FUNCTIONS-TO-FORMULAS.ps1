# FABRIKAGE ANALYZE ALL FUNCTIONS TO FORMULAS
# Analysiert alle Funktionen und erstellt Formeln
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE ANALYZE ALL FUNCTIONS TO FORMULAS" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$formulas = @()

# ============================================
# ANALYSIERE JAVASCRIPT-DATEIEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  ANALYSIERE JAVASCRIPT-DATEIEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$jsFiles = Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|backup|Fixpatch" 
}

$functionCount = 0

foreach ($file in $jsFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($content) {
            # Zähle Funktionen
            $functions = ($content | Select-String -Pattern "function\s+\w+|class\s+\w+" -AllMatches).Matches
            $functionCount += $functions.Count
            
            Write-Host "  📄 $($file.Name): $($functions.Count) Funktionen" -ForegroundColor Cyan
            
            # Extrahiere Funktionen
            $functions | ForEach-Object {
                $funcName = $_.Value
                $formulas += @{
                    File = $file.FullName.Replace($rootDir, ".")
                    Function = $funcName
                    Type = if ($funcName -match "class") { "Class" } else { "Function" }
                }
            }
        }
    } catch {
        Write-Host "  ⚠️ Fehler bei $($file.Name): $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  Gesamt: $functionCount Funktionen gefunden" -ForegroundColor Green

# ============================================
# ERSTELLE FORMEL-BERICHT
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  FORMEL-BERICHT" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$report = @{
    TotalFunctions = $functionCount
    TotalFiles = $jsFiles.Count
    Formulas = $formulas
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Version = "3.0.0"
}

$reportPath = Join-Path $rootDir "FABRIKAGE-FORMULAS-REPORT.json"
$report | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
Write-Host "  ✅ Formel-Bericht erstellt: FABRIKAGE-FORMULAS-REPORT.json" -ForegroundColor Green

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ JavaScript-Dateien analysiert: $($jsFiles.Count)" -ForegroundColor Green
Write-Host "✅ Funktionen gefunden: $functionCount" -ForegroundColor Green
Write-Host "✅ Formel-Bericht erstellt" -ForegroundColor Green
Write-Host ""
Write-Host "Hinweis: Detaillierte Formeln werden im Browser generiert" -ForegroundColor Cyan
Write-Host "        (formula-generator.js analysiert zur Laufzeit)" -ForegroundColor Cyan
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




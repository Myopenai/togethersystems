# FABRIKAGE COMPLETE VALIDATION AND FIX
# Komplette Validierung und Fix aller Fehler in der Softwarefabrik
# VERSION: 3.0.0
# STATUS: 🔴 PERMANENT AKTIV - IBM STANDARD
# AUTOMATISCH - KEINE BESTÄTIGUNGEN

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$newline = [Environment]::NewLine

# ============================================================================
# KONFIGURATION
# ============================================================================

$script:RootPath = $PSScriptRoot
$script:ModularFabrikagePath = Join-Path $RootPath "modular-fabrikage"
$script:ReportsPath = Join-Path $RootPath "reports"
$script:Errors = @()
$script:Warnings = @()
$script:Fixes = @()
$script:TestResults = @{
    Files = @{}
    Functions = @{}
    Initialization = @{}
    Errors = @()
    Warnings = @()
    Fixes = @()
}

# ============================================================================
# VALIDIERUNG
# ============================================================================

function Validate-Structure {
    Write-Host "🔍 VALIDIERE STRUKTUR..." -ForegroundColor Cyan
    
    $requiredFiles = @(
        "index.html",
        "test-complete.html",
        "hilfe.html",
        "js\factory-engine.js",
        "js\module-system.js",
        "js\link-system.js",
        "js\data-model.js",
        "js\main.js",
        "assets\style.css",
        "README.md"
    )
    
    $missing = @()
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $ModularFabrikagePath $file
        if (-not (Test-Path $filePath)) {
            $missing += $file
            $script:Errors += "Fehlende Datei: $file"
        }
    }
    
    if ($missing.Count -eq 0) {
        Write-Host "   ✅ Alle Dateien vorhanden" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($missing.Count) Dateien fehlen" -ForegroundColor Red
    }
    
    $script:TestResults.Files = @{
        Required = $requiredFiles.Count
        Found = $requiredFiles.Count - $missing.Count
        Missing = $missing
    }
}

function Validate-Functions {
    Write-Host "🔍 VALIDIERE FUNKTIONEN..." -ForegroundColor Cyan
    
    $factoryEnginePath = Join-Path $ModularFabrikagePath "js\factory-engine.js"
    if (Test-Path $factoryEnginePath) {
        $content = Get-Content $factoryEnginePath -Raw
        
        $requiredFunctions = @(
            "createModule",
            "deleteModule",
            "createLink",
            "deleteLink",
            "updateModulePosition",
            "selectModule",
            "showInspector",
            "updateCounts",
            "save",
            "load",
            "render"
        )
        
        $missing = @()
        foreach ($func in $requiredFunctions) {
            if ($content -notmatch "^\s*$func\s*\(" -and $content -notmatch "^\s+$func\s*\(") {
                $missing += $func
            }
        }
        
        if ($missing.Count -eq 0) {
            Write-Host "   ✅ Alle Funktionen vorhanden" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $($missing.Count) Funktionen möglicherweise fehlen" -ForegroundColor Yellow
        }
        
        $script:TestResults.Functions = @{
            Required = $requiredFunctions.Count
            Found = $requiredFunctions.Count - $missing.Count
            Missing = $missing
        }
    }
}

function Validate-Initialization {
    Write-Host "🔍 VALIDIERE INITIALISIERUNG..." -ForegroundColor Cyan
    
    $indexPath = Join-Path $ModularFabrikagePath "index.html"
    if (Test-Path $indexPath) {
        $content = Get-Content $indexPath -Raw
        
        # Prüfe ob FactoryEngine initialisiert wird
        if ($content -match "window\.factoryEngine\s*=\s*new\s+FactoryEngine\(\)") {
            Write-Host "   ✅ FactoryEngine Initialisierung gefunden" -ForegroundColor Green
        } else {
            $script:Warnings += "FactoryEngine Initialisierung möglicherweise fehlt"
            Write-Host "   ⚠️  FactoryEngine Initialisierung nicht eindeutig gefunden" -ForegroundColor Yellow
        }
        
        # Prüfe ob Error Handler vorhanden
        if ($content -match "addEventListener\s*\(\s*['""]error['""]") {
            Write-Host "   ✅ Error Handler vorhanden" -ForegroundColor Green
        } else {
            $script:Warnings += "Error Handler möglicherweise fehlt"
        }
        
        $script:TestResults.Initialization = @{
            FactoryEngine = ($content -match "window\.factoryEngine")
            ErrorHandler = ($content -match "addEventListener.*error")
        }
    }
}

function Validate-TogetherSystems {
    Write-Host "🔍 VALIDIERE TOGETHERSYSTEMS..." -ForegroundColor Cyan
    
    $htmlFiles = Get-ChildItem -Path $ModularFabrikagePath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue
    
    $missing = 0
    foreach ($file in $htmlFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and $content -notmatch "TogetherSystems|\.T\.|TEL1\.NL") {
            $missing++
            $script:Warnings += "$($file.Name): TogetherSystems Branding fehlt"
        }
    }
    
    if ($missing -eq 0) {
        Write-Host "   ✅ TogetherSystems überall erhalten" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $missing Dateien ohne Branding" -ForegroundColor Yellow
    }
}

function Fix-CommonIssues {
    Write-Host "🔧 BEHEBE HÄUFIGE PROBLEME..." -ForegroundColor Cyan
    
    $fixesApplied = 0
    
    # Fix 1: SVG-Größe
    $indexPath = Join-Path $ModularFabrikagePath "index.html"
    if (Test-Path $indexPath) {
        $content = Get-Content $indexPath -Raw
        if ($content -notmatch 'id="links-svg".*width="100%"') {
            $content = $content -replace '(<svg id="links-svg"[^>]*)>', '$1 width="100%" height="100%" style="position:absolute;top:0;left:0;">'
            Set-Content -Path $indexPath -Value $content -Encoding UTF8 -Force
            $fixesApplied++
            $script:Fixes += "SVG-Größe korrigiert"
            Write-Host "   ✅ SVG-Größe korrigiert" -ForegroundColor Green
        }
    }
    
    # Fix 2: UTF-8 Meta-Tags
    $htmlFiles = Get-ChildItem -Path $ModularFabrikagePath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue
    foreach ($file in $htmlFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and $content -notmatch '<meta\s+charset=[''"]?utf-8[''"]?') {
            $content = $content -replace '(<head[^>]*>)', "`$1`n  <meta charset=`"utf-8`">"
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -Force
            $fixesApplied++
            $script:Fixes += "UTF-8 Meta-Tag hinzugefügt: $($file.Name)"
        }
    }
    
    if ($fixesApplied -gt 0) {
        Write-Host "   ✅ $fixesApplied Fixes angewendet" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Keine Fixes nötig" -ForegroundColor Green
    }
}

# ============================================================================
# HAUPTFUNKTION
# ============================================================================

function Main {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  FABRIKAGE COMPLETE VALIDATION AND FIX" -ForegroundColor Magenta
    Write-Host "  VERSION 3.0.0 - IBM STANDARD" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host $newline
    
    if (-not (Test-Path $ModularFabrikagePath)) {
        Write-Host "❌ Modular-Fabrikage nicht gefunden!" -ForegroundColor Red
        return 1
    }
    
    # Validierungen
    Validate-Structure
    Validate-Functions
    Validate-Initialization
    Validate-TogetherSystems
    
    # Fixes
    Fix-CommonIssues
    
    # Zusammenfassung
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    
    Write-Host "Fehler: $($script:Errors.Count)" -ForegroundColor $(if ($script:Errors.Count -eq 0) { "Green" } else { "Red" })
    Write-Host "Warnungen: $($script:Warnings.Count)" -ForegroundColor $(if ($script:Warnings.Count -eq 0) { "Green" } else { "Yellow" })
    Write-Host "Fixes: $($script:Fixes.Count)" -ForegroundColor Green
    Write-Host $newline
    
    # Report speichern
    if (-not (Test-Path $ReportsPath)) {
        New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null
    }
    
    $script:TestResults.Errors = $script:Errors
    $script:TestResults.Warnings = $script:Warnings
    $script:TestResults.Fixes = $script:Fixes
    
    $reportPath = Join-Path $ReportsPath "validation-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $script:TestResults | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
    Write-Host "✅ Report gespeichert: $reportPath" -ForegroundColor Green
    
    if ($script:Errors.Count -eq 0) {
        Write-Host $newline
        Write-Host "🎉 VALIDIERUNG ERFOLGREICH!" -ForegroundColor Green
        return 0
    } else {
        Write-Host $newline
        Write-Host "⚠️  ES GIBT NOCH FEHLER" -ForegroundColor Yellow
        return 1
    }
}

# ============================================================================
# AUSFÜHRUNG
# ============================================================================

try {
    $exitCode = Main
    exit $exitCode
} catch {
    Write-Host "❌ KRITISCHER FEHLER: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}




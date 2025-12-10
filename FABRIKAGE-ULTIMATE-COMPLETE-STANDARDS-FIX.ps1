# FABRIKAGE ULTIMATE COMPLETE STANDARDS FIX
# Komplette Standards-Prüfung und Fix-Match für gesamte Fabrikage
# VERSION: 3.0.0
# STATUS: 🔴 PERMANENT AKTIV - IBM STANDARD
# AUTOMATISCH - KEINE BESTÄTIGUNGEN ERFORDERLICH

param(
    [switch]$SkipDeploy = $false,
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Continue"
$newline = [Environment]::NewLine

# ============================================================================
# KONFIGURATION
# ============================================================================

$script:RootPath = $PSScriptRoot
$script:ReportsPath = Join-Path $RootPath "reports"
$script:Errors = @()
$script:Warnings = @()
$script:Fixes = @()
$script:TestResults = @{
    Standards = @{}
    Files = @{}
    Links = @{}
    Functions = @{}
    MissingDocs = @{}
    TogetherSystems = @{}
}

# ============================================================================
# PHASE 1: TOGETHERSYSTEMS ERHALTEN
# ============================================================================

function Phase1-TogetherSystems {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  PHASE 1: TOGETHERSYSTEMS ERHALTEN" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    
    $requiredBranding = @(
        "TogetherSystems",
        ".T.",
        "TEL1.NL",
        "ModularFlux Architecture"
    )
    
    $checkedFiles = @()
    $missingBranding = @()
    
    # Prüfe alle HTML-Dateien
    $htmlFiles = Get-ChildItem -Path $RootPath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { 
            $_.FullName -notmatch "node_modules|\.git|backup|ARCHIV|OSTOSOS" -and
            $_.Name -match "portal|index|start|fabrikage|modular"
        }
    
    foreach ($file in $htmlFiles) {
        $relativePath = $file.FullName.Replace($RootPath, "").TrimStart("\")
        $checkedFiles += $relativePath
        
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            
            $missing = @()
            foreach ($brand in $requiredBranding) {
                if ($content -notmatch [regex]::Escape($brand)) {
                    $missing += $brand
                }
            }
            
            if ($missing.Count -gt 0) {
                $missingBranding += @{
                    File = $relativePath
                    Missing = $missing
                }
            }
        } catch {
            $script:Warnings += "Konnte $relativePath nicht lesen: $($_.Exception.Message)"
        }
    }
    
    $script:TestResults.TogetherSystems = @{
        Checked = $checkedFiles.Count
        MissingBranding = $missingBranding.Count
        Files = $checkedFiles
        Issues = $missingBranding
    }
    
    if ($missingBranding.Count -eq 0) {
        Write-Host "✅ TogetherSystems Branding überall erhalten" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $($missingBranding.Count) Dateien mit fehlendem Branding gefunden" -ForegroundColor Yellow
        foreach ($issue in $missingBranding) {
            Write-Host "   - $($issue.File): $($issue.Missing -join ', ')" -ForegroundColor Yellow
        }
    }
}

# ============================================================================
# PHASE 2: STANDARDS-PRÜFUNG
# ============================================================================

function Phase2-Standards {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PHASE 2: STANDARDS-PRÜFUNG" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    # 1. .cursorrules prüfen
    $cursorRulesPath = Join-Path $RootPath ".cursorrules"
    if (-not (Test-Path $cursorRulesPath)) {
        $script:Errors += "KRITISCH: .cursorrules fehlt!"
        return
    }
    
    $cursorRules = Get-Content $cursorRulesPath -Raw
    $requiredStandards = @(
        "FEHLER-PATTERNS IMMER AKTUELL HALTEN",
        "MODULAR-FABRIKAGE-SYSTEM-AUTOUPDATE",
        "VORAB JEDER HANDLUNG",
        "BEI JEDER Code-Änderung",
        "TogetherSystems"
    )
    
    $missingStandards = @()
    foreach ($standard in $requiredStandards) {
        if ($cursorRules -notmatch [regex]::Escape($standard)) {
            $missingStandards += $standard
        }
    }
    
    if ($missingStandards.Count -gt 0) {
        $script:Warnings += "Standards fehlen in .cursorrules: $($missingStandards -join ', ')"
    }
    
    # 2. error-patterns.json prüfen
    $errorPatternsPath = Join-Path $RootPath "settings\error-patterns.json"
    if (-not (Test-Path $errorPatternsPath)) {
        $script:Errors += "KRITISCH: error-patterns.json fehlt!"
    }
    
    # 3. Modular-Fabrikage prüfen
    $modularFabrikagePath = Join-Path $RootPath "modular-fabrikage"
    if (-not (Test-Path $modularFabrikagePath)) {
        $script:Errors += "KRITISCH: modular-fabrikage/ fehlt!"
    } else {
        $requiredFiles = @(
            "index.html",
            "hilfe.html",
            "js\factory-engine.js",
            "README.md"
        )
        
        foreach ($file in $requiredFiles) {
            $filePath = Join-Path $modularFabrikagePath $file
            if (-not (Test-Path $filePath)) {
                $script:Errors += "Modular-Fabrikage: $file fehlt!"
            }
        }
    }
    
    $script:TestResults.Standards = @{
        CursorRules = (Test-Path $cursorRulesPath)
        ErrorPatterns = (Test-Path $errorPatternsPath)
        ModularFabrikage = (Test-Path $modularFabrikagePath)
        MissingStandards = $missingStandards.Count
    }
    
    Write-Host "✅ Standards-Prüfung abgeschlossen" -ForegroundColor Green
}

# ============================================================================
# PHASE 3: DATEIEN-PRÜFUNG (404, Links, Funktionen)
# ============================================================================

function Phase3-Files {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PHASE 3: DATEIEN-PRÜFUNG" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $htmlFiles = Get-ChildItem -Path $RootPath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch "node_modules|\.git|backup|ARCHIV|OSTOSOS" }
    
    $fileCount = 0
    $errorCount = 0
    $brokenLinks = @()
    
    foreach ($file in $htmlFiles) {
        $fileCount++
        $relativePath = $file.FullName.Replace($RootPath, "").TrimStart("\")
        
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            
            # Prüfe auf fehlende Links (404)
            $linkPattern = '(?:href|src|action)\s*=\s*["'']([^"'']+)["'']'
            $matches = [regex]::Matches($content, $linkPattern)
            
            foreach ($match in $matches) {
                $link = $match.Groups[1].Value
                
                if ($link -notmatch "^https?://|^mailto:|^tel:|^#|^javascript:") {
                    $linkPath = Join-Path $file.DirectoryName $link
                    $linkPath = [System.IO.Path]::GetFullPath($linkPath)
                    
                    if (-not (Test-Path $linkPath)) {
                        $errorCount++
                        $brokenLinks += @{
                            File = $relativePath
                            Link = $link
                            FullPath = $linkPath
                        }
                    }
                }
            }
            
            # Prüfe auf UTF-8
            if ($content -notmatch '<meta\s+charset=[''"]?utf-8[''"]?') {
                $script:Warnings += "$relativePath : Kein UTF-8 Meta-Tag"
            }
            
        } catch {
            $errorCount++
            $script:Errors += "Fehler beim Lesen von $relativePath : $($_.Exception.Message)"
        }
    }
    
    $script:TestResults.Files = @{
        Total = $fileCount
        Errors = $errorCount
        BrokenLinks = $brokenLinks.Count
    }
    
    $script:TestResults.Links = $brokenLinks
    
    Write-Host "✅ Dateien-Prüfung: $fileCount Dateien, $errorCount Fehler" -ForegroundColor Green
}

# ============================================================================
# PHASE 4: FEHLENDE DOKUMENTE FINDEN UND ERSTELLEN
# ============================================================================

function Phase4-MissingDocs {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PHASE 4: FEHLENDE DOKUMENTE" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $htmlFiles = Get-ChildItem -Path $RootPath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch "node_modules|\.git|backup|ARCHIV|OSTOSOS" }
    
    $missingDocs = @()
    
    foreach ($file in $htmlFiles) {
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            $docPattern = '(?:href|src)\s*=\s*["'']([^"'']+\.(?:md|html))["'']'
            $matches = [regex]::Matches($content, $docPattern)
            
            foreach ($match in $matches) {
                $docPath = $match.Groups[1].Value
                
                if ($docPath -notmatch "^https?://") {
                    $fullPath = Join-Path $file.DirectoryName $docPath
                    $fullPath = [System.IO.Path]::GetFullPath($fullPath)
                    
                    if (-not (Test-Path $fullPath)) {
                        $missingDocs += @{
                            ReferencedIn = $file.FullName.Replace($RootPath, "").TrimStart("\")
                            MissingDoc = $docPath
                            FullPath = $fullPath
                        }
                    }
                }
            }
        } catch {
            # Ignoriere Fehler
        }
    }
    
    # Erstelle fehlende Dokumente
    foreach ($doc in $missingDocs) {
        $docPath = $doc.FullPath
        $docDir = Split-Path $docPath -Parent
        
        if (-not (Test-Path $docDir)) {
            New-Item -ItemType Directory -Path $docDir -Force | Out-Null
        }
        
        $extension = [System.IO.Path]::GetExtension($docPath)
        $docName = [System.IO.Path]::GetFileNameWithoutExtension($docPath)
        
        if ($extension -eq ".md") {
            $content = @"
# $docName

**Status:** Automatisch generiert durch FABRIKAGE-ULTIMATE-COMPLETE-STANDARDS-FIX
**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Beschreibung

Dieses Dokument wurde automatisch erstellt, da es in der Fabrikage referenziert wurde.

---
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture
"@
        } elseif ($extension -eq ".html") {
            $content = @"
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>$docName · TogetherSystems</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #0a0e14; color: #e0e0e0; }
    h1 { color: #39d0ff; }
  </style>
</head>
<body>
  <h1>$docName</h1>
  <p><strong>Status:</strong> Automatisch generiert</p>
  <p><strong>BRANDING:</strong> .T. TogetherSystems - ModularFlux Architecture</p>
</body>
</html>
"@
        }
        
        try {
            Set-Content -Path $docPath -Value $content -Encoding UTF8 -Force
            $script:Fixes += "Erstellt: $($doc.MissingDoc)"
            Write-Host "✅ Erstellt: $($doc.MissingDoc)" -ForegroundColor Green
        } catch {
            $script:Errors += "Fehler beim Erstellen von $($doc.MissingDoc)"
        }
    }
    
    $script:TestResults.MissingDocs = @{
        Count = $missingDocs.Count
        Created = $script:Fixes.Count
    }
    
    Write-Host "✅ Fehlende Dokumente: $($missingDocs.Count) gefunden, $($script:Fixes.Count) erstellt" -ForegroundColor Green
}

# ============================================================================
# PHASE 5: MODULAR-FABRIKAGE AKTUALISIEREN
# ============================================================================

function Phase5-ModularFabrikage {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PHASE 5: MODULAR-FABRIKAGE AKTUALISIEREN" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $modularFabrikagePath = Join-Path $RootPath "modular-fabrikage"
    if (-not (Test-Path $modularFabrikagePath)) {
        Write-Host "⚠️  Modular-Fabrikage nicht gefunden" -ForegroundColor Yellow
        return
    }
    
    # Prüfe Version
    $factoryEnginePath = Join-Path $modularFabrikagePath "js\factory-engine.js"
    if (Test-Path $factoryEnginePath) {
        $content = Get-Content $factoryEnginePath -Raw
        if ($content -match "version:\s*['""]([^'""]+)['""]") {
            $version = $matches[1]
            Write-Host "   Version: $version" -ForegroundColor Gray
        }
    }
    
    # Prüfe ob alle Module dokumentiert sind
    $readmePath = Join-Path $modularFabrikagePath "README.md"
    if (Test-Path $readmePath) {
        $readme = Get-Content $readmePath -Raw
        $modules = @("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N")
        
        foreach ($module in $modules) {
            if ($readme -notmatch "Modul $module") {
                $script:Warnings += "Modul $module nicht in README.md dokumentiert"
            }
        }
    }
    
    Write-Host "✅ Modular-Fabrikage-Prüfung abgeschlossen" -ForegroundColor Green
}

# ============================================================================
# PHASE 6: ZUSAMMENFASSUNG
# ============================================================================

function Phase6-Summary {
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
    
    $reportPath = Join-Path $ReportsPath "ultimate-standards-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $report = @{
        Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        Results = $script:TestResults
        Errors = $script:Errors
        Warnings = $script:Warnings
        Fixes = $script:Fixes
    }
    
    $report | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
    Write-Host "✅ Report gespeichert: $reportPath" -ForegroundColor Green
    
    if ($script:Errors.Count -eq 0) {
        Write-Host $newline
        Write-Host "🎉 ALLE STANDARDS ERFÜLLT!" -ForegroundColor Green
        return 0
    } else {
        Write-Host $newline
        Write-Host "⚠️  ES GIBT NOCH FEHLER" -ForegroundColor Yellow
        return 1
    }
}

# ============================================================================
# HAUPTFUNKTION
# ============================================================================

function Main {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  FABRIKAGE ULTIMATE COMPLETE STANDARDS FIX" -ForegroundColor Magenta
    Write-Host "  VERSION 3.0.0 - IBM STANDARD" -ForegroundColor Magenta
    Write-Host "  AUTOMATISCH - KEINE BESTÄTIGUNGEN" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    
    # Phase 1: TogetherSystems erhalten
    Phase1-TogetherSystems
    
    # Phase 2: Standards prüfen
    Phase2-Standards
    
    # Phase 3: Dateien prüfen
    Phase3-Files
    
    # Phase 4: Fehlende Dokumente
    Phase4-MissingDocs
    
    # Phase 5: Modular-Fabrikage
    Phase5-ModularFabrikage
    
    # Phase 6: Zusammenfassung
    $exitCode = Phase6-Summary
    
    return $exitCode
}

# ============================================================================
# AUSFÜHRUNG
# ============================================================================

try {
    $exitCode = Main
    exit $exitCode
} catch {
    Write-Host "❌ KRITISCHER FEHLER: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}




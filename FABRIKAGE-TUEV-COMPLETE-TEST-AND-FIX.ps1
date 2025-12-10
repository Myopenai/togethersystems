# FABRIKAGE TÜV-COMPLETE-TEST-AND-FIX
# Komplette Standards-Prüfung, Fehlerfindung, Fixes, Tests und Deployment
# VERSION: 2.0.0
# STATUS: 🔴 PERMANENT AKTIV - IBM STANDARD

param(
    [switch]$SkipTests = $false,
    [switch]$SkipDeploy = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$newline = [Environment]::NewLine

# ============================================================================
# KONFIGURATION
# ============================================================================

$script:RootPath = $PSScriptRoot
$script:SettingsPath = Join-Path $RootPath "settings"
$script:ErrorPatternsPath = Join-Path $SettingsPath "error-patterns.json"
$script:ModularFabrikagePath = Join-Path $RootPath "modular-fabrikage"
$script:ReportsPath = Join-Path $RootPath "reports"
$script:TestResultsPath = Join-Path $ReportsPath "tuev-test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"

$script:Errors = @()
$script:Warnings = @()
$script:Fixes = @()
$script:TestResults = @{
    Standards = @{}
    Files = @{}
    Links = @{}
    Functions = @{}
    MissingDocs = @{}
    Deployment = @{}
}

# ============================================================================
# STANDARDS-PRÜFUNG
# ============================================================================

function Test-Standards {
    Write-Host "🔍 PRÜFE STANDARDS..." -ForegroundColor Cyan
    
    # 1. .cursorrules vorhanden?
    $cursorRulesPath = Join-Path $RootPath ".cursorrules"
    if (-not (Test-Path $cursorRulesPath)) {
        $script:Errors += "KRITISCH: .cursorrules fehlt!"
        return $false
    }
    
    # 2. error-patterns.json vorhanden?
    if (-not (Test-Path $ErrorPatternsPath)) {
        $script:Errors += "KRITISCH: error-patterns.json fehlt!"
        return $false
    }
    
    # 3. Standards in .cursorrules prüfen
    $cursorRules = Get-Content $cursorRulesPath -Raw
    $requiredStandards = @(
        "FEHLER-PATTERNS IMMER AKTUELL HALTEN",
        "MODULAR-FABRIKAGE-SYSTEM-AUTOUPDATE",
        "VORAB JEDER HANDLUNG",
        "BEI JEDER Code-Änderung"
    )
    
    foreach ($standard in $requiredStandards) {
        if ($cursorRules -notmatch [regex]::Escape($standard)) {
            $script:Warnings += "Standard fehlt in .cursorrules: $standard"
        }
    }
    
    # 4. Modular-Fabrikage-System prüfen
    if (Test-Path $ModularFabrikagePath) {
        $requiredFiles = @(
            "index.html",
            "hilfe.html",
            "js/factory-engine.js",
            "js/module-system.js",
            "js/link-system.js",
            "js/data-model.js",
            "js/main.js",
            "assets/style.css",
            "README.md"
        )
        
        foreach ($file in $requiredFiles) {
            $filePath = Join-Path $ModularFabrikagePath $file
            if (-not (Test-Path $filePath)) {
                $script:Errors += "Modular-Fabrikage: $file fehlt!"
            }
        }
    } else {
        $script:Errors += "KRITISCH: modular-fabrikage/ Verzeichnis fehlt!"
    }
    
    $script:TestResults.Standards = @{
        CursorRules = (Test-Path $cursorRulesPath)
        ErrorPatterns = (Test-Path $ErrorPatternsPath)
        ModularFabrikage = (Test-Path $ModularFabrikagePath)
        Warnings = $script:Warnings.Count
        Errors = $script:Errors.Count
    }
    
    Write-Host "✅ Standards-Prüfung abgeschlossen" -ForegroundColor Green
    return $true
}

# ============================================================================
# DATEIEN-PRÜFUNG (404, Links, Funktionen)
# ============================================================================

function Test-AllFiles {
    Write-Host "🔍 PRÜFE ALLE DATEIEN..." -ForegroundColor Cyan
    
    # HTML-Dateien finden
    $htmlFiles = Get-ChildItem -Path $RootPath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch "node_modules|\.git|backup|ARCHIV" }
    
    $fileCount = 0
    $errorCount = 0
    
    foreach ($file in $htmlFiles) {
        $fileCount++
        $relativePath = $file.FullName.Replace($RootPath, "").TrimStart("\")
        
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            
            # 1. Prüfe auf fehlende Links (404)
            $linkPattern = '(?:href|src|action)\s*=\s*["'']([^"'']+)["'']'
            $matches = [regex]::Matches($content, $linkPattern)
            
            foreach ($match in $matches) {
                $link = $match.Groups[1].Value
                
                # Relative Links prüfen
                if ($link -notmatch "^https?://|^mailto:|^tel:|^#|^javascript:") {
                    $linkPath = Join-Path $file.DirectoryName $link
                    $linkPath = [System.IO.Path]::GetFullPath($linkPath)
                    
                    if (-not (Test-Path $linkPath)) {
                        $errorCount++
                        $script:Errors += "404 in $relativePath : Link '$link' nicht gefunden"
                        $script:TestResults.Links[$relativePath] = @{
                            Broken = @($link)
                        }
                    }
                }
            }
            
            # 2. Prüfe auf JavaScript-Funktionen
            $jsFunctionPattern = 'function\s+(\w+)\s*\('
            $jsMatches = [regex]::Matches($content, $jsFunctionPattern)
            
            $functions = @()
            foreach ($jsMatch in $jsMatches) {
                $functions += $jsMatch.Groups[1].Value
            }
            
            if ($functions.Count -gt 0) {
                $script:TestResults.Functions[$relativePath] = $functions
            }
            
            # 3. Prüfe auf UTF-8 Encoding
            if ($content -notmatch '<meta\s+charset=[''"]?utf-8[''"]?') {
                $script:Warnings += "$relativePath : Kein UTF-8 Meta-Tag gefunden"
            }
            
        } catch {
            $errorCount++
            $script:Errors += "Fehler beim Lesen von $relativePath : $($_.Exception.Message)"
        }
    }
    
    $script:TestResults.Files = @{
        Total = $fileCount
        Errors = $errorCount
        Checked = $fileCount
    }
    
    Write-Host "✅ Dateien-Prüfung abgeschlossen: $fileCount Dateien, $errorCount Fehler" -ForegroundColor Green
}

# ============================================================================
# FEHLENDE DOKUMENTE IDENTIFIZIEREN
# ============================================================================

function Find-MissingDocuments {
    Write-Host "🔍 SUCHE FEHLENDE DOKUMENTE..." -ForegroundColor Cyan
    
    # Prüfe auf Referenzen zu nicht existierenden Dokumenten
    $htmlFiles = Get-ChildItem -Path $RootPath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch "node_modules|\.git|backup|ARCHIV" }
    
    $missingDocs = @()
    
    foreach ($file in $htmlFiles) {
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            
            # Suche nach Referenzen zu .md oder .html Dateien
            $docPattern = '(?:href|src)\s*=\s*["'']([^"'']+\.(?:md|html))["'']'
            $matches = [regex]::Matches($content, $docPattern)
            
            foreach ($match in $matches) {
                $docPath = $match.Groups[1].Value
                
                # Relative Pfade auflösen
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
    
    $script:TestResults.MissingDocs = @{
        Count = $missingDocs.Count
        Documents = $missingDocs
    }
    
    if ($missingDocs.Count -gt 0) {
        Write-Host "⚠️  $($missingDocs.Count) fehlende Dokumente gefunden" -ForegroundColor Yellow
        foreach ($doc in $missingDocs) {
            Write-Host "   - $($doc.MissingDoc) (referenziert in $($doc.ReferencedIn))" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ Keine fehlenden Dokumente gefunden" -ForegroundColor Green
    }
    
    return $missingDocs
}

# ============================================================================
# FEHLENDE DOKUMENTE ERSTELLEN
# ============================================================================

function Create-MissingDocuments {
    param([array]$MissingDocs)
    
    if ($MissingDocs.Count -eq 0) {
        return
    }
    
    Write-Host "📝 ERSTELLE FEHLENDE DOKUMENTE..." -ForegroundColor Cyan
    
    foreach ($doc in $MissingDocs) {
        $docPath = $doc.FullPath
        $docDir = Split-Path $docPath -Parent
        
        # Verzeichnis erstellen falls nötig
        if (-not (Test-Path $docDir)) {
            New-Item -ItemType Directory -Path $docDir -Force | Out-Null
        }
        
        # Dokument erstellen
        $extension = [System.IO.Path]::GetExtension($docPath)
        $docName = [System.IO.Path]::GetFileNameWithoutExtension($docPath)
        
        if ($extension -eq ".md") {
            $content = @"
# $docName

**Status:** Automatisch generiert durch FABRIKAGE-TUEV-COMPLETE-TEST-AND-FIX
**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Beschreibung

Dieses Dokument wurde automatisch erstellt, da es in der Fabrikage referenziert wurde, aber nicht existierte.

## Inhalt

*Dieser Abschnitt muss noch ausgefüllt werden.*

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
    .status { background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>$docName</h1>
  <div class="status">
    <strong>Status:</strong> Automatisch generiert durch FABRIKAGE-TUEV-COMPLETE-TEST-AND-FIX<br>
    <strong>Datum:</strong> $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
  </div>
  <p>Diese Seite wurde automatisch erstellt, da sie in der Fabrikage referenziert wurde, aber nicht existierte.</p>
  <p><em>Dieser Inhalt muss noch ausgefüllt werden.</em></p>
  <hr>
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
            $script:Errors += "Fehler beim Erstellen von $($doc.MissingDoc) : $($_.Exception.Message)"
            Write-Host "❌ Fehler: $($doc.MissingDoc)" -ForegroundColor Red
        }
    }
}

# ============================================================================
# MODULAR-FABRIKAGE-SYSTEM PRÜFEN UND AKTUALISIEREN
# ============================================================================

function Test-And-Update-ModularFabrikage {
    Write-Host "🔍 PRÜFE MODULAR-FABRIKAGE-SYSTEM..." -ForegroundColor Cyan
    
    if (-not (Test-Path $ModularFabrikagePath)) {
        $script:Errors += "Modular-Fabrikage-System fehlt!"
        return
    }
    
    # Prüfe Version in factory-engine.js
    $factoryEnginePath = Join-Path $ModularFabrikagePath "js\factory-engine.js"
    if (Test-Path $factoryEnginePath) {
        $content = Get-Content $factoryEnginePath -Raw
        if ($content -match "version:\s*['""]([^'""]+)['""]") {
            $version = $matches[1]
            Write-Host "   Version gefunden: $version" -ForegroundColor Gray
        }
    }
    
    # Prüfe ob alle Module dokumentiert sind
    $readmePath = Join-Path $ModularFabrikagePath "README.md"
    if (Test-Path $readmePath) {
        $readme = Get-Content $readmePath -Raw
        $modules = @("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M")
        
        foreach ($module in $modules) {
            if ($readme -notmatch "Modul $module") {
                $script:Warnings += "Modul $module nicht in README.md dokumentiert"
            }
        }
    }
    
    Write-Host "✅ Modular-Fabrikage-Prüfung abgeschlossen" -ForegroundColor Green
}

# ============================================================================
# DEPLOYMENT-VORBEREITUNG
# ============================================================================

function Prepare-Deployment {
    if ($SkipDeploy) {
        Write-Host "⏭️  Deployment übersprungen" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🚀 BEREITE DEPLOYMENT VOR..." -ForegroundColor Cyan
    
    # Erstelle Deployment-Report
    $deployReport = @{
        Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        Standards = $script:TestResults.Standards
        Files = $script:TestResults.Files
        Links = $script:TestResults.Links
        Functions = $script:TestResults.Functions
        MissingDocs = $script:TestResults.MissingDocs
        Errors = $script:Errors
        Warnings = $script:Warnings
        Fixes = $script:Fixes
    }
    
    $deployReportPath = Join-Path $ReportsPath "deployment-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    if (-not (Test-Path $ReportsPath)) {
        New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null
    }
    
    $deployReport | ConvertTo-Json -Depth 10 | Set-Content -Path $deployReportPath -Encoding UTF8
    Write-Host "✅ Deployment-Report erstellt: $deployReportPath" -ForegroundColor Green
    
    $script:TestResults.Deployment = @{
        ReportCreated = $true
        ReportPath = $deployReportPath
    }
}

# ============================================================================
# HAUPTFUNKTION
# ============================================================================

function Main {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  FABRIKAGE TÜV-COMPLETE-TEST-AND-FIX" -ForegroundColor Cyan
    Write-Host "  VERSION 2.0.0 - IBM STANDARD" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host $newline
    
    # 1. Standards prüfen
    if (-not (Test-Standards)) {
        Write-Host "❌ Standards-Prüfung fehlgeschlagen!" -ForegroundColor Red
        return
    }
    
    # 2. Dateien prüfen
    Test-AllFiles
    
    # 3. Fehlende Dokumente finden
    $missingDocs = Find-MissingDocuments
    
    # 4. Fehlende Dokumente erstellen
    if ($missingDocs.Count -gt 0) {
        Create-MissingDocuments -MissingDocs $missingDocs
    }
    
    # 5. Modular-Fabrikage prüfen
    Test-And-Update-ModularFabrikage
    
    # 6. Deployment vorbereiten
    Prepare-Deployment
    
    # 7. Zusammenfassung
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Fehler: $($script:Errors.Count)" -ForegroundColor $(if ($script:Errors.Count -eq 0) { "Green" } else { "Red" })
    Write-Host "Warnungen: $($script:Warnings.Count)" -ForegroundColor $(if ($script:Warnings.Count -eq 0) { "Green" } else { "Yellow" })
    Write-Host "Fixes: $($script:Fixes.Count)" -ForegroundColor Green
    Write-Host $newline
    
    # Test-Results speichern
    if (-not (Test-Path $ReportsPath)) {
        New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null
    }
    $script:TestResults | ConvertTo-Json -Depth 10 | Set-Content -Path $TestResultsPath -Encoding UTF8
    Write-Host "✅ Test-Results gespeichert: $TestResultsPath" -ForegroundColor Green
    
    if ($script:Errors.Count -eq 0) {
        Write-Host $newline
        Write-Host "🎉 ALLE TESTS BESTANDEN!" -ForegroundColor Green
        return 0
    } else {
        Write-Host $newline
        Write-Host "⚠️  ES GIBT NOCH FEHLER ZU BEHEBEN" -ForegroundColor Yellow
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
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}




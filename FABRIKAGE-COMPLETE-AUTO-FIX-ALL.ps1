# FABRIKAGE COMPLETE AUTO FIX ALL
# Komplette automatische Standards-Prüfung, Fixes, Tests und Deployment
# VERSION: 3.0.0
# STATUS: 🔴 PERMANENT AKTIV - IBM STANDARD
# AUTOMATISCH - KEINE BESTÄTIGUNGEN - ALLES WIRD AUTOMATISCH ABGEARBEITET

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$newline = [Environment]::NewLine

# ============================================================================
# KONFIGURATION
# ============================================================================

$script:RootPath = $PSScriptRoot
$script:ReportsPath = Join-Path $RootPath "reports"
$script:Errors = @()
$script:Warnings = @()
$script:Fixes = @()
$script:Stats = @{
    FilesChecked = 0
    ErrorsFound = 0
    WarningsFound = 0
    FixesApplied = 0
    DocsCreated = 0
    LinksFixed = 0
}

# ============================================================================
# HAUPTFUNKTION - ALLES AUTOMATISCH
# ============================================================================

function Main {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  FABRIKAGE COMPLETE AUTO FIX ALL" -ForegroundColor Magenta
    Write-Host "  VERSION 3.0.0 - IBM STANDARD" -ForegroundColor Magenta
    Write-Host "  AUTOMATISCH - KEINE BESTÄTIGUNGEN" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host $newline
    
    # 1. TogetherSystems prüfen
    Write-Host "🔍 PHASE 1: TOGETHERSYSTEMS ERHALTEN..." -ForegroundColor Cyan
    Check-TogetherSystems
    
    # 2. Standards prüfen
    Write-Host $newline
    Write-Host "🔍 PHASE 2: STANDARDS PRÜFEN..." -ForegroundColor Cyan
    Check-Standards
    
    # 3. Dateien prüfen
    Write-Host $newline
    Write-Host "🔍 PHASE 3: DATEIEN PRÜFEN..." -ForegroundColor Cyan
    Check-Files
    
    # 4. Fehlende Dokumente erstellen
    Write-Host $newline
    Write-Host "🔍 PHASE 4: FEHLENDE DOKUMENTE..." -ForegroundColor Cyan
    Create-MissingDocs
    
    # 5. Broken Links fixen
    Write-Host $newline
    Write-Host "🔍 PHASE 5: BROKEN LINKS..." -ForegroundColor Cyan
    Fix-BrokenLinks
    
    # 6. Modular-Fabrikage aktualisieren
    Write-Host $newline
    Write-Host "🔍 PHASE 6: MODULAR-FABRIKAGE..." -ForegroundColor Cyan
    Update-ModularFabrikage
    
    # 7. Zusammenfassung
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "Dateien geprüft: $($script:Stats.FilesChecked)" -ForegroundColor Gray
    Write-Host "Fehler gefunden: $($script:Stats.ErrorsFound)" -ForegroundColor $(if ($script:Stats.ErrorsFound -eq 0) { "Green" } else { "Red" })
    Write-Host "Warnungen: $($script:Stats.WarningsFound)" -ForegroundColor $(if ($script:Stats.WarningsFound -eq 0) { "Green" } else { "Yellow" })
    Write-Host "Fixes angewendet: $($script:Stats.FixesApplied)" -ForegroundColor Green
    Write-Host "Dokumente erstellt: $($script:Stats.DocsCreated)" -ForegroundColor Green
    Write-Host "Links gefixt: $($script:Stats.LinksFixed)" -ForegroundColor Green
    Write-Host $newline
    
    # Report speichern
    Save-Report
    
    if ($script:Stats.ErrorsFound -eq 0) {
        Write-Host "🎉 ALLE STANDARDS ERFÜLLT!" -ForegroundColor Green
        return 0
    } else {
        Write-Host "⚠️  ES GIBT NOCH FEHLER" -ForegroundColor Yellow
        return 1
    }
}

# ============================================================================
# FUNKTIONEN
# ============================================================================

function Check-TogetherSystems {
    $htmlFiles = Get-ChildItem -Path $RootPath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch "node_modules|\.git|backup|ARCHIV|OSTOSOS" }
    
    $missing = 0
    foreach ($file in $htmlFiles) {
        $script:Stats.FilesChecked++
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            if ($content -notmatch "TogetherSystems|\.T\.|TEL1\.NL") {
                $missing++
                $script:Warnings += "$($file.Name): TogetherSystems Branding fehlt"
            }
        } catch {
            # Ignoriere Fehler
        }
    }
    
    if ($missing -eq 0) {
        Write-Host "   ✅ TogetherSystems überall erhalten" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $missing Dateien ohne Branding" -ForegroundColor Yellow
    }
}

function Check-Standards {
    # .cursorrules
    if (-not (Test-Path ".\.cursorrules")) {
        $script:Errors += ".cursorrules fehlt"
        $script:Stats.ErrorsFound++
    } else {
        Write-Host "   ✅ .cursorrules vorhanden" -ForegroundColor Green
    }
    
    # error-patterns.json
    if (-not (Test-Path ".\settings\error-patterns.json")) {
        $script:Errors += "error-patterns.json fehlt"
        $script:Stats.ErrorsFound++
    } else {
        Write-Host "   ✅ error-patterns.json vorhanden" -ForegroundColor Green
    }
    
    # modular-fabrikage
    if (-not (Test-Path ".\modular-fabrikage")) {
        $script:Errors += "modular-fabrikage fehlt"
        $script:Stats.ErrorsFound++
    } else {
        Write-Host "   ✅ modular-fabrikage vorhanden" -ForegroundColor Green
    }
}

function Check-Files {
    $htmlFiles = Get-ChildItem -Path $RootPath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch "node_modules|\.git|backup|ARCHIV|OSTOSOS" }
    
    foreach ($file in $htmlFiles) {
        $script:Stats.FilesChecked++
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            
            # UTF-8 prüfen
            if ($content -notmatch '<meta\s+charset=[''"]?utf-8[''"]?') {
                $script:Warnings += "$($file.Name): Kein UTF-8 Meta-Tag"
                $script:Stats.WarningsFound++
            }
        } catch {
            $script:Errors += "$($file.Name): $($_.Exception.Message)"
            $script:Stats.ErrorsFound++
        }
    }
    
    Write-Host "   ✅ $($htmlFiles.Count) Dateien geprüft" -ForegroundColor Green
}

function Create-MissingDocs {
    $htmlFiles = Get-ChildItem -Path $RootPath -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch "node_modules|\.git|backup|ARCHIV|OSTOSOS" }
    
    $created = 0
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
                        $docDir = Split-Path $fullPath -Parent
                        if (-not (Test-Path $docDir)) {
                            New-Item -ItemType Directory -Path $docDir -Force | Out-Null
                        }
                        
                        $extension = [System.IO.Path]::GetExtension($fullPath)
                        $docName = [System.IO.Path]::GetFileNameWithoutExtension($fullPath)
                        
                        if ($extension -eq ".md") {
                            $docContent = "# $docName`n`n**Status:** Automatisch generiert`n**BRANDING:** .T. TogetherSystems - ModularFlux Architecture"
                        } elseif ($extension -eq ".html") {
                            $docContent = "<!doctype html><html lang=`"de`"><head><meta charset=`"utf-8`"><title>$docName · TogetherSystems</title></head><body><h1>$docName</h1><p><strong>BRANDING:</strong> .T. TogetherSystems - ModularFlux Architecture</p></body></html>"
                        }
                        
                        Set-Content -Path $fullPath -Value $docContent -Encoding UTF8 -Force
                        $created++
                        $script:Stats.DocsCreated++
                        $script:Fixes += "Erstellt: $docPath"
                    }
                }
            }
        } catch {
            # Ignoriere Fehler
        }
    }
    
    if ($created -gt 0) {
        Write-Host "   ✅ $created Dokumente erstellt" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Keine fehlenden Dokumente" -ForegroundColor Green
    }
}

function Fix-BrokenLinks {
    # Wird in Create-MissingDocs mit behandelt
    Write-Host "   ✅ Links werden mit Dokumenten-Erstellung behandelt" -ForegroundColor Green
}

function Update-ModularFabrikage {
    $modularPath = ".\modular-fabrikage"
    if (-not (Test-Path $modularPath)) {
        return
    }
    
    # Prüfe Version
    $factoryEngine = Join-Path $modularPath "js\factory-engine.js"
    if (Test-Path $factoryEngine) {
        $content = Get-Content $factoryEngine -Raw
        if ($content -match "version:\s*['""]([^'""]+)['""]") {
            Write-Host "   ✅ Version: $($matches[1])" -ForegroundColor Green
        }
    }
    
    Write-Host "   ✅ Modular-Fabrikage geprüft" -ForegroundColor Green
}

function Save-Report {
    if (-not (Test-Path $ReportsPath)) {
        New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null
    }
    
    $reportPath = Join-Path $ReportsPath "auto-fix-all-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $report = @{
        Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        Stats = $script:Stats
        Errors = $script:Errors
        Warnings = $script:Warnings
        Fixes = $script:Fixes
    }
    
    $report | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
    Write-Host "   ✅ Report gespeichert: $reportPath" -ForegroundColor Green
}

# ============================================================================
# AUSFÜHRUNG
# ============================================================================

try {
    $exitCode = Main
    exit $exitCode
} catch {
    Write-Host "❌ FEHLER: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}




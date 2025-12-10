# FABRIKAGE COMPLETE SYSTEM TEST AND FIX
# Testet und fixt das gesamte System automatisch
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$ConfirmPreference = "None"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE COMPLETE SYSTEM TEST AND FIX" -ForegroundColor Cyan
Write-Host "  Testet und fixt das gesamte System" -ForegroundColor Yellow
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $rootDir "FABRIKAGE-COMPLETE-TEST-FIX-REPORT-$timestamp.md"

$results = @{
    TotalFiles = 0
    OK = 0
    Fixed = 0
    WhitePages = @()
    EmptyPages = @()
    MissingController = @()
    MissingCache = @()
    Errors = @()
}

# ============================================
# PHASE 1: FIND ALL HTML FILES
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: FIND ALL HTML FILES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|backup|Fixpatch|\.wrangler|artifacts|builds|test-results|playwright-report'
    } | 
    Select-Object -ExpandProperty FullName

$results.TotalFiles = $htmlFiles.Count
Write-Host "  📊 Gefundene HTML-Dateien: $($results.TotalFiles)" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PHASE 2: TEST AND FIX EACH FILE
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: TEST AND FIX EACH FILE" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$tested = 0
foreach ($file in $htmlFiles) {
    $tested++
    $relativePath = $file.Replace($rootDir, '').TrimStart('\')
    $percent = [math]::Round(($tested / $results.TotalFiles) * 100, 1)
    
    if ($tested % 10 -eq 0) {
        Write-Host "  [$tested/$($results.TotalFiles)] ($percent%)" -ForegroundColor Cyan
    }
    
    try {
        $content = Get-Content $file -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        
        if (-not $content) {
            $results.WhitePages += $relativePath
            continue
        }
        
        $needsFix = $false
        $fixed = $false
        
        # Prüfe auf Console Error Controller
        if ($content -notmatch 'console-error-controller\.js') {
            $results.MissingController += $relativePath
            $needsFix = $true
        }
        
        # Prüfe auf Console Cache System
        if ($content -notmatch 'console-cache-system\.js') {
            $results.MissingCache += $relativePath
            $needsFix = $true
        }
        
        # Fix: Füge fehlende Scripts hinzu
        if ($needsFix) {
            $depth = ($relativePath -split '\\').Count - 1
            $controllerPath = if ($depth -gt 0) { '../' * $depth + 'js/console-error-controller.js' } else { 'js/console-error-controller.js' }
            $cachePath = if ($depth -gt 0) { '../' * $depth + 'js/console-cache-system.js' } else { 'js/console-cache-system.js' }
            
            $scriptsToAdd = ""
            if ($content -notmatch 'console-error-controller\.js') {
                $scriptsToAdd += "`n    <script src=`"$controllerPath`"></script>"
            }
            if ($content -notmatch 'console-cache-system\.js') {
                $scriptsToAdd += "`n    <script src=`"$cachePath`"></script>"
            }
            
            if ($scriptsToAdd) {
                # Finde beste Einfügeposition
                $insertPosition = $null
                if ($content -match '(?s)(<script[^>]*src=["'']?[^"'']*error-fix-system\.js[^"'']*["'']?[^>]*></script>)') {
                    $insertPosition = $content.IndexOf($matches[0]) + $matches[0].Length
                } elseif ($content -match '(?s)(</head>)') {
                    $insertPosition = $content.IndexOf($matches[0])
                } elseif ($content -match '(?s)(</body>)') {
                    $insertPosition = $content.IndexOf($matches[0])
                }
                
                if ($insertPosition -ne $null) {
                    $newContent = $content.Insert($insertPosition, $scriptsToAdd + "`n")
                    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                    [System.IO.File]::WriteAllText($file, $newContent, $utf8NoBom)
                    $results.Fixed++
                    $fixed = $true
                }
            }
        }
        
        # Prüfe auf leere Seiten
        $bodyMatch = $content -match '<body[^>]*>([\s\S]*?)</body>'
        if ($bodyMatch) {
            $textContent = ($matches[1] -replace '<[^>]+>', '').Trim()
            if ($textContent.Length -lt 50) {
                $results.EmptyPages += $relativePath
            } else {
                $results.OK++
            }
        } else {
            $results.EmptyPages += $relativePath
        }
        
    } catch {
        $results.Errors += @{
            File = $relativePath
            Error = $_.Exception.Message
        }
    }
}

Write-Host ""
Write-Host "  ✅ Getestet: $tested Dateien" -ForegroundColor Green
Write-Host "  ✅ Gefixt: $($results.Fixed) Dateien" -ForegroundColor Green
Write-Host ""

# ============================================
# PHASE 3: GENERATE REPORT
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PHASE 3: GENERATE REPORT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$report = @"
# FABRIKAGE COMPLETE SYSTEM TEST AND FIX REPORT

**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status:** Kompletter System-Test und Fix
**Modus:** AUTOMATISCH - OHNE BESTÄTIGUNGEN

---

## 📊 ZUSAMMENFASSUNG

- **Gesamt getestet:** $($results.TotalFiles)
- **✅ OK:** $($results.OK)
- **✅ Gefixt:** $($results.Fixed)
- **❌ Weiße Seiten:** $($results.WhitePages.Count)
- **❌ Leere Seiten:** $($results.EmptyPages.Count)
- **⚠️ Ohne Console Controller:** $($results.MissingController.Count)
- **⚠️ Ohne Cache System:** $($results.MissingCache.Count)
- **❌ Fehler:** $($results.Errors.Count)

---

## ✅ GEFIXTE DATEIEN

$($results.Fixed) Dateien wurden automatisch mit Console Error Controller und Cache System ausgestattet.

---

## ❌ WEIßE SEITEN

$($results.WhitePages | ForEach-Object { "- **$_**" } | Out-String)

---

## ❌ LEERE SEITEN

$($results.EmptyPages | ForEach-Object { "- **$_**" } | Out-String)

---

## ⚠️ OHNE CONSOLE CONTROLLER

$($results.MissingController | ForEach-Object { "- **$_**" } | Out-String)

---

## ⚠️ OHNE CACHE SYSTEM

$($results.MissingCache | ForEach-Object { "- **$_**" } | Out-String)

---

## ❌ FEHLER

$($results.Errors | ForEach-Object { "- **$($_.File)**: $($_.Error)" } | Out-String)

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture
**VERSION:** 3.0.0
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Erstellt automatisch: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ FABRIKAGE COMPLETE SYSTEM TEST AND FIX - ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "  ✅ OK: $($results.OK) / $($results.TotalFiles)" -ForegroundColor Green
Write-Host "  ✅ Gefixt: $($results.Fixed)" -ForegroundColor Green
Write-Host "  ❌ Weiße Seiten: $($results.WhitePages.Count)" -ForegroundColor $(if ($results.WhitePages.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  ❌ Leere Seiten: $($results.EmptyPages.Count)" -ForegroundColor $(if ($results.EmptyPages.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "📄 Report gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host ""

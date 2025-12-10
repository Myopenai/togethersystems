# FABRIKAGE COMPLETE WEBSITE TEST
# Prüft ALLE Webseiten auf Fehler
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$ConfirmPreference = "None"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE COMPLETE WEBSITE TEST" -ForegroundColor Cyan
Write-Host "  PRÜFT ALLE WEBSEITEN AUF FEHLER" -ForegroundColor Yellow
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $rootDir "FABRIKAGE-WEBSITE-TEST-REPORT-$timestamp.md"

$results = @{
    TotalPages = 0
    WorkingPages = 0
    WhitePages = 0
    NoContentPages = 0
    ErrorPages = 0
    BrokenLinks = 0
    MissingScripts = 0
    Details = @()
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
    }

$results.TotalPages = $htmlFiles.Count
Write-Host "  📊 Gefundene HTML-Dateien: $($results.TotalPages)" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PHASE 2: TEST EACH PAGE
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: TEST EACH PAGE" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$baseUrl = "http://localhost:5173"
$tested = 0

foreach ($file in $htmlFiles) {
    $tested++
    $relativePath = $file.FullName.Replace($rootDir, '').TrimStart('\').Replace('\', '/')
    $url = "$baseUrl/$relativePath"
    
    Write-Host "  [$tested/$($results.TotalPages)] Teste: $relativePath" -ForegroundColor Cyan
    
    $pageResult = @{
        File = $relativePath
        URL = $url
        Status = "unknown"
        Issues = @()
    }
    
    try {
        # Test 1: HTTP Request
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            
            # Test 2: Prüfe ob Seite weiß bleibt (kein Inhalt)
            $bodyMatch = $content -match '<body[^>]*>(.*?)</body>'
            if ($bodyMatch) {
                $bodyContent = $matches[1]
                $textContent = $bodyContent -replace '<[^>]+>', '' | ForEach-Object { $_.Trim() }
                
                if ($textContent.Length -lt 10) {
                    $pageResult.Status = "WHITE_PAGE"
                    $pageResult.Issues += "Seite ist weiß - kein Inhalt geladen"
                    $results.WhitePages++
                    Write-Host "    ❌ WEIßE SEITE" -ForegroundColor Red
                } elseif ($bodyContent -match '<script|<div|<p|<h1|<h2|<h3|<h4|<h5|<h6|<section|<article|<main') {
                    # Hat HTML-Elemente
                    $pageResult.Status = "OK"
                    $results.WorkingPages++
                    Write-Host "    ✅ OK" -ForegroundColor Green
                } else {
                    $pageResult.Status = "NO_CONTENT"
                    $pageResult.Issues += "Seite hat keinen Inhalt"
                    $results.NoContentPages++
                    Write-Host "    ⚠️ KEIN INHALT" -ForegroundColor Yellow
                }
            } else {
                $pageResult.Status = "NO_BODY"
                $pageResult.Issues += "Kein <body> Tag gefunden"
                $results.NoContentPages++
                Write-Host "    ⚠️ KEIN BODY" -ForegroundColor Yellow
            }
            
            # Test 3: Prüfe auf Console Error Controller
            if ($content -notmatch 'console-error-controller\.js') {
                $pageResult.Issues += "Fehlendes Script: console-error-controller.js"
                $results.MissingScripts++
            }
            
            # Test 4: Prüfe auf Console Cache System
            if ($content -notmatch 'console-cache-system\.js') {
                $pageResult.Issues += "Fehlendes Script: console-cache-system.js"
                $results.MissingScripts++
            }
            
            # Test 5: Prüfe auf broken links (relativ)
            $linkMatches = [regex]::Matches($content, 'href=["'']([^"'']+)["'']')
            foreach ($match in $linkMatches) {
                $href = $match.Groups[1].Value
                if ($href -notmatch '^(http|#|mailto:|javascript:)') {
                    # Relativer Link - prüfe ob existiert
                    $linkPath = Join-Path (Split-Path $file.FullName) $href
                    if (-not (Test-Path $linkPath)) {
                        $pageResult.Issues += "Broken Link: $href"
                        $results.BrokenLinks++
                    }
                }
            }
            
        } else {
            $pageResult.Status = "HTTP_ERROR"
            $pageResult.Issues += "HTTP $($response.StatusCode)"
            $results.ErrorPages++
            Write-Host "    ❌ HTTP $($response.StatusCode)" -ForegroundColor Red
        }
        
    } catch {
        $pageResult.Status = "ERROR"
        $pageResult.Issues += "Fehler: $($_.Exception.Message)"
        $results.ErrorPages++
        Write-Host "    ❌ FEHLER: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($pageResult.Issues.Count -gt 0) {
        $results.Details += $pageResult
    }
}

Write-Host ""

# ============================================
# PHASE 3: FIX MISSING SCRIPTS
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: FIX MISSING SCRIPTS" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$fixed = 0
foreach ($detail in $results.Details) {
    if ($detail.Issues -match 'console-cache-system\.js') {
        $filePath = Join-Path $rootDir $detail.File.Replace('/', '\')
        if (Test-Path $filePath) {
            try {
                $content = Get-Content $filePath -Raw -Encoding UTF8
                if ($content -notmatch 'console-cache-system\.js') {
                    # Füge Script hinzu
                    if ($content -match '</body>') {
                        $newContent = $content -replace '(</body>)', "  <script src=`"js/console-cache-system.js`"></script>`n`$1"
                        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                        [System.IO.File]::WriteAllText($filePath, $newContent, $utf8NoBom)
                        $fixed++
                        Write-Host "  ✅ Fix: $($detail.File)" -ForegroundColor Green
                    }
                }
            } catch {
                Write-Host "  ❌ Fehler beim Fix: $($detail.File)" -ForegroundColor Red
            }
        }
    }
}

Write-Host "  📊 Scripts hinzugefügt: $fixed" -ForegroundColor Cyan
Write-Host ""

# ============================================
# REPORT GENERIEREN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  REPORT GENERIEREN" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$report = @"
# FABRIKAGE COMPLETE WEBSITE TEST - REPORT

**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status:** Komplette Website-Prüfung
**Modus:** AUTOMATISCH

---

## 📊 ZUSAMMENFASSUNG

- **Gesamt Seiten:** $($results.TotalPages)
- **✅ Funktionierende Seiten:** $($results.WorkingPages)
- **❌ Weiße Seiten:** $($results.WhitePages)
- **⚠️ Kein Inhalt:** $($results.NoContentPages)
- **❌ Fehler-Seiten:** $($results.ErrorPages)
- **🔗 Broken Links:** $($results.BrokenLinks)
- **📜 Fehlende Scripts:** $($results.MissingScripts)

---

## ❌ PROBLEME

$($results.Details | ForEach-Object {
    "- **$($_.File)**: $($_.Status) - $($_.Issues -join ', ')"
} | Out-String)

---

## ✅ FIXES

- **Scripts hinzugefügt:** $fixed

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture
**VERSION:** 3.0.0
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Erstellt automatisch: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ FABRIKAGE COMPLETE WEBSITE TEST - ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "  ✅ Funktionierende Seiten: $($results.WorkingPages) / $($results.TotalPages)" -ForegroundColor Green
Write-Host "  ❌ Weiße Seiten: $($results.WhitePages)" -ForegroundColor $(if ($results.WhitePages -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️ Kein Inhalt: $($results.NoContentPages)" -ForegroundColor $(if ($results.NoContentPages -eq 0) { "Green" } else { "Yellow" })
Write-Host "  ❌ Fehler-Seiten: $($results.ErrorPages)" -ForegroundColor $(if ($results.ErrorPages -eq 0) { "Green" } else { "Red" })
Write-Host "  🔗 Broken Links: $($results.BrokenLinks)" -ForegroundColor $(if ($results.BrokenLinks -eq 0) { "Green" } else { "Yellow" })
Write-Host "  📜 Fehlende Scripts: $($results.MissingScripts)" -ForegroundColor $(if ($results.MissingScripts -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "📄 Report gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host ""

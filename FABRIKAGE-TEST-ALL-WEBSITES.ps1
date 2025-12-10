# FABRIKAGE TEST ALL WEBSITES
# Testet alle Webseiten automatisch auf Fehler
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$ConfirmPreference = "None"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE TEST ALL WEBSITES" -ForegroundColor Cyan
Write-Host "  Testet alle Webseiten auf Fehler" -ForegroundColor Yellow
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $rootDir "FABRIKAGE-WEBSITE-TEST-REPORT-$timestamp.md"

$results = @{
    Total = 0
    OK = 0
    WhitePages = @()
    EmptyPages = @()
    ErrorPages = @()
    NotFoundPages = @()
    LoadingIssues = @()
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

$results.Total = $htmlFiles.Count
Write-Host "  📊 Gefundene HTML-Dateien: $($results.Total)" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PHASE 2: TEST EACH FILE
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: TEST EACH FILE" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$tested = 0
foreach ($file in $htmlFiles) {
    $tested++
    $relativePath = $file.Replace($rootDir, '').TrimStart('\')
    $percent = [math]::Round(($tested / $results.Total) * 100, 1)
    
    Write-Host "  [$tested/$($results.Total)] ($percent %) Teste: $relativePath" -ForegroundColor Cyan
    
    try {
        # Lese Datei-Inhalt
        $content = Get-Content $file -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        
        if (-not $content) {
            $results.NotFoundPages += @{
                File = $relativePath
                Issue = "Datei leer oder nicht lesbar"
            }
            Write-Host "    ❌ Datei leer" -ForegroundColor Red
            continue
        }
        
        # Prüfe auf Probleme
        $issues = @()
        
        # Prüfe ob Seite weiß ist (nur weißer Hintergrund, kein Inhalt)
        if ($content -match '<body[^>]*style[^>]*background[^>]*white|background:\s*white|background:\s*#fff|background:\s*#ffffff') {
            $bodyText = if ($content -match '<body[^>]*>([\s\S]*?)</body>') { $matches[1] } else { "" }
            $textLength = ($bodyText -replace '<[^>]+>', '').Trim().Length
            if ($textLength -lt 50) {
                $issues += "Weißer Hintergrund ohne Inhalt"
                $results.WhitePages += @{
                    File = $relativePath
                    Issue = "Weißer Hintergrund ohne Inhalt"
                }
            }
        }
        
        # Prüfe ob Seite leer ist (öffnet aber keinen Inhalt hat)
        $bodyMatch = $content -match '<body[^>]*>([\s\S]*?)</body>'
        if ($bodyMatch) {
            $bodyContent = $matches[1]
            $textContent = ($bodyContent -replace '<[^>]+>', '').Trim()
            $visibleElements = ($bodyContent -split '<').Count - 1
            
            if ($textContent.Length -lt 50 -and $visibleElements -lt 5) {
                $issues += "Seite öffnet aber hat keinen Inhalt"
                $results.EmptyPages += @{
                    File = $relativePath
                    Issue = "Seite öffnet aber hat keinen Inhalt"
                    TextLength = $textContent.Length
                    Elements = $visibleElements
                }
            }
        } else {
            $bodyTagIssue = "Kein body Tag gefunden"
            $issues += $bodyTagIssue
            $results.EmptyPages += @{
                File = $relativePath
                Issue = $bodyTagIssue
            }
        }
        
        # Prüfe auf Console-Fehler-Patterns
        $errorPatterns = @(
            'SyntaxError',
            'ReferenceError',
            'TypeError',
            '404',
            'CORS',
            'Failed to load',
            'Unexpected token'
        )
        
        $foundErrors = @()
        foreach ($pattern in $errorPatterns) {
            if ($content -match $pattern) {
                $foundErrors += $pattern
            }
        }
        
        if ($foundErrors.Count -gt 0) {
            $results.ErrorPages += @{
                File = $relativePath
                Issue = "Potenzielle Fehler-Patterns gefunden: $($foundErrors -join ', ')"
                Patterns = $foundErrors
            }
        }
        
        # Prüfe auf fehlende Scripts
        $requiredScripts = @(
            'console-error-controller\.js',
            'console-cache-system\.js'
        )
        
        $missingScripts = @()
        foreach ($script in $requiredScripts) {
            if ($content -notmatch $script) {
                $missingScripts += $script
            }
        }
        
        if ($missingScripts.Count -gt 0) {
            $results.ErrorPages += @{
                File = $relativePath
                Issue = "Fehlende Scripts: $($missingScripts -join ', ')"
                MissingScripts = $missingScripts
            }
        }
        
        # Prüfe auf Loading-Issues
        if ($content -match 'onload|DOMContentLoaded|window\.addEventListener.*load') {
            # Hat Loading-Handler - OK
        } else {
            # Kein Loading-Handler - könnte Problem sein
            if ($content -match '<script') {
                $results.LoadingIssues += @{
                    File = $relativePath
                    Issue = "Kein Loading-Handler gefunden"
                }
            }
        }
        
        if ($issues.Count -eq 0 -and $foundErrors.Count -eq 0 -and $missingScripts.Count -eq 0) {
            $results.OK++
            Write-Host "    ✅ OK" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️ Probleme gefunden: $($issues.Count)" -ForegroundColor Yellow
        }
        
    } catch {
        $results.ErrorPages += @{
            File = $relativePath
            Issue = "Fehler beim Testen: $($_.Exception.Message)"
        }
        Write-Host "    ❌ Fehler: $_" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# PHASE 3: GENERATE REPORT
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PHASE 3: GENERATE REPORT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$report = @"
# FABRIKAGE WEBSITE TEST REPORT

**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status:** Automatischer Test aller Webseiten
**Modus:** AUTOMATISCH - OHNE BESTÄTIGUNGEN

---

## ZUSAMMENFASSUNG

- Gesamt getestet: $($results.Total)
- OK: $($results.OK)
- Weisse Seiten: $($results.WhitePages.Count)
- Leere Seiten: $($results.EmptyPages.Count)
- Fehler-Seiten: $($results.ErrorPages.Count)
- **❌ Nicht gefunden:** $($results.NotFoundPages.Count)
- **⚠️ Loading-Issues:** $($results.LoadingIssues.Count)

---

## WEISSE SEITEN

$($results.WhitePages | ForEach-Object { "- $($_.File): $($_.Issue)" } | Out-String)

---

## LEERE SEITEN

$($results.EmptyPages | ForEach-Object { "- $($_.File): $($_.Issue)" } | Out-String)

---

## FEHLER-SEITEN

$($results.ErrorPages | ForEach-Object { "- $($_.File): $($_.Issue)" } | Out-String)

---

## NICHT GEFUNDEN

$($results.NotFoundPages | ForEach-Object { "- $($_.File): $($_.Issue)" } | Out-String)

---

## LOADING-ISSUES

$($results.LoadingIssues | ForEach-Object { "- $($_.File): $($_.Issue)" } | Out-String)

---

## ✅ OK SEITEN

$($results.OK) Seiten funktionieren korrekt.

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture
**VERSION:** 3.0.0
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Erstellt automatisch: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ FABRIKAGE TEST ALL WEBSITES - ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "  ✅ OK: $($results.OK) / $($results.Total)" -ForegroundColor Green
Write-Host "  ❌ Weiße Seiten: $($results.WhitePages.Count)" -ForegroundColor $(if ($results.WhitePages.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  ❌ Leere Seiten: $($results.EmptyPages.Count)" -ForegroundColor $(if ($results.EmptyPages.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  ❌ Fehler-Seiten: $($results.ErrorPages.Count)" -ForegroundColor $(if ($results.ErrorPages.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️ Loading-Issues: $($results.LoadingIssues.Count)" -ForegroundColor $(if ($results.LoadingIssues.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "📄 Report gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host ""



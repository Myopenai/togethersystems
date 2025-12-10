# FABRIKAGE COMPLETE WEBSITE TEST SYSTEM
# Testet ALLE Webseiten automatisch auf:
# - Weiße Seiten (kein Inhalt)
# - Seiten die nicht angezeigt werden
# - Fehlende Inhalte
# - Browser bleibt weiß
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$ConfirmPreference = "None"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE COMPLETE WEBSITE TEST SYSTEM" -ForegroundColor Cyan
Write-Host "  Testet ALLE Webseiten automatisch" -ForegroundColor Yellow
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
    EmptyPages = 0
    ErrorPages = 0
    MissingContent = 0
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

foreach ($file in $htmlFiles) {
    try {
        $relativePath = $file.FullName.Replace($rootDir, '').TrimStart('\')
        Write-Host "  🔍 Teste: $relativePath" -ForegroundColor Gray
        
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) {
            $results.ErrorPages++
            $results.Details += @{
                File = $relativePath
                Status = "ERROR"
                Issue = "Datei kann nicht gelesen werden"
            }
            Write-Host "    ❌ Fehler: Datei kann nicht gelesen werden" -ForegroundColor Red
            continue
        }
        
        # Prüfe auf weiße Seite (minimaler Inhalt)
        $textContent = $content -replace '<[^>]+>', '' -replace '\s+', ' '
        $textLength = $textContent.Trim().Length
        
        # Prüfe auf Body-Tag
        $hasBody = $content -match '<body[^>]*>'
        
        # Prüfe auf sichtbaren Inhalt
        $hasVisibleContent = $content -match '<(h[1-6]|p|div|span|article|section|main|header|footer|nav|button|a|img|canvas|svg)[^>]*>'
        
        # Prüfe auf Script-Tags (könnte dynamisch laden)
        $hasScripts = $content -match '<script[^>]*>'
        
        # Prüfe auf Console Error Controller
        $hasConsoleController = $content -match 'console-error-controller\.js'
        
        # Status bestimmen
        $status = "OK"
        $issues = @()
        
        if ($textLength -lt 50 -and -not $hasScripts) {
            $status = "WHITE_PAGE"
            $results.WhitePages++
            $issues += "Seite hat weniger als 50 Zeichen Text und keine Scripts"
        }
        
        if (-not $hasBody) {
            $status = "NO_BODY"
            $results.EmptyPages++
            $issues += "Kein Body-Tag gefunden"
        }
        
        if (-not $hasVisibleContent -and -not $hasScripts) {
            $status = "NO_CONTENT"
            $results.MissingContent++
            $issues += "Keine sichtbaren HTML-Elemente gefunden"
        }
        
        if (-not $hasConsoleController) {
            $issues += "Console Error Controller fehlt"
        }
        
        if ($status -eq "OK") {
            $results.WorkingPages++
            Write-Host "    ✅ OK" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️ $status" -ForegroundColor Yellow
            foreach ($issue in $issues) {
                Write-Host "      - $issue" -ForegroundColor Gray
            }
        }
        
        $results.Details += @{
            File = $relativePath
            Status = $status
            Issues = $issues
            TextLength = $textLength
            HasBody = $hasBody
            HasVisibleContent = $hasVisibleContent
            HasScripts = $hasScripts
            HasConsoleController = $hasConsoleController
        }
        
    } catch {
        $results.ErrorPages++
        $results.Details += @{
            File = $relativePath
            Status = "ERROR"
            Issue = $_.Exception.Message
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
# FABRIKAGE COMPLETE WEBSITE TEST REPORT

**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status:** Automatischer Test aller Webseiten
**Modus:** AUTOMATISCH - OHNE BESTÄTIGUNGEN

---

## 📊 ZUSAMMENFASSUNG

- **Gesamt Seiten:** $($results.TotalPages)
- **✅ Funktionierende Seiten:** $($results.WorkingPages)
- **⚠️ Weiße Seiten:** $($results.WhitePages)
- **⚠️ Leere Seiten:** $($results.EmptyPages)
- **⚠️ Fehlende Inhalte:** $($results.MissingContent)
- **❌ Fehler:** $($results.ErrorPages)

**Abdeckung:** $([math]::Round(($results.WorkingPages/$results.TotalPages)*100, 1))%

---

## ⚠️ PROBLEME

### Weiße Seiten ($($results.WhitePages)):
$($results.Details | Where-Object { $_.Status -eq "WHITE_PAGE" } | ForEach-Object { "- **$($_.File)**: $($_.Issues -join ', ')" } | Out-String)

### Leere Seiten ($($results.EmptyPages)):
$($results.Details | Where-Object { $_.Status -eq "NO_BODY" } | ForEach-Object { "- **$($_.File)**: $($_.Issues -join ', ')" } | Out-String)

### Fehlende Inhalte ($($results.MissingContent)):
$($results.Details | Where-Object { $_.Status -eq "NO_CONTENT" } | ForEach-Object { "- **$($_.File)**: $($_.Issues -join ', ')" } | Out-String)

### Fehler ($($results.ErrorPages)):
$($results.Details | Where-Object { $_.Status -eq "ERROR" } | ForEach-Object { "- **$($_.File)**: $($_.Issue)" } | Out-String)

---

## ✅ FUNKTIONIERENDE SEITEN

$($results.Details | Where-Object { $_.Status -eq "OK" } | ForEach-Object { "- ✅ $($_.File)" } | Out-String)

---

## 📋 ALLE DETAILS

$($results.Details | ForEach-Object { 
    $detail = "### $($_.File)`n"
    $detail += "- Status: $($_.Status)`n"
    if ($_.Issues) {
        $detail += "- Probleme: $($_.Issues -join ', ')`n"
    }
    $detail += "- Text-Länge: $($_.TextLength) Zeichen`n"
    $detail += "- Body-Tag: $(if ($_.HasBody) { '✅' } else { '❌' })`n"
    $detail += "- Sichtbarer Inhalt: $(if ($_.HasVisibleContent) { '✅' } else { '❌' })`n"
    $detail += "- Scripts: $(if ($_.HasScripts) { '✅' } else { '❌' })`n"
    $detail += "- Console Controller: $(if ($_.HasConsoleController) { '✅' } else { '❌' })`n"
    $detail
} | Out-String)

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
Write-Host "  ⚠️ Weiße Seiten: $($results.WhitePages)" -ForegroundColor $(if ($results.WhitePages -eq 0) { "Green" } else { "Yellow" })
Write-Host "  ⚠️ Leere Seiten: $($results.EmptyPages)" -ForegroundColor $(if ($results.EmptyPages -eq 0) { "Green" } else { "Yellow" })
Write-Host "  ⚠️ Fehlende Inhalte: $($results.MissingContent)" -ForegroundColor $(if ($results.MissingContent -eq 0) { "Green" } else { "Yellow" })
Write-Host "  ❌ Fehler: $($results.ErrorPages)" -ForegroundColor $(if ($results.ErrorPages -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "📄 Report gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host ""

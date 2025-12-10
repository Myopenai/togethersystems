# FABRIKAGE MASTER COMPLETE ALL
# Master-Script: Standards prüfen, Fehler fixen, testen, deployen
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE MASTER COMPLETE ALL" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  Komplette Fabrikage-TÜV-Prüfung" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# ============================================
# PHASE 1: STANDARDS PRÜFEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: STANDARDS PRÜFEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

& "$rootDir\FABRIKAGE-ULTIMATE-COMPLETE-TEST-FIX-DEPLOY.ps1" -Phase Standards

# ============================================
# PHASE 2: FEHLER FINDEN & FIXEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: FEHLER FINDEN & FIXEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Console Error Controller zu allen HTML-Dateien hinzufügen
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|backup|Fixpatch" 
}

$controllerAdded = 0
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Prüfe ob error-fix-system.js vorhanden aber console-error-controller.js fehlt
        if ($content -match "error-fix-system\.js" -and $content -notmatch "console-error-controller\.js") {
            # Füge console-error-controller.js nach error-fix-system.js hinzu
            $newContent = $content -replace "(<script[^>]*error-fix-system\.js[^>]*>)", "`$1`n  <script src=`"js/console-error-controller.js`"></script>"
            Set-Content -Path $file.FullName -Value $newContent -NoNewline -Encoding UTF8
            Write-Host "  ✅ Console Error Controller hinzugefügt: $($file.Name)" -ForegroundColor Green
            $controllerAdded++
        }
    }
}

Write-Host ""
Write-Host "  Console Error Controller hinzugefügt zu: $controllerAdded Dateien" -ForegroundColor Green

# ============================================
# PHASE 3: TESTEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: TESTEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

& "$rootDir\FABRIKAGE-COMPLETE-TEST-ALL-SYSTEMS.ps1"

# ============================================
# PHASE 4: DEPLOY VORBEREITUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 4: DEPLOY VORBEREITUNG" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

& "$rootDir\FABRIKAGE-DEPLOY-ALL-REPOS.ps1"

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  MASTER ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Standards geprüft" -ForegroundColor Green
Write-Host "✅ Fehler gefixt: $controllerAdded Dateien aktualisiert" -ForegroundColor Green
Write-Host "✅ Tests durchgeführt" -ForegroundColor Green
Write-Host "✅ Deploy vorbereitet" -ForegroundColor Green
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 ALLE AUFGABEN ABGESCHLOSSEN!" -ForegroundColor Green




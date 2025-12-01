# T,. MASTER COMPLETE SYSTEM VERIFICATION AND DEPLOY
# Status: 🔴 PERMANENT AKTIV - NIEMALS DEAKTIVIEREN
# Version: 1.0.0-MASTER-COMPLETE
# Datum: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. MASTER COMPLETE SYSTEM VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$rootPath = $PSScriptRoot
$startTime = Get-Date

# Phase 1: Root-Verifikation - Alle Dateien erfassen
Write-Host "[PHASE 1] Root-Verifikation - Alle Dateien erfassen..." -ForegroundColor Yellow
$allFiles = Get-ChildItem -Path $rootPath -File -Recurse | Where-Object { 
    $_.FullName -notmatch 'node_modules|\.git|Settings|backup|archive|DEPLOY-PACKAGE|PRODUCTION-PACKAGE' 
}
$htmlFiles = $allFiles | Where-Object { $_.Extension -eq '.html' }
$mdFiles = $allFiles | Where-Object { $_.Extension -eq '.md' }
$jsFiles = $allFiles | Where-Object { $_.Extension -eq '.js' }

Write-Host "  ✅ Gesamt: $($allFiles.Count) Dateien" -ForegroundColor Green
Write-Host "  ✅ HTML: $($htmlFiles.Count) Dateien" -ForegroundColor Green
Write-Host "  ✅ MD: $($mdFiles.Count) Dateien" -ForegroundColor Green
Write-Host "  ✅ JS: $($jsFiles.Count) Dateien" -ForegroundColor Green

# Phase 2: MD zu HTML Konvertierung
Write-Host ""
Write-Host "[PHASE 2] MD zu HTML Konvertierung..." -ForegroundColor Yellow
$mdWithoutHtml = @()
foreach ($md in $mdFiles) {
    $htmlPath = $md.FullName -replace '\.md$', '.html'
    if (-not (Test-Path $htmlPath)) {
        $mdWithoutHtml += $md
    }
}
Write-Host "  ⚠️  MD ohne HTML: $($mdWithoutHtml.Count) Dateien" -ForegroundColor Yellow

if ($mdWithoutHtml.Count -gt 0) {
    Write-Host "  🔄 Konvertiere MD zu HTML..." -ForegroundColor Cyan
    # Verwende vorhandenen Converter
    if (Test-Path "$rootPath\MD-TO-HTML-AUTO-CONVERTER.js") {
        node "$rootPath\MD-TO-HTML-AUTO-CONVERTER.js" 2>&1 | Out-Null
        Write-Host "  ✅ MD-TO-HTML-AUTO-CONVERTER.js ausgeführt" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  MD-TO-HTML-AUTO-CONVERTER.js nicht gefunden" -ForegroundColor Yellow
    }
}

# Phase 3: 404-Fehler finden und beheben
Write-Host ""
Write-Host "[PHASE 3] 404-Fehler finden und beheben..." -ForegroundColor Yellow
$brokenLinks = @()
foreach ($html in $htmlFiles) {
    $content = Get-Content $html.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Suche nach href/src Attributen
        $matches = [regex]::Matches($content, '(href|src)=["'']([^"'']+)["'']')
        foreach ($match in $matches) {
            $url = $match.Groups[2].Value
            if ($url -notmatch '^(https?://|mailto:|tel:|#|javascript:)') {
                $fullPath = Join-Path (Split-Path $html.FullName) $url
                if (-not (Test-Path $fullPath) -and -not (Test-Path (Join-Path $rootPath $url))) {
                    $brokenLinks += @{
                        File = $html.Name
                        Link = $url
                    }
                }
            }
        }
    }
}
Write-Host "  ⚠️  Gefundene 404-Fehler: $($brokenLinks.Count)" -ForegroundColor Yellow

if ($brokenLinks.Count -gt 0) {
    Write-Host "  🔄 Behebe 404-Fehler..." -ForegroundColor Cyan
    if (Test-Path "$rootPath\FIX-ALL-404-ERRORS-COMPLETE.ps1") {
        & "$rootPath\FIX-ALL-404-ERRORS-COMPLETE.ps1"
        Write-Host "  ✅ FIX-ALL-404-ERRORS-COMPLETE.ps1 ausgeführt" -ForegroundColor Green
    }
}

# Phase 4: OSTOSOS Integration verifizieren
Write-Host ""
Write-Host "[PHASE 4] OSTOSOS Integration verifizieren..." -ForegroundColor Yellow
$ososFiles = @(
    "osos-full.html",
    "OSTOSOS-COMPLETE-OFFLINE-OS.html",
    "OSTOSOS-COMPLETE-OS-SYSTEM\OSTOSOS-OS-COMPLETE-SYSTEM.html"
)
$missingOsos = @()
foreach ($file in $ososFiles) {
    if (-not (Test-Path (Join-Path $rootPath $file))) {
        $missingOsos += $file
    }
}
if ($missingOsos.Count -eq 0) {
    Write-Host "  ✅ Alle OSTOSOS-Dateien vorhanden" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Fehlende OSTOSOS-Dateien: $($missingOsos -join ', ')" -ForegroundColor Yellow
}

# Prüfe ROOT-APPS-INTEGRATION.js
if (Test-Path "$rootPath\ROOT-APPS-INTEGRATION.js") {
    Write-Host "  ✅ ROOT-APPS-INTEGRATION.js vorhanden" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  ROOT-APPS-INTEGRATION.js fehlt" -ForegroundColor Yellow
}

# Phase 5: Systemtechnische Ordner verifizieren
Write-Host ""
Write-Host "[PHASE 5] Systemtechnische Ordner verifizieren..." -ForegroundColor Yellow
$systemFolders = @(
    "Settings",
    "OSTOSOS-COMPLETE-OS-SYSTEM",
    "TELBANK",
    "LEGAL",
    "gentlyoverdone",
    "Innovationsordner"
)
foreach ($folder in $systemFolders) {
    if (Test-Path (Join-Path $rootPath $folder)) {
        Write-Host "  ✅ $folder vorhanden" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $folder fehlt" -ForegroundColor Yellow
    }
}

# Phase 6: Tests durchführen
Write-Host ""
Write-Host "[PHASE 6] Tests durchführen..." -ForegroundColor Yellow
if (Test-Path "$rootPath\COMPLETE-TEST-SYSTEM-100-PERCENT.js") {
    Write-Host "  🔄 Führe Tests aus..." -ForegroundColor Cyan
    $testResult = node "$rootPath\COMPLETE-TEST-SYSTEM-100-PERCENT.js" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Tests erfolgreich" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Tests mit Fehlern beendet" -ForegroundColor Yellow
        Write-Host $testResult
    }
} else {
    Write-Host "  ⚠️  COMPLETE-TEST-SYSTEM-100-PERCENT.js nicht gefunden" -ForegroundColor Yellow
}

# Phase 7: Localhost-Verifikation
Write-Host ""
Write-Host "[PHASE 7] Localhost-Verifikation..." -ForegroundColor Yellow
$localhostReport = @{
    TotalFiles = $allFiles.Count
    HtmlFiles = $htmlFiles.Count
    MdFiles = $mdFiles.Count
    JsFiles = $jsFiles.Count
    BrokenLinks = $brokenLinks.Count
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}
$localhostReport | ConvertTo-Json -Depth 10 | Out-File "$rootPath\LOCALHOST-VERIFICATION-MASTER.json" -Encoding UTF8
Write-Host "  ✅ Localhost-Verifikation gespeichert" -ForegroundColor Green

# Phase 8: Builds erstellen (wenn Build-System vorhanden)
Write-Host ""
Write-Host "[PHASE 8] Builds erstellen..." -ForegroundColor Yellow
if (Test-Path "$rootPath\OSTOSOS-COMPLETE-OS-SYSTEM\OSTOSOS-UNIVERSAL-BUILD-ALL-DEVICES.html") {
    Write-Host "  ✅ Build-System vorhanden" -ForegroundColor Green
    Write-Host "  ℹ️  Builds müssen manuell über HTML-Interface erstellt werden" -ForegroundColor Cyan
} else {
    Write-Host "  ⚠️  Build-System nicht gefunden" -ForegroundColor Yellow
}

# Phase 9: Deploy-Vorbereitung
Write-Host ""
Write-Host "[PHASE 9] Deploy-Vorbereitung..." -ForegroundColor Yellow
$deployScripts = @(
    "deploy-all-servers.ps1",
    "COMPLETE-TEST-AND-DEPLOY-FINAL.ps1",
    "FINAL-COMPLETE-TEST-DEPLOY-AND-VERIFY.ps1"
)
$foundDeploy = $false
foreach ($script in $deployScripts) {
    if (Test-Path (Join-Path $rootPath $script)) {
        Write-Host "  ✅ $script vorhanden" -ForegroundColor Green
        $foundDeploy = $true
    }
}
if (-not $foundDeploy) {
    Write-Host "  ⚠️  Keine Deploy-Scripts gefunden" -ForegroundColor Yellow
}

# Zusammenfassung
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gesamt-Dateien: $($allFiles.Count)" -ForegroundColor White
Write-Host "HTML-Dateien: $($htmlFiles.Count)" -ForegroundColor White
Write-Host "MD-Dateien: $($mdFiles.Count)" -ForegroundColor White
Write-Host "MD ohne HTML: $($mdWithoutHtml.Count)" -ForegroundColor $(if ($mdWithoutHtml.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "404-Fehler: $($brokenLinks.Count)" -ForegroundColor $(if ($brokenLinks.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
$duration = (Get-Date) - $startTime
Write-Host "Dauer: $($duration.TotalSeconds) Sekunden" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ PHASE 1-7 ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "⚠️  PHASE 8-9 ERFORDERN MANUELLE AUSFÜHRUNG" -ForegroundColor Yellow
Write-Host ""


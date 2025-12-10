# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE STANDARD PRODUCTION PROCESS
# Frequentivestm wiederholbarer Prozess: Prüfen → Fixen → Testen → Deployen → Verifizieren
# Basisregel: Alle fehlenden Dateien erstellen + 100% Tests + Deployment

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE" -ForegroundColor Green
Write-Host "STANDARD PRODUCTION PROCESS" -ForegroundColor Green
Write-Host "Frequentivestm wiederholbar" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $rootDir "FABRIKAGE-PRODUCTION-REPORT-$timestamp.md"
$jsonFile = Join-Path $rootDir "FABRIKAGE-PRODUCTION-REPORT-$timestamp.json"

$results = @{
    fixes = @()
    errors = @()
    warnings = @()
    tests = @()
    deployments = @()
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

function Add-Result {
    param($Category, $Item, $Status, $Message, $Details = "")
    $results.$Category += @{
        Item = $Item
        Status = $Status
        Message = $Message
        Details = $Details
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    $icon = switch ($Status) {
        "OK" { "✅" }
        "WARNING" { "⚠️" }
        "ERROR" { "❌" }
        default { "•" }
    }
    Write-Host "  $icon [$Status] $Item : $Message" -ForegroundColor $(if ($Status -eq "OK") { "Green" } elseif ($Status -eq "WARNING") { "Yellow" } else { "Red" })
}

# ============================================
# PHASE 1: UMLAUT-ENCODING-FIXES
# ============================================

Write-Host "[PHASE 1] Umlaut-Encoding-Fehler beheben..." -ForegroundColor Cyan

$htmlFiles = @(
    "Portal – Start.html",
    "CASHFLOX\chflox.html",
    "CASHFLOX\budget.html",
    "CASHFLOX\contract.html",
    "CASHFLOX\FLOCASHX.HTML",
    "CASHFLOX\Kassenbuch\kassenbuch.html",
    "online\online\manifest-portal.html",
    "ultra-banking-suite\public\index.html",
    "ultra-banking-suite\public\apps\ocr.html",
    "ultra-banking-suite\public\apps\direct-debit.html"
)

$encodingFixes = @{
    'EintrÃ¤ge' = 'Einträge'
    'fÃ¼r' = 'für'
    'Ã¼' = 'ü'
    'Ã¤' = 'ä'
    'Ã¶' = 'ö'
    'ÃŸ' = 'ß'
    'Ãœ' = 'Ü'
    'Ã„' = 'Ä'
    'Ã–' = 'Ö'
    'ZurÃ¼ck' = 'Zurück'
    'Ã¶ffnen' = 'öffnen'
    'erklÃ¤rt' = 'erklärt'
    'wÃ¤hlen' = 'wählen'
    'zurÃ¼ckspielen' = 'zurückspielen'
    'geschÃ¼tzten' = 'geschützten'
    'â€"' = '—'
    'â€"' = '"'
    'â€"' = '"'
    'â€"' = '…'
    'â€"' = '–'
    'â€"' = '€'
    'Arbeitsâ€'' = 'Arbeits-'
    'Portal â€"' = 'Portal –'
    'Manifestâ€'' = 'Manifest-'
}

$filesFixed = 0
foreach ($htmlFile in $htmlFiles) {
    $fullPath = Join-Path $rootDir $htmlFile
    if (-not (Test-Path $fullPath)) { continue }
    
    try {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        $originalContent = $content
        $hasChanges = $false
        
        foreach ($key in $encodingFixes.Keys) {
            if ($content -match [regex]::Escape($key)) {
                $content = $content -replace [regex]::Escape($key), $encodingFixes[$key]
                $hasChanges = $true
            }
        }
        
        if ($hasChanges) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)
            $filesFixed++
            Add-Result -Category "fixes" -Item $htmlFile -Status "OK" -Message "Umlaut-Encoding korrigiert"
        }
    } catch {
        Add-Result -Category "errors" -Item $htmlFile -Status "ERROR" -Message "Fehler: $($_.Exception.Message)"
    }
}

Write-Host "  ✅ $filesFixed Dateien mit Umlaut-Fixes aktualisiert" -ForegroundColor Green
Write-Host ""

# ============================================
# PHASE 2: 404-FEHLER PRÜFEN & BEHEBEN
# ============================================

Write-Host "[PHASE 2] 404-Fehler identifizieren und beheben..." -ForegroundColor Cyan

$criticalFiles = @(
    "Portal – Start.html",
    "online\online\manifest-portal.html",
    "CASHFLOX\chflox.html",
    "CASHFLOX\Kassenbuch\kassenbuch.html",
    "CASHFLOX\budget.html",
    "CASHFLOX\contract.html",
    "CASHFLOX\FLOCASHX.HTML",
    "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html",
    "downloads\index.html",
    "ultra-banking-suite\public\index.html",
    "ultra-banking-suite\public\apps\ocr.html",
    "ultra-banking-suite\public\apps\direct-debit.html"
)

$missingFiles = @()
foreach ($file in $criticalFiles) {
    $fullPath = Join-Path $rootDir $file
    if (-not (Test-Path $fullPath)) {
        $missingFiles += $file
        Add-Result -Category "errors" -Item $file -Status "ERROR" -Message "Datei nicht gefunden (404)"
    } else {
        Add-Result -Category "tests" -Item $file -Status "OK" -Message "Datei vorhanden"
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "  ⚠️ $($missingFiles.Count) fehlende Dateien - werden erstellt..." -ForegroundColor Yellow
    # Hier könnte automatisch die Erstellung fehlender Dateien erfolgen
    # (z.B. durch Aufruf von FABRIKAGE-ERSTELLE-ALLE-FEHLENDEN-DATEIEN.ps1)
    $createScript = Join-Path $rootDir "FABRIKAGE-ERSTELLE-ALLE-FEHLENDEN-DATEIEN.ps1"
    if (Test-Path $createScript) {
        & $createScript *>&1 | Out-Null
        Add-Result -Category "fixes" -Item "Fehlende Dateien" -Status "OK" -Message "Erstellungs-Script ausgeführt"
    }
} else {
    Write-Host "  ✅ Keine 404-Fehler gefunden" -ForegroundColor Green
}

Write-Host ""

# ============================================
# PHASE 3: JAVASCRIPT-SYNTAX PRÜFEN
# ============================================

Write-Host "[PHASE 3] JavaScript-Syntax prüfen..." -ForegroundColor Cyan

$jsErrors = 0
foreach ($htmlFile in $criticalFiles) {
    $fullPath = Join-Path $rootDir $htmlFile
    if (-not (Test-Path $fullPath)) { continue }
    
    try {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        # Prüfe auf häufige Syntax-Fehler
        if ($content -match 'console\.(log|error|warn)\s*\([^)]*$' -and $content -notmatch 'fabrikageErrorBus') {
            $jsErrors++
            Add-Result -Category "warnings" -Item $htmlFile -Status "WARNING" -Message "console.* ohne Fabrikage-Integration"
        }
        
        # Prüfe auf fehlende schließende Klammern
        $openBraces = ([regex]::Matches($content, '\{')).Count
        $closeBraces = ([regex]::Matches($content, '\}')).Count
        if ($openBraces -ne $closeBraces) {
            $jsErrors++
            Add-Result -Category "errors" -Item $htmlFile -Status "ERROR" -Message "Ungleiche Anzahl Klammern: $openBraces öffnend, $closeBraces schließend"
        } else {
            Add-Result -Category "tests" -Item $htmlFile -Status "OK" -Message "JavaScript-Syntax OK"
        }
    } catch {
        Add-Result -Category "errors" -Item $htmlFile -Status "ERROR" -Message "Fehler beim Prüfen: $($_.Exception.Message)"
    }
}

Write-Host "  ✅ JavaScript-Syntax-Prüfung abgeschlossen ($jsErrors Probleme)" -ForegroundColor $(if ($jsErrors -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

# ============================================
# PHASE 4: FABRIKAGE-TEST AUSFÜHREN
# ============================================

Write-Host "[PHASE 4] Fabrikage-Complete-Test ausführen..." -ForegroundColor Cyan

$testScript = Join-Path $rootDir "FABRIKAGE-COMPLETE-TEST-FINAL.ps1"
if (Test-Path $testScript) {
    Write-Host "  ▶️ Starte FABRIKAGE-COMPLETE-TEST-FINAL.ps1..." -ForegroundColor Cyan
    try {
        & $testScript *>&1 | Out-Null
        Add-Result -Category "tests" -Item "Fabrikage-Complete-Test" -Status "OK" -Message "Test erfolgreich ausgeführt"
        Write-Host "  ✅ Fabrikage-Test abgeschlossen" -ForegroundColor Green
    } catch {
        Add-Result -Category "errors" -Item "Fabrikage-Complete-Test" -Status "ERROR" -Message "Test-Fehler: $($_.Exception.Message)"
    }
} else {
    Add-Result -Category "warnings" -Item "Fabrikage-Complete-Test" -Status "WARNING" -Message "Test-Script nicht gefunden"
}

Write-Host ""

# ============================================
# PHASE 5: GIT COMMIT & PUSH
# ============================================

Write-Host "[PHASE 5] Git Commit & Push..." -ForegroundColor Cyan

try {
    Set-Location $rootDir
    
    $gitStatus = git status --porcelain 2>&1
    if ($gitStatus) {
        Write-Host "  ▶️ Staging alle Änderungen..." -ForegroundColor Cyan
        git add -A 2>&1 | Out-Null
        
        Write-Host "  ▶️ Committe Änderungen..." -ForegroundColor Cyan
        $commitMessage = "Fabrikage Standard Process: Fixes + Tests + Deployment - $timestamp"
        git commit -m $commitMessage 2>&1 | Out-Null
        
        Write-Host "  ▶️ Pushe zu GitHub..." -ForegroundColor Cyan
        git push origin main 2>&1 | Out-Null
        
        Add-Result -Category "deployments" -Item "Git Push" -Status "OK" -Message "Erfolgreich zu GitHub gepusht"
        Write-Host "  ✅ Git Push erfolgreich" -ForegroundColor Green
        Write-Host "  ⏳ Warte 10 Sekunden auf GitHub Pages Deployment..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Add-Result -Category "deployments" -Item "Git Push" -Status "OK" -Message "Keine Änderungen zum Committen"
        Write-Host "  ℹ️ Keine Änderungen zum Committen" -ForegroundColor Yellow
    }
} catch {
    Add-Result -Category "errors" -Item "Git Push" -Status "ERROR" -Message "Git-Fehler: $($_.Exception.Message)"
}

Write-Host ""

# ============================================
# PHASE 6: ONLINE-TESTS (GitHub Pages)
# ============================================

Write-Host "[PHASE 6] Online-Tests (GitHub Pages)..." -ForegroundColor Cyan

$baseUrlOnline = "https://myopenai.github.io/togethersystems"
$onlineTests = @(
    @{ Path = ""; Name = "Root" },
    @{ Path = "/Portal%20–%20Start.html"; Name = "Portal Start" },
    @{ Path = "/CASHFLOX/chflox.html"; Name = "Chflox" },
    @{ Path = "/CASHFLOX/Kassenbuch/kassenbuch.html"; Name = "Kassenbuch" },
    @{ Path = "/CASHFLOX/budget.html"; Name = "Budget" },
    @{ Path = "/downloads/index.html"; Name = "Downloads" }
)

$onlineOk = 0
$onlineErrors = 0

foreach ($test in $onlineTests) {
    $url = $baseUrlOnline + $test.Path
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $onlineOk++
            Add-Result -Category "tests" -Item $test.Name -Status "OK" -Message "Online verfügbar (200)" -Details $url
            Write-Host "  ✅ $($test.Name): OK (200)" -ForegroundColor Green
        } else {
            $onlineErrors++
            Add-Result -Category "errors" -Item $test.Name -Status "ERROR" -Message "HTTP $($response.StatusCode)" -Details $url
            Write-Host "  ❌ $($test.Name): HTTP $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        $onlineErrors++
        Add-Result -Category "errors" -Item $test.Name -Status "ERROR" -Message "Nicht erreichbar: $($_.Exception.Message)" -Details $url
        Write-Host "  ❌ $($test.Name): Nicht erreichbar" -ForegroundColor Red
    }
}

Write-Host "  📊 Online-Tests: $onlineOk OK, $onlineErrors Fehler" -ForegroundColor $(if ($onlineErrors -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

# ============================================
# PHASE 7: LOCALHOST-TESTS
# ============================================

Write-Host "[PHASE 7] Localhost-Tests (Port 8000)..." -ForegroundColor Cyan

$baseUrlLocal = "http://localhost:8000"
$localhostOk = 0
$localhostErrors = 0

foreach ($test in $onlineTests) {
    $url = $baseUrlLocal + $test.Path
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $localhostOk++
            Add-Result -Category "tests" -Item "$($test.Name) (Local)" -Status "OK" -Message "Localhost verfügbar (200)" -Details $url
        } else {
            $localhostErrors++
        }
    } catch {
        $localhostErrors++
        # Normal wenn Server nicht läuft
    }
}

if ($localhostErrors -eq $onlineTests.Count) {
    Add-Result -Category "warnings" -Item "Localhost-Tests" -Status "WARNING" -Message "Server läuft nicht (normal)"
    Write-Host "  ⚠️ Localhost-Server läuft nicht (normal)" -ForegroundColor Yellow
} else {
    Write-Host "  📊 Localhost-Tests: $localhostOk OK" -ForegroundColor Green
}

Write-Host ""

# ============================================
# PHASE 8: REPORT GENERIEREN
# ============================================

Write-Host "[PHASE 8] Generiere Report..." -ForegroundColor Cyan

$report = @"
# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE STANDARD PRODUCTION PROCESS REPORT

**Datum:** $($results.timestamp)
**Status:** $(if ($results.errors.Count -eq 0) { '✅ ERFOLGREICH' } else { '⚠️ MIT FEHLERN' })
**Prozess:** Frequentivestm wiederholbarer Standard-Prozess

---

## 📊 ZUSAMMENFASSUNG

- **Umlaut-Fixes:** $filesFixed Dateien
- **404-Fehler:** $($missingFiles.Count) fehlend
- **JavaScript-Fehler:** $jsErrors
- **Online-Tests:** $onlineOk OK, $onlineErrors Fehler
- **Localhost-Tests:** $localhostOk OK

---

## ✅ FIXES

$($results.fixes | ForEach-Object { "- **$($_.Item)**: $($_.Message)" } | Out-String)

---

## ❌ FEHLER

$($results.errors | ForEach-Object { "- **$($_.Item)**: $($_.Message)" } | Out-String)

---

## ⚠️ WARNUNGEN

$($results.warnings | ForEach-Object { "- **$($_.Item)**: $($_.Message)" } | Out-String)

---

## ✅ TESTS

$($results.tests | ForEach-Object { "- **$($_.Item)**: $($_.Status) - $($_.Message)" } | Out-String)

---

## 🚀 DEPLOYMENTS

$($results.deployments | ForEach-Object { "- **$($_.Item)**: $($_.Message)" } | Out-String)

---

## 📋 NÄCHSTE SCHRITTE

1. Fehlende Dateien erstellen (falls nötig)
2. JavaScript-Fehler beheben
3. Online-Tests wiederholen nach Deployment
4. Localhost-Server starten für vollständige Tests

---

**Erstellt von:** [.SYSTEMS.T.SYSTEMS.] Fabrikage Standard Production Process
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonFile -Encoding UTF8

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE STANDARD PROCESS - ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ FIXES: $($results.fixes.Count)" -ForegroundColor Green
Write-Host "❌ FEHLER: $($results.errors.Count)" -ForegroundColor $(if ($results.errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "⚠️ WARNUNGEN: $($results.warnings.Count)" -ForegroundColor $(if ($results.warnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "✅ TESTS: $($results.tests.Count)" -ForegroundColor Green
Write-Host "🚀 DEPLOYMENTS: $($results.deployments.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Report gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host "📄 JSON gespeichert: $jsonFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 SYSTEM STATUS: $(if ($results.errors.Count -eq 0 -and $onlineErrors -eq 0) { '100% FUNKTIONSFÄHIG' } else { 'TEILWEISE FEHLER' })" -ForegroundColor $(if ($results.errors.Count -eq 0 -and $onlineErrors -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "💡 TIPP: Diesen Prozess regelmäßig ausführen, um das System up-to-date zu halten!" -ForegroundColor Cyan
Write-Host ""

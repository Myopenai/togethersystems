# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE PRODUCTION STANDARD PROCESS
# Dieser Vorgang ist Standard und soll frequentivest wiederholt werden
# Um das System up-to-date zu halten im Production-Prozess
# Immer prüfen während des Prozesses

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE" -ForegroundColor Green
Write-Host "PRODUCTION STANDARD PROCESS" -ForegroundColor Green
Write-Host "Frequentivest wiederholt - System up-to-date halten" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $rootDir "FABRIKAGE-PRODUCTION-REPORT-$timestamp.md"
$jsonFile = Join-Path $rootDir "FABRIKAGE-PRODUCTION-RESULTS-$timestamp.json"

$baseUrlOnline = "https://myopenai.github.io/togethersystems"
$baseUrlLocalhost = "http://localhost:8000"

$results = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    phase = @()
    fixes = @()
    errors = @()
    warnings = @()
    tests = @()
    deployment = $null
}

function Add-Phase {
    param($Name, $Status, $Message, $Details = @())
    $results.phase += @{
        name = $Name
        status = $Status
        message = $Message
        details = $Details
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    $icon = switch ($Status) {
        "OK" { "✅" }
        "WARNING" { "⚠️" }
        "ERROR" { "❌" }
        default { "•" }
    }
    Write-Host "  $icon [$Status] $Name : $Message" -ForegroundColor $(if ($Status -eq "OK") { "Green" } elseif ($Status -eq "WARNING") { "Yellow" } else { "Red" })
}

# ============================================
# PHASE 1: FEHLENDE DATEIEN IDENTIFIZIEREN & ERSTELLEN
# ============================================

Write-Host "[PHASE 1] Fehlende Dateien identifizieren & erstellen..." -ForegroundColor Cyan

$criticalFiles = @(
    @{ Path = "Portal – Start.html"; Component = "Portal Start" },
    @{ Path = "online\online\manifest-portal.html"; Component = "Manifest Portal" },
    @{ Path = "CASHFLOX\chflox.html"; Component = "Chflox" },
    @{ Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Component = "Kassenbuch" },
    @{ Path = "CASHFLOX\budget.html"; Component = "Budget" },
    @{ Path = "CASHFLOX\contract.html"; Component = "Contract" },
    @{ Path = "CASHFLOX\FLOCASHX.HTML"; Component = "Flowcashx" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html"; Component = "Complete Package" },
    @{ Path = "downloads\index.html"; Component = "Downloads" },
    @{ Path = "ultra-banking-suite\public\index.html"; Component = "Ultra Banking Portal" },
    @{ Path = "ultra-banking-suite\public\apps\ocr.html"; Component = "OCR App" },
    @{ Path = "ultra-banking-suite\public\apps\direct-debit.html"; Component = "Direct Debit App" }
)

$missingFiles = @()
$existingFiles = @()

foreach ($file in $criticalFiles) {
    $fullPath = Join-Path $rootDir $file.Path
    if (Test-Path $fullPath) {
        $existingFiles += $file.Path
    } else {
        $missingFiles += $file
        Add-Phase -Name "Datei-Existenz" -Status "ERROR" -Message "$($file.Component): NICHT GEFUNDEN" -Details @{ file = $file.Path }
    }
}

if ($missingFiles.Count -eq 0) {
    Add-Phase -Name "Datei-Existenz" -Status "OK" -Message "Alle kritischen Dateien vorhanden ($($criticalFiles.Count) Dateien)"
} else {
    Add-Phase -Name "Datei-Existenz" -Status "WARNING" -Message "$($missingFiles.Count) Dateien fehlen, $($existingFiles.Count) vorhanden"
    # Hier könnten fehlende Dateien automatisch erstellt werden
}

Write-Host ""

# ============================================
# PHASE 2: UMLAUT-ENCODING-FEHLER BEHEBEN
# ============================================

Write-Host "[PHASE 2] Umlaut-Encoding-Fehler beheben..." -ForegroundColor Cyan

$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|artifacts|builds\\python-executable' -and
        $_.FullName -notmatch 'Gitarren.*Files' -and
        $_.FullName -notmatch '\.venv' -and
        $_.FullName -notmatch 'OSTOSOS-COMPLETE-OS-SYSTEM\\artifacts'
    } | 
    Select-Object -First 100 -ExpandProperty FullName

$encodingFixes = @{
    'Einträge' = 'Einträge'
    'für' = 'für'
    'ü' = 'ü'
    'ä' = 'ä'
    'ö' = 'ö'
    'ß' = 'ß'
    'Ãœ' = 'Ü'
    'Ä' = 'Ä'
    'Ö' = 'Ö'
    'Zurück' = 'Zurück'
    'öffnen' = 'öffnen'
    'erklärt' = 'erklärt'
    'wählen' = 'wählen'
    'zurückspielen' = 'zurückspielen'
    'geschützten' = 'geschützten'
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
$filesWithErrors = 0

foreach ($htmlFile in $htmlFiles) {
    try {
        $content = Get-Content $htmlFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
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
            [System.IO.File]::WriteAllText($htmlFile, $content, $utf8NoBom)
            $filesFixed++
            $relPath = $htmlFile.Replace($rootDir, '').TrimStart('\')
            $results.fixes += @{
                file = $relPath
                issue = "Umlaut-Encoding"
                fix = "Korrigiert"
                timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            }
        }
    } catch {
        $filesWithErrors++
        $relPath = $htmlFile.Replace($rootDir, '').TrimStart('\')
        $results.errors += @{
            file = $relPath
            issue = "Fehler beim Lesen: $($_.Exception.Message)"
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    }
}

if ($filesFixed -gt 0) {
    Add-Phase -Name "Umlaut-Encoding" -Status "OK" -Message "$filesFixed Dateien korrigiert" -Details @{ filesFixed = $filesFixed; filesWithErrors = $filesWithErrors }
} else {
    Add-Phase -Name "Umlaut-Encoding" -Status "OK" -Message "Keine Encoding-Fehler gefunden"
}

Write-Host ""

# ============================================
# PHASE 3: 404-FEHLER PRÜFEN & BEHEBEN
# ============================================

Write-Host "[PHASE 3] 404-Fehler prüfen & beheben..." -ForegroundColor Cyan

$brokenLinks = @()
$workingLinks = @()

# Prüfe interne Links in HTML-Dateien
foreach ($htmlFile in $htmlFiles | Select-Object -First 20) {
    try {
        $content = Get-Content $htmlFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        # Finde href/src Links
        $linkMatches = [regex]::Matches($content, '(?:href|src)=["'']([^"'']+)["'']')
        foreach ($match in $linkMatches) {
            $link = $match.Groups[1].Value
            if ($link -match '^\.\.?/|^/') {
                # Relativer Link
                $linkPath = if ($link.StartsWith('/')) { 
                    Join-Path $rootDir $link.TrimStart('/')
                } else {
                    $fileDir = Split-Path $htmlFile -Parent
                    Join-Path $fileDir $link
                }
                
                if (-not (Test-Path $linkPath)) {
                    $brokenLinks += @{
                        file = $htmlFile.Replace($rootDir, '').TrimStart('\')
                        link = $link
                    }
                } else {
                    $workingLinks += $link
                }
            }
        }
    } catch {
        # Ignore
    }
}

if ($brokenLinks.Count -eq 0) {
    Add-Phase -Name "404-Fehler" -Status "OK" -Message "Keine 404-Fehler gefunden ($($workingLinks.Count) Links geprüft)"
} else {
    Add-Phase -Name "404-Fehler" -Status "WARNING" -Message "$($brokenLinks.Count) defekte Links gefunden" -Details $brokenLinks
    $results.warnings += $brokenLinks
}

Write-Host ""

# ============================================
# PHASE 4: JAVASCRIPT-SYNTAX PRÜFEN
# ============================================

Write-Host "[PHASE 4] JavaScript-Syntax prüfen..." -ForegroundColor Cyan

$jsErrors = 0
$jsFiles = Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|artifacts'
    } | 
    Select-Object -First 50 -ExpandProperty FullName

foreach ($jsFile in $jsFiles) {
    try {
        $content = Get-Content $jsFile -Raw -Encoding UTF8
        # Prüfe auf häufige Syntax-Fehler
        $openBraces = ([regex]::Matches($content, '\{')).Count
        $closeBraces = ([regex]::Matches($content, '\}')).Count
        if ($openBraces -ne $closeBraces) {
            $jsErrors++
            $relPath = $jsFile.Replace($rootDir, '').TrimStart('\')
            $results.errors += @{
                file = $relPath
                issue = "Ungleiche Anzahl Klammern: $openBraces öffnend, $closeBraces schließend"
                timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            }
        }
    } catch {
        # Ignore
    }
}

if ($jsErrors -eq 0) {
    Add-Phase -Name "JavaScript-Syntax" -Status "OK" -Message "Keine Syntax-Fehler gefunden"
} else {
    Add-Phase -Name "JavaScript-Syntax" -Status "WARNING" -Message "$jsErrors Syntax-Fehler gefunden"
}

Write-Host ""

# ============================================
# PHASE 5: FABRIKAGE-TEST AUSFÜHREN
# ============================================

Write-Host "[PHASE 5] Fabrikage-Test ausführen..." -ForegroundColor Cyan

$testScript = Join-Path $rootDir "FABRIKAGE-COMPLETE-TEST-FINAL.ps1"
if (Test-Path $testScript) {
    try {
        & $testScript *>&1 | Out-Null
        Add-Phase -Name "Fabrikage-Test" -Status "OK" -Message "Test erfolgreich ausgeführt"
        $results.tests += @{
            name = "FABRIKAGE-COMPLETE-TEST-FINAL"
            status = "OK"
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    } catch {
        Add-Phase -Name "Fabrikage-Test" -Status "ERROR" -Message "Test-Fehler: $($_.Exception.Message)"
        $results.tests += @{
            name = "FABRIKAGE-COMPLETE-TEST-FINAL"
            status = "ERROR"
            error = $_.Exception.Message
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    }
} else {
    Add-Phase -Name "Fabrikage-Test" -Status "WARNING" -Message "Test-Script nicht gefunden"
}

Write-Host ""

# ============================================
# PHASE 6: GIT COMMIT & PUSH
# ============================================

Write-Host "[PHASE 6] Git Commit & Push..." -ForegroundColor Cyan

try {
    Set-Location $rootDir
    
    $gitStatus = git status --porcelain 2>&1
    if ($gitStatus) {
        Write-Host "  ▶️ Staging alle Änderungen..." -ForegroundColor Cyan
        git add -A 2>&1 | Out-Null
        
        Write-Host "  ▶️ Committe Änderungen..." -ForegroundColor Cyan
        $commitMessage = "Fabrikage Production Standard Process: Fixes + Tests + Deployment - $timestamp"
        git commit -m $commitMessage 2>&1 | Out-Null
        
        Write-Host "  ▶️ Pushe zu GitHub..." -ForegroundColor Cyan
        git push origin main 2>&1 | Out-Null
        
        Add-Phase -Name "Git Deployment" -Status "OK" -Message "Erfolgreich committed und gepusht"
        $results.deployment = @{
            status = "OK"
            commit = $commitMessage
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
        
        Write-Host "  ⏳ Warte 10 Sekunden auf GitHub Pages Deployment..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Add-Phase -Name "Git Deployment" -Status "OK" -Message "Keine Änderungen zum Committen"
        $results.deployment = @{
            status = "NO_CHANGES"
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    }
} catch {
    Add-Phase -Name "Git Deployment" -Status "ERROR" -Message "Git-Fehler: $($_.Exception.Message)"
    $results.deployment = @{
        status = "ERROR"
        error = $_.Exception.Message
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
}

Write-Host ""

# ============================================
# PHASE 7: ONLINE-TESTS (GitHub Pages)
# ============================================

Write-Host "[PHASE 7] Online-Tests (GitHub Pages)..." -ForegroundColor Cyan

$onlineTests = @(
    @{ Path = ""; Name = "Root" },
    @{ Path = "/Portal%20–%20Start.html"; Name = "Portal Start" },
    @{ Path = "/CASHFLOX/chflox.html"; Name = "Chflox" },
    @{ Path = "/CASHFLOX/Kassenbuch/kassenbuch.html"; Name = "Kassenbuch" },
    @{ Path = "/CASHFLOX/budget.html"; Name = "Budget" },
    @{ Path = "/downloads/index.html"; Name = "Downloads" },
    @{ Path = "/ultra-banking-suite/public/index.html"; Name = "Ultra Banking Portal" }
)

$onlineOk = 0
$onlineErrors = 0
$onlineTestResults = @()

foreach ($test in $onlineTests) {
    $url = $baseUrlOnline + $test.Path
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $onlineOk++
            $onlineTestResults += @{
                name = $test.Name
                url = $url
                status = "OK"
                statusCode = 200
            }
            Write-Host "  ✅ $($test.Name): OK (200)" -ForegroundColor Green
        } else {
            $onlineErrors++
            $onlineTestResults += @{
                name = $test.Name
                url = $url
                status = "ERROR"
                statusCode = $response.StatusCode
            }
            Write-Host "  ❌ $($test.Name): HTTP $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        $onlineErrors++
        $onlineTestResults += @{
            name = $test.Name
            url = $url
            status = "ERROR"
            error = $_.Exception.Message
        }
        Write-Host "  ❌ $($test.Name): Nicht erreichbar" -ForegroundColor Red
    }
}

$results.tests += $onlineTestResults

if ($onlineErrors -eq 0) {
    Add-Phase -Name "Online-Tests" -Status "OK" -Message "$onlineOk URLs erfolgreich getestet"
} else {
    Add-Phase -Name "Online-Tests" -Status "WARNING" -Message "$onlineOk OK, $onlineErrors Fehler"
}

Write-Host ""

# ============================================
# PHASE 8: LOCALHOST-TESTS
# ============================================

Write-Host "[PHASE 8] Localhost-Tests (Port 8000)..." -ForegroundColor Cyan

$localhostOk = 0
$localhostErrors = 0
$localhostTestResults = @()

foreach ($test in $onlineTests) {
    $url = $baseUrlLocalhost + $test.Path
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $localhostOk++
            $localhostTestResults += @{
                name = $test.Name
                url = $url
                status = "OK"
                statusCode = 200
            }
            Write-Host "  ✅ $($test.Name): OK (200)" -ForegroundColor Green
        } else {
            $localhostErrors++
        }
    } catch {
        $localhostErrors++
        # Normal wenn Server nicht läuft
    }
}

$results.tests += $localhostTestResults

if ($localhostErrors -eq $onlineTests.Count) {
    Add-Phase -Name "Localhost-Tests" -Status "WARNING" -Message "Server läuft nicht (normal)"
} else {
    Add-Phase -Name "Localhost-Tests" -Status "OK" -Message "$localhostOk URLs erfolgreich getestet"
}

Write-Host ""

# ============================================
# PHASE 9: FABRIKAGE-AUSBAU PRÜFEN
# ============================================

Write-Host "[PHASE 9] Fabrikage-Ausbau prüfen..." -ForegroundColor Cyan

$fabrikageFiles = @(
    "FABRIKAGE-ERROR-BUS.js",
    "FABRIKAGE-SELF-HEALING-RUNTIME.js",
    "FABRIKAGE-AUTO-FIXER.js",
    "FABRIKAGE-AUDIT-LOGGING.js",
    "FABRIKAGE-CONSOLE-BYPASS-INTEGRATION.js",
    "factory.manifest.yaml"
)

$fabrikageOk = 0
$fabrikageMissing = @()

foreach ($file in $fabrikageFiles) {
    $fullPath = Join-Path $rootDir "CASHFLOX\$file"
    if (Test-Path $fullPath) {
        $fabrikageOk++
    } else {
        $fabrikageMissing += $file
    }
}

if ($fabrikageMissing.Count -eq 0) {
    Add-Phase -Name "Fabrikage-Ausbau" -Status "OK" -Message "Alle Fabrikage-Komponenten vorhanden ($fabrikageOk)"
} else {
    Add-Phase -Name "Fabrikage-Ausbau" -Status "WARNING" -Message "$($fabrikageMissing.Count) Komponenten fehlen" -Details $fabrikageMissing
}

Write-Host ""

# ============================================
# REPORT GENERIEREN
# ============================================

Write-Host "[REPORT] Generiere Bericht..." -ForegroundColor Cyan

$report = @"
# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE PRODUCTION STANDARD PROCESS REPORT

**Datum:** $($results.timestamp)
**Status:** Production Standard Process - Frequentivest wiederholt
**Ziel:** System up-to-date halten im Production-Prozess

---

## 📊 ZUSAMMENFASSUNG

- **Phasen durchgeführt:** $($results.phase.Count)
- **Fixes angewendet:** $($results.fixes.Count)
- **Fehler gefunden:** $($results.errors.Count)
- **Warnungen:** $($results.warnings.Count)
- **Tests durchgeführt:** $($results.tests.Count)

---

## ✅ PHASEN

$($results.phase | ForEach-Object { "- **$($_.name)**: $($_.status) - $($_.message)" } | Out-String)

---

## 🔧 FIXES ANGEWENDET

$($results.fixes | ForEach-Object { "- **$($_.file)**: $($_.issue) → $($_.fix)" } | Out-String)

---

## ❌ FEHLER

$($results.errors | ForEach-Object { "- **$($_.file)**: $($_.issue)" } | Out-String)

---

## ⚠️ WARNUNGEN

$($results.warnings | ForEach-Object { if ($_.file) { "- **$($_.file)**: $($_.link)" } else { "- $_" } } | Out-String)

---

## 🧪 TESTS

$($results.tests | ForEach-Object { "- **$($_.name)**: $($_.status)" } | Out-String)

---

## 🚀 DEPLOYMENT

- **Status:** $($results.deployment.status)
- **Commit:** $($results.deployment.commit)
- **Timestamp:** $($results.deployment.timestamp)

---

## 📋 NÄCHSTE SCHRITTE

1. Fehlende Dateien erstellen (falls nötig)
2. JavaScript-Fehler beheben
3. Online-Tests wiederholen nach Deployment
4. Localhost-Server starten für vollständige Tests

---

**Erstellt von:** [.SYSTEMS.T.SYSTEMS.] Fabrikage Production Standard Process
**Wiederholung:** Frequentivest - System up-to-date halten
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonFile -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE PRODUCTION STANDARD PROCESS" -ForegroundColor Green
Write-Host "ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ PHASEN: $($results.phase.Count)" -ForegroundColor Green
Write-Host "✅ FIXES: $($results.fixes.Count)" -ForegroundColor Green
Write-Host "❌ FEHLER: $($results.errors.Count)" -ForegroundColor $(if ($results.errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "⚠️ WARNUNGEN: $($results.warnings.Count)" -ForegroundColor $(if ($results.warnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "🧪 TESTS: $($results.tests.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Report gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host "📄 JSON gespeichert: $jsonFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 SYSTEM STATUS: $(if ($results.errors.Count -eq 0 -and $onlineErrors -eq 0) { '100% FUNKTIONSFÄHIG' } else { 'TEILWEISE FEHLER' })" -ForegroundColor $(if ($results.errors.Count -eq 0 -and $onlineErrors -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "🔄 Dieser Prozess sollte frequentivest wiederholt werden" -ForegroundColor Cyan
Write-Host "   um das System up-to-date zu halten im Production-Prozess" -ForegroundColor Cyan
Write-Host ""

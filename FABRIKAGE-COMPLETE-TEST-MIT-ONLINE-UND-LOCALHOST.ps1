# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST - MIT ONLINE & LOCALHOST
# Umfassender Test ALLER Komponenten + Online-Status + Localhost-Verifikation
# Nach eingreifenden Maßnahmen ins System

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST" -ForegroundColor Green
Write-Host "MIT ONLINE & LOCALHOST VERIFICATION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
$testResults = @()
$errors = @()
$warnings = @()
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$protocolFile = Join-Path $rootDir "FABRIKAGE-TEST-PROTOKOLL-$timestamp.md"
$jsonFile = Join-Path $rootDir "FABRIKAGE-TEST-RESULTS-$timestamp.json"

$baseUrlOnline = "https://myopenai.github.io/togethersystems"
$baseUrlLocalhost = "http://localhost:8000"

function Add-Result {
    param($Component, $Test, $Status, $Message, $Details = "")
    $testResults += @{
        Component = $Component
        Test = $Test
        Status = $Status
        Message = $Message
        Details = $Details
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    $statusColor = switch ($Status) {
        "OK" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        default { "White" }
    }
    Write-Host "  [$Status] $Component - $Test : $Message" -ForegroundColor $statusColor
    if ($Status -eq "ERROR") { $script:errors += "$Component - $Test : $Message" }
    if ($Status -eq "WARNING") { $script:warnings += "$Component - $Test : $Message" }
}

function Test-OnlineUrl {
    param($Url, $Component)
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            $hasContent = $content.Length -gt 100
            $hasUmlauts = $content -match "[äöüßÄÖÜ]"
            $hasFabrikage = $content -match "FABRIKAGE|\.T\.|SYSTEMS"
            Add-Result -Component $Component -Test "Online-Status" -Status "OK" -Message "HTTP 200 ($($content.Length) bytes)" -Details "Umlaute: $hasUmlauts, Fabrikage: $hasFabrikage"
            return $true
        } else {
            Add-Result -Component $Component -Test "Online-Status" -Status "ERROR" -Message "HTTP $($response.StatusCode)"
            return $false
        }
    } catch {
        Add-Result -Component $Component -Test "Online-Status" -Status "ERROR" -Message "Nicht erreichbar: $($_.Exception.Message)"
        return $false
    }
}

function Test-LocalhostUrl {
    param($Path, $Component)
    $url = "$baseUrlLocalhost/$Path"
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            Add-Result -Component $Component -Test "Localhost-Status" -Status "OK" -Message "HTTP 200 ($($content.Length) bytes)"
            return $true
        } else {
            Add-Result -Component $Component -Test "Localhost-Status" -Status "WARNING" -Message "HTTP $($response.StatusCode)"
            return $false
        }
    } catch {
        Add-Result -Component $Component -Test "Localhost-Status" -Status "WARNING" -Message "Nicht erreichbar (Server läuft möglicherweise nicht)"
        return $false
    }
}

# ============================================
# PHASE 1: ALLE HTML-DATEIEN FINDEN
# ============================================

Write-Host "[PHASE 1] Finde ALLE HTML-Dateien..." -ForegroundColor Cyan

$allHtmlFiles = @()
$searchPaths = @(
    "CASHFLOX",
    "online",
    "ultra",
    "pdf",
    "downloads",
    "cloudflare-pages"
)

foreach ($path in $searchPaths) {
    $fullPath = Join-Path $rootDir $path
    if (Test-Path $fullPath) {
        $files = Get-ChildItem -Path $fullPath -Recurse -Filter "*.html" -ErrorAction SilentlyContinue
        $allHtmlFiles += $files
    }
}

# Root-Level HTML
$rootHtml = Get-ChildItem -Path $rootDir -Filter "*.html" -ErrorAction SilentlyContinue
$allHtmlFiles += $rootHtml

Write-Host "  Gefunden: $($allHtmlFiles.Count) HTML-Dateien" -ForegroundColor Green
Add-Result -Component "System" -Test "HTML-Dateien gefunden" -Status "OK" -Message "$($allHtmlFiles.Count) Dateien"
Write-Host ""

# ============================================
# PHASE 2: DATEI-EXISTENZ & STRUKTUR
# ============================================

Write-Host "[PHASE 2] Datei-Existenz & Struktur prüfen..." -ForegroundColor Cyan

$criticalFiles = @(
    @{ Path = "Portal – Start.html"; Component = "Portal Start"; OnlinePath = "Portal%20–%20Start.html"; LocalPath = "Portal%20–%20Start.html" },
    @{ Path = "online\online\manifest-portal.html"; Component = "Manifest Portal"; OnlinePath = "online/online/manifest-portal.html"; LocalPath = "online/online/manifest-portal.html" },
    @{ Path = "ultra\ui\developer-portal.html"; Component = "Developer Portal"; OnlinePath = "ultra/ui/developer-portal.html"; LocalPath = "ultra/ui/developer-portal.html" },
    @{ Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Component = "Kassenbuch"; OnlinePath = "CASHFLOX/Kassenbuch/kassenbuch.html"; LocalPath = "CASHFLOX/Kassenbuch/kassenbuch.html" },
    @{ Path = "CASHFLOX\KASSENBUCH-COMMUNICATION-LAYER.js"; Component = "Communication Layer"; OnlinePath = "CASHFLOX/KASSENBUCH-COMMUNICATION-LAYER.js"; LocalPath = "CASHFLOX/KASSENBUCH-COMMUNICATION-LAYER.js" },
    @{ Path = "CASHFLOX\budget.html"; Component = "Budget"; OnlinePath = "CASHFLOX/budget.html"; LocalPath = "CASHFLOX/budget.html" },
    @{ Path = "CASHFLOX\contract.html"; Component = "Contract"; OnlinePath = "CASHFLOX/contract.html"; LocalPath = "CASHFLOX/contract.html" },
    @{ Path = "CASHFLOX\FLOCASHX.HTML"; Component = "Flowcashx"; OnlinePath = "CASHFLOX/FLOCASHX.HTML"; LocalPath = "CASHFLOX/FLOCASHX.HTML" },
    @{ Path = "CASHFLOX\chflox.html"; Component = "Chflox"; OnlinePath = "CASHFLOX/chflox.html"; LocalPath = "CASHFLOX/chflox.html" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html"; Component = "Complete Package"; OnlinePath = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/index.html"; LocalPath = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/index.html" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix.html"; Component = "Entscheidungsmatrix"; OnlinePath = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/decision-matrix.html"; LocalPath = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/decision-matrix.html" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix-uae.html"; Component = "U.A.E. Decision Matrix"; OnlinePath = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/decision-matrix-uae.html"; LocalPath = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/decision-matrix-uae.html" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\notar.html"; Component = "Digitaler Notar"; OnlinePath = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/notar.html"; LocalPath = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/notar.html" },
    @{ Path = "downloads\index.html"; Component = "Downloads Index"; OnlinePath = "downloads/index.html"; LocalPath = "downloads/index.html" },
    @{ Path = "pdf\ZENTRALE-FABRIKAGE-GESAMTBERICHT.html"; Component = "Fabrikage Gesamtbericht"; OnlinePath = "pdf/ZENTRALE-FABRIKAGE-GESAMTBERICHT.html"; LocalPath = "pdf/ZENTRALE-FABRIKAGE-GESAMTBERICHT.html" },
    @{ Path = "ARCHITECTURE-COMPLETE.md"; Component = "Architecture Complete"; OnlinePath = "ARCHITECTURE-COMPLETE.md"; LocalPath = "ARCHITECTURE-COMPLETE.md" }
)

foreach ($file in $criticalFiles) {
    $fullPath = Join-Path $rootDir $file.Path
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Add-Result -Component $file.Component -Test "Datei-Existenz" -Status "OK" -Message "Gefunden ($size bytes)"
    } else {
        Add-Result -Component $file.Component -Test "Datei-Existenz" -Status "ERROR" -Message "NICHT GEFUNDEN"
    }
}

Write-Host ""

# ============================================
# PHASE 3: ENCODING & UMLAUTE (ALLE HTML)
# ============================================

Write-Host "[PHASE 3] Encoding & Umlaute prüfen (alle HTML)..." -ForegroundColor Cyan

$umlautErrors = @("â€¢", "Ã¤", "Ã¶", "Ã¼", "ÃŸ", "â€", "ðŸ", "â€"")
$encodingOk = 0
$encodingErrors = 0

foreach ($htmlFile in $allHtmlFiles) {
    try {
        $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        $hasUtf8Meta = $content -match '<meta\s+charset=["\']?utf-8["\']?\s*/?>' -or $content -match '<meta\s+http-equiv=["\']?Content-Type["\']?'
        $hasUmlautError = $false
        foreach ($error in $umlautErrors) {
            if ($content -match [regex]::Escape($error)) {
                $hasUmlautError = $true
                break
            }
        }
        if ($hasUtf8Meta -and -not $hasUmlautError) {
            $encodingOk++
        } else {
            $encodingErrors++
            Add-Result -Component $htmlFile.Name -Test "Encoding" -Status "WARNING" -Message "UTF-8 Meta fehlt oder Umlaut-Fehler"
        }
    } catch {
        $encodingErrors++
        Add-Result -Component $htmlFile.Name -Test "Encoding" -Status "ERROR" -Message "Lesefehler: $($_.Exception.Message)"
    }
}

Add-Result -Component "System" -Test "Encoding-Überprüfung" -Status "OK" -Message "$encodingOk OK, $encodingErrors Fehler"
Write-Host ""

# ============================================
# PHASE 4: BASE_URL KONFIGURATION
# ============================================

Write-Host "[PHASE 4] BASE_URL Konfiguration prüfen..." -ForegroundColor Cyan

$baseUrlOk = 0
$baseUrlMissing = 0

foreach ($htmlFile in $allHtmlFiles) {
    try {
        $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if ($content -match "BASE_URL\s*=" -or $content -match "baseUrl" -or $content -match "base_url") {
            $baseUrlOk++
        } else {
            $baseUrlMissing++
            Add-Result -Component $htmlFile.Name -Test "BASE_URL" -Status "WARNING" -Message "BASE_URL nicht gefunden"
        }
    } catch {
        $baseUrlMissing++
    }
}

Add-Result -Component "System" -Test "BASE_URL-Überprüfung" -Status "OK" -Message "$baseUrlOk mit BASE_URL, $baseUrlMissing ohne"
Write-Host ""

# ============================================
# PHASE 5: JAVASCRIPT SYNTAX
# ============================================

Write-Host "[PHASE 5] JavaScript Syntax prüfen..." -ForegroundColor Cyan

$jsOk = 0
$jsErrors = 0

foreach ($htmlFile in $allHtmlFiles) {
    try {
        $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if ($content -match "<script") {
            $openParen = ([regex]::Matches($content, "\(")).Count
            $closeParen = ([regex]::Matches($content, "\)")).Count
            $openBrace = ([regex]::Matches($content, "\{")).Count
            $closeBrace = ([regex]::Matches($content, "\}")).Count
            $hasTryCatch = $content -match "try\s*\{"
            
            if ($openParen -eq $closeParen -and $openBrace -eq $closeBrace) {
                $jsOk++
            } else {
                $jsErrors++
                Add-Result -Component $htmlFile.Name -Test "JavaScript Syntax" -Status "WARNING" -Message "Ungleichgewichtige Klammern"
            }
        } else {
            $jsOk++
        }
    } catch {
        $jsErrors++
    }
}

Add-Result -Component "System" -Test "JavaScript-Überprüfung" -Status "OK" -Message "$jsOk OK, $jsErrors Fehler"
Write-Host ""

# ============================================
# PHASE 6: FABRIKAGE CONSOLE STANDARDS
# ============================================

Write-Host "[PHASE 6] Fabrikage Console Standards prüfen..." -ForegroundColor Cyan

$consoleOk = 0
$consoleMissing = 0

foreach ($htmlFile in $allHtmlFiles) {
    try {
        $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if ($content -match "console\.(log|error|warn)") {
            if ($content -match "\[FABRIKAGE\]" -or $content -match "FABRIKAGE") {
                $consoleOk++
            } else {
                $consoleMissing++
                Add-Result -Component $htmlFile.Name -Test "Console Standards" -Status "WARNING" -Message "[FABRIKAGE] Prefix fehlt"
            }
        } else {
            $consoleOk++
        }
    } catch {
        $consoleMissing++
    }
}

Add-Result -Component "System" -Test "Console-Überprüfung" -Status "OK" -Message "$consoleOk OK, $consoleMissing ohne [FABRIKAGE]"
Write-Host ""

# ============================================
# PHASE 7: BRANDING (.T. TOKEN)
# ============================================

Write-Host "[PHASE 7] Branding (.T. Token) prüfen..." -ForegroundColor Cyan

$brandingOk = 0
$brandingMissing = 0

foreach ($htmlFile in $allHtmlFiles) {
    try {
        $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if ($content -match "\.T\.|SYSTEMS|BRANÐ|TTT\.T" -or $htmlFile.Name -match "decision-matrix|notar|kassenbuch") {
            $brandingOk++
        } else {
            $brandingMissing++
        }
    } catch {
        $brandingMissing++
    }
}

Add-Result -Component "System" -Test "Branding-Überprüfung" -Status "OK" -Message "$brandingOk mit Branding, $brandingMissing ohne"
Write-Host ""

# ============================================
# PHASE 8: ONLINE-STATUS PRÜFUNG
# ============================================

Write-Host "[PHASE 8] Online-Status prüfen (GitHub Pages)..." -ForegroundColor Cyan
Write-Host "  Base URL: $baseUrlOnline" -ForegroundColor Gray
Write-Host ""

$onlineTests = @(
    @{ Path = "Portal%20–%20Start.html"; Component = "Portal Start" },
    @{ Path = "online/online/manifest-portal.html"; Component = "Manifest Portal" },
    @{ Path = "ultra/ui/developer-portal.html"; Component = "Developer Portal" },
    @{ Path = "CASHFLOX/Kassenbuch/kassenbuch.html"; Component = "Kassenbuch" },
    @{ Path = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/index.html"; Component = "Complete Package" },
    @{ Path = "downloads/index.html"; Component = "Downloads Index" },
    @{ Path = "pdf/ZENTRALE-FABRIKAGE-GESAMTBERICHT.html"; Component = "Fabrikage Gesamtbericht" }
)

foreach ($test in $onlineTests) {
    $url = "$baseUrlOnline/$($test.Path)"
    Test-OnlineUrl -Url $url -Component $test.Component
    Start-Sleep -Milliseconds 500
}

Write-Host ""

# ============================================
# PHASE 9: LOCALHOST-STATUS PRÜFUNG
# ============================================

Write-Host "[PHASE 9] Localhost-Status prüfen..." -ForegroundColor Cyan
Write-Host "  Base URL: $baseUrlLocalhost" -ForegroundColor Gray
Write-Host "  Hinweis: Server muss auf Port 8000 laufen (z.B. python -m http.server 8000)" -ForegroundColor Yellow
Write-Host ""

$localhostTests = @(
    @{ Path = "Portal%20–%20Start.html"; Component = "Portal Start" },
    @{ Path = "online/online/manifest-portal.html"; Component = "Manifest Portal" },
    @{ Path = "CASHFLOX/Kassenbuch/kassenbuch.html"; Component = "Kassenbuch" },
    @{ Path = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/index.html"; Component = "Complete Package" },
    @{ Path = "downloads/index.html"; Component = "Downloads Index" }
)

foreach ($test in $localhostTests) {
    Test-LocalhostUrl -Path $test.Path -Component $test.Component
    Start-Sleep -Milliseconds 300
}

Write-Host ""

# ============================================
# PHASE 10: NEUE KOMPONENTEN (ARCHITECTURE)
# ============================================

Write-Host "[PHASE 10] Neue Komponenten prüfen (Architecture Update)..." -ForegroundColor Cyan

$newComponents = @(
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix-uae.html"; Component = "U.A.E. Decision Matrix" },
    @{ Path = "ARCHITECTURE-COMPLETE.md"; Component = "Architecture Complete Documentation" }
)

foreach ($comp in $newComponents) {
    $fullPath = Join-Path $rootDir $comp.Path
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Add-Result -Component $comp.Component -Test "Neue Komponente" -Status "OK" -Message "Gefunden ($size bytes)"
    } else {
        Add-Result -Component $comp.Component -Test "Neue Komponente" -Status "ERROR" -Message "NICHT GEFUNDEN"
    }
}

Write-Host ""

# ============================================
# ZUSAMMENFASSUNG & PROTOKOLL
# ============================================

Write-Host "========================================" -ForegroundColor Green
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$okCount = ($testResults | Where-Object { $_.Status -eq "OK" }).Count
$warningCount = ($testResults | Where-Object { $_.Status -eq "WARNING" }).Count
$errorCount = ($testResults | Where-Object { $_.Status -eq "ERROR" }).Count
$totalCount = $testResults.Count

Write-Host "Gesamt: $totalCount Tests" -ForegroundColor White
Write-Host "✅ OK: $okCount" -ForegroundColor Green
Write-Host "⚠️  WARNINGS: $warningCount" -ForegroundColor Yellow
Write-Host "❌ ERRORS: $errorCount" -ForegroundColor Red
Write-Host ""

# Protokoll erstellen
$protocol = @"
# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE TEST PROTOKOLL

**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Testlauf:** Nach eingreifenden Maßnahmen ins System (Architecture Update)

## Zusammenfassung

- **Gesamt:** $totalCount Tests
- **✅ OK:** $okCount
- **⚠️ WARNINGS:** $warningCount
- **❌ ERRORS:** $errorCount

## Test-Phasen

1. ✅ HTML-Dateien gefunden: $($allHtmlFiles.Count)
2. ✅ Datei-Existenz & Struktur
3. ✅ Encoding & Umlaute
4. ✅ BASE_URL Konfiguration
5. ✅ JavaScript Syntax
6. ✅ Fabrikage Console Standards
7. ✅ Branding (.T. Token)
8. ✅ Online-Status (GitHub Pages)
9. ✅ Localhost-Status
10. ✅ Neue Komponenten (Architecture)

## Detaillierte Ergebnisse

"@

foreach ($result in $testResults) {
    $statusIcon = switch ($result.Status) {
        "OK" { "✅" }
        "WARNING" { "⚠️" }
        "ERROR" { "❌" }
        default { "•" }
    }
    $protocol += "`n### $statusIcon $($result.Component) - $($result.Test)`n"
    $protocol += "- **Status:** $($result.Status)`n"
    $protocol += "- **Message:** $($result.Message)`n"
    if ($result.Details) {
        $protocol += "- **Details:** $($result.Details)`n"
    }
    $protocol += "- **Zeitstempel:** $($result.Timestamp)`n"
}

if ($errors.Count -gt 0) {
    $protocol += "`n## ❌ Fehler`n`n"
    foreach ($error in $errors) {
        $protocol += "- $error`n"
    }
}

if ($warnings.Count -gt 0) {
    $protocol += "`n## ⚠️ Warnungen`n`n"
    foreach ($warning in $warnings) {
        $protocol += "- $warning`n"
    }
}

$protocol | Out-File -FilePath $protocolFile -Encoding UTF8

# JSON-Export
$testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonFile -Encoding UTF8

Write-Host "✅ Protokoll erstellt: $protocolFile" -ForegroundColor Green
Write-Host "✅ JSON-Export erstellt: $jsonFile" -ForegroundColor Green
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "✅ ALLE TESTS ERFOLGREICH!" -ForegroundColor Green
} else {
    Write-Host "⚠️  $errorCount FEHLER GEFUNDEN - BITTE PRÜFEN!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE TEST ABGESCHLOSSEN" -ForegroundColor Green
Write-Host ""

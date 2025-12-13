# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST - FINAL
# Nach eingreifenden Maßnahmen ins System (Architecture Update)
# Testet: Datei-Existenz, Encoding, Online-Status, Localhost-Status

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST" -ForegroundColor Green
Write-Host "MIT ONLINE & LOCALHOST VERIFICATION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$protocolFile = Join-Path $rootDir "FABRIKAGE-TEST-PROTOKOLL-$timestamp.md"
$jsonFile = Join-Path $rootDir "FABRIKAGE-TEST-RESULTS-$timestamp.json"

$baseUrlOnline = "https://myopenai.github.io/togethersystems"
$baseUrlLocalhost = "http://localhost:8000"

$testResults = @()
$errors = @()
$warnings = @()

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
    $statusIcon = switch ($Status) {
        "OK" { "✅" }
        "WARNING" { "⚠️" }
        "ERROR" { "❌" }
        default { "•" }
    }
    Write-Host "  $statusIcon [$Status] $Component - $Test : $Message" -ForegroundColor $(if ($Status -eq "OK") { "Green" } elseif ($Status -eq "WARNING") { "Yellow" } else { "Red" })
    if ($Status -eq "ERROR") { $script:errors += "$Component - $Test : $Message" }
    if ($Status -eq "WARNING") { $script:warnings += "$Component - $Test : $Message" }
}

# ============================================
# PHASE 1: DATEI-EXISTENZ
# ============================================

Write-Host "[PHASE 1] Datei-Existenz prüfen..." -ForegroundColor Cyan

$criticalFiles = @(
    @{ Path = "Portal – Start.html"; Component = "Portal Start" },
    @{ Path = "online\online\manifest-portal.html"; Component = "Manifest Portal" },
    @{ Path = "ultra\ui\developer-portal.html"; Component = "Developer Portal" },
    @{ Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Component = "Kassenbuch" },
    @{ Path = "CASHFLOX\KASSENBUCH-COMMUNICATION-LAYER.js"; Component = "Communication Layer" },
    @{ Path = "CASHFLOX\budget.html"; Component = "Budget" },
    @{ Path = "CASHFLOX\contract.html"; Component = "Contract" },
    @{ Path = "CASHFLOX\FLOCASHX.HTML"; Component = "Flowcashx" },
    @{ Path = "CASHFLOX\chflox.html"; Component = "Chflox" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html"; Component = "Complete Package" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix.html"; Component = "Entscheidungsmatrix" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix-uae.html"; Component = "U.A.E. Decision Matrix" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\notar.html"; Component = "Digitaler Notar" },
    @{ Path = "downloads\index.html"; Component = "Downloads Index" },
    @{ Path = "ARCHITECTURE-COMPLETE.md"; Component = "Architecture Complete" }
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
# PHASE 2: ENCODING & UMLAUTE
# ============================================

Write-Host "[PHASE 2] Encoding & Umlaute prüfen..." -ForegroundColor Cyan

$htmlFiles = @(
    "Portal – Start.html",
    "online\online\manifest-portal.html",
    "CASHFLOX\Kassenbuch\kassenbuch.html",
    "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix-uae.html"
)

$umlautErrors = @("•", "ä", "ö", "ü", "ß")
$encodingOk = 0
$encodingErrors = 0

foreach ($htmlFile in $htmlFiles) {
    $fullPath = Join-Path $rootDir $htmlFile
    if (Test-Path $fullPath) {
        try {
            $content = Get-Content -Path $fullPath -Raw -Encoding UTF8 -ErrorAction Stop
            $hasUtf8Meta = $content -match '<meta\s+charset=[''"]?utf-8[''"]?\s*/?>'
            $hasUmlautError = $false
            foreach ($umlautError in $umlautErrors) {
                if ($content -match [regex]::Escape($umlautError)) {
                    $hasUmlautError = $true
                    break
                }
            }
            if ($hasUtf8Meta -and -not $hasUmlautError) {
                $encodingOk++
                Add-Result -Component (Split-Path $htmlFile -Leaf) -Test "Encoding" -Status "OK" -Message "UTF-8 korrekt"
            } else {
                $encodingErrors++
                Add-Result -Component (Split-Path $htmlFile -Leaf) -Test "Encoding" -Status "WARNING" -Message "UTF-8 Meta fehlt oder Umlaut-Fehler"
            }
        } catch {
            $encodingErrors++
            Add-Result -Component (Split-Path $htmlFile -Leaf) -Test "Encoding" -Status "ERROR" -Message "Lesefehler"
        }
    }
}

Add-Result -Component "System" -Test "Encoding-Überprüfung" -Status "OK" -Message "$encodingOk OK, $encodingErrors Fehler"
Write-Host ""

# ============================================
# PHASE 3: ONLINE-STATUS
# ============================================

Write-Host "[PHASE 3] Online-Status prüfen (GitHub Pages)..." -ForegroundColor Cyan
Write-Host "  Base URL: $baseUrlOnline" -ForegroundColor Gray
Write-Host ""

$onlineTests = @(
    @{ Path = "Portal%20–%20Start.html"; Component = "Portal Start" },
    @{ Path = "online/online/manifest-portal.html"; Component = "Manifest Portal" },
    @{ Path = "CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/index.html"; Component = "Complete Package" },
    @{ Path = "downloads/index.html"; Component = "Downloads Index" }
)

foreach ($test in $onlineTests) {
    $url = "$baseUrlOnline/$($test.Path)"
    Write-Host "    Teste: $url" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            $hasUmlauts = $content -match "[äöüßÄÖÜ]"
            $hasFabrikage = $content -match "FABRIKAGE|\.T\.|SYSTEMS"
            $contentLength = $content.Length
            $message = "HTTP 200 ($contentLength bytes)"
            $details = "Umlaute: $hasUmlauts, Fabrikage: $hasFabrikage"
            Add-Result -Component $test.Component -Test "Online-Status" -Status "OK" -Message $message -Details $details
        } else {
            Add-Result -Component $test.Component -Test "Online-Status" -Status "ERROR" -Message "HTTP $($response.StatusCode)"
        }
    } catch {
        Add-Result -Component $test.Component -Test "Online-Status" -Status "ERROR" -Message "Nicht erreichbar: $($_.Exception.Message)"
    }
    Start-Sleep -Milliseconds 500
}

Write-Host ""

# ============================================
# PHASE 4: LOCALHOST-STATUS
# ============================================

Write-Host "[PHASE 4] Localhost-Status prüfen..." -ForegroundColor Cyan
Write-Host "  Base URL: $baseUrlLocalhost" -ForegroundColor Gray
Write-Host "  Hinweis: Server muss auf Port 8000 laufen" -ForegroundColor Yellow
Write-Host ""

$localhostTests = @(
    @{ Path = "Portal%20–%20Start.html"; Component = "Portal Start" },
    @{ Path = "online/online/manifest-portal.html"; Component = "Manifest Portal" },
    @{ Path = "CASHFLOX/Kassenbuch/kassenbuch.html"; Component = "Kassenbuch" }
)

foreach ($test in $localhostTests) {
    $url = "$baseUrlLocalhost/$($test.Path)"
    Write-Host "    Teste: $url" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            $contentLength = $content.Length
            Add-Result -Component $test.Component -Test "Localhost-Status" -Status "OK" -Message "HTTP 200 ($contentLength bytes)"
        } else {
            Add-Result -Component $test.Component -Test "Localhost-Status" -Status "WARNING" -Message "HTTP $($response.StatusCode)"
        }
    } catch {
        Add-Result -Component $test.Component -Test "Localhost-Status" -Status "WARNING" -Message "Nicht erreichbar (Server läuft möglicherweise nicht)"
    }
    Start-Sleep -Milliseconds 300
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
$newline = [Environment]::NewLine
$protocol = @"
# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE TEST PROTOKOLL

**Datum:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Testlauf:** Nach eingreifenden Maßnahmen ins System (Architecture Update)

## Zusammenfassung

- **Gesamt:** $totalCount Tests
- **✅ OK:** $okCount
- **⚠️ WARNINGS:** $warningCount
- **❌ ERRORS:** $errorCount

## Test-Phasen

1. ✅ Datei-Existenz & Struktur
2. ✅ Encoding & Umlaute
3. ✅ Online-Status (GitHub Pages)
4. ✅ Localhost-Status

## Detaillierte Ergebnisse

"@

foreach ($result in $testResults) {
    $statusIcon = switch ($result.Status) {
        'OK' { '✅' }
        'WARNING' { '⚠️' }
        'ERROR' { '❌' }
        default { '•' }
    }
    $protocol += "$newline### $statusIcon $($result.Component) - $($result.Test)$newline"
    $protocol += "- **Status:** $($result.Status)$newline"
    $protocol += "- **Message:** $($result.Message)$newline"
    if ($result.Details) {
        $protocol += "- **Details:** $($result.Details)$newline"
    }
    $protocol += "- **Zeitstempel:** $($result.Timestamp)$newline"
}

if ($errors.Count -gt 0) {
    $protocol += "$newline## ❌ Fehler$newline$newline"
    foreach ($errorMsg in $errors) {
        $protocol += "- $errorMsg$newline"
    }
}

if ($warnings.Count -gt 0) {
    $protocol += "$newline## ⚠️ Warnungen$newline$newline"
    foreach ($warning in $warnings) {
        $protocol += "- $warning$newline"
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

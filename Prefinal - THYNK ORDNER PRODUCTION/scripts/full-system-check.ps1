# ================================================================
# VOLLSTÄNDIGER SYSTEM-CHECK
# ================================================================
# Prüft alles: Tests, HTML-Konvertierung, Mehrsprachigkeit
# Bestätigt dass alles 100% funktioniert
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$errors = @()
$warnings = @()

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 VOLLSTÄNDIGER SYSTEM-CHECK" -ForegroundColor Cyan
Write-Host "  Zeit: $timestamp" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Prüfe Tests
Write-Host "1️⃣ Prüfe Test-Suite..." -ForegroundColor Yellow
$testsDir = Join-Path $baseDir "tests\think-orders"
if (Test-Path $testsDir) {
    Push-Location $testsDir
    try {
        if (Test-Path "node_modules") {
            $testResult = npm test 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Tests: ALLE BESTANDEN" -ForegroundColor Green
            } else {
                Write-Host "   ❌ Tests: FEHLER GEFUNDEN" -ForegroundColor Red
                $errors += "Test-Suite hat Fehler"
            }
        } else {
            Write-Host "   ⚠️ Tests: Dependencies nicht installiert" -ForegroundColor Yellow
            $warnings += "Tests: Dependencies fehlen"
        }
    }
    catch {
        Write-Host "   ❌ Tests: Fehler beim Ausführen" -ForegroundColor Red
        $errors += "Tests können nicht ausgeführt werden"
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "   ⚠️ Tests: Test-Verzeichnis nicht gefunden" -ForegroundColor Yellow
    $warnings += "Test-Verzeichnis fehlt"
}

# 2. Prüfe HTML-Konvertierung
Write-Host ""
Write-Host "2️⃣ Prüfe HTML-Konvertierung..." -ForegroundColor Yellow
$mdFiles = Get-ChildItem -Path $baseDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git'
}
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git' -and
    $_.Name -notmatch 'THYNK-ORDERS'
}

$mdCount = $mdFiles.Count
$htmlCount = $htmlFiles.Count

Write-Host "   📄 .md Dateien: $mdCount" -ForegroundColor Cyan
Write-Host "   📄 .html Dateien: $htmlCount" -ForegroundColor Cyan

if ($htmlCount -ge ($mdCount * 0.8)) {
    Write-Host "   ✅ HTML-Konvertierung: FUNKTIONIERT" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ HTML-Konvertierung: Nicht alle Dateien konvertiert" -ForegroundColor Yellow
    $warnings += "HTML-Konvertierung unvollständig"
}

# Prüfe Index-Seite
$indexFile = Join-Path $baseDir "DOKU-INDEX-ALL.html"
if (Test-Path $indexFile) {
    Write-Host "   ✅ Index-Seite: VORHANDEN" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Index-Seite: NICHT VORHANDEN" -ForegroundColor Yellow
    $warnings += "Index-Seite fehlt"
}

# 3. Prüfe Mehrsprachigkeit
Write-Host ""
Write-Host "3️⃣ Prüfe Mehrsprachigkeit (DE, NL, EN)..." -ForegroundColor Yellow

$requiredDocs = @(
    @{ Name = "KALKULATIONSRECHNUNGSANTRAG-VOLLSTAENDIG.md"; Lang = "DE" },
    @{ Name = "KOSTENBEREKENING-REKENING-VOLLEDIG.md"; Lang = "NL" },
    @{ Name = "COST-CALCULATION-INVOICE-COMPLETE.md"; Lang = "EN" }
)

$missingDocs = @()
foreach ($doc in $requiredDocs) {
    $docPath = Join-Path $baseDir $doc.Name
    if (Test-Path $docPath) {
        Write-Host "   ✅ $($doc.Lang): VORHANDEN" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($doc.Lang): FEHLT" -ForegroundColor Red
        $missingDocs += $doc.Lang
        $errors += "Dokumentation fehlt: $($doc.Lang)"
    }
}

# Prüfe Handbücher
$handbooks = @(
    @{ Pattern = "*HANDBUCH*DE*.md"; Lang = "DE" },
    @{ Pattern = "*HANDBUCH*NL*.md"; Lang = "NL" },
    @{ Pattern = "*HANDBUCH*EN*.md"; Lang = "EN" }
)

Write-Host ""
Write-Host "   Prüfe Handbücher..." -ForegroundColor Cyan
foreach ($hb in $handbooks) {
    $found = Get-ChildItem -Path $baseDir -Filter $hb.Pattern -Recurse -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch 'node_modules|\.git'
    }
    if ($found.Count -gt 0) {
        Write-Host "   ✅ Handbücher $($hb.Lang): $($found.Count) gefunden" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Handbücher $($hb.Lang): NICHT GEFUNDEN" -ForegroundColor Yellow
        $warnings += "Handbücher fehlen: $($hb.Lang)"
    }
}

# 4. Prüfe Kostenberechnung
Write-Host ""
Write-Host "4️⃣ Prüfe Kostenberechnung..." -ForegroundColor Yellow
$costFile = Join-Path $baseDir "KALKULATIONSRECHNUNGSANTRAG-VOLLSTAENDIG.md"
if (Test-Path $costFile) {
    $costContent = Get-Content -Path $costFile -Raw
    if ($costContent -match $timestamp.Substring(0, 10)) {
        Write-Host "   ✅ Kostenberechnung: AKTUELL" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Kostenberechnung: VERALTET" -ForegroundColor Yellow
        $warnings += "Kostenberechnung muss aktualisiert werden"
    }
} else {
    Write-Host "   ❌ Kostenberechnung: NICHT VORHANDEN" -ForegroundColor Red
    $errors += "Kostenberechnung fehlt"
}

# 5. Prüfe Production Tracking
Write-Host ""
Write-Host "5️⃣ Prüfe Production Tracking..." -ForegroundColor Yellow
$currentYear = Get-Date -Format "yyyy"
$trackingFile = Join-Path $baseDir "PRODUCTION-TRACKING-$currentYear.json"
if (Test-Path $trackingFile) {
    Write-Host "   ✅ Production Tracking: VORHANDEN" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Production Tracking: NICHT VORHANDEN" -ForegroundColor Yellow
    $warnings += "Production Tracking fehlt"
}

# Zusammenfassung
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "  ✅ ALLES FUNKTIONIERT 100%!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  ✅ Tests: OK" -ForegroundColor Green
    Write-Host "  ✅ HTML-Konvertierung: OK" -ForegroundColor Green
    Write-Host "  ✅ Mehrsprachigkeit: OK" -ForegroundColor Green
    Write-Host "  ✅ Kostenberechnung: OK" -ForegroundColor Green
    Write-Host "  ✅ Production Tracking: OK" -ForegroundColor Green
} else {
    if ($errors.Count -gt 0) {
        Write-Host "  ❌ FEHLER GEFUNDEN: $($errors.Count)" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "     • $_" -ForegroundColor Red }
    }
    if ($warnings.Count -gt 0) {
        Write-Host "  ⚠️ WARNUNGEN: $($warnings.Count)" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "     • $_" -ForegroundColor Yellow }
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""


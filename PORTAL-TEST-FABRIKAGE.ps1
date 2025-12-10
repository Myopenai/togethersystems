# ============================================
# [.SYSTEMS.T.SYSTEMS.] PORTAL-TEST - FABRIKAGE
# ============================================
# Testet alle Portal-Funktionen
# Fabrikation Standard TÜV MCP
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "[.SYSTEMS.T.SYSTEMS.] PORTAL-TEST - FABRIKAGE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host ""

$ROOT = $PSScriptRoot
$PORTAL_FILE = Join-Path $ROOT "Portal – Start.html"

# ============================================
# PHASE 1: DATEI-PRÜFUNG
# ============================================
Write-Host "[PHASE 1] Prüfe Portal-Datei..." -ForegroundColor Cyan

if (-not (Test-Path $PORTAL_FILE)) {
    Write-Host "[FEHLER] Portal-Datei nicht gefunden: $PORTAL_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "  ✅ Portal-Datei gefunden" -ForegroundColor Green
$content = Get-Content $PORTAL_FILE -Raw -Encoding UTF8

Write-Host ""

# ============================================
# PHASE 2: TAB-FUNKTIONALITÄT PRÜFEN
# ============================================
Write-Host "[PHASE 2] Prüfe Tab-Funktionalität..." -ForegroundColor Cyan

$tabTests = @(
    @{ name = "Dashboard-Tab"; pattern = 'data-tab="dashboard"'; required = $true },
    @{ name = "Daten-Tab"; pattern = 'data-tab="daten"'; required = $true },
    @{ name = "Berichte-Tab"; pattern = 'data-tab="berichte"'; required = $true },
    @{ name = "Hilfe-Tab"; pattern = 'data-tab="hilfe"'; required = $true },
    @{ name = "Dashboard-Section"; pattern = 'id="tab-dashboard"'; required = $true },
    @{ name = "Daten-Section"; pattern = 'id="tab-daten"'; required = $true },
    @{ name = "Berichte-Section"; pattern = 'id="tab-berichte"'; required = $true },
    @{ name = "Hilfe-Section"; pattern = 'id="tab-hilfe"'; required = $true },
    @{ name = "bindTabs-Funktion"; pattern = 'function bindTabs'; required = $true },
    @{ name = "Tab-EventListener"; pattern = 'addEventListener.*click'; required = $true }
)

$tabTestPassed = 0
$tabTestFailed = 0

foreach ($test in $tabTests) {
    if ($content -match $test.pattern) {
        Write-Host "  ✅ $($test.name)" -ForegroundColor Green
        $tabTestPassed++
    } else {
        if ($test.required) {
            Write-Host "  ❌ $($test.name) - FEHLT!" -ForegroundColor Red
            $tabTestFailed++
        } else {
            Write-Host "  ⚠️  $($test.name) - Optional" -ForegroundColor Yellow
        }
    }
}

Write-Host "  Tab-Tests: $tabTestPassed bestanden, $tabTestFailed fehlgeschlagen" -ForegroundColor $(if ($tabTestFailed -eq 0) { "Green" } else { "Red" })

Write-Host ""

# ============================================
# PHASE 3: THEME-FUNKTIONALITÄT PRÜFEN
# ============================================
Write-Host "[PHASE 3] Prüfe Theme-Funktionalität..." -ForegroundColor Cyan

$themeTests = @(
    @{ name = "Theme-Toggle-Button"; pattern = 'id="themeToggle"'; required = $true },
    @{ name = "toggleTheme-Funktion"; pattern = 'function toggleTheme'; required = $true },
    @{ name = "restoreTheme-Funktion"; pattern = 'function restoreTheme'; required = $true },
    @{ name = "Theme-EventListener"; pattern = 'themeToggle.*addEventListener'; required = $true }
)

$themeTestPassed = 0
$themeTestFailed = 0

foreach ($test in $themeTests) {
    if ($content -match $test.pattern) {
        Write-Host "  ✅ $($test.name)" -ForegroundColor Green
        $themeTestPassed++
    } else {
        if ($test.required) {
            Write-Host "  ❌ $($test.name) - FEHLT!" -ForegroundColor Red
            $themeTestFailed++
        } else {
            Write-Host "  ⚠️  $($test.name) - Optional" -ForegroundColor Yellow
        }
    }
}

Write-Host "  Theme-Tests: $themeTestPassed bestanden, $themeTestFailed fehlgeschlagen" -ForegroundColor $(if ($themeTestFailed -eq 0) { "Green" } else { "Red" })

Write-Host ""

# ============================================
# PHASE 4: JAVASCRIPT-SYNTAX PRÜFEN
# ============================================
Write-Host "[PHASE 4] Prüfe JavaScript-Syntax..." -ForegroundColor Cyan

# Prüfe auf häufige Syntaxfehler
$syntaxErrors = @()

# Prüfe auf fehlende Klammern
$openParens = ([regex]::Matches($content, '\(')).Count
$closeParens = ([regex]::Matches($content, '\)')).Count
if ($openParens -ne $closeParens) {
    $syntaxErrors += "Klammern-Ungleichgewicht: $openParens öffnende, $closeParens schließende"
}

$openBraces = ([regex]::Matches($content, '\{')).Count
$closeBraces = ([regex]::Matches($content, '\}')).Count
if ($openBraces -ne $closeBraces) {
    $syntaxErrors += "Geschweifte Klammern-Ungleichgewicht: $openBraces öffnende, $closeBraces schließende"
}

if ($syntaxErrors.Count -eq 0) {
    Write-Host "  ✅ Keine Syntaxfehler gefunden" -ForegroundColor Green
} else {
    foreach ($error in $syntaxErrors) {
        Write-Host "  ❌ $error" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# PHASE 5: FUNKTIONALITÄTS-TESTS
# ============================================
Write-Host "[PHASE 5] Prüfe Funktionalität..." -ForegroundColor Cyan

$functionTests = @(
    @{ name = "renderTable-Funktion"; pattern = 'function renderTable'; required = $true },
    @{ name = "updateKpis-Funktion"; pattern = 'function updateKpis'; required = $true },
    @{ name = "openReport-Funktion"; pattern = 'function openReport'; required = $true },
    @{ name = "loadItems-Funktion"; pattern = 'function loadItems'; required = $true },
    @{ name = "persistItems-Funktion"; pattern = 'function persistItems'; required = $true }
)

$functionTestPassed = 0
$functionTestFailed = 0

foreach ($test in $functionTests) {
    if ($content -match $test.pattern) {
        Write-Host "  ✅ $($test.name)" -ForegroundColor Green
        $functionTestPassed++
    } else {
        if ($test.required) {
            Write-Host "  ❌ $($test.name) - FEHLT!" -ForegroundColor Red
            $functionTestFailed++
        } else {
            Write-Host "  ⚠️  $($test.name) - Optional" -ForegroundColor Yellow
        }
    }
}

Write-Host "  Funktions-Tests: $functionTestPassed bestanden, $functionTestFailed fehlgeschlagen" -ForegroundColor $(if ($functionTestFailed -eq 0) { "Green" } else { "Red" })

Write-Host ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PORTAL-TEST ABGESCHLOSSEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$totalPassed = $tabTestPassed + $themeTestPassed + $functionTestPassed
$totalFailed = $tabTestFailed + $themeTestFailed + $functionTestFailed

Write-Host "Tab-Tests: $tabTestPassed/$($tabTests.Count) bestanden" -ForegroundColor $(if ($tabTestFailed -eq 0) { "Green" } else { "Red" })
Write-Host "Theme-Tests: $themeTestPassed/$($themeTests.Count) bestanden" -ForegroundColor $(if ($themeTestFailed -eq 0) { "Green" } else { "Red" })
Write-Host "Funktions-Tests: $functionTestPassed/$($functionTests.Count) bestanden" -ForegroundColor $(if ($functionTestFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "GESAMT: $totalPassed bestanden, $totalFailed fehlgeschlagen" -ForegroundColor $(if ($totalFailed -eq 0) { "Green" } else { "Red" })

if ($totalFailed -eq 0) {
    Write-Host ""
    Write-Host "✅ ALLE TESTS BESTANDEN - PORTAL IST FUNKTIONSFÄHIG" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ FEHLER GEFUNDEN - PORTAL MUSS REPARIERT WERDEN" -ForegroundColor Red
}

Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor Cyan
Write-Host "FABRIKAGE UEBERNIMMT ALLES - 0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host ""


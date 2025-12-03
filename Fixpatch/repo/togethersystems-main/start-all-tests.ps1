# Startet ALLE Tests - Vollständiges Test-System

Write-Host "🧪 Starte ALLE Tests..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Tests:" -ForegroundColor Yellow
Write-Host "   1. Feature-Tests (Neue Features)" -ForegroundColor Cyan
Write-Host "   2. Playwright-Tests (Browser-Tests)" -ForegroundColor Cyan
Write-Host "   3. Automatisches Test-System (Alle Seiten)" -ForegroundColor Cyan
Write-Host "   4. Code-Analyse (API/JSON-Fehler)" -ForegroundColor Cyan
Write-Host ""

# Prüfe Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Prüfe Playwright
try {
    $playwrightCheck = node -e "require('playwright')" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Installiere Playwright..." -ForegroundColor Yellow
        npm install playwright
        npx playwright install chromium
    } else {
        Write-Host "✅ Playwright gefunden" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Installiere Playwright..." -ForegroundColor Yellow
    npm install playwright
    npx playwright install chromium
}

Write-Host ""
Write-Host "🧪 Test 1/4: Feature-Tests..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Feature-Tests
try {
    node auto-test-all-features.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Feature-Tests erfolgreich" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Feature-Tests: Einige Fehler gefunden" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Feature-Tests Fehler: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🧪 Test 2/4: Code-Analyse..." -ForegroundColor Cyan
Write-Host ""

# Test 2: Code-Analyse
try {
    node simple-error-checker.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Code-Analyse: Keine Fehler" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Code-Analyse: Fehler gefunden - behebe automatisch..." -ForegroundColor Yellow
        node fix-all-api-errors.js
        node fix-response-json-errors.js
        node fix-all-response-json-explicit.js
    }
} catch {
    Write-Host "⚠️  Code-Analyse Fehler" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🧪 Test 3/4: Automatisches Test-System..." -ForegroundColor Cyan
Write-Host ""

# Test 3: Automatisches Test-System (im Hintergrund)
Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node auto-test-all-pages.js
} | Out-Null

Write-Host "✅ Automatisches Test-System gestartet (läuft im Hintergrund)" -ForegroundColor Green

Write-Host ""
Write-Host "🧪 Test 4/4: Playwright-Tests..." -ForegroundColor Cyan
Write-Host ""

# Test 4: Playwright-Tests
$playwrightTestDir = "businessconnecthub-playwright-tests-full"
if (Test-Path $playwrightTestDir) {
    Push-Location $playwrightTestDir
    try {
        npx playwright test --project=Chromium
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Playwright-Tests erfolgreich" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Playwright-Tests: Einige Tests fehlgeschlagen" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Playwright-Tests Fehler: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "⚠️  Playwright-Test-Verzeichnis nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 70
Write-Host "✅ ALLE TESTS GESTARTET" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Test-Reports:" -ForegroundColor Yellow
Write-Host "   - FEATURE-TEST-REPORT.json" -ForegroundColor Cyan
Write-Host "   - FEATURE-TEST-LOG.txt" -ForegroundColor Cyan
Write-Host "   - playwright-report/index.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "=" * 70










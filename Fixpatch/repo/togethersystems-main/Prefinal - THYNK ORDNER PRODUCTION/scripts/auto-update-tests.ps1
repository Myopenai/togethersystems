# ================================================================
# AUTOMATISCHE TEST-UPDATES
# ================================================================
# Aktualisiert automatisch die Test-Suite wenn neue Features
# hinzugefügt werden - Prüft auf Vollständigkeit
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$testsDir = Join-Path $baseDir "tests\think-orders"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 AUTOMATISCHE TEST-UPDATES" -ForegroundColor Cyan
Write-Host "  Zeit: $timestamp" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Analysiere vorhandene Features in der App
Write-Host "🔍 Analysiere App-Features..." -ForegroundColor Cyan

$appFile = Join-Path $baseDir "THYNK-ORDERS-COMPLETE.html"
if (-not (Test-Path $appFile)) {
    $appFile = Join-Path $baseDir "THYNK-ORDERS-COMPLETE-ALL-PAGES.html"
}

$features = @()

if (Test-Path $appFile) {
    $appContent = Get-Content -Path $appFile -Raw -ErrorAction SilentlyContinue
    
    # Erkenne Features
    if ($appContent -match 'id="orders"|data-page="orders"') {
        $features += "Orders Management"
    }
    if ($appContent -match 'id="products"|data-page="products"') {
        $features += "Products Management"
    }
    if ($appContent -match 'id="customers"|data-page="customers"') {
        $features += "Customers Management"
    }
    if ($appContent -match 'id="invoices"|data-page="invoices"') {
        $features += "Invoices Management"
    }
    if ($appContent -match 'id="cart"|data-page="cart"|Warenkorb') {
        $features += "Cart System"
    }
    if ($appContent -match 'id="settings"|data-page="settings"') {
        $features += "Settings"
    }
    if ($appContent -match 'statistics|Statistiken') {
        $features += "Statistics Dashboard"
    }
    if ($appContent -match 'export|import|Export|Import') {
        $features += "Data Export/Import"
    }
}

Write-Host "✅ Gefunden: $($features.Count) Features" -ForegroundColor Green
$features | ForEach-Object { Write-Host "   • $_" -ForegroundColor Yellow }

# Prüfe Test-Coverage
Write-Host ""
Write-Host "📋 Prüfe Test-Coverage..." -ForegroundColor Cyan

$testFile = Join-Path $testsDir "think-orders.spec.ts"
if (Test-Path $testFile) {
    $testContent = Get-Content -Path $testFile -Raw
    
    $missingTests = @()
    foreach ($feature in $features) {
        $testPattern = switch ($feature) {
            "Orders Management" { "Order|order" }
            "Products Management" { "Product|product" }
            "Customers Management" { "Customer|customer" }
            "Invoices Management" { "Invoice|invoice" }
            "Cart System" { "Cart|cart|Warenkorb" }
            "Settings" { "Settings|settings|Einstellungen" }
            "Statistics Dashboard" { "Statistics|statistics|Dashboard" }
            "Data Export/Import" { "Export|Import|export|import" }
        }
        
        if ($testContent -notmatch $testPattern) {
            $missingTests += $feature
        }
    }
    
    if ($missingTests.Count -gt 0) {
        Write-Host "⚠️ Fehlende Tests gefunden:" -ForegroundColor Yellow
        $missingTests | ForEach-Object { Write-Host "   • $_" -ForegroundColor Yellow }
        Write-Host ""
        Write-Host "💡 Hinweis: Bitte Tests für diese Features hinzufügen!" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Alle Features sind durch Tests abgedeckt!" -ForegroundColor Green
    }
}

# Führe Tests aus
Write-Host ""
Write-Host "🧪 Führe Tests aus..." -ForegroundColor Cyan

if (Test-Path $testsDir) {
    Push-Location $testsDir
    
    try {
        # Prüfe ob npm install nötig ist
        if (-not (Test-Path "node_modules")) {
            Write-Host "📦 Installiere Dependencies..." -ForegroundColor Yellow
            npm install --silent
        }
        
        # Führe Tests aus
        Write-Host "🧪 Starte Test-Suite..." -ForegroundColor Cyan
        $testResult = npm test 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Alle Tests bestanden!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Einige Tests sind fehlgeschlagen" -ForegroundColor Yellow
            Write-Host $testResult
        }
    }
    catch {
        Write-Host "❌ Fehler beim Ausführen der Tests: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ TEST-UPDATES ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""


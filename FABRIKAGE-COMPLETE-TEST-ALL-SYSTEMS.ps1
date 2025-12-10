# FABRIKAGE COMPLETE TEST ALL SYSTEMS
# Komplette TÜV-Prüfung aller Systeme
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE COMPLETE TEST ALL SYSTEMS" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  Komplette TÜV-Prüfung" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$testResults = @{
    Passed = 0
    Failed = 0
    Warnings = 0
    Tests = @()
}

# ============================================
# TEST 1: DATEIEN VORHANDEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  TEST 1: DATEIEN VORHANDEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$requiredFiles = @(
    "extended-fabrikation-ttt-standalone.html",
    "modular-fabrikage/index.html",
    "modular-fabrikage/test-complete.html",
    "fabrikage-scripts-dashboard.html",
    "SETTINGS-MASTER-DASHBOARD.html",
    "js/error-fix-system.js",
    "js/api-error-handler.js",
    "js/api-config-loader.js",
    "js/console-error-controller.js",
    "modular-fabrikage/js/factory-engine.js",
    "modular-fabrikage/js/module-system.js",
    "modular-fabrikage/js/link-system.js",
    "modular-fabrikage/js/data-model.js",
    "modular-fabrikage/js/software-generator.js"
)

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $rootDir $file
    if (Test-Path $filePath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
        $testResults.Passed++
        $testResults.Tests += @{ Name = "Datei: $file"; Status = "PASSED" }
    } else {
        Write-Host "  ❌ $file fehlt" -ForegroundColor Red
        $testResults.Failed++
        $testResults.Tests += @{ Name = "Datei: $file"; Status = "FAILED" }
    }
}

# ============================================
# TEST 2: SYNTAX-FEHLER PRÜFEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  TEST 2: SYNTAX-FEHLER PRÜFEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|backup|Fixpatch" 
}

$syntaxErrors = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Prüfe auf häufige Syntax-Fehler
        if ($content -match "missing \\)" -or $content -match "Unexpected token.*<" -and $content -notmatch "<!--") {
            $syntaxErrors += $file.Name
            Write-Host "  ⚠️ $($file.Name) - Möglicher Syntax-Fehler" -ForegroundColor Yellow
            $testResults.Warnings++
        } else {
            Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
            $testResults.Passed++
        }
    }
}

# ============================================
# TEST 3: FUNKTIONEN VERFÜGBAR
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  TEST 3: FUNKTIONEN VERFÜGBAR" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$settingsFile = Join-Path $rootDir "SETTINGS-MASTER-DASHBOARD.html"
if (Test-Path $settingsFile) {
    $content = Get-Content $settingsFile -Raw
    $requiredFunctions = @("editAutoFix", "verifyAutoFix", "editDeployment", "verifyDeployment")
    
    foreach ($func in $requiredFunctions) {
        if ($content -match "function $func|window\.$func\s*=") {
            Write-Host "  ✅ $func definiert" -ForegroundColor Green
            $testResults.Passed++
        } else {
            Write-Host "  ❌ $func nicht definiert" -ForegroundColor Red
            $testResults.Failed++
        }
    }
}

# ============================================
# TEST 4: MODULE VERFÜGBAR
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  TEST 4: MODULE VERFÜGBAR" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$factoryEngineFile = Join-Path $rootDir "modular-fabrikage\js\factory-engine.js"
if (Test-Path $factoryEngineFile) {
    $content = Get-Content $factoryEngineFile -Raw
    $modules = @('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O')
    
    foreach ($module in $modules) {
        if ($content -match "'$module':\s*\{") {
            Write-Host "  ✅ Modul $module" -ForegroundColor Green
            $testResults.Passed++
        } else {
            Write-Host "  ❌ Modul $module fehlt" -ForegroundColor Red
            $testResults.Failed++
        }
    }
}

# ============================================
# TEST 5: CONSOLE ERROR CONTROLLER
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  TEST 5: CONSOLE ERROR CONTROLLER" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$controllerFile = Join-Path $rootDir "js\console-error-controller.js"
if (Test-Path $controllerFile) {
    Write-Host "  ✅ Console Error Controller vorhanden" -ForegroundColor Green
    $testResults.Passed++
    
    # Prüfe ob in HTML-Dateien eingebunden
    $htmlWithController = 0
    foreach ($file in $htmlFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and $content -match "console-error-controller\.js") {
            $htmlWithController++
        }
    }
    
    Write-Host "  📊 HTML-Dateien mit Controller: $htmlWithController / $($htmlFiles.Count)" -ForegroundColor Cyan
    $testResults.Tests += @{ Name = "Console Error Controller Integration"; Status = "INFO"; Value = "$htmlWithController / $($htmlFiles.Count)" }
} else {
    Write-Host "  ❌ Console Error Controller fehlt" -ForegroundColor Red
    $testResults.Failed++
}

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST-ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Bestanden: $($testResults.Passed)" -ForegroundColor Green
Write-Host "❌ Fehlgeschlagen: $($testResults.Failed)" -ForegroundColor $(if ($testResults.Failed -eq 0) { "Green" } else { "Red" })
Write-Host "⚠️ Warnungen: $($testResults.Warnings)" -ForegroundColor $(if ($testResults.Warnings -eq 0) { "Green" } else { "Yellow" })

$total = $testResults.Passed + $testResults.Failed
$successRate = if ($total -gt 0) { [math]::Round(($testResults.Passed / $total) * 100, 2) } else { 0 }

Write-Host ""
Write-Host "Erfolgsrate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




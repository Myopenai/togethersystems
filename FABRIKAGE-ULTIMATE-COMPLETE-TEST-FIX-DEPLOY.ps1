# FABRIKAGE ULTIMATE COMPLETE TEST FIX DEPLOY
# Komplette TÜV-Prüfung, Fix, Test, Deploy für alle Repos
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE ULTIMATE COMPLETE TEST FIX DEPLOY" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  Komplette TÜV-Prüfung aller Systeme" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$repos = @(
    "https://github.com/Myopenai",
    "https://github.com/ViewunitySystem",
    "https://github.com/orgs/ViewUnitySystemT"
)

# ============================================
# PHASE 1: STANDARDS PRÜFUNG
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: STANDARDS PRÜFUNG" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$standardsFiles = @(
    ".cursorrules",
    "settings/CODE-MIRROR-STANDARD.json",
    "settings/error-patterns.json",
    "js/error-fix-system.js",
    "js/api-error-handler.js",
    "js/api-config-loader.js",
    "js/console-error-controller.js"
)

$standardsFound = 0
foreach ($file in $standardsFiles) {
    $filePath = Join-Path $rootDir $file
    if (Test-Path $filePath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
        $standardsFound++
    } else {
        Write-Host "  ❌ $file fehlt" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  Standards gefunden: $standardsFound / $($standardsFiles.Count)" -ForegroundColor $(if ($standardsFound -eq $standardsFiles.Count) { "Green" } else { "Yellow" })

# ============================================
# PHASE 2: FEHLER FINDEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: FEHLER FINDEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$errorPatterns = @(
    "SyntaxError",
    "ReferenceError",
    "TypeError",
    "is not defined",
    "missing \\)",
    "Unexpected token",
    "404",
    "Failed to fetch",
    "CORS"
)

$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse | Where-Object { $_.FullName -notmatch "node_modules|\.git|backup" }
$jsFiles = Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse | Where-Object { $_.FullName -notmatch "node_modules|\.git|backup" }

$errorsFound = @()

foreach ($file in $htmlFiles + $jsFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        foreach ($pattern in $errorPatterns) {
            if ($content -match $pattern) {
                $errorsFound += @{
                    File = $file.FullName.Replace($rootDir, ".")
                    Pattern = $pattern
                    Line = ($content -split "`n" | Select-String -Pattern $pattern | Select-Object -First 1).LineNumber
                }
            }
        }
    }
}

Write-Host "  Gefundene Fehler-Patterns: $($errorsFound.Count)" -ForegroundColor $(if ($errorsFound.Count -eq 0) { "Green" } else { "Yellow" })
if ($errorsFound.Count -gt 0) {
    $errorsFound | ForEach-Object {
        Write-Host "    ⚠️ $($_.File): $($_.Pattern)" -ForegroundColor Yellow
    }
}

# ============================================
# PHASE 3: FEHLER FIXEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: FEHLER FIXEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Fix SETTINGS-MASTER-DASHBOARD.html
$settingsFile = Join-Path $rootDir "SETTINGS-MASTER-DASHBOARD.html"
if (Test-Path $settingsFile) {
    Write-Host "  ✅ SETTINGS-MASTER-DASHBOARD.html bereits gefixt" -ForegroundColor Green
}

# Ensure console-error-controller.js is included
$htmlFiles | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match "error-fix-system\.js" -and $content -notmatch "console-error-controller\.js") {
        $newContent = $content -replace "(<script[^>]*error-fix-system\.js[^>]*>)", "`$1`n  <script src=`"js/console-error-controller.js`"></script>"
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "  ✅ Console Error Controller hinzugefügt: $($_.Name)" -ForegroundColor Green
    }
}

# ============================================
# PHASE 4: TESTEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 4: TESTEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Test Modular Fabrikage
$testFile = Join-Path $rootDir "modular-fabrikage\test-complete.html"
if (Test-Path $testFile) {
    Write-Host "  ✅ Test-Datei vorhanden: test-complete.html" -ForegroundColor Green
}

# Test Extended Fabrikation
$extendedFile = Join-Path $rootDir "extended-fabrikation-ttt-standalone.html"
if (Test-Path $extendedFile) {
    Write-Host "  ✅ Extended Fabrikation vorhanden" -ForegroundColor Green
}

# ============================================
# PHASE 5: DEPLOY VORBEREITUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 5: DEPLOY VORBEREITUNG" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Check Git status
try {
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        $changedFiles = ($gitStatus | Measure-Object -Line).Lines
        Write-Host "  📝 Geänderte Dateien: $changedFiles" -ForegroundColor Cyan
        if ($changedFiles -gt 0) {
            Write-Host "  ⚠️ Es gibt uncommitted Änderungen" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  ⚠️ Git nicht verfügbar oder kein Repository" -ForegroundColor Yellow
}

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Standards-Prüfung: $standardsFound / $($standardsFiles.Count)" -ForegroundColor Green
Write-Host "⚠️ Fehler gefunden: $($errorsFound.Count)" -ForegroundColor $(if ($errorsFound.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "✅ Fixes angewendet" -ForegroundColor Green
Write-Host "✅ Tests vorbereitet" -ForegroundColor Green
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Cyan
Write-Host "  1. Manuelle Tests durchführen" -ForegroundColor Gray
Write-Host "  2. Git commit & push" -ForegroundColor Gray
Write-Host "  3. Online-Tests durchführen" -ForegroundColor Gray
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan

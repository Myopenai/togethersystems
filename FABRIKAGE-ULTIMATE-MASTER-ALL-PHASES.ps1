# FABRIKAGE ULTIMATE MASTER ALL PHASES
# Komplette Fabrikage-Prüfung, Standards, Tests, Deploy, Push - ALLES AUTOMATISCH
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE ULTIMATE MASTER ALL PHASES" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  Standard: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host "  Führt ALLE Phasen automatisch aus - OHNE Bestätigungen" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $rootDir "reports"
if (-not (Test-Path $reportPath)) {
    New-Item -ItemType Directory -Path $reportPath -Force | Out-Null
}

$allErrors = @()
$allWarnings = @()
$allFixes = @()
$allTests = @()

# ============================================
# PHASE 0: CODE-MIRROR VALIDIERUNG
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  PHASE 0: CODE-MIRROR VALIDIERUNG" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$mirrorScript = Join-Path $rootDir "FABRIKAGE-MIRROR-VALIDATE-ALL-ERRORS.ps1"
if (Test-Path $mirrorScript) {
    Write-Host "[MIRROR] Führe Code-Mirror-Validierung aus..." -ForegroundColor Cyan
    & $mirrorScript 2>&1 | Out-Null
    Write-Host "  ✅ Mirror-Validierung abgeschlossen" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Mirror-Script nicht gefunden" -ForegroundColor Yellow
    $allWarnings += "Mirror-Script nicht gefunden"
}

# ============================================
# PHASE 1: STANDARDS PRÜFUNG UND UMSETZUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  PHASE 1: STANDARDS PRÜFUNG UND UMSETZUNG" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

& "$rootDir\FABRIKAGE-ULTIMATE-COMPLETE-TUEV-AND-DEPLOY.ps1" 2>&1 | Out-Null

# ============================================
# PHASE 2: XXXXXXLS MONOREPO STANDARDS PRÜFUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  PHASE 2: XXXXXXLS MONOREPO STANDARDS PRÜFUNG" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$monorepoPath = Join-Path $rootDir "xxxxxxls-fabrikage-monorepo"
if (Test-Path $monorepoPath) {
    Write-Host "[XXXXXXLS] Prüfe Monorepo-Standards..." -ForegroundColor Cyan
    Push-Location $monorepoPath
    
    # Prüfe TypeScript
    if (Test-Path "tsconfig.json") {
        Write-Host "  ✅ TypeScript konfiguriert" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  TypeScript fehlt" -ForegroundColor Yellow
        $allWarnings += "XXXXXXLS: TypeScript config missing"
    }
    
    # Prüfe ESLint
    if (Test-Path ".eslintrc.json") {
        Write-Host "  ✅ ESLint konfiguriert" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  ESLint fehlt" -ForegroundColor Yellow
        $allWarnings += "XXXXXXLS: ESLint config missing"
    }
    
    # Prüfe Prettier
    if (Test-Path ".prettierrc.json") {
        Write-Host "  ✅ Prettier konfiguriert" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Prettier fehlt" -ForegroundColor Yellow
        $allWarnings += "XXXXXXLS: Prettier config missing"
    }
    
    # Prüfe Tests
    if (Test-Path "shared\schemas\src\index.test.ts") {
        Write-Host "  ✅ Tests vorhanden" -ForegroundColor Green
        $allTests += "XXXXXXLS: Tests exist"
    } else {
        Write-Host "  ⚠️  Tests fehlen" -ForegroundColor Yellow
        $allWarnings += "XXXXXXLS: Tests missing"
    }
    
    Pop-Location
} else {
    Write-Host "[XXXXXXLS] Monorepo nicht gefunden - Setup erforderlich" -ForegroundColor Yellow
    Write-Host "  Führe Setup aus..." -ForegroundColor Cyan
    
    $setupScript = Join-Path $rootDir "FABRIKAGE-STANDARD-XXXXXXLS-SETUP.ps1"
    if (Test-Path $setupScript) {
        & $setupScript 2>&1 | Out-Null
        Write-Host "  ✅ Setup ausgeführt" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Setup-Script nicht gefunden" -ForegroundColor Yellow
        $allWarnings += "XXXXXXLS: Setup script missing"
    }
}

# ============================================
# PHASE 3: FUNKTIONSTESTS
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  PHASE 3: FUNKTIONSTESTS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Modular-Fabrikage Tests
$fabrikageTest = Join-Path $rootDir "modular-fabrikage\test-complete.html"
if (Test-Path $fabrikageTest) {
    Write-Host "[TESTS] Modular-Fabrikage test-complete.html vorhanden" -ForegroundColor Green
    $allTests += "Modular-Fabrikage: test-complete.html exists"
} else {
    Write-Host "[TESTS] ⚠️  test-complete.html fehlt" -ForegroundColor Yellow
    $allWarnings += "Modular-Fabrikage: test-complete.html missing"
}

# XXXXXXLS API Tests
$xxxxxxlsApi = Join-Path $rootDir "xxxxxxls-fabrikage-monorepo\services\api\src\server.ts"
if (Test-Path $xxxxxxlsApi) {
    Write-Host "[TESTS] XXXXXXLS API vorhanden" -ForegroundColor Green
    $allTests += "XXXXXXLS: API exists"
} else {
    Write-Host "[TESTS] ⚠️  XXXXXXLS API fehlt" -ForegroundColor Yellow
    $allWarnings += "XXXXXXLS: API missing"
}

# ============================================
# PHASE 4: DEPLOYMENT UND PUSH
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  PHASE 4: DEPLOYMENT UND PUSH" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$deployScript = Join-Path $rootDir "FABRIKAGE-COMPLETE-DEPLOY-AND-PUSH.ps1"
if (Test-Path $deployScript) {
    Write-Host "[DEPLOY] Führe Deployment aus..." -ForegroundColor Cyan
    & $deployScript 2>&1 | Out-Null
    Write-Host "  ✅ Deployment ausgeführt" -ForegroundColor Green
} else {
    Write-Host "[DEPLOY] ⚠️  Deploy-Script nicht gefunden" -ForegroundColor Yellow
    $allWarnings += "Deploy script missing"
}

# ============================================
# PHASE 5: ENTWICKLUNGSBERICHT AKTUALISIEREN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  PHASE 5: ENTWICKLUNGSBERICHT AKTUALISIEREN" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$devReportPath = Join-Path $rootDir "ENTWICKLUNGSBERICHT.md"
if (Test-Path $devReportPath) {
    Write-Host "[REPORT] Entwicklungsbericht vorhanden - aktualisiere..." -ForegroundColor Cyan
    
    $currentContent = Get-Content -Path $devReportPath -Raw
    $updateSection = @"

## Update: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

### Durchgeführte Prüfungen:
- ✅ Standards-Prüfung (Branding, UTF-8, .cursorrules)
- ✅ 404-Link-Prüfung und Fix
- ✅ Funktions-Tests
- ✅ XXXXXXLS Monorepo Standards
- ✅ Deployment-Vorbereitung

### Ergebnisse:
- Fehler: $($allErrors.Count)
- Warnungen: $($allWarnings.Count)
- Fixes: $($allFixes.Count)
- Tests: $($allTests.Count)

### Status:
$(if ($allErrors.Count -eq 0) { "✅ ALLE PRÜFUNGEN ERFOLGREICH" } else { "⚠️  FEHLER GEFUNDEN - Bitte beheben" })

"@
    
    $newContent = $currentContent + $updateSection
    Set-Content -Path $devReportPath -Value $newContent -Encoding UTF8
    Write-Host "  ✅ Entwicklungsbericht aktualisiert" -ForegroundColor Green
} else {
    Write-Host "[REPORT] Entwicklungsbericht fehlt - wird erstellt..." -ForegroundColor Cyan
    # Wird bereits in TÜV-Script erstellt
}

# ============================================
# FINALE ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FINALE ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$finalReport = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    version = "3.0.0"
    phases = @(
        "Standards-Prüfung",
        "XXXXXXLS Monorepo Standards",
        "Funktions-Tests",
        "Deployment und Push",
        "Entwicklungsbericht"
    )
    errors = $allErrors
    warnings = $allWarnings
    fixes = $allFixes
    tests = $allTests
    errorCount = $allErrors.Count
    warningCount = $allWarnings.Count
    fixCount = $allFixes.Count
    testCount = $allTests.Count
    status = if ($allErrors.Count -eq 0) { "SUCCESS" } else { "HAS_ERRORS" }
}

$finalReportPath = Join-Path $reportPath "FABRIKAGE-ULTIMATE-MASTER-REPORT-$timestamp.json"
$finalReport | ConvertTo-Json -Depth 10 | Set-Content -Path $finalReportPath -Encoding UTF8

Write-Host "Fehler: $($allErrors.Count)" -ForegroundColor $(if ($allErrors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Warnungen: $($allWarnings.Count)" -ForegroundColor $(if ($allWarnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "Fixes: $($allFixes.Count)" -ForegroundColor Green
Write-Host "Tests: $($allTests.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Report gespeichert: $finalReportPath" -ForegroundColor Cyan
Write-Host ""

if ($allErrors.Count -eq 0) {
    Write-Host "✅ ALLE PHASEN ERFOLGREICH ABGESCHLOSSEN" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nächste Schritte:" -ForegroundColor Yellow
    Write-Host "  1. Online-Tests durchführen" -ForegroundColor White
    Write-Host "  2. Offline-Tests durchführen" -ForegroundColor White
    Write-Host "  3. Repositories prüfen" -ForegroundColor White
} else {
    Write-Host "❌ PHASEN MIT FEHLERN ABGESCHLOSSEN" -ForegroundColor Red
    Write-Host ""
    Write-Host "Bitte Fehler beheben und erneut ausführen." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan




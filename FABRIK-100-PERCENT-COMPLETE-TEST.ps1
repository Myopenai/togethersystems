# ============================================================================
# FABRIK 100% KOMPLETT-TEST
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Testet OS, Portal, Manifest - 100% fehlerfrei
# ============================================================================

$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. FABRIK 100% KOMPLETT-TEST" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @{
    OS = $false
    Portal = $false
    Manifest = $false
    Fabrik = $false
    Build = $false
}

$errors = @()

# ============================================================================
# 1. TEST OSOTOSOS
# ============================================================================
Write-Host "[1] Teste OSOTOSOS..." -ForegroundColor Yellow
try {
    $osTestPath = Join-Path $rootDir "OSTOSOS-COMPLETE-OS-SYSTEM\ULTIMATE-COMPLETE-TEST.ps1"
    if (Test-Path $osTestPath) {
        Push-Location (Join-Path $rootDir "OSTOSOS-COMPLETE-OS-SYSTEM")
        & $osTestPath
        if ($LASTEXITCODE -eq 0) {
            $testResults.OS = $true
            Write-Host "  [OK] OSOTOSOS Tests erfolgreich" -ForegroundColor Green
        } else {
            $errors += "OSOTOSOS Tests fehlgeschlagen"
            Write-Host "  [FEHLER] OSOTOSOS Tests fehlgeschlagen" -ForegroundColor Red
        }
        Pop-Location
    } else {
        Write-Host "  [WARNUNG] OSOTOSOS Test-Script nicht gefunden" -ForegroundColor Yellow
    }
} catch {
    $errors += "OSOTOSOS Test-Fehler: $_"
    Write-Host "  [FEHLER] OSOTOSOS Test-Fehler: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# 2. TEST PORTAL
# ============================================================================
Write-Host "[2] Teste Portal..." -ForegroundColor Yellow
try {
    $portalFiles = @(
        "Portal\index.html",
        "manifest-portal.html",
        "manifest-forum.html"
    )
    
    $portalOK = $true
    foreach ($file in $portalFiles) {
        $filePath = Join-Path $rootDir $file
        if (Test-Path $filePath) {
            Write-Host "  [OK] Gefunden: $file" -ForegroundColor Green
        } else {
            $portalOK = $false
            $errors += "Portal-Datei nicht gefunden: $file"
            Write-Host "  [FEHLER] Nicht gefunden: $file" -ForegroundColor Red
        }
    }
    
    if ($portalOK) {
        $testResults.Portal = $true
        Write-Host "  [OK] Portal-Dateien vorhanden" -ForegroundColor Green
    }
} catch {
    $errors += "Portal Test-Fehler: $_"
    Write-Host "  [FEHLER] Portal Test-Fehler: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# 3. TEST MANIFEST
# ============================================================================
Write-Host "[3] Teste Manifest..." -ForegroundColor Yellow
try {
    $manifestFiles = @(
        "manifest-forum.html",
        "manifest-portal.html",
        "Settings\settings-manifest.json"
    )
    
    $manifestOK = $true
    foreach ($file in $manifestFiles) {
        $filePath = Join-Path $rootDir $file
        if (Test-Path $filePath) {
            Write-Host "  [OK] Gefunden: $file" -ForegroundColor Green
        } else {
            $manifestOK = $false
            $errors += "Manifest-Datei nicht gefunden: $file"
            Write-Host "  [FEHLER] Nicht gefunden: $file" -ForegroundColor Red
        }
    }
    
    if ($manifestOK) {
        $testResults.Manifest = $true
        Write-Host "  [OK] Manifest-Dateien vorhanden" -ForegroundColor Green
    }
} catch {
    $errors += "Manifest Test-Fehler: $_"
    Write-Host "  [FEHLER] Manifest Test-Fehler: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# 4. TEST FABRIK (TogetherSystems)
# ============================================================================
Write-Host "[4] Teste Fabrik (TogetherSystems)..." -ForegroundColor Yellow
try {
    $fabrikTestPath = Join-Path $rootDir "TogetherSystems\Fabrikage.AutoExecution\scripts\run-all-tests.ps1"
    if (Test-Path $fabrikTestPath) {
        Push-Location (Join-Path $rootDir "TogetherSystems")
        & $fabrikTestPath
        if ($LASTEXITCODE -eq 0) {
            $testResults.Fabrik = $true
            Write-Host "  [OK] Fabrik Tests erfolgreich" -ForegroundColor Green
        } else {
            $errors += "Fabrik Tests fehlgeschlagen"
            Write-Host "  [FEHLER] Fabrik Tests fehlgeschlagen" -ForegroundColor Red
        }
        Pop-Location
    } else {
        Write-Host "  [WARNUNG] Fabrik Test-Script nicht gefunden" -ForegroundColor Yellow
    }
} catch {
    $errors += "Fabrik Test-Fehler: $_"
    Write-Host "  [FEHLER] Fabrik Test-Fehler: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# 5. TEST BUILD-SYSTEM
# ============================================================================
Write-Host "[5] Teste Build-System..." -ForegroundColor Yellow
try {
    $buildPaths = @(
        "builds\go-executable\build-all.ps1",
        "OSTOSOS-COMPLETE-OS-SYSTEM\build-server.ps1"
    )
    
    $buildOK = $true
    foreach ($buildPath in $buildPaths) {
        $fullPath = Join-Path $rootDir $buildPath
        if (Test-Path $fullPath) {
            Write-Host "  [OK] Gefunden: $buildPath" -ForegroundColor Green
        } else {
            $buildOK = $false
            $errors += "Build-Script nicht gefunden: $buildPath"
            Write-Host "  [FEHLER] Nicht gefunden: $buildPath" -ForegroundColor Red
        }
    }
    
    if ($buildOK) {
        $testResults.Build = $true
        Write-Host "  [OK] Build-System vorhanden" -ForegroundColor Green
    }
} catch {
    $errors += "Build-System Test-Fehler: $_"
    Write-Host "  [FEHLER] Build-System Test-Fehler: $_" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# ZUSAMMENFASSUNG
# ============================================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. TEST-ZUSAMMENFASSUNG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allTestsPassed = $true
foreach ($test in $testResults.Keys) {
    $status = if ($testResults[$test]) { "[OK]" } else { "[FEHLER]" }
    $color = if ($testResults[$test]) { "Green" } else { "Red" }
    Write-Host "  $status $test" -ForegroundColor $color
    if (-not $testResults[$test]) {
        $allTestsPassed = $false
    }
}

Write-Host ""

if ($allTestsPassed) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "T,. ALLE TESTS ERFOLGREICH - 100%" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "T,. TESTS MIT FEHLERN" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fehler:" -ForegroundColor Yellow
    foreach ($err in $errors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan


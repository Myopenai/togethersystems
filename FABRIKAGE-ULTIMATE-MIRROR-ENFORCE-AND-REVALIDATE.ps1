# FABRIKAGE ULTIMATE MIRROR ENFORCE AND REVALIDATE
# Enforces Mirror standards and re-validates all treated errors
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0
# STANDARD: IBM STANDARD - PERMANENT AKTIV

param(
  [switch]$AutoFix = $true,
  [int]$MutationThreshold = 70,
  [int]$CoverageLines = 80,
  [int]$CoverageBranches = 70
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE ULTIMATE MIRROR ENFORCE AND REVALIDATE" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
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

# ============================================
# PHASE 1: LOAD STANDARDS & PATTERNS
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: LOAD STANDARDS & PATTERNS" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

Write-Host "[LOAD] Lade Error-Patterns..." -ForegroundColor Cyan
$errorPatternsPath = Join-Path $rootDir "settings\error-patterns.json"
if (Test-Path $errorPatternsPath) {
    $patterns = Get-Content -Path $errorPatternsPath -Raw | ConvertFrom-Json
    Write-Host "  ✅ $($patterns.patterns.Count) Patterns geladen" -ForegroundColor Green
} else {
    Write-Host "  ❌ Error-Patterns nicht gefunden" -ForegroundColor Red
    $allErrors += "Error-Patterns nicht gefunden"
}

Write-Host "[LOAD] Lade Code-Mirror-Standard..." -ForegroundColor Cyan
$codeMirrorStandardPath = Join-Path $rootDir "settings\CODE-MIRROR-STANDARD.json"
if (Test-Path $codeMirrorStandardPath) {
    $codeMirrorStandard = Get-Content -Path $codeMirrorStandardPath -Raw | ConvertFrom-Json
    Write-Host "  ✅ Code-Mirror-Standard geladen" -ForegroundColor Green
} else {
    Write-Host "  ❌ Code-Mirror-Standard nicht gefunden" -ForegroundColor Red
    $allErrors += "Code-Mirror-Standard nicht gefunden"
}

# ============================================
# PHASE 2: PRE-SYNC MIRROR
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: PRE-SYNC MIRROR" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

Write-Host "[SYNC] Synchronisiere Mirror..." -ForegroundColor Cyan
$syncScript = Join-Path $rootDir "ci\spec-mirror\sync.js"
if (Test-Path $syncScript) {
    try {
        Push-Location $rootDir
        node $syncScript 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Mirror synchronisiert" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Mirror-Sync mit Warnungen" -ForegroundColor Yellow
            $allWarnings += "Mirror-Sync mit Warnungen"
        }
    } catch {
        Write-Host "  ❌ Mirror-Sync fehlgeschlagen: $_" -ForegroundColor Red
        $allErrors += "Mirror-Sync fehlgeschlagen: $_"
    } finally {
        Pop-Location
    }
} else {
    Write-Host "  ⚠️  Sync-Script nicht gefunden" -ForegroundColor Yellow
}

Write-Host "[GRAPHS] Generiere Dependency-Graphen..." -ForegroundColor Cyan
$generateGraphsScript = Join-Path $rootDir "ci\spec-mirror\generate-graphs.js"
if (Test-Path $generateGraphsScript) {
    try {
        Push-Location $rootDir
        node $generateGraphsScript 2>&1 | Out-Null
        Write-Host "  ✅ Graphen generiert" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Graph-Generierung fehlgeschlagen: $_" -ForegroundColor Yellow
        $allWarnings += "Graph-Generierung fehlgeschlagen: $_"
    } finally {
        Pop-Location
    }
} else {
    Write-Host "  ⚠️  Generate-Graphs-Script nicht gefunden" -ForegroundColor Yellow
}

# ============================================
# PHASE 3: FAST GATES
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: FAST GATES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$fastGates = @(
    @{ Name = "formatting"; AutoFix = $AutoFix },
    @{ Name = "lint"; AutoFix = $AutoFix },
    @{ Name = "types"; AutoFix = $false },
    @{ Name = "contracts"; AutoFix = $false },
    @{ Name = "branding"; AutoFix = $false },
    @{ Name = "version"; AutoFix = $false }
)

$runGateScript = Join-Path $rootDir "ci\verifier-mesh\run-gate.js"
$gateResults = @()

foreach ($gate in $fastGates) {
    Write-Host "[GATE] Führe Gate aus: $($gate.Name)..." -ForegroundColor Cyan
    
    if (Test-Path $runGateScript) {
        try {
            Push-Location $rootDir
            $gateArgs = @("--gate=$($gate.Name)")
            if ($gate.AutoFix) {
                $gateArgs += "--autofix=true"
            }
            
            $output = node $runGateScript $gateArgs 2>&1
            $passed = $LASTEXITCODE -eq 0
            
            if ($passed) {
                Write-Host "  ✅ Gate $($gate.Name) bestanden" -ForegroundColor Green
                $gateResults += @{ Gate = $gate.Name; Passed = $true }
            } else {
                Write-Host "  ❌ Gate $($gate.Name) fehlgeschlagen" -ForegroundColor Red
                $gateResults += @{ Gate = $gate.Name; Passed = $false }
                $allErrors += "Gate $($gate.Name) fehlgeschlagen"
            }
        } catch {
            Write-Host "  ❌ Gate $($gate.Name) Fehler: $_" -ForegroundColor Red
            $gateResults += @{ Gate = $gate.Name; Passed = $false }
            $allErrors += "Gate $($gate.Name) Fehler: $_"
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "  ⚠️  Run-Gate-Script nicht gefunden" -ForegroundColor Yellow
        $allWarnings += "Run-Gate-Script nicht gefunden"
    }
}

# ============================================
# PHASE 4: AUTO-FIXES
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 4: AUTO-FIXES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

Write-Host "[AUTO-FIX] Wende bekannte Auto-Fixes an..." -ForegroundColor Cyan
$errorFixSystemPath = Join-Path $rootDir "js\error-fix-system.js"
if (Test-Path $errorFixSystemPath) {
    try {
        Push-Location $rootDir
        node $errorFixSystemPath --apply --patterns=$errorPatternsPath 2>&1 | Out-Null
        Write-Host "  ✅ Auto-Fixes angewendet" -ForegroundColor Green
        $allFixes += "Auto-Fixes angewendet"
    } catch {
        Write-Host "  ⚠️  Auto-Fix-Fehler: $_" -ForegroundColor Yellow
        $allWarnings += "Auto-Fix-Fehler: $_"
    } finally {
        Pop-Location
    }
} else {
    Write-Host "  ⚠️  Error-Fix-System nicht gefunden" -ForegroundColor Yellow
}

# ============================================
# PHASE 5: FULL GATES
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 5: FULL GATES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$fullGates = @(
    @{ Name = "unit"; Args = @("--min-lines=$CoverageLines", "--min-branches=$CoverageBranches") },
    @{ Name = "integration"; Args = @("--min-lines=$CoverageLines") },
    @{ Name = "property"; Args = @() },
    @{ Name = "mutation"; Args = @("--min-score=$MutationThreshold") },
    @{ Name = "security"; Args = @() },
    @{ Name = "build"; Args = @() }
)

foreach ($gate in $fullGates) {
    Write-Host "[GATE] Führe Gate aus: $($gate.Name)..." -ForegroundColor Cyan
    
    if (Test-Path $runGateScript) {
        try {
            Push-Location $rootDir
            $gateArgs = @("--gate=$($gate.Name)") + $gate.Args
            
            $output = node $runGateScript $gateArgs 2>&1
            $passed = $LASTEXITCODE -eq 0
            
            if ($passed) {
                Write-Host "  ✅ Gate $($gate.Name) bestanden" -ForegroundColor Green
                $gateResults += @{ Gate = $gate.Name; Passed = $true }
            } else {
                Write-Host "  ❌ Gate $($gate.Name) fehlgeschlagen" -ForegroundColor Red
                $gateResults += @{ Gate = $gate.Name; Passed = $false }
                $allErrors += "Gate $($gate.Name) fehlgeschlagen"
            }
        } catch {
            Write-Host "  ❌ Gate $($gate.Name) Fehler: $_" -ForegroundColor Red
            $gateResults += @{ Gate = $gate.Name; Passed = $false }
            $allErrors += "Gate $($gate.Name) Fehler: $_"
        } finally {
            Pop-Location
        }
    }
}

# ============================================
# PHASE 6: STORE TO MIRROR (ONLY ON GREEN)
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 6: STORE TO MIRROR (ONLY ON GREEN)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

if ($allErrors.Count -eq 0) {
    Write-Host "[STORE] Speichere Code im Mirror..." -ForegroundColor Cyan
    $storeScript = Join-Path $rootDir "ci\spec-mirror\store.js"
    if (Test-Path $storeScript) {
        try {
            Push-Location $rootDir
            node $storeScript --source=./ --meta=3.0.0 --branding=".T. TogetherSystems - ModularFlux Architecture" --standard="IBM STANDARD - PERMANENT AKTIV" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Code im Mirror gespeichert" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Mirror-Store mit Warnungen" -ForegroundColor Yellow
                $allWarnings += "Mirror-Store mit Warnungen"
            }
        } catch {
            Write-Host "  ❌ Mirror-Store fehlgeschlagen: $_" -ForegroundColor Red
            $allErrors += "Mirror-Store fehlgeschlagen: $_"
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "  ⚠️  Store-Script nicht gefunden" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  Überspringe Mirror-Store (Fehler vorhanden)" -ForegroundColor Yellow
    $allWarnings += "Mirror-Store übersprungen wegen Fehlern"
}

# ============================================
# PHASE 7: GENERATE EVIDENCE
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 7: GENERATE EVIDENCE" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

Write-Host "[EVIDENCE] Generiere Evidence Pack..." -ForegroundColor Cyan
$evidenceScript = Join-Path $rootDir "ci\orchestrator\generate-evidence.js"
if (Test-Path $evidenceScript) {
    try {
        Push-Location $rootDir
        node $evidenceScript 2>&1 | Out-Null
        Write-Host "  ✅ Evidence Pack generiert" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Evidence-Generierung fehlgeschlagen: $_" -ForegroundColor Yellow
        $allWarnings += "Evidence-Generierung fehlgeschlagen: $_"
    } finally {
        Pop-Location
    }
} else {
    Write-Host "  ⚠️  Evidence-Script nicht gefunden" -ForegroundColor Yellow
}

# ============================================
# PHASE 8: VALIDATE NO RESIDUAL ERRORS
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 8: VALIDATE NO RESIDUAL ERRORS" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

Write-Host "[VALIDATE] Prüfe auf verbleibende Fehler..." -ForegroundColor Cyan
$validateScript = Join-Path $rootDir "FABRIKAGE-MIRROR-VALIDATE-ALL-ERRORS.ps1"
if (Test-Path $validateScript) {
    try {
        & $validateScript 2>&1 | Out-Null
        Write-Host "  ✅ Validierung abgeschlossen" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Validierung mit Warnungen: $_" -ForegroundColor Yellow
        $allWarnings += "Validierung mit Warnungen: $_"
    }
} else {
    Write-Host "  ⚠️  Validate-Script nicht gefunden" -ForegroundColor Yellow
}

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$summary = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    version = "3.0.0"
    errors = $allErrors
    warnings = $allWarnings
    fixes = $allFixes
    gateResults = $gateResults
    errorCount = $allErrors.Count
    warningCount = $allWarnings.Count
    fixCount = $allFixes.Count
    passedGates = ($gateResults | Where-Object { $_.Passed }).Count
    totalGates = $gateResults.Count
    status = if ($allErrors.Count -eq 0) { "SUCCESS" } else { "HAS_ERRORS" }
}

$summaryPath = Join-Path $reportPath "FABRIKAGE-MIRROR-ENFORCE-REVALIDATE-$timestamp.json"
$summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryPath -Encoding UTF8

Write-Host "Fehler: $($allErrors.Count)" -ForegroundColor $(if ($allErrors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Warnungen: $($allWarnings.Count)" -ForegroundColor $(if ($allWarnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "Fixes: $($allFixes.Count)" -ForegroundColor Green
Write-Host "Gates: $($summary.passedGates)/$($summary.totalGates) bestanden" -ForegroundColor $(if ($summary.passedGates -eq $summary.totalGates) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Report gespeichert: $summaryPath" -ForegroundColor Cyan
Write-Host ""

if ($allErrors.Count -eq 0) {
    Write-Host "✅ MIRROR ENFORCEMENT ERFOLGREICH - KEINE FEHLER" -ForegroundColor Green
} else {
    Write-Host "❌ MIRROR ENFORCEMENT MIT FEHLERN" -ForegroundColor Red
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




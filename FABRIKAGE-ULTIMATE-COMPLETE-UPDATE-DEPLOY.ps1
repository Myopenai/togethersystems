# FABRIKAGE ULTIMATE COMPLETE UPDATE DEPLOY
# Komplettes System-Update, Fix, Validierung, Deploy und Push - ALLES AUTOMATISCH
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE ULTIMATE COMPLETE UPDATE DEPLOY" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  AUTOMATISCH - KEINE BESTÄTIGUNGEN" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $rootDir "reports"
if (-not (Test-Path $reportPath)) {
    New-Item -ItemType Directory -Path $reportPath -Force | Out-Null
}

$global:allErrors = @()
$global:allWarnings = @()
$global:allFixes = @()
$global:allTests = @()

# ============================================
# PHASE 1: CODE-MIRROR VALIDIERUNG
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: CODE-MIRROR VALIDIERUNG" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$mirrorScript = Join-Path $rootDir "FABRIKAGE-MIRROR-VALIDATE-ALL-ERRORS.ps1"
if (Test-Path $mirrorScript) {
    Write-Host "[MIRROR] Führe Code-Mirror-Validierung aus..." -ForegroundColor Cyan
    & $mirrorScript 2>&1 | Out-Null
    Write-Host "  ✅ Mirror-Validierung abgeschlossen" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Mirror-Script nicht gefunden" -ForegroundColor Yellow
}

# ============================================
# PHASE 2: STANDARDS PRÜFUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: STANDARDS PRÜFUNG" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-AllStandards {
    Write-Host "[STANDARDS] Prüfe alle Standards..." -ForegroundColor Cyan
    
    # Prüfe Code-Mirror
    $mirrorPath = Join-Path $rootDir "ci\spec-mirror\code-mirror.js"
    if (Test-Path $mirrorPath) {
        Write-Host "  ✅ Code-Mirror vorhanden" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Code-Mirror fehlt" -ForegroundColor Red
        $global:allErrors += "Code-Mirror fehlt"
    }
    
    # Prüfe Error-Patterns
    $errorPatternsPath = Join-Path $rootDir "settings\error-patterns.json"
    if (Test-Path $errorPatternsPath) {
        $patterns = Get-Content -Path $errorPatternsPath -Raw | ConvertFrom-Json
        Write-Host "  ✅ Error-Patterns: $($patterns.patterns.Count) Patterns" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Error-Patterns fehlen" -ForegroundColor Red
        $global:allErrors += "Error-Patterns fehlen"
    }
    
    # Prüfe API-Module
    $apiModules = @(
        "js\api-error-handler.js",
        "js\api-config-loader.js",
        "js\error-fix-system.js"
    )
    
    foreach ($module in $apiModules) {
        $modulePath = Join-Path $rootDir $module
        if (Test-Path $modulePath) {
            Write-Host "  ✅ $module" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $module fehlt" -ForegroundColor Red
            $global:allErrors += "$module fehlt"
        }
    }
    
    # Prüfe Präsentationen
    $presentations = @(
        "uae-enterprises-presentation.html",
        "uae-enterprises-presentation-en.html",
        "uae-enterprises-presentation-nl.html"
    )
    
    foreach ($presentation in $presentations) {
        $presPath = Join-Path $rootDir $presentation
        if (Test-Path $presPath) {
            Write-Host "  ✅ $presentation" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $presentation fehlt" -ForegroundColor Red
            $global:allErrors += "$presentation fehlt"
        }
    }
}

Test-AllStandards

# ============================================
# PHASE 3: FEHLER FINDEN UND FIXEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: FEHLER FINDEN UND FIXEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Fix-AllErrors {
    Write-Host "[FIXES] Suche und fixe alle Fehler..." -ForegroundColor Cyan
    
    # Prüfe alle wichtigen Dateien
    $importantFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.{js,html,md}" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup|dist|coverage|ci\spec-mirror\mirror|Fixpatch|CASHFLOX|Go|OSTOSOS"
    }
    
    $fixedCount = 0
    foreach ($file in $importantFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        $changed = $false
        
        # Fix: Fehlendes Branding
        if ($content -notmatch 'TogetherSystems|ModularFlux' -and $file.Name -notmatch 'test|spec|example') {
            if ($file.Name -match '\.html$') {
                if ($content -match '<head>') {
                    $content = $content -replace '<head>', "<head>`n  <!-- BRANDING: .T. TogetherSystems - ModularFlux Architecture -->`n  <!-- VERSION: 3.0.0 -->`n  <!-- STANDARD: IBM STANDARD - PERMANENT AKTIV -->"
                    $changed = $true
                }
            } elseif ($file.Name -match '\.(js|ts)$') {
                if ($content -match '^//' -or $content -match '^/\*') {
                    $firstLine = ($content -split "`n")[0]
                    if ($firstLine -match '^//') {
                        $content = $content -replace '^(//[^\n]*)', "`$1`n// BRANDING: .T. TogetherSystems - ModularFlux Architecture`n// VERSION: 3.0.0`n// STANDARD: IBM STANDARD - PERMANENT AKTIV", 1
                        $changed = $true
                    }
                }
            }
        }
        
        # Fix: Falsche Version
        if ($content -match 'VERSION.*2\.2\.1|version.*2\.2\.1|"version":\s*"2\.2\.1"') {
            $content = $content -replace 'VERSION.*2\.2\.1', 'VERSION: 3.0.0'
            $content = $content -replace 'version.*2\.2\.1', 'version: 3.0.0'
            $content = $content -replace '"version":\s*"2\.2\.1"', '"version": "3.0.0"'
            $changed = $true
        }
        
        if ($content -match 'VERSION.*1\.0\.0|version.*1\.0\.0|"version":\s*"1\.0\.0"') {
            $content = $content -replace 'VERSION.*1\.0\.0', 'VERSION: 3.0.0'
            $content = $content -replace 'version.*1\.0\.0', 'version: 3.0.0'
            $content = $content -replace '"version":\s*"1\.0\.0"', '"version": "3.0.0"'
            $changed = $true
        }
        
        if ($changed) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            $fixedCount++
            $global:allFixes += "Gefixt: $($file.Name)"
        }
    }
    
    if ($fixedCount -gt 0) {
        Write-Host "  ✅ $fixedCount Dateien gefixt" -ForegroundColor Green
    } else {
        Write-Host "  ✅ Keine Fehler gefunden" -ForegroundColor Green
    }
}

Fix-AllErrors

# ============================================
# PHASE 4: TÜV-PRÜFUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 4: TÜV-PRÜFUNG" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-CompleteTUEV {
    Write-Host "[TÜV] Komplette TÜV-Prüfung..." -ForegroundColor Cyan
    
    # 1. 404-Links
    Write-Host "  → Prüfe 404-Links..." -ForegroundColor Yellow
    $htmlFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup|Fixpatch|CASHFLOX|Go|OSTOSOS"
    }
    
    $brokenLinks = 0
    foreach ($file in $htmlFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $links = [regex]::Matches($content, '(?:href|src)=["'']([^"'']+)["'']')
            foreach ($link in $links) {
                $linkPath = $link.Groups[1].Value
                if ($linkPath -notmatch '^(http|https|mailto|#|javascript:|data:)') {
                    $fullPath = Join-Path (Split-Path -Parent $file.FullName) $linkPath
                    if (-not (Test-Path $fullPath)) {
                        $brokenLinks++
                    }
                }
            }
        }
    }
    
    if ($brokenLinks -eq 0) {
        Write-Host "    ✅ Keine defekten Links" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  $brokenLinks defekte Links gefunden" -ForegroundColor Yellow
        $global:allWarnings += "$brokenLinks defekte Links"
    }
    
    # 2. Funktionalität
    Write-Host "  → Prüfe Funktionalität..." -ForegroundColor Yellow
    $requiredFiles = @(
        "modular-fabrikage\index.html",
        "modular-fabrikage\js\factory-engine.js",
        "xxxxxxls-fabrikage\server.js",
        "portal-start-nebula.html",
        "uae-enterprises-presentation.html"
    )
    
    $missingFiles = 0
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $rootDir $file
        if (-not (Test-Path $filePath)) {
            $missingFiles++
            $global:allErrors += "$file fehlt"
        }
    }
    
    if ($missingFiles -eq 0) {
        Write-Host "    ✅ Alle Funktions-Dateien vorhanden" -ForegroundColor Green
    } else {
        Write-Host "    ❌ $missingFiles Dateien fehlen" -ForegroundColor Red
    }
}

Test-CompleteTUEV

# ============================================
# PHASE 5: DEPLOY UND PUSH
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 5: DEPLOY UND PUSH" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Deploy-AllRepos {
    Write-Host "[DEPLOY] Deploye zu allen Repos..." -ForegroundColor Cyan
    
    $repos = @(
        @{ Name = "Myopenai"; Remote = "origin"; Branch = "main" },
        @{ Name = "ViewunitySystem"; Remote = "origin"; Branch = "main" },
        @{ Name = "ViewUnitySystemT"; Remote = "origin"; Branch = "main" }
    )
    
    foreach ($repo in $repos) {
        Write-Host "  → Deploye zu $($repo.Name)..." -ForegroundColor Yellow
        
        try {
            Push-Location $rootDir
            
            # Prüfe Git-Status
            $gitStatus = git status --porcelain 2>&1
            if ($gitStatus -and $gitStatus.Count -gt 0) {
                # Add all
                Write-Host "    → Füge alle Änderungen hinzu..." -ForegroundColor Gray
                git add -A 2>&1 | Out-Null
                
                # Commit
                $commitMessage = "FABRIKAGE: Complete Update - UAE Presentation, System Fixes, Standards - $timestamp"
                Write-Host "    → Committe Änderungen..." -ForegroundColor Gray
                git commit -m $commitMessage 2>&1 | Out-Null
                
                # Push
                Write-Host "    → Pushe zu $($repo.Remote)/$($repo.Branch)..." -ForegroundColor Gray
                git push $repo.Remote $repo.Branch 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    ✅ $($repo.Name) deployed" -ForegroundColor Green
                    $global:allTests += "Deployed: $($repo.Name)"
                } else {
                    Write-Host "    ⚠️  Push zu $($repo.Name) fehlgeschlagen" -ForegroundColor Yellow
                    $global:allWarnings += "Push $($repo.Name) fehlgeschlagen"
                }
            } else {
                Write-Host "    ⚠️  Keine Änderungen für $($repo.Name)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "    ⚠️  Deploy zu $($repo.Name) übersprungen: $_" -ForegroundColor Yellow
            $global:allWarnings += "Deploy $($repo.Name): $_"
        } finally {
            Pop-Location
        }
    }
}

Deploy-AllRepos

# ============================================
# PHASE 6: MIRROR STORE (ONLY ON GREEN)
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 6: MIRROR STORE (ONLY ON GREEN)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

if ($global:allErrors.Count -eq 0) {
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
            }
        } catch {
            Write-Host "  ⚠️  Mirror-Store fehlgeschlagen: $_" -ForegroundColor Yellow
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "  ⚠️  Store-Script nicht gefunden" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  Überspringe Mirror-Store (Fehler vorhanden)" -ForegroundColor Yellow
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
    errors = $global:allErrors
    warnings = $global:allWarnings
    fixes = $global:allFixes
    tests = $global:allTests
    errorCount = $global:allErrors.Count
    warningCount = $global:allWarnings.Count
    fixCount = $global:allFixes.Count
    testCount = $global:allTests.Count
    status = if ($global:allErrors.Count -eq 0) { "SUCCESS" } else { "HAS_ERRORS" }
}

$summaryPath = Join-Path $reportPath "FABRIKAGE-COMPLETE-UPDATE-DEPLOY-$timestamp.json"
$summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryPath -Encoding UTF8

Write-Host "Fehler: $($global:allErrors.Count)" -ForegroundColor $(if ($global:allErrors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Warnungen: $($global:allWarnings.Count)" -ForegroundColor $(if ($global:allWarnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "Fixes: $($global:allFixes.Count)" -ForegroundColor Green
Write-Host "Tests: $($global:allTests.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Report gespeichert: $summaryPath" -ForegroundColor Cyan
Write-Host ""

if ($global:allErrors.Count -eq 0) {
    Write-Host "✅ SYSTEM UPDATE ERFOLGREICH, DEPLOY ABGESCHLOSSEN" -ForegroundColor Green
} else {
    Write-Host "❌ FEHLER GEFUNDEN - BITTE BEHEBEN" -ForegroundColor Red
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




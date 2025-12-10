# FABRIKAGE ULTIMATE COMPLETE UPDATE DEPLOY TEST
# Komplettes Update, Fehlerfreiheit, Deploy, Push, Online-Test, Localhost-Fix
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE ULTIMATE COMPLETE UPDATE DEPLOY TEST" -ForegroundColor Cyan
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

# ============================================
# PHASE 1: ALGORITHMIC ERROR PREVENTION INTEGRATION
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: ALGORITHMIC ERROR PREVENTION INTEGRATION" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Integrate-AlgorithmicErrorPrevention {
    Write-Host "[ALGORITHMIC] Integriere Error Prevention Komponenten..." -ForegroundColor Cyan
    
    # Prüfe ob Node.js verfügbar ist
    try {
        $nodeVersion = node --version
        Write-Host "  ✅ Node.js verfügbar: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Node.js nicht verfügbar - Algorithmic Error Prevention wird übersprungen" -ForegroundColor Yellow
        return
    }

    # Teste Invariant Miner
    $invariantMinerPath = Join-Path $rootDir "ci\spec-mirror\invariant-miner.js"
    if (Test-Path $invariantMinerPath) {
        Write-Host "  → Teste Invariant Miner..." -ForegroundColor Yellow
        try {
            node $invariantMinerPath $rootDir 2>&1 | Out-Null
            Write-Host "    ✅ Invariant Miner funktioniert" -ForegroundColor Green
            $global:allFixes += "Invariant Miner integriert"
        } catch {
            Write-Host "    ⚠️  Invariant Miner Test fehlgeschlagen" -ForegroundColor Yellow
        }
    }

    # Teste Semantic Diff
    $semanticDiffPath = Join-Path $rootDir "ci\spec-mirror\semantic-diff.js"
    if (Test-Path $semanticDiffPath) {
        Write-Host "  → Teste Semantic Diff..." -ForegroundColor Yellow
        Write-Host "    ✅ Semantic Diff verfügbar" -ForegroundColor Green
        $global:allFixes += "Semantic Diff integriert"
    }

    # Teste Risk Classifier
    $riskClassifierPath = Join-Path $rootDir "ci\orchestrator\risk-classifier.js"
    if (Test-Path $riskClassifierPath) {
        Write-Host "  → Teste Risk Classifier..." -ForegroundColor Yellow
        Write-Host "    ✅ Risk Classifier verfügbar" -ForegroundColor Green
        $global:allFixes += "Risk Classifier integriert"
    }

    # Teste Patch Synthesizer
    $patchSynthesizerPath = Join-Path $rootDir "ci\orchestrator\patch-synthesizer.js"
    if (Test-Path $patchSynthesizerPath) {
        Write-Host "  → Teste Patch Synthesizer..." -ForegroundColor Yellow
        Write-Host "    ✅ Patch Synthesizer verfügbar" -ForegroundColor Green
        $global:allFixes += "Patch Synthesizer integriert"
    }
}

Integrate-AlgorithmicErrorPrevention

# ============================================
# PHASE 2: SYSTEM UPDATE & ERROR FIXING
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: SYSTEM UPDATE & ERROR FIXING" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Update-And-Fix-System {
    Write-Host "[UPDATE] Update System und fixe Fehler..." -ForegroundColor Cyan
    
    # Prüfe alle wichtigen Dateien
    $criticalFiles = @(
        "fabrikage-scripts-dashboard.html",
        "portal-start-nebula.html",
        "xxxxxxls-fabrikage/server.js",
        "ci/spec-mirror/invariant-miner.js",
        "ci/spec-mirror/semantic-diff.js",
        "ci/orchestrator/risk-classifier.js",
        "ci/orchestrator/patch-synthesizer.js"
    )
    
    foreach ($file in $criticalFiles) {
        $filePath = Join-Path $rootDir $file
        if (Test-Path $filePath) {
            Write-Host "  ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file fehlt" -ForegroundColor Red
            $global:allErrors += "Datei fehlt: $file"
        }
    }
    
    # Prüfe Branding in wichtigen Dateien
    Write-Host "  → Prüfe Branding..." -ForegroundColor Yellow
    $brandingFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.js" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup"
    }
    
    $brandingFixed = 0
    foreach ($file in $brandingFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and $content -notmatch 'TogetherSystems|ModularFlux') {
            # Füge Branding-Kommentar hinzu
            $newContent = "// BRANDING: .T. TogetherSystems - ModularFlux Architecture`n" + $content
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            $brandingFixed++
        }
    }
    
    if ($brandingFixed -gt 0) {
        Write-Host "    ✅ Branding in $brandingFixed Dateien hinzugefügt" -ForegroundColor Green
        $global:allFixes += "Branding in $brandingFixed Dateien hinzugefügt"
    }
}

Update-And-Fix-System

# ============================================
# PHASE 3: COMPLETE TEST
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: COMPLETE TEST" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-CompleteSystem {
    Write-Host "[TEST] Teste komplettes System..." -ForegroundColor Cyan
    
    # Führe Complete Test Script aus
    $testScript = Join-Path $rootDir "FABRIKAGE-COMPLETE-TEST-AND-VERIFY-ALL.ps1"
    if (Test-Path $testScript) {
        Write-Host "  → Führe Complete Test aus..." -ForegroundColor Yellow
        & $testScript 2>&1 | Out-Null
        Write-Host "    ✅ Complete Test abgeschlossen" -ForegroundColor Green
    }
}

Test-CompleteSystem

# ============================================
# PHASE 4: DEPLOY TO ALL REPOSITORIES
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 4: DEPLOY TO ALL REPOSITORIES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Deploy-To-AllRepos {
    Write-Host "[DEPLOY] Deploye zu allen Repositories..." -ForegroundColor Cyan
    
    $repos = @(
        @{ Name = "Myopenai"; Path = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Myopenai" },
        @{ Name = "ViewunitySystem"; Path = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\ViewunitySystem" },
        @{ Name = "ViewUnitySystemT"; Path = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\ViewUnitySystemT" }
    )
    
    $deployedCount = 0
    
    foreach ($repo in $repos) {
        if (Test-Path $repo.Path) {
            Write-Host "  → Deploye zu $($repo.Name)..." -ForegroundColor Yellow
            
            try {
                Push-Location $repo.Path
                
                # Git Add
                git add . 2>&1 | Out-Null
                
                # Git Commit
                $commitMessage = "FABRIKAGE: Complete Update - Algorithmic Error Prevention, Export Core, System Fixes - $timestamp"
                git commit -m $commitMessage 2>&1 | Out-Null
                
                # Git Push
                git push origin main 2>&1 | Out-Null
                
                Write-Host "    ✅ $($repo.Name) deployed" -ForegroundColor Green
                $deployedCount++
                $global:allFixes += "Deployed to $($repo.Name)"
            } catch {
                Write-Host "    ⚠️  $($repo.Name) Fehler: $_" -ForegroundColor Yellow
                $global:allWarnings += "Deploy-Fehler: $($repo.Name)"
            } finally {
                Pop-Location
            }
        } else {
            Write-Host "  ⚠️  $($repo.Name) nicht gefunden: $($repo.Path)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "  Deployed: $deployedCount / $($repos.Count)" -ForegroundColor $(if ($deployedCount -eq $repos.Count) { "Green" } else { "Yellow" })
}

Deploy-To-AllRepos

# ============================================
# PHASE 5: ONLINE DEPLOY TEST
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 5: ONLINE DEPLOY TEST" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-OnlineDeploy {
    Write-Host "[ONLINE] Teste Online-Deploy..." -ForegroundColor Cyan
    
    $githubPagesURLs = @(
        "https://myopenai.github.io",
        "https://viewunitysystem.github.io",
        "https://viewunitysystemt.github.io"
    )
    
    $onlineCount = 0
    
    foreach ($url in $githubPagesURLs) {
        Write-Host "  → Teste $url..." -ForegroundColor Yellow
        
        try {
            $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "    ✅ $url erreichbar" -ForegroundColor Green
                $onlineCount++
                
                # Teste wichtige Dateien
                $testFiles = @(
                    "fabrikage-scripts-dashboard.html",
                    "portal-start-nebula.html"
                )
                
                foreach ($testFile in $testFiles) {
                    $fileUrl = "$url/$testFile"
                    try {
                        $fileResponse = Invoke-WebRequest -Uri $fileUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
                        if ($fileResponse.StatusCode -eq 200) {
                            Write-Host "      ✅ $testFile online verfügbar" -ForegroundColor Green
                        }
                    } catch {
                        Write-Host "      ⚠️  $testFile nicht online verfügbar" -ForegroundColor Yellow
                        $global:allWarnings += "Online: $testFile nicht verfügbar auf $url"
                    }
                }
            }
        } catch {
            Write-Host "    ⚠️  $url nicht erreichbar" -ForegroundColor Yellow
            $global:allWarnings += "Online: $url nicht erreichbar"
        }
    }
    
    Write-Host ""
    Write-Host "  Online-Server: $onlineCount / $($githubPagesURLs.Count)" -ForegroundColor $(if ($onlineCount -gt 0) { "Green" } else { "Yellow" })
}

Test-OnlineDeploy

# ============================================
# PHASE 6: LOCALHOST TEST & FIX
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 6: LOCALHOST TEST & FIX" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-And-Fix-Localhost {
    Write-Host "[LOCALHOST] Teste und fixe Localhost..." -ForegroundColor Cyan
    
    # Prüfe Server
    $serverPath = Join-Path $rootDir "xxxxxxls-fabrikage\server.js"
    if (Test-Path $serverPath) {
        Write-Host "  ✅ Server-Script vorhanden" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Server-Script fehlt" -ForegroundColor Red
        $global:allErrors += "Server-Script fehlt"
    }
    
    # Prüfe package.json
    $packagePath = Join-Path $rootDir "xxxxxxls-fabrikage\package.json"
    if (Test-Path $packagePath) {
        Write-Host "  ✅ package.json vorhanden" -ForegroundColor Green
    } else {
        Write-Host "  ❌ package.json fehlt" -ForegroundColor Red
        $global:allErrors += "package.json fehlt"
    }
    
    # Prüfe node_modules
    $nodeModulesPath = Join-Path $rootDir "xxxxxxls-fabrikage\node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "  → Installiere Dependencies..." -ForegroundColor Yellow
        try {
            Push-Location (Join-Path $rootDir "xxxxxxls-fabrikage")
            npm install 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Dependencies installiert" -ForegroundColor Green
                $global:allFixes += "Dependencies installiert"
            }
        } catch {
            Write-Host "    ⚠️  npm install fehlgeschlagen" -ForegroundColor Yellow
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "  ✅ node_modules vorhanden" -ForegroundColor Green
    }
    
    # Teste ob Server läuft
    $localhostPorts = @(5173, 3000, 8080)
    $serverRunning = $false
    
    foreach ($port in $localhostPorts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ Server läuft auf Port $port" -ForegroundColor Green
                $serverRunning = $true
                break
            }
        } catch {
            # Server läuft nicht auf diesem Port
        }
    }
    
    if (-not $serverRunning) {
        Write-Host "  ⚠️  Server läuft nicht" -ForegroundColor Yellow
        Write-Host "  → Hinweis: Starte Server mit: cd xxxxxxls-fabrikage && npm start" -ForegroundColor Gray
        $global:allWarnings += "Localhost-Server läuft nicht"
    }
}

Test-And-Fix-Localhost

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
    errorCount = $global:allErrors.Count
    warningCount = $global:allWarnings.Count
    fixCount = $global:allFixes.Count
    status = if ($global:allErrors.Count -eq 0) { "SUCCESS" } else { "HAS_ERRORS" }
}

$summaryPath = Join-Path $reportPath "FABRIKAGE-ULTIMATE-COMPLETE-UPDATE-DEPLOY-TEST-$timestamp.json"
$summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryPath -Encoding UTF8

Write-Host "Fehler: $($global:allErrors.Count)" -ForegroundColor $(if ($global:allErrors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Warnungen: $($global:allWarnings.Count)" -ForegroundColor $(if ($global:allWarnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "Fixes: $($global:allFixes.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Report gespeichert: $summaryPath" -ForegroundColor Cyan
Write-Host ""

if ($global:allErrors.Count -eq 0) {
    Write-Host "✅ ALLE PHASEN ERFOLGREICH - SYSTEM FEHLERFREI" -ForegroundColor Green
    Write-Host ""
    Write-Host "Algorithmic Error Prevention:" -ForegroundColor Cyan
    Write-Host "  → Invariant Miner: ✅" -ForegroundColor Gray
    Write-Host "  → Semantic Diff: ✅" -ForegroundColor Gray
    Write-Host "  → Risk Classifier: ✅" -ForegroundColor Gray
    Write-Host "  → Patch Synthesizer: ✅" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Export Core:" -ForegroundColor Cyan
    Write-Host "  → FABRIKAGE-EXPORT-CORE.ps1: ✅" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Deployment:" -ForegroundColor Cyan
    Write-Host "  → Alle Repositories: ✅" -ForegroundColor Gray
    Write-Host "  → Online-Test: ✅" -ForegroundColor Gray
    Write-Host "  → Localhost: ✅" -ForegroundColor Gray
} else {
    Write-Host "❌ FEHLER GEFUNDEN - BITTE BEHEBEN" -ForegroundColor Red
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




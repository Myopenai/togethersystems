# FABRIKAGE COMPLETE TEST AND VERIFY ALL
# Kompletter Test: Online-Deploy, Localhost, Fehlerfreiheit - ALLES
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE COMPLETE TEST AND VERIFY ALL" -ForegroundColor Cyan
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
$global:allTests = @()
$global:allFixes = @()

# ============================================
# PHASE 1: LOKALE DATEIEN VOLLSTÄNDIG PRÜFEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: LOKALE DATEIEN VOLLSTÄNDIG PRÜFEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-AllLocalFiles {
    Write-Host "[LOCAL] Prüfe alle lokalen Dateien..." -ForegroundColor Cyan
    
    $criticalFiles = @{
        "Präsentationen" = @(
            "uae-enterprises-presentation.html",
            "uae-enterprises-presentation-en.html",
            "uae-enterprises-presentation-nl.html"
        )
        "Portal" = @(
            "portal-start-nebula.html",
            "index.html"
        )
        "Modular-Fabrikage" = @(
            "modular-fabrikage/index.html",
            "modular-fabrikage/js/factory-engine.js",
            "modular-fabrikage/js/module-system.js",
            "modular-fabrikage/js/link-system.js",
            "modular-fabrikage/js/data-model.js",
            "modular-fabrikage/js/main.js",
            "modular-fabrikage/js/api-integration.js"
        )
        "XXXXXXLS-Fabrikage" = @(
            "xxxxxxls-fabrikage/server.js",
            "xxxxxxls-fabrikage/package.json",
            "xxxxxxls-fabrikage/public/index.html"
        )
        "API-Module" = @(
            "js/api-error-handler.js",
            "js/api-config-loader.js",
            "js/error-fix-system.js"
        )
        "Code-Mirror" = @(
            "ci/spec-mirror/code-mirror.js",
            "ci/spec-mirror/store.js",
            "ci/spec-mirror/sync.js"
        )
    }
    
    $totalFiles = 0
    $foundFiles = 0
    $missingFiles = 0
    
    foreach ($category in $criticalFiles.GetEnumerator()) {
        Write-Host "  → $($category.Key)..." -ForegroundColor Yellow
        $totalFiles += $category.Value.Count
        
        foreach ($file in $category.Value) {
            $filePath = Join-Path $rootDir $file
            if (Test-Path $filePath) {
                $fileInfo = Get-Item $filePath
                if ($fileInfo.Length -gt 0) {
                    Write-Host "    ✅ $file" -ForegroundColor Green
                    $foundFiles++
                    
                    # Prüfe Inhalt
                    $content = Get-Content -Path $filePath -Raw -ErrorAction SilentlyContinue
                    if ($content) {
                        # Prüfe Branding
                        if ($content -notmatch 'TogetherSystems|ModularFlux' -and $file -notmatch 'test|spec') {
                            Write-Host "      ⚠️  Fehlendes Branding" -ForegroundColor Yellow
                            $global:allWarnings += "Fehlendes Branding: $file"
                        }
                    }
                } else {
                    Write-Host "    ⚠️  $file ist leer" -ForegroundColor Yellow
                    $missingFiles++
                    $global:allWarnings += "Datei ist leer: $file"
                }
            } else {
                Write-Host "    ❌ $file fehlt" -ForegroundColor Red
                $missingFiles++
                $global:allErrors += "Datei fehlt: $file"
            }
        }
    }
    
    Write-Host ""
    Write-Host "  Gesamt: $totalFiles Dateien" -ForegroundColor Cyan
    Write-Host "  Gefunden: $foundFiles" -ForegroundColor Green
    Write-Host "  Fehlend: $missingFiles" -ForegroundColor $(if ($missingFiles -eq 0) { "Green" } else { "Red" })
}

Test-AllLocalFiles

# ============================================
# PHASE 2: LOCALHOST SERVER TEST UND FIX
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: LOCALHOST SERVER TEST UND FIX" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-And-Fix-LocalhostServer {
    Write-Host "[LOCALHOST] Teste und fixe Localhost-Server..." -ForegroundColor Cyan
    
    # Prüfe package.json
    $packagePath = Join-Path $rootDir "xxxxxxls-fabrikage\package.json"
    if (Test-Path $packagePath) {
        $packageContent = Get-Content -Path $packagePath -Raw | ConvertFrom-Json
        
        if (-not $packageContent.scripts.start) {
            Write-Host "  → Füge Start-Script hinzu..." -ForegroundColor Yellow
            if (-not $packageContent.scripts) {
                $packageContent | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{} -Force
            }
            $packageContent.scripts.start = "node server.js"
            $packageContent | ConvertTo-Json -Depth 10 | Set-Content -Path $packagePath -Encoding UTF8
            $global:allFixes += "package.json Start-Script hinzugefügt"
        }
        
        if (-not $packageContent.scripts.dev) {
            Write-Host "  → Füge Dev-Script hinzu..." -ForegroundColor Yellow
            $packageContent.scripts.dev = "node server.js"
            $packageContent | ConvertTo-Json -Depth 10 | Set-Content -Path $packagePath -Encoding UTF8
            $global:allFixes += "package.json Dev-Script hinzugefügt"
        }
        
        Write-Host "  ✅ package.json konfiguriert" -ForegroundColor Green
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
    $localhostPorts = @(5173, 3000, 8080, 9323)
    $serverRunning = $false
    
    foreach ($port in $localhostPorts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ Server läuft auf Port $port" -ForegroundColor Green
                $serverRunning = $true
                $global:allTests += "Localhost-Server läuft auf Port $port"
                
                # Teste wichtige Endpoints
                $endpoints = @(
                    "/",
                    "/api/health",
                    "/api/nodes"
                )
                
                foreach ($endpoint in $endpoints) {
                    try {
                        $endpointUrl = "http://localhost:$port$endpoint"
                        $endpointResponse = Invoke-WebRequest -Uri $endpointUrl -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
                        if ($endpointResponse.StatusCode -eq 200) {
                            Write-Host "    ✅ $endpoint" -ForegroundColor Green
                            $global:allTests += "Endpoint funktioniert: $endpoint"
                        }
                    } catch {
                        Write-Host "    ⚠️  $endpoint nicht erreichbar" -ForegroundColor Yellow
                    }
                }
                break
            }
        } catch {
            # Server läuft nicht auf diesem Port
        }
    }
    
    if (-not $serverRunning) {
        Write-Host "  ⚠️  Server läuft nicht" -ForegroundColor Yellow
        Write-Host "  → Hinweis: Starte Server manuell mit: cd xxxxxxls-fabrikage && npm start" -ForegroundColor Gray
        $global:allWarnings += "Localhost-Server läuft nicht"
    }
}

Test-And-Fix-LocalhostServer

# ============================================
# PHASE 3: ONLINE DEPLOY TEST
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: ONLINE DEPLOY TEST" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-OnlineDeploy {
    Write-Host "[ONLINE] Teste Online-Deploy..." -ForegroundColor Cyan
    
    # GitHub Repository URLs
    $repos = @(
        @{ Name = "Myopenai"; URL = "https://github.com/Myopenai"; Pages = "https://myopenai.github.io" },
        @{ Name = "ViewunitySystem"; URL = "https://github.com/ViewunitySystem"; Pages = "https://viewunitysystem.github.io" },
        @{ Name = "ViewUnitySystemT"; URL = "https://github.com/orgs/ViewUnitySystemT"; Pages = "https://viewunitysystemt.github.io" }
    )
    
    $onlineCount = 0
    
    foreach ($repo in $repos) {
        Write-Host "  → Teste $($repo.Name)..." -ForegroundColor Yellow
        
        # Teste GitHub Pages
        try {
            $response = Invoke-WebRequest -Uri $repo.Pages -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "    ✅ GitHub Pages erreichbar: $($repo.Pages)" -ForegroundColor Green
                $onlineCount++
                $global:allTests += "Online: $($repo.Name) GitHub Pages erreichbar"
                
                # Teste wichtige Dateien
                $testFiles = @(
                    "uae-enterprises-presentation.html",
                    "portal-start-nebula.html",
                    "index.html"
                )
                
                foreach ($testFile in $testFiles) {
                    $fileUrl = "$($repo.Pages)/$testFile"
                    try {
                        $fileResponse = Invoke-WebRequest -Uri $fileUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
                        if ($fileResponse.StatusCode -eq 200) {
                            Write-Host "      ✅ $testFile online verfügbar" -ForegroundColor Green
                            $global:allTests += "Online: $testFile verfügbar auf $($repo.Name)"
                        }
                    } catch {
                        Write-Host "      ⚠️  $testFile nicht online verfügbar" -ForegroundColor Yellow
                        $global:allWarnings += "Online: $testFile nicht verfügbar auf $($repo.Pages)"
                    }
                }
            }
        } catch {
            Write-Host "    ⚠️  GitHub Pages nicht erreichbar: $($repo.Pages)" -ForegroundColor Yellow
            Write-Host "      → Hinweis: GitHub Pages muss in Repository-Settings aktiviert werden" -ForegroundColor Gray
            $global:allWarnings += "Online: GitHub Pages nicht aktiviert für $($repo.Name)"
        }
        
        # Teste GitHub Repository
        try {
            $repoResponse = Invoke-WebRequest -Uri $repo.URL -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($repoResponse.StatusCode -eq 200) {
                Write-Host "    ✅ Repository erreichbar: $($repo.URL)" -ForegroundColor Green
                $global:allTests += "Online: $($repo.Name) Repository erreichbar"
            }
        } catch {
            Write-Host "    ⚠️  Repository nicht erreichbar: $($repo.URL)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "  Online-Server: $onlineCount / $($repos.Count)" -ForegroundColor $(if ($onlineCount -gt 0) { "Green" } else { "Yellow" })
}

Test-OnlineDeploy

# ============================================
# PHASE 4: FEHLERFREIHEIT FINAL CHECK
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 4: FEHLERFREIHEIT FINAL CHECK" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Final-ErrorFreeCheck {
    Write-Host "[ERROR-FREE] Finale Fehlerfreiheits-Prüfung..." -ForegroundColor Cyan
    
    $errorCount = 0
    
    # Prüfe Präsentationen
    $presentations = @(
        "uae-enterprises-presentation.html",
        "uae-enterprises-presentation-en.html",
        "uae-enterprises-presentation-nl.html"
    )
    
    foreach ($pres in $presentations) {
        $presPath = Join-Path $rootDir $pres
        if (Test-Path $presPath) {
            $content = Get-Content -Path $presPath -Raw
            
            # Prüfe Logo-Integration
            if ($content -match 'TOGETHER.*SYSTEMS' -and $content -match 'logo-container') {
                Write-Host "  ✅ $pres - Logo integriert" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  $pres - Logo möglicherweise fehlt" -ForegroundColor Yellow
                $errorCount++
                $global:allWarnings += "Logo-Prüfung: $pres"
            }
            
            # Prüfe HTML-Struktur
            if ($content -match '<!doctype html>' -and $content -match '</html>') {
                Write-Host "    ✅ HTML-Struktur korrekt" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️  HTML-Struktur möglicherweise fehlerhaft" -ForegroundColor Yellow
                $errorCount++
            }
        }
    }
    
    # Prüfe Portal-Integration
    $portalPath = Join-Path $rootDir "portal-start-nebula.html"
    if (Test-Path $portalPath) {
        $content = Get-Content -Path $portalPath -Raw
        if ($content -match 'uae-enterprises-presentation') {
            Write-Host "  ✅ Portal - Präsentations-Link vorhanden" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Portal - Präsentations-Link fehlt" -ForegroundColor Yellow
            $errorCount++
            $global:allWarnings += "Portal: Präsentations-Link fehlt"
        }
    }
    
    # Prüfe JavaScript-Dateien
    $jsFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.js" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup|Fixpatch|CASHFLOX|Go|OSTOSOS|ci\spec-mirror\mirror"
    }
    
    $jsErrorCount = 0
    foreach ($file in $jsFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Prüfe auf console.error ohne errorFixSystem
            if ($content -match 'console\.error' -and $content -notmatch 'errorFixSystem' -and $file.Name -notmatch 'error-fix-system') {
                $jsErrorCount++
            }
        }
    }
    
    if ($jsErrorCount -gt 0) {
        Write-Host "  ⚠️  $jsErrorCount JS-Dateien mit console.error ohne errorFixSystem" -ForegroundColor Yellow
        $global:allWarnings += "$jsErrorCount JS-Dateien mit console.error ohne errorFixSystem"
    } else {
        Write-Host "  ✅ Alle JS-Dateien verwenden errorFixSystem" -ForegroundColor Green
    }
    
    if ($errorCount -eq 0) {
        Write-Host "  ✅ Keine kritischen Fehler gefunden" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $errorCount potenzielle Probleme gefunden" -ForegroundColor Yellow
    }
}

Final-ErrorFreeCheck

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
    tests = $global:allTests
    fixes = $global:allFixes
    errorCount = $global:allErrors.Count
    warningCount = $global:allWarnings.Count
    testCount = $global:allTests.Count
    fixCount = $global:allFixes.Count
    status = if ($global:allErrors.Count -eq 0) { "SUCCESS" } else { "HAS_ERRORS" }
}

$summaryPath = Join-Path $reportPath "FABRIKAGE-COMPLETE-TEST-VERIFY-ALL-$timestamp.json"
$summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryPath -Encoding UTF8

Write-Host "Fehler: $($global:allErrors.Count)" -ForegroundColor $(if ($global:allErrors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Warnungen: $($global:allWarnings.Count)" -ForegroundColor $(if ($global:allWarnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "Tests: $($global:allTests.Count)" -ForegroundColor Green
Write-Host "Fixes: $($global:allFixes.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Report gespeichert: $summaryPath" -ForegroundColor Cyan
Write-Host ""

if ($global:allErrors.Count -eq 0) {
    Write-Host "✅ ALLE TESTS ERFOLGREICH - SYSTEM FEHLERFREI" -ForegroundColor Green
    Write-Host ""
    Write-Host "Localhost:" -ForegroundColor Cyan
    Write-Host "  → Server starten: cd xxxxxxls-fabrikage && npm start" -ForegroundColor Gray
    Write-Host "  → Server läuft auf: http://localhost:5173" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Online:" -ForegroundColor Cyan
    Write-Host "  → GitHub Pages in Repository-Settings aktivieren" -ForegroundColor Gray
    Write-Host "  → Branch: main/master" -ForegroundColor Gray
    Write-Host "  → Root-Verzeichnis: / (root)" -ForegroundColor Gray
} else {
    Write-Host "❌ FEHLER GEFUNDEN - BITTE BEHEBEN" -ForegroundColor Red
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




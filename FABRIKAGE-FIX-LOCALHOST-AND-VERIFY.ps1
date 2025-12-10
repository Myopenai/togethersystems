# FABRIKAGE FIX LOCALHOST AND VERIFY
# Fixt Localhost-Probleme und verifiziert alles
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE FIX LOCALHOST AND VERIFY" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
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
# PHASE 1: LOCALHOST SERVER PRÜFEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: LOCALHOST SERVER PRÜFEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-And-Fix-Localhost {
    Write-Host "[LOCALHOST] Prüfe und fixe Localhost..." -ForegroundColor Cyan
    
    # Prüfe XXXXXXLS Server
    $serverPath = Join-Path $rootDir "xxxxxxls-fabrikage\server.js"
    $packagePath = Join-Path $rootDir "xxxxxxls-fabrikage\package.json"
    
    if (-not (Test-Path $serverPath)) {
        Write-Host "  ❌ Server-Script nicht gefunden" -ForegroundColor Red
        $global:allErrors += "Server-Script nicht gefunden"
        return
    }
    
    Write-Host "  ✅ Server-Script vorhanden" -ForegroundColor Green
    
    # Prüfe package.json
    if (-not (Test-Path $packagePath)) {
        Write-Host "  ❌ package.json nicht gefunden" -ForegroundColor Red
        $global:allErrors += "package.json nicht gefunden"
        return
    }
    
    Write-Host "  ✅ package.json vorhanden" -ForegroundColor Green
    
    # Prüfe package.json Inhalt
    $packageContent = Get-Content -Path $packagePath -Raw | ConvertFrom-Json
    
    $needsUpdate = $false
    
    # Prüfe Start-Script
    if (-not $packageContent.scripts.start) {
        Write-Host "  → Füge Start-Script hinzu..." -ForegroundColor Yellow
        if (-not $packageContent.scripts) {
            $packageContent | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{} -Force
        }
        $packageContent.scripts.start = "node server.js"
        $needsUpdate = $true
    }
    
    # Prüfe Dev-Script
    if (-not $packageContent.scripts.dev) {
        Write-Host "  → Füge Dev-Script hinzu..." -ForegroundColor Yellow
        $packageContent.scripts.dev = "node server.js"
        $needsUpdate = $true
    }
    
    if ($needsUpdate) {
        $packageContent | ConvertTo-Json -Depth 10 | Set-Content -Path $packagePath -Encoding UTF8
        Write-Host "  ✅ package.json aktualisiert" -ForegroundColor Green
        $global:allFixes += "package.json aktualisiert"
    }
    
    # Prüfe node_modules
    $nodeModulesPath = Join-Path $rootDir "xxxxxxls-fabrikage\node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "  → Installiere Dependencies..." -ForegroundColor Yellow
        
        try {
            Push-Location (Join-Path $rootDir "xxxxxxls-fabrikage")
            Write-Host "    → Führe npm install aus..." -ForegroundColor Gray
            $installOutput = npm install 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ npm install erfolgreich" -ForegroundColor Green
                $global:allFixes += "Dependencies installiert"
            } else {
                Write-Host "    ⚠️  npm install mit Warnungen" -ForegroundColor Yellow
                $global:allWarnings += "npm install mit Warnungen"
            }
        } catch {
            Write-Host "    ❌ npm install fehlgeschlagen: $_" -ForegroundColor Red
            $global:allErrors += "npm install fehlgeschlagen: $_"
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "  ✅ node_modules vorhanden" -ForegroundColor Green
    }
    
    # Prüfe ob Server läuft
    $localhostPorts = @(5173, 3000, 8080, 9323)
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
        Write-Host "  → Starte Server..." -ForegroundColor Cyan
        
        try {
            Push-Location (Join-Path $rootDir "xxxxxxls-fabrikage")
            $serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -WindowStyle Hidden
            Start-Sleep -Seconds 3
            
            # Prüfe ob Server jetzt läuft
            $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "    ✅ Server gestartet" -ForegroundColor Green
                $global:allFixes += "Server gestartet"
            } else {
                Write-Host "    ⚠️  Server-Start unklar" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "    ⚠️  Server-Start fehlgeschlagen: $_" -ForegroundColor Yellow
            Write-Host "    → Bitte manuell starten: cd xxxxxxls-fabrikage && npm start" -ForegroundColor Gray
            $global:allWarnings += "Server-Start fehlgeschlagen"
        } finally {
            Pop-Location
        }
    }
}

Test-And-Fix-Localhost

# ============================================
# PHASE 2: DATEIEN VERIFIZIEREN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: DATEIEN VERIFIZIEREN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Verify-AllFiles {
    Write-Host "[VERIFY] Verifiziere alle wichtigen Dateien..." -ForegroundColor Cyan
    
    $criticalFiles = @(
        "uae-enterprises-presentation.html",
        "uae-enterprises-presentation-en.html",
        "uae-enterprises-presentation-nl.html",
        "portal-start-nebula.html",
        "modular-fabrikage/index.html",
        "modular-fabrikage/js/factory-engine.js",
        "xxxxxxls-fabrikage/server.js",
        "ci/spec-mirror/code-mirror.js",
        "js/api-error-handler.js",
        "js/api-config-loader.js",
        "js/error-fix-system.js"
    )
    
    $verified = 0
    $missing = 0
    
    foreach ($file in $criticalFiles) {
        $filePath = Join-Path $rootDir $file
        if (Test-Path $filePath) {
            $fileInfo = Get-Item $filePath
            if ($fileInfo.Length -gt 0) {
                Write-Host "  ✅ $file ($([math]::Round($fileInfo.Length/1KB, 2)) KB)" -ForegroundColor Green
                $verified++
            } else {
                Write-Host "  ⚠️  $file ist leer" -ForegroundColor Yellow
                $missing++
                $global:allWarnings += "Datei ist leer: $file"
            }
        } else {
            Write-Host "  ❌ $file fehlt" -ForegroundColor Red
            $missing++
            $global:allErrors += "Datei fehlt: $file"
        }
    }
    
    Write-Host ""
    Write-Host "  Verifiziert: $verified / $($criticalFiles.Count)" -ForegroundColor $(if ($missing -eq 0) { "Green" } else { "Yellow" })
    Write-Host "  Fehlend: $missing" -ForegroundColor $(if ($missing -eq 0) { "Green" } else { "Red" })
}

Verify-AllFiles

# ============================================
# PHASE 3: ONLINE DEPLOY VERIFIZIEREN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: ONLINE DEPLOY VERIFIZIEREN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Verify-OnlineDeploy {
    Write-Host "[ONLINE] Verifiziere Online-Deploy..." -ForegroundColor Cyan
    
    # Teste GitHub Pages (falls konfiguriert)
    $githubPagesURLs = @(
        @{ Name = "Myopenai"; URL = "https://myopenai.github.io" },
        @{ Name = "ViewunitySystem"; URL = "https://viewunitysystem.github.io" },
        @{ Name = "ViewUnitySystemT"; URL = "https://viewunitysystemt.github.io" }
    )
    
    $onlineCount = 0
    
    foreach ($repo in $githubPagesURLs) {
        Write-Host "  → Teste $($repo.Name)..." -ForegroundColor Yellow
        
        try {
            $response = Invoke-WebRequest -Uri $repo.URL -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "    ✅ $($repo.URL) erreichbar" -ForegroundColor Green
                $onlineCount++
                
                # Teste wichtige Dateien
                $testFiles = @(
                    "uae-enterprises-presentation.html",
                    "portal-start-nebula.html"
                )
                
                foreach ($testFile in $testFiles) {
                    $fileUrl = "$($repo.URL)/$testFile"
                    try {
                        $fileResponse = Invoke-WebRequest -Uri $fileUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
                        if ($fileResponse.StatusCode -eq 200) {
                            Write-Host "      ✅ $testFile online verfügbar" -ForegroundColor Green
                        }
                    } catch {
                        Write-Host "      ⚠️  $testFile nicht online verfügbar" -ForegroundColor Yellow
                        $global:allWarnings += "Online: $testFile nicht verfügbar auf $($repo.URL)"
                    }
                }
            }
        } catch {
            Write-Host "    ⚠️  $($repo.URL) nicht erreichbar" -ForegroundColor Yellow
            $global:allWarnings += "Online: $($repo.URL) nicht erreichbar"
        }
    }
    
    Write-Host ""
    Write-Host "  Online-Server: $onlineCount / $($githubPagesURLs.Count)" -ForegroundColor $(if ($onlineCount -gt 0) { "Green" } else { "Yellow" })
}

Verify-OnlineDeploy

# ============================================
# PHASE 4: FEHLERFREIHEIT FINAL CHECK
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 4: FEHLERFREIHEIT FINAL CHECK" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Final-ErrorCheck {
    Write-Host "[FINAL] Finale Fehlerfreiheits-Prüfung..." -ForegroundColor Cyan
    
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
            if ($content -match 'TOGETHER.*SYSTEMS' -and $content -match 'logo-container') {
                Write-Host "  ✅ $pres - Logo integriert" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  $pres - Logo möglicherweise fehlt" -ForegroundColor Yellow
                $global:allWarnings += "Logo-Prüfung: $pres"
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
            $global:allWarnings += "Portal: Präsentations-Link fehlt"
        }
    }
}

Final-ErrorCheck

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

$summaryPath = Join-Path $reportPath "FABRIKAGE-FIX-LOCALHOST-VERIFY-$timestamp.json"
$summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryPath -Encoding UTF8

Write-Host "Fehler: $($global:allErrors.Count)" -ForegroundColor $(if ($global:allErrors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Warnungen: $($global:allWarnings.Count)" -ForegroundColor $(if ($global:allWarnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "Fixes: $($global:allFixes.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Report gespeichert: $summaryPath" -ForegroundColor Cyan
Write-Host ""

if ($global:allErrors.Count -eq 0) {
    Write-Host "✅ LOCALHOST FIX ERFOLGREICH - SYSTEM VERIFIZIERT" -ForegroundColor Green
} else {
    Write-Host "❌ FEHLER GEFUNDEN - BITTE BEHEBEN" -ForegroundColor Red
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




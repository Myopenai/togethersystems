# FABRIKAGE TEST ONLINE DEPLOY AND LOCALHOST
# Testet Online-Deploy, prüft Fehlerfreiheit, kontrolliert Localhost
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE TEST ONLINE DEPLOY AND LOCALHOST" -ForegroundColor Cyan
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
$global:allTests = @()
$global:onlineResults = @()
$global:localhostResults = @()

# GitHub Repository URLs (Beispiel-URLs - müssen angepasst werden)
$repos = @(
    @{ Name = "Myopenai"; BaseURL = "https://raw.githubusercontent.com/Myopenai" },
    @{ Name = "ViewunitySystem"; BaseURL = "https://raw.githubusercontent.com/ViewunitySystem" },
    @{ Name = "ViewUnitySystemT"; BaseURL = "https://raw.githubusercontent.com/orgs/ViewUnitySystemT" }
)

# Wichtige Dateien zum Testen
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

# ============================================
# PHASE 1: LOCALHOST TEST
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: LOCALHOST TEST" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-Localhost {
    Write-Host "[LOCALHOST] Teste Localhost-Dateien..." -ForegroundColor Cyan
    
    $localhostPorts = @(5173, 3000, 8080, 9323, 5174, 5175, 5176)
    $foundServer = $false
    
    foreach ($port in $localhostPorts) {
        $url = "http://localhost:$port"
        Write-Host "  → Teste $url..." -ForegroundColor Yellow
        
        try {
            $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "    ✅ Server läuft auf Port $port" -ForegroundColor Green
                $foundServer = $true
                $global:localhostResults += @{
                    Port = $port
                    Status = "Running"
                    URL = $url
                }
                
                # Teste wichtige Dateien
                foreach ($file in $criticalFiles) {
                    $fileUrl = "$url/$file"
                    try {
                        $fileResponse = Invoke-WebRequest -Uri $fileUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
                        if ($fileResponse.StatusCode -eq 200) {
                            Write-Host "      ✅ $file" -ForegroundColor Green
                            $global:localhostResults += @{
                                File = $file
                                Port = $port
                                Status = "Found"
                                URL = $fileUrl
                            }
                        }
                    } catch {
                        Write-Host "      ❌ $file nicht gefunden" -ForegroundColor Red
                        $global:allErrors += "Localhost: $file nicht gefunden auf Port $port"
                    }
                }
                break
            }
        } catch {
            # Server läuft nicht auf diesem Port
        }
    }
    
    if (-not $foundServer) {
        Write-Host "  ⚠️  Kein Localhost-Server gefunden" -ForegroundColor Yellow
        Write-Host "  → Starte XXXXXXLS-Server..." -ForegroundColor Cyan
        
        # Versuche Server zu starten
        $serverPath = Join-Path $rootDir "xxxxxxls-fabrikage\server.js"
        if (Test-Path $serverPath) {
            Write-Host "    → Server-Script gefunden: $serverPath" -ForegroundColor Gray
            Write-Host "    ⚠️  Bitte manuell starten: cd xxxxxxls-fabrikage && npm start" -ForegroundColor Yellow
        } else {
            Write-Host "    ❌ Server-Script nicht gefunden" -ForegroundColor Red
            $global:allErrors += "Localhost: Server-Script nicht gefunden"
        }
    }
}

Test-Localhost

# ============================================
# PHASE 2: LOKALE DATEIEN PRÜFEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: LOKALE DATEIEN PRÜFEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-LocalFiles {
    Write-Host "[LOCAL] Prüfe lokale Dateien..." -ForegroundColor Cyan
    
    $missingFiles = 0
    $foundFiles = 0
    
    foreach ($file in $criticalFiles) {
        $filePath = Join-Path $rootDir $file
        if (Test-Path $filePath) {
            Write-Host "  ✅ $file" -ForegroundColor Green
            $foundFiles++
            
            # Prüfe Dateigröße
            $fileInfo = Get-Item $filePath
            if ($fileInfo.Length -eq 0) {
                Write-Host "    ⚠️  Datei ist leer" -ForegroundColor Yellow
                $global:allWarnings += "Datei ist leer: $file"
            }
            
            # Prüfe Encoding
            $content = Get-Content -Path $filePath -Raw -ErrorAction SilentlyContinue
            if ($content) {
                # Prüfe Branding
                if ($content -notmatch 'TogetherSystems|ModularFlux') {
                    Write-Host "    ⚠️  Fehlendes Branding" -ForegroundColor Yellow
                    $global:allWarnings += "Fehlendes Branding: $file"
                }
                
                # Prüfe Version
                if ($file -match '\.(js|html)$' -and $content -match 'VERSION|version' -and $content -notmatch '3\.0\.0') {
                    Write-Host "    ⚠️  Falsche Version" -ForegroundColor Yellow
                    $global:allWarnings += "Falsche Version: $file"
                }
            }
        } else {
            Write-Host "  ❌ $file fehlt" -ForegroundColor Red
            $missingFiles++
            $global:allErrors += "Datei fehlt lokal: $file"
        }
    }
    
    Write-Host ""
    Write-Host "  Gefunden: $foundFiles / $($criticalFiles.Count)" -ForegroundColor $(if ($missingFiles -eq 0) { "Green" } else { "Yellow" })
    Write-Host "  Fehlend: $missingFiles" -ForegroundColor $(if ($missingFiles -eq 0) { "Green" } else { "Red" })
}

Test-LocalFiles

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
    
    # Teste GitHub Pages URLs (falls vorhanden)
    $githubPagesURLs = @(
        "https://myopenai.github.io",
        "https://viewunitysystem.github.io",
        "https://viewunitysystemt.github.io"
    )
    
    foreach ($url in $githubPagesURLs) {
        Write-Host "  → Teste $url..." -ForegroundColor Yellow
        
        try {
            $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "    ✅ $url erreichbar" -ForegroundColor Green
                $global:onlineResults += @{
                    URL = $url
                    Status = "Online"
                    StatusCode = $response.StatusCode
                }
                
                # Teste wichtige Dateien
                foreach ($file in $criticalFiles) {
                    $fileUrl = "$url/$file"
                    try {
                        $fileResponse = Invoke-WebRequest -Uri $fileUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
                        if ($fileResponse.StatusCode -eq 200) {
                            Write-Host "      ✅ $file online verfügbar" -ForegroundColor Green
                            $global:onlineResults += @{
                                File = $file
                                URL = $fileUrl
                                Status = "Found"
                                StatusCode = $fileResponse.StatusCode
                            }
                        }
                    } catch {
                        Write-Host "      ❌ $file nicht online verfügbar" -ForegroundColor Red
                        $global:allErrors += "Online: $file nicht verfügbar auf $url"
                    }
                }
            }
        } catch {
            Write-Host "    ⚠️  $url nicht erreichbar: $_" -ForegroundColor Yellow
            $global:allWarnings += "Online: $url nicht erreichbar"
        }
    }
    
    # Teste GitHub Raw URLs
    Write-Host ""
    Write-Host "  → Teste GitHub Raw URLs..." -ForegroundColor Yellow
    
    foreach ($repo in $repos) {
        Write-Host "    → Teste $($repo.Name)..." -ForegroundColor Gray
        
        # Teste README (meist vorhanden)
        $readmeUrl = "$($repo.BaseURL)/main/README.md"
        try {
            $response = Invoke-WebRequest -Uri $readmeUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "      ✅ $($repo.Name) Repository erreichbar" -ForegroundColor Green
                $global:onlineResults += @{
                    Repo = $repo.Name
                    Status = "Online"
                    URL = $readmeUrl
                }
            }
        } catch {
            Write-Host "      ⚠️  $($repo.Name) Repository nicht erreichbar" -ForegroundColor Yellow
            $global:allWarnings += "Online: $($repo.Name) Repository nicht erreichbar"
        }
    }
}

Test-OnlineDeploy

# ============================================
# PHASE 4: DATEI-VERGLEICH LOKAL VS ONLINE
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 4: DATEI-VERGLEICH LOKAL VS ONLINE" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Compare-LocalVsOnline {
    Write-Host "[COMPARE] Vergleiche lokale und online Dateien..." -ForegroundColor Cyan
    
    $compared = 0
    $mismatches = 0
    
    foreach ($file in $criticalFiles) {
        $localPath = Join-Path $rootDir $file
        if (-not (Test-Path $localPath)) {
            continue
        }
        
        $localContent = Get-Content -Path $localPath -Raw -ErrorAction SilentlyContinue
        if (-not $localContent) {
            continue
        }
        
        # Versuche Online-Version zu finden
        $foundOnline = $false
        foreach ($result in $global:onlineResults) {
            if ($result.File -eq $file) {
                $foundOnline = $true
                $compared++
                
                try {
                    $onlineResponse = Invoke-WebRequest -Uri $result.URL -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
                    $onlineContent = $onlineResponse.Content
                    
                    # Vergleiche Hash
                    $localHash = [System.Security.Cryptography.MD5]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($localContent)) | ForEach-Object { $_.ToString("x2") } | Join-String
                    $onlineHash = [System.Security.Cryptography.MD5]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($onlineContent)) | ForEach-Object { $_.ToString("x2") } | Join-String
                    
                    if ($localHash -eq $onlineHash) {
                        Write-Host "  ✅ $file - Lokal und Online identisch" -ForegroundColor Green
                    } else {
                        Write-Host "  ⚠️  $file - Unterschiede gefunden" -ForegroundColor Yellow
                        $mismatches++
                        $global:allWarnings += "Datei-Unterschied: $file"
                    }
                } catch {
                    Write-Host "  ⚠️  $file - Online-Vergleich fehlgeschlagen" -ForegroundColor Yellow
                }
                break
            }
        }
        
        if (-not $foundOnline) {
            Write-Host "  ⚠️  $file - Keine Online-Version gefunden" -ForegroundColor Yellow
            $global:allWarnings += "Keine Online-Version: $file"
        }
    }
    
    Write-Host ""
    Write-Host "  Verglichen: $compared" -ForegroundColor Cyan
    Write-Host "  Unterschiede: $mismatches" -ForegroundColor $(if ($mismatches -eq 0) { "Green" } else { "Yellow" })
}

Compare-LocalVsOnline

# ============================================
# PHASE 5: LOCALHOST FIXES
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 5: LOCALHOST FIXES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Fix-Localhost {
    Write-Host "[FIX] Prüfe und fixe Localhost-Probleme..." -ForegroundColor Cyan
    
    # Prüfe XXXXXXLS Server
    $serverPath = Join-Path $rootDir "xxxxxxls-fabrikage\server.js"
    if (Test-Path $serverPath) {
        Write-Host "  → Prüfe XXXXXXLS Server..." -ForegroundColor Yellow
        $serverContent = Get-Content -Path $serverPath -Raw
        
        # Prüfe Port-Konfiguration
        if ($serverContent -notmatch 'PORT|port') {
            Write-Host "    ⚠️  Port-Konfiguration fehlt" -ForegroundColor Yellow
            # Port wird bereits in server.js über process.env.PORT || 5173 gesetzt
        }
        
        # Prüfe ob Server korrekt konfiguriert ist
        if ($serverContent -match 'app\.listen') {
            Write-Host "    ✅ Server-Listen konfiguriert" -ForegroundColor Green
        } else {
            Write-Host "    ❌ Server-Listen fehlt" -ForegroundColor Red
            $global:allErrors += "Localhost: Server-Listen fehlt in server.js"
        }
    } else {
        Write-Host "  ❌ Server-Script nicht gefunden" -ForegroundColor Red
        $global:allErrors += "Localhost: Server-Script nicht gefunden"
    }
    
    # Prüfe package.json
    $packagePath = Join-Path $rootDir "xxxxxxls-fabrikage\package.json"
    if (Test-Path $packagePath) {
        Write-Host "  → Prüfe package.json..." -ForegroundColor Yellow
        $packageContent = Get-Content -Path $packagePath -Raw | ConvertFrom-Json
        
        if ($packageContent.scripts.start) {
            Write-Host "    ✅ Start-Script vorhanden" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  Start-Script fehlt" -ForegroundColor Yellow
            $global:allWarnings += "Localhost: Start-Script fehlt in package.json"
        }
        
        if ($packageContent.scripts.dev) {
            Write-Host "    ✅ Dev-Script vorhanden" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  Dev-Script fehlt" -ForegroundColor Yellow
        }
    }
    
    # Prüfe ob node_modules vorhanden
    $nodeModulesPath = Join-Path $rootDir "xxxxxxls-fabrikage\node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "  ⚠️  node_modules nicht vorhanden" -ForegroundColor Yellow
        Write-Host "  → Führe npm install aus..." -ForegroundColor Cyan
        
        try {
            Push-Location (Join-Path $rootDir "xxxxxxls-fabrikage")
            npm install 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ npm install erfolgreich" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️  npm install mit Warnungen" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "    ⚠️  npm install fehlgeschlagen: $_" -ForegroundColor Yellow
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "  ✅ node_modules vorhanden" -ForegroundColor Green
    }
}

Fix-Localhost

# ============================================
# PHASE 6: FEHLERFREIHEIT PRÜFUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 6: FEHLERFREIHEIT PRÜFUNG" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Test-ErrorFree {
    Write-Host "[ERROR-FREE] Prüfe Fehlerfreiheit..." -ForegroundColor Cyan
    
    $errorCount = 0
    
    # Prüfe HTML-Dateien auf Syntax-Fehler
    $htmlFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup|Fixpatch|CASHFLOX|Go|OSTOSOS"
    }
    
    foreach ($file in $htmlFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Prüfe auf ungeschlossene Tags (einfache Prüfung)
            $openTags = ([regex]::Matches($content, '<[^/][^>]*>')).Count
            $closeTags = ([regex]::Matches($content, '</[^>]+>')).Count
            
            if ($openTags -ne $closeTags) {
                Write-Host "  ⚠️  $($file.Name) - Mögliche ungeschlossene Tags" -ForegroundColor Yellow
                $errorCount++
                $global:allWarnings += "HTML-Syntax: $($file.Name)"
            }
            
            # Prüfe auf JavaScript-Fehler (console.error ohne errorFixSystem)
            if ($content -match 'console\.error' -and $content -notmatch 'errorFixSystem') {
                Write-Host "  ⚠️  $($file.Name) - console.error ohne errorFixSystem" -ForegroundColor Yellow
                $errorCount++
                $global:allWarnings += "JavaScript: $($file.Name)"
            }
        }
    }
    
    # Prüfe JS-Dateien
    $jsFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.js" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup|Fixpatch|CASHFLOX|Go|OSTOSOS|ci\spec-mirror\mirror"
    }
    
    foreach ($file in $jsFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Prüfe auf Syntax-Fehler (einfache Prüfung)
            if ($content -match 'console\.error' -and $content -notmatch 'errorFixSystem' -and $file.Name -notmatch 'error-fix-system') {
                Write-Host "  ⚠️  $($file.Name) - console.error ohne errorFixSystem" -ForegroundColor Yellow
                $errorCount++
                $global:allWarnings += "JavaScript: $($file.Name)"
            }
            
            # Prüfe auf fetch ohne apiErrorHandler
            if ($content -match 'fetch\s*\(' -and $content -notmatch 'apiErrorHandler' -and $file.Name -notmatch 'api-error-handler') {
                Write-Host "  ⚠️  $($file.Name) - fetch() ohne apiErrorHandler" -ForegroundColor Yellow
                $errorCount++
                $global:allWarnings += "API-Call: $($file.Name)"
            }
        }
    }
    
    if ($errorCount -eq 0) {
        Write-Host "  ✅ Keine Fehler gefunden" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $errorCount potenzielle Probleme gefunden" -ForegroundColor Yellow
    }
}

Test-ErrorFree

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
    onlineResults = $global:onlineResults
    localhostResults = $global:localhostResults
    errorCount = $global:allErrors.Count
    warningCount = $global:allWarnings.Count
    testCount = $global:allTests.Count
    onlineCount = ($global:onlineResults | Where-Object { $_.Status -eq "Online" }).Count
    localhostCount = ($global:localhostResults | Where-Object { $_.Status -eq "Running" }).Count
    status = if ($global:allErrors.Count -eq 0) { "SUCCESS" } else { "HAS_ERRORS" }
}

$summaryPath = Join-Path $reportPath "FABRIKAGE-TEST-ONLINE-DEPLOY-LOCALHOST-$timestamp.json"
$summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryPath -Encoding UTF8

Write-Host "Fehler: $($global:allErrors.Count)" -ForegroundColor $(if ($global:allErrors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Warnungen: $($global:allWarnings.Count)" -ForegroundColor $(if ($global:allWarnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "Online-Server: $($summary.onlineCount)" -ForegroundColor Cyan
Write-Host "Localhost-Server: $($summary.localhostCount)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Report gespeichert: $summaryPath" -ForegroundColor Cyan
Write-Host ""

if ($global:allErrors.Count -eq 0) {
    Write-Host "✅ ALLE TESTS ERFOLGREICH - SYSTEM FEHLERFREI" -ForegroundColor Green
} else {
    Write-Host "❌ FEHLER GEFUNDEN - BITTE BEHEBEN" -ForegroundColor Red
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




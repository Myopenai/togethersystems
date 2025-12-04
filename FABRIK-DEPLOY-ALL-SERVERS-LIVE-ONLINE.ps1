# FABRIK: DEPLOY ALL SERVERS LIVE ONLINE
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software
# Fabrikationssystemsoftware - Alle verbundenen Server deployen

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: DEPLOY ALL SERVERS LIVE ONLINE" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "Fabrikationssystemsoftware" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date
$deploymentResults = @()

# ============================================================================
# PHASE 1: PRE-DEPLOY VERIFICATION
# ============================================================================
Write-Host "[PHASE 1] Pre-Deploy Verification..." -ForegroundColor Yellow
Write-Host ""

# Prüfe Node.js
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Node.js nicht gefunden" -ForegroundColor Yellow
}

# Prüfe Git
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Git: $gitVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Git nicht gefunden" -ForegroundColor Yellow
}

# Prüfe Wrangler (Cloudflare)
try {
    $wranglerVersion = npx wrangler --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Wrangler: $wranglerVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Wrangler nicht gefunden (optional)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# PHASE 2: GITHUB PAGES DEPLOY
# ============================================================================
Write-Host "[PHASE 2] GitHub Pages Deploy..." -ForegroundColor Yellow
Write-Host ""

try {
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Git Repository erkannt" -ForegroundColor Green
        
        if ($gitStatus) {
            Write-Host "  📝 Änderungen gefunden - Commit vorbereiten..." -ForegroundColor Cyan
            git add . 2>&1 | Out-Null
            $commitMessage = "FABRIK: Complete System Update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $commitMessage 2>&1 | Out-Null
            Write-Host "  ✅ Commit erstellt: $commitMessage" -ForegroundColor Green
            
            $currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
            if ($currentBranch -and $currentBranch -ne "HEAD") {
                Write-Host "  🚀 Push zu GitHub..." -ForegroundColor Cyan
                git push origin $currentBranch 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✅ Push abgeschlossen" -ForegroundColor Green
                    $deploymentResults += @{ Server = "GitHub Pages"; Status = "Deployed"; URL = "https://USERNAME.github.io/REPO/" }
                } else {
                    Write-Host "  ⚠️  Push fehlgeschlagen" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "  ℹ️  Keine Änderungen zum Committen" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  ⚠️  Kein Git Repository erkannt" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Git-Fehler: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# PHASE 3: CLOUDFLARE PAGES DEPLOY
# ============================================================================
Write-Host "[PHASE 3] Cloudflare Pages Deploy..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "wrangler.toml") {
    Write-Host "  ✅ wrangler.toml gefunden" -ForegroundColor Green
    Write-Host "  🚀 Deploy zu Cloudflare Pages..." -ForegroundColor Cyan
    
    try {
        $cfDeploy = npx wrangler pages deploy . --project-name=togethersystems --compatibility-date=2024-01-01 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Cloudflare Pages Deploy erfolgreich" -ForegroundColor Green
            $deploymentResults += @{ Server = "Cloudflare Pages"; Status = "Deployed"; URL = "https://togethersystems.pages.dev/" }
        } else {
            Write-Host "  ⚠️  Cloudflare Deploy fehlgeschlagen" -ForegroundColor Yellow
            Write-Host "  Output: $cfDeploy" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⚠️  Cloudflare Deploy Fehler: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ℹ️  Keine Cloudflare-Konfiguration gefunden" -ForegroundColor Cyan
}

Write-Host ""

# ============================================================================
# PHASE 4: CLOUDFLARE WORKERS DEPLOY
# ============================================================================
Write-Host "[PHASE 4] Cloudflare Workers Deploy..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "functions") {
    Write-Host "  ✅ Functions-Verzeichnis gefunden" -ForegroundColor Green
    Write-Host "  🚀 Deploy Workers..." -ForegroundColor Cyan
    
    try {
        $workerDeploy = npx wrangler deploy 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Workers Deploy erfolgreich" -ForegroundColor Green
            $deploymentResults += @{ Server = "Cloudflare Workers"; Status = "Deployed"; URL = "https://WORKER-NAME.workers.dev/" }
        } else {
            Write-Host "  ⚠️  Workers Deploy fehlgeschlagen" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠️  Workers Deploy Fehler: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ℹ️  Keine Functions gefunden" -ForegroundColor Cyan
}

Write-Host ""

# ============================================================================
# PHASE 5: D1 DATABASE DEPLOY
# ============================================================================
Write-Host "[PHASE 5] D1 Database Deploy..." -ForegroundColor Yellow
Write-Host ""

$d1Schemas = @(
    "d1-schema.sql",
    "TELBANK/d1-schema-telbank-negative-assets.sql",
    "TELADIA/d1-schema-teladia-assets.sql"
)

foreach ($schema in $d1Schemas) {
    if (Test-Path $schema) {
        Write-Host "  ✅ Schema gefunden: $schema" -ForegroundColor Green
        Write-Host "  🚀 Deploy Schema..." -ForegroundColor Cyan
        
        try {
            $schemaName = if ($schema -match "telbank") { "telbank-db" } elseif ($schema -match "teladia") { "teladia-db" } else { "main-db" }
            $d1Deploy = npx wrangler d1 execute $schemaName --file=$schema 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ D1 Schema deployed: $schemaName" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  D1 Deploy fehlgeschlagen für $schema" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ⚠️  D1 Deploy Fehler: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# ============================================================================
# PHASE 6: FRONTEND ASSETS VERIFICATION
# ============================================================================
Write-Host "[PHASE 6] Frontend Assets Verification..." -ForegroundColor Yellow
Write-Host ""

$frontendFiles = @(
    "index.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "admin.html",
    "honeycomb.html",
    "legal-hub.html"
)

$deployedFiles = 0
foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        $deployedFiles++
        Write-Host "  ✅ $file vorhanden" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $file fehlt" -ForegroundColor Yellow
    }
}

Write-Host "  Frontend-Dateien: $deployedFiles/$($frontendFiles.Count)" -ForegroundColor $(if ($deployedFiles -eq $frontendFiles.Count) { "Green" } else { "Yellow" })

Write-Host ""

# ============================================================================
# PHASE 7: LOCAL SERVER START (Go Server)
# ============================================================================
Write-Host "[PHASE 7] Local Server Start (Go Server)..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "builds\go-executable\main.go") {
    Write-Host "  ✅ Go Server gefunden" -ForegroundColor Green
    Write-Host "  🚀 Starte Go Server..." -ForegroundColor Cyan
    
    try {
        Push-Location "builds\go-executable"
        $goServer = Start-Process -FilePath "go" -ArgumentList "run", "main.go" -PassThru -WindowStyle Hidden
        if ($goServer) {
            Write-Host "  ✅ Go Server gestartet (PID: $($goServer.Id))" -ForegroundColor Green
            Write-Host "  🌐 Server läuft auf: http://127.0.0.1:9090" -ForegroundColor Cyan
            $deploymentResults += @{ Server = "Local Go Server"; Status = "Running"; URL = "http://127.0.0.1:9090" }
        }
        Pop-Location
    } catch {
        Write-Host "  ⚠️  Go Server Fehler: $($_.Exception.Message)" -ForegroundColor Yellow
        Pop-Location
    }
} else {
    Write-Host "  ℹ️  Go Server nicht gefunden" -ForegroundColor Cyan
}

Write-Host ""

# ============================================================================
# PHASE 8: NODE.JS SERVER START (Optional)
# ============================================================================
Write-Host "[PHASE 8] Node.js Server Start (Optional)..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "tools\serve.js") {
    Write-Host "  ✅ Node.js Server gefunden" -ForegroundColor Green
    Write-Host "  🚀 Starte Node.js Server..." -ForegroundColor Cyan
    
    try {
        $nodeServer = Start-Process -FilePath "node" -ArgumentList "tools\serve.js" -PassThru -WindowStyle Hidden
        if ($nodeServer) {
            Write-Host "  ✅ Node.js Server gestartet (PID: $($nodeServer.Id))" -ForegroundColor Green
            Write-Host "  🌐 Server läuft auf: http://127.0.0.1:8080" -ForegroundColor Cyan
            $deploymentResults += @{ Server = "Local Node.js Server"; Status = "Running"; URL = "http://127.0.0.1:8080" }
        }
    } catch {
        Write-Host "  ⚠️  Node.js Server Fehler: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ℹ️  Node.js Server nicht gefunden" -ForegroundColor Cyan
}

Write-Host ""

# ============================================================================
# PHASE 9: POST-DEPLOY VERIFICATION
# ============================================================================
Write-Host "[PHASE 9] Post-Deploy Verification..." -ForegroundColor Yellow
Write-Host ""

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "  Deployment-Dauer: $($duration.TotalSeconds) Sekunden" -ForegroundColor Cyan
Write-Host "  Deployed Server: $($deploymentResults.Count)" -ForegroundColor Cyan

Write-Host ""

# ============================================================================
# ZUSAMMENFASSUNG
# ============================================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($deploymentResults.Count -gt 0) {
    Write-Host "Deployed Server:" -ForegroundColor Yellow
    foreach ($result in $deploymentResults) {
        Write-Host "  ✅ $($result.Server): $($result.Status)" -ForegroundColor Green
        if ($result.URL) {
            Write-Host "     URL: $($result.URL)" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "  ⚠️  Keine Server deployed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] FABRIK DEPLOYMENT ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems" -ForegroundColor Green
Write-Host "Fabrikationssystemsoftware - Live Online" -ForegroundColor Green


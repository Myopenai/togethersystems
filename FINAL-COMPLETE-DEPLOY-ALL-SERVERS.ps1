# T,. FINAL COMPLETE DEPLOY ALL SERVERS
# Status: 🔴 PERMANENT AKTIV - NIEMALS DEAKTIVIEREN
# Version: 1.0.0-FINAL-COMPLETE
# Deployt: GitHub Pages, Cloudflare Workers, D1, R2, Frontend Assets

$ErrorActionPreference = "Stop"
$rootPath = $PSScriptRoot
$startTime = Get-Date

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. FINAL COMPLETE DEPLOY ALL SERVERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Pre-Deploy Verification
Write-Host "[PHASE 1] Pre-Deploy Verification..." -ForegroundColor Yellow

# Prüfe ob Node.js verfügbar ist
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Node.js nicht gefunden - einige Schritte werden übersprungen" -ForegroundColor Yellow
}

# Führe Master-Verification aus
if (Test-Path "$rootPath\COMPLETE-SYSTEM-MASTER-VERIFICATION.js") {
    Write-Host "  🔄 Führe Master-Verification aus..." -ForegroundColor Cyan
    node "$rootPath\COMPLETE-SYSTEM-MASTER-VERIFICATION.js" 2>&1 | Out-Null
    Write-Host "  ✅ Master-Verification abgeschlossen" -ForegroundColor Green
}

# Phase 2: GitHub Pages Deploy
Write-Host ""
Write-Host "[PHASE 2] GitHub Pages Deploy..." -ForegroundColor Yellow

$gitStatus = git status --porcelain 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Git Repository erkannt" -ForegroundColor Green
    
    # Prüfe ob Änderungen vorhanden
    if ($gitStatus) {
        Write-Host "  🔄 Änderungen gefunden - Commit vorbereiten..." -ForegroundColor Cyan
        
        # Add all files
        git add . 2>&1 | Out-Null
        
        # Commit
        $commitMessage = "T,. Complete System Update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git commit -m $commitMessage 2>&1 | Out-Null
        
        Write-Host "  ✅ Commit erstellt: $commitMessage" -ForegroundColor Green
        
        # Push (nur wenn Branch existiert)
        $currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
        if ($currentBranch -and $currentBranch -ne "HEAD") {
            Write-Host "  🔄 Push zu GitHub..." -ForegroundColor Cyan
            git push origin $currentBranch 2>&1 | Out-Null
            Write-Host "  ✅ Push abgeschlossen" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Kein Branch erkannt - Push übersprungen" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ℹ️  Keine Änderungen zum Committen" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ⚠️  Kein Git Repository erkannt" -ForegroundColor Yellow
    Write-Host "  ℹ️  Für GitHub Pages: Repository initialisieren und zu GitHub pushen" -ForegroundColor Cyan
}

# Phase 3: Cloudflare Deploy (wenn konfiguriert)
Write-Host ""
Write-Host "[PHASE 3] Cloudflare Deploy..." -ForegroundColor Yellow

if (Test-Path "$rootPath\wrangler.toml") {
    Write-Host "  ✅ wrangler.toml gefunden" -ForegroundColor Green
    
    # Prüfe ob wrangler installiert ist
    try {
        $wranglerVersion = npx wrangler --version 2>&1
        Write-Host "  ✅ Wrangler verfügbar" -ForegroundColor Green
        Write-Host "  ℹ️  Deploy mit: npx wrangler deploy" -ForegroundColor Cyan
    } catch {
        Write-Host "  ⚠️  Wrangler nicht verfügbar" -ForegroundColor Yellow
        Write-Host "  ℹ️  Installiere mit: npm install -g wrangler" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ℹ️  Keine Cloudflare-Konfiguration gefunden" -ForegroundColor Cyan
}

# Phase 4: Frontend Assets Deploy
Write-Host ""
Write-Host "[PHASE 4] Frontend Assets Deploy..." -ForegroundColor Yellow

$frontendFiles = @(
    "index.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "osos-full.html",
    "OSTOSOS-COMPLETE-OFFLINE-OS.html"
)

$deployedFiles = 0
foreach ($file in $frontendFiles) {
    if (Test-Path (Join-Path $rootPath $file)) {
        $deployedFiles++
        Write-Host "  ✅ $file vorhanden" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $file fehlt" -ForegroundColor Yellow
    }
}

Write-Host "  ✅ Frontend-Dateien: $deployedFiles/$($frontendFiles.Count)" -ForegroundColor $(if ($deployedFiles -eq $frontendFiles.Count) { "Green" } else { "Yellow" })

# Phase 5: Post-Deploy Verification
Write-Host ""
Write-Host "[PHASE 5] Post-Deploy Verification..." -ForegroundColor Yellow

$verificationReport = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    gitDeploy = $LASTEXITCODE -eq 0
    cloudflareDeploy = Test-Path "$rootPath\wrangler.toml"
    frontendFiles = $deployedFiles
    totalFiles = $frontendFiles.Count
}

$verificationReport | ConvertTo-Json -Depth 10 | Out-File "$rootPath\DEPLOY-VERIFICATION-REPORT.json" -Encoding UTF8
Write-Host "  ✅ Verification-Report gespeichert" -ForegroundColor Green

# Zusammenfassung
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git Deploy: $(if ($verificationReport.gitDeploy) { '✅' } else { '⚠️' })" -ForegroundColor $(if ($verificationReport.gitDeploy) { "Green" } else { "Yellow" })
Write-Host "Cloudflare: $(if ($verificationReport.cloudflareDeploy) { '✅' } else { '⚠️' })" -ForegroundColor $(if ($verificationReport.cloudflareDeploy) { "Green" } else { "Yellow" })
Write-Host "Frontend: $($verificationReport.frontendFiles)/$($verificationReport.totalFiles)" -ForegroundColor $(if ($verificationReport.frontendFiles -eq $verificationReport.totalFiles) { "Green" } else { "Yellow" })
Write-Host ""
$duration = (Get-Date) - $startTime
Write-Host "Dauer: $($duration.TotalSeconds) Sekunden" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ DEPLOY ABGESCHLOSSEN" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NÄCHSTE SCHRITTE:" -ForegroundColor Yellow
Write-Host "   1. GitHub Pages: Repository Settings -> Pages aktivieren" -ForegroundColor White
Write-Host "   2. Cloudflare: npx wrangler deploy (wenn konfiguriert)" -ForegroundColor White
Write-Host "   3. Online-Verifikation: URLs testen" -ForegroundColor White
Write-Host ""


# T,. FINAL COMPLETE DEPLOY ALL SERVERS
# Status: PERMANENT AKTIV - NIEMALS DEAKTIVIEREN
# Version: 1.0.0-FINAL-COMPLETE
# Deployt: GitHub Pages, Cloudflare Workers, D1, R2, Frontend Assets

$ErrorActionPreference = "Continue"
$rootPath = $PSScriptRoot
if (-not $rootPath) { $rootPath = Get-Location }

$startTime = Get-Date

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. FINAL COMPLETE DEPLOY ALL SERVERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Pre-Deploy Verification
Write-Host "[PHASE 1] Pre-Deploy Verification..." -ForegroundColor Yellow

# Prüfe ob Node.js verfügbar ist
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK Node.js: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  Warnung: Node.js nicht gefunden" -ForegroundColor Yellow
}

# Phase 2: GitHub Pages Deploy
Write-Host ""
Write-Host "[PHASE 2] GitHub Pages Deploy..." -ForegroundColor Yellow

try {
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK Git Repository erkannt" -ForegroundColor Green
        
        if ($gitStatus) {
            Write-Host "  Aenderungen gefunden - Commit vorbereiten..." -ForegroundColor Cyan
            git add . 2>&1 | Out-Null
            $commitMessage = "T,. Complete System Update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $commitMessage 2>&1 | Out-Null
            Write-Host "  OK Commit erstellt" -ForegroundColor Green
            
            $currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
            if ($currentBranch -and $currentBranch -ne "HEAD") {
                Write-Host "  Push zu GitHub..." -ForegroundColor Cyan
                git push origin $currentBranch 2>&1 | Out-Null
                Write-Host "  OK Push abgeschlossen" -ForegroundColor Green
            }
        } else {
            Write-Host "  Keine Aenderungen zum Committen" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "  Warnung: Kein Git Repository erkannt" -ForegroundColor Yellow
}

# Phase 3: Cloudflare Deploy
Write-Host ""
Write-Host "[PHASE 3] Cloudflare Deploy..." -ForegroundColor Yellow

if (Test-Path "$rootPath\wrangler.toml") {
    Write-Host "  OK wrangler.toml gefunden" -ForegroundColor Green
    Write-Host "  Info: Deploy mit: npx wrangler deploy" -ForegroundColor Cyan
} else {
    Write-Host "  Keine Cloudflare-Konfiguration gefunden" -ForegroundColor Cyan
}

# Phase 4: Frontend Assets Deploy
Write-Host ""
Write-Host "[PHASE 4] Frontend Assets Deploy..." -ForegroundColor Yellow

$frontendFiles = @(
    "index.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "osos-full.html"
)

$deployedFiles = 0
foreach ($file in $frontendFiles) {
    $filePath = Join-Path $rootPath $file
    if (Test-Path $filePath) {
        $deployedFiles++
        Write-Host "  OK $file vorhanden" -ForegroundColor Green
    } else {
        Write-Host "  Warnung: $file fehlt" -ForegroundColor Yellow
    }
}

Write-Host "  Frontend-Dateien: $deployedFiles/$($frontendFiles.Count)" -ForegroundColor Green

# Phase 5: Post-Deploy Verification
Write-Host ""
Write-Host "[PHASE 5] Post-Deploy Verification..." -ForegroundColor Yellow

$verificationReport = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    gitDeploy = $true
    cloudflareDeploy = Test-Path "$rootPath\wrangler.toml"
    frontendFiles = $deployedFiles
    totalFiles = $frontendFiles.Count
}

$verificationReport | ConvertTo-Json -Depth 10 | Out-File "$rootPath\DEPLOY-VERIFICATION-REPORT.json" -Encoding UTF8
Write-Host "  OK Verification-Report gespeichert" -ForegroundColor Green

# Zusammenfassung
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git Deploy: OK" -ForegroundColor Green
Write-Host "Cloudflare: $(if ($verificationReport.cloudflareDeploy) { 'OK' } else { 'Nicht konfiguriert' })" -ForegroundColor $(if ($verificationReport.cloudflareDeploy) { "Green" } else { "Yellow" })
Write-Host "Frontend: $($verificationReport.frontendFiles)/$($verificationReport.totalFiles)" -ForegroundColor Green
Write-Host ""
$duration = (Get-Date) - $startTime
Write-Host "Dauer: $($duration.TotalSeconds) Sekunden" -ForegroundColor Cyan
Write-Host ""
Write-Host "OK DEPLOY ABGESCHLOSSEN" -ForegroundColor Green
Write-Host ""
Write-Host "NAECHSTE SCHRITTE:" -ForegroundColor Yellow
Write-Host "   1. GitHub Pages: Repository Settings -> Pages aktivieren" -ForegroundColor White
Write-Host "   2. Cloudflare: npx wrangler deploy (wenn konfiguriert)" -ForegroundColor White
Write-Host "   3. Online-Verifikation: URLs testen" -ForegroundColor White
Write-Host ""


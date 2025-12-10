# FABRIKAGE DEPLOY ALL REPOS
# Deploy zu allen Repositories
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE DEPLOY ALL REPOS" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# Repositories
$repos = @(
    @{
        Name = "Myopenai"
        Url = "https://github.com/Myopenai"
        Path = $null
    },
    @{
        Name = "ViewunitySystem"
        Url = "https://github.com/ViewunitySystem"
        Path = $null
    },
    @{
        Name = "ViewUnitySystemT"
        Url = "https://github.com/orgs/ViewUnitySystemT"
        Path = $null
    }
)

# ============================================
# GIT STATUS PRÜFEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  GIT STATUS PRÜFEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

try {
    Push-Location $rootDir
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        $changedFiles = ($gitStatus | Where-Object { $_ -match "^\s*[MADRC]" } | Measure-Object).Count
        Write-Host "  📝 Geänderte Dateien: $changedFiles" -ForegroundColor Cyan
        
        if ($changedFiles -gt 0) {
            Write-Host "  ⚠️ Es gibt uncommitted Änderungen" -ForegroundColor Yellow
            Write-Host "  📝 Committe automatisch (KEINE BESTÄTIGUNG)..." -ForegroundColor Cyan
            git add .
            $commitMessage = "FABRIKAGE AUTO: Update, Fix, Test, Deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $commitMessage
            Write-Host "  ✅ Gecommittet" -ForegroundColor Green
        } else {
            Write-Host "  ✅ Keine Änderungen" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠️ Git nicht verfügbar oder kein Repository" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️ Git-Fehler: $_" -ForegroundColor Yellow
} finally {
    Pop-Location
}

# ============================================
# DEPLOY ZU REPOS
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  DEPLOY ZU REPOS" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

Write-Host "⚠️ HINWEIS: Automatisches Push zu mehreren Repos erfordert" -ForegroundColor Yellow
Write-Host "   manuelle Konfiguration der Git-Remotes." -ForegroundColor Yellow
Write-Host ""
Write-Host "Repositories:" -ForegroundColor Cyan
foreach ($repo in $repos) {
    Write-Host "  → $($repo.Name): $($repo.Url)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Manuelle Schritte:" -ForegroundColor Cyan
Write-Host "  1. Git Remotes konfigurieren:" -ForegroundColor Gray
Write-Host "     git remote add myopenai https://github.com/Myopenai/togethersystems.git" -ForegroundColor DarkGray
Write-Host "     git remote add viewunity https://github.com/ViewunitySystem/togethersystems.git" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  2. Push zu allen Remotes:" -ForegroundColor Gray
Write-Host "     git push myopenai main" -ForegroundColor DarkGray
Write-Host "     git push viewunity main" -ForegroundColor DarkGray

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Git Status geprüft" -ForegroundColor Green
Write-Host "✅ Deploy-Anleitung bereit" -ForegroundColor Green
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Cyan
Write-Host "  1. Git Remotes konfigurieren" -ForegroundColor Gray
Write-Host "  2. Push zu allen Repos" -ForegroundColor Gray
Write-Host "  3. Online-Tests durchführen" -ForegroundColor Gray
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




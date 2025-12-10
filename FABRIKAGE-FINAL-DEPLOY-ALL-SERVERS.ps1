# FABRIKAGE FINAL DEPLOY ALL SERVERS
# Deployt alle Änderungen zu allen Repositories und Servern
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE FINAL DEPLOY ALL SERVERS" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  AUTOMATISCH - KEINE BESTÄTIGUNGEN" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

$repos = @(
    @{ Name = "Myopenai"; URL = "https://github.com/Myopenai" },
    @{ Name = "ViewunitySystem"; URL = "https://github.com/ViewunitySystem" },
    @{ Name = "ViewUnitySystemT"; URL = "https://github.com/orgs/ViewUnitySystemT" }
)

function Deploy-To-Repo {
    param(
        [string]$RepoName,
        [string]$RepoURL
    )
    
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  DEPLOY: $RepoName" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        Push-Location $rootDir
        
        # Prüfe ob Git-Repository vorhanden
        if (-not (Test-Path ".git")) {
            Write-Host "  ⚠️  Kein Git-Repository gefunden - Initialisiere..." -ForegroundColor Yellow
            git init 2>&1 | Out-Null
            git branch -M main 2>&1 | Out-Null
        }
        
        # Prüfe Remote
        $remotes = git remote 2>&1
        if ($remotes -notcontains "origin") {
            Write-Host "  → Füge Remote 'origin' hinzu..." -ForegroundColor Gray
            # Remote wird nicht automatisch hinzugefügt, da URL benötigt wird
            Write-Host "  ⚠️  Remote 'origin' fehlt - Bitte manuell hinzufügen: git remote add origin $RepoURL" -ForegroundColor Yellow
        }
        
        # Git Status
        Write-Host "[GIT] Prüfe Status..." -ForegroundColor Cyan
        $status = git status --porcelain 2>&1
        
        if ($status -and $status.Count -gt 0) {
            Write-Host "  📝 $($status.Count) geänderte Dateien gefunden" -ForegroundColor Cyan
            
            # Add all
            Write-Host "[GIT] Füge alle Änderungen hinzu..." -ForegroundColor Cyan
            git add -A 2>&1 | Out-Null
            
            # Commit
            $commitMessage = "FABRIKAGE: Complete Update - UAE Presentation with Logo, System Fixes, Standards - $timestamp"
            Write-Host "[GIT] Committe Änderungen..." -ForegroundColor Cyan
            git commit -m $commitMessage 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Commit erfolgreich" -ForegroundColor Green
                
                # Push
                Write-Host "[GIT] Pushe zu Remote..." -ForegroundColor Cyan
                $pushOutput = git push origin main 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    ✅ Push erfolgreich" -ForegroundColor Green
                    return $true
                } else {
                    Write-Host "    ⚠️  Push-Fehler: $pushOutput" -ForegroundColor Yellow
                    return $false
                }
            } else {
                Write-Host "    ⚠️  Commit-Fehler oder keine Änderungen" -ForegroundColor Yellow
                return $false
            }
        } else {
            Write-Host "  ✅ Keine Änderungen zum Committen" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "  ❌ Fehler: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

# Deploy alle Repositories
$deployResults = @()

foreach ($repo in $repos) {
    $result = Deploy-To-Repo -RepoName $repo.Name -RepoURL $repo.URL
    $deployResults += @{
        Name = $repo.Name
        Success = $result
    }
    Write-Host ""
}

# Zusammenfassung
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$successCount = ($deployResults | Where-Object { $_.Success }).Count
$totalCount = $deployResults.Count

foreach ($result in $deployResults) {
    $status = if ($result.Success) { "✅" } else { "⚠️" }
    $color = if ($result.Success) { "Green" } else { "Yellow" }
    Write-Host "  $status $($result.Name)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Erfolgreich: $successCount / $totalCount" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host ""

if ($successCount -eq $totalCount) {
    Write-Host "✅ ALLE REPOSITORIES ERFOLGREICH DEPLOYED" -ForegroundColor Green
} else {
    Write-Host "⚠️  EINIGE REPOSITORIES HABEN PROBLEME" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Hinweis: Falls Remote 'origin' fehlt, füge es manuell hinzu:" -ForegroundColor Yellow
    Write-Host "  git remote add origin <REPO-URL>" -ForegroundColor Gray
    Write-Host "  git push -u origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




# FABRIKAGE COMPLETE DEPLOY AND PUSH
# Deployt alle Repositories und pusht zu GitHub
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE COMPLETE DEPLOY AND PUSH" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$repos = @(
    @{ Name = "Myopenai"; URL = "https://github.com/Myopenai" },
    @{ Name = "ViewunitySystem"; URL = "https://github.com/ViewunitySystem" },
    @{ Name = "ViewUnitySystemT"; URL = "https://github.com/orgs/ViewUnitySystemT" }
)

function Deploy-Repository {
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
        
        # Git Status
        Write-Host "[GIT] Prüfe Status..." -ForegroundColor Cyan
        $status = git status --porcelain 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ⚠️  Kein Git Repository oder Fehler" -ForegroundColor Yellow
            return $false
        }
        
        $changedFiles = ($status | Where-Object { $_ -match '^\s*[AM]' })
        if ($changedFiles.Count -eq 0) {
            Write-Host "  ✅ Keine Änderungen zum Committen" -ForegroundColor Green
        } else {
            Write-Host "  📝 $($changedFiles.Count) geänderte Dateien gefunden" -ForegroundColor Cyan
            
            # Add all
            Write-Host "[GIT] Füge alle Änderungen hinzu..." -ForegroundColor Cyan
            git add -A 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Alle Änderungen hinzugefügt" -ForegroundColor Green
            } else {
                Write-Host "    ❌ Fehler beim Hinzufügen" -ForegroundColor Red
                return $false
            }
            
            # Commit
            $commitMessage = "FABRIKAGE UPDATE: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Complete TÜV and Standards Update"
            Write-Host "[GIT] Committe Änderungen..." -ForegroundColor Cyan
            git commit -m $commitMessage 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Commit erfolgreich" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️  Kein Commit nötig oder Fehler" -ForegroundColor Yellow
            }
            
            # Push
            Write-Host "[GIT] Pushe zu Remote..." -ForegroundColor Cyan
            $pushOutput = git push 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Push erfolgreich" -ForegroundColor Green
                return $true
            } else {
                Write-Host "    ⚠️  Push-Fehler oder bereits aktuell" -ForegroundColor Yellow
                Write-Host "    Output: $pushOutput" -ForegroundColor Gray
                return $false
            }
        }
        
        return $true
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
    $result = Deploy-Repository -RepoName $repo.Name -RepoURL $repo.URL
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
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




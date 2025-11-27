# PowerShell Extension 4: Developer Portal Management
# Verwaltet das Developer Portal

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "open", "onboard", "deploy")]
    [string]$Action = "status"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Extension 4: Developer Portal Management" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
if (-not $rootPath) {
    $rootPath = Get-Location
}

$devPortalPath = Join-Path $rootPath "ultra\ui\developer-portal.html"
$betaPortalPath = Join-Path $rootPath "ultra\beta\index.html"

switch ($Action) {
    "status" {
        Write-Host "📊 Developer Portal Status:" -ForegroundColor Yellow
        Write-Host ""
        
        if (Test-Path $devPortalPath) {
            Write-Host "✅ Developer Portal gefunden" -ForegroundColor Green
        } else {
            Write-Host "❌ Developer Portal nicht gefunden" -ForegroundColor Red
        }
        
        if (Test-Path $betaPortalPath) {
            Write-Host "✅ Beta Portal gefunden" -ForegroundColor Green
        } else {
            Write-Host "❌ Beta Portal nicht gefunden" -ForegroundColor Red
        }
        
        # Prüfe Onboarding
        $onboardingPath = Join-Path $rootPath "ultra\core\developer-onboarding.js"
        if (Test-Path $onboardingPath) {
            Write-Host "✅ Developer Onboarding gefunden" -ForegroundColor Green
        }
    }
    
    "open" {
        Write-Host "🚀 Öffne Developer Portal..." -ForegroundColor Yellow
        if (Test-Path $devPortalPath) {
            Start-Process $devPortalPath
            Write-Host "✅ Developer Portal geöffnet" -ForegroundColor Green
        }
        if (Test-Path $betaPortalPath) {
            $openBeta = Read-Host "Beta Portal auch öffnen? (j/n)"
            if ($openBeta -eq "j") {
                Start-Process $betaPortalPath
                Write-Host "✅ Beta Portal geöffnet" -ForegroundColor Green
            }
        }
    }
    
    "onboard" {
        Write-Host "👨‍💻 Developer Onboarding..." -ForegroundColor Yellow
        Write-Host "   (Onboarding-Prozess startet)" -ForegroundColor Cyan
        # Hier könnte Onboarding-Prozess integriert werden
    }
    
    "deploy" {
        Write-Host "🚀 Deploy Developer Portal..." -ForegroundColor Yellow
        Write-Host "   (Deployment über Cloudflare Pages)" -ForegroundColor Cyan
        # Hier könnte Deployment integriert werden
    }
}

Write-Host ""


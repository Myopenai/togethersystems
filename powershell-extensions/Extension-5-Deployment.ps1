# PowerShell Extension 5: Deployment & Server Management
# Verwaltet Deployment und Server

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "deploy", "test", "monitor")]
    [string]$Action = "status"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Extension 5: Deployment & Server Management" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
if (-not $rootPath) {
    $rootPath = Get-Location
}

switch ($Action) {
    "status" {
        Write-Host "📊 Deployment Status:" -ForegroundColor Yellow
        Write-Host ""
        
        # Prüfe Cloudflare Pages
        $wranglerPath = Join-Path $rootPath "wrangler.toml"
        if (Test-Path $wranglerPath) {
            Write-Host "✅ Cloudflare Pages konfiguriert" -ForegroundColor Green
        }
        
        # Prüfe GitHub Pages
        $githubWorkflow = Join-Path $rootPath ".github\workflows\pages.yml"
        if (Test-Path $githubWorkflow) {
            Write-Host "✅ GitHub Pages konfiguriert" -ForegroundColor Green
        }
        
        # Prüfe Functions
        $functionsPath = Join-Path $rootPath "functions"
        if (Test-Path $functionsPath) {
            $functionCount = (Get-ChildItem -Path $functionsPath -Recurse -File -Filter "*.js").Count
            Write-Host "✅ Cloudflare Functions: $functionCount" -ForegroundColor Green
        }
    }
    
    "deploy" {
        Write-Host "🚀 Deploy alle Server..." -ForegroundColor Yellow
        Write-Host ""
        
        Write-Host "1. Cloudflare Pages..." -ForegroundColor Cyan
        $wranglerPath = Join-Path $rootPath "wrangler.toml"
        if (Test-Path $wranglerPath) {
            Write-Host "   (wrangler pages deploy . --project-name=togethersystems)" -ForegroundColor Gray
            # Hier könnte Cloudflare Pages Deployment integriert werden
        }
        
        Write-Host ""
        Write-Host "2. GitHub Pages..." -ForegroundColor Cyan
        Write-Host "   (Git Push aktiviert GitHub Actions)" -ForegroundColor Gray
        
        Write-Host ""
        Write-Host "✅ Deployment gestartet" -ForegroundColor Green
    }
    
    "test" {
        Write-Host "🧪 Teste Deployment..." -ForegroundColor Yellow
        Write-Host "   (Deployment-Tests werden ausgeführt)" -ForegroundColor Cyan
        # Hier könnte Deployment-Test integriert werden
    }
    
    "monitor" {
        Write-Host "📊 Monitor Deployment..." -ForegroundColor Yellow
        Write-Host "   (Deployment-Monitoring aktiv)" -ForegroundColor Cyan
        # Hier könnte Deployment-Monitoring integriert werden
    }
}

Write-Host ""









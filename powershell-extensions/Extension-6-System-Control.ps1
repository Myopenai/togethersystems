# PowerShell Extension 6: System Control & Overview
# Zentrale System-Kontrolle

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("overview", "health", "features", "all")]
    [string]$Action = "overview"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Extension 6: System Control & Overview" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
if (-not $rootPath) {
    $rootPath = Get-Location
}

function Show-FeatureStatus {
    param($name, $path, $url = $null)
    
    if (Test-Path $path) {
        Write-Host "✅ $name" -ForegroundColor Green
        if ($url) {
            Write-Host "   URL: $url" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ $name" -ForegroundColor Red
    }
}

switch ($Action) {
    "overview" {
        Write-Host "📊 System-Übersicht:" -ForegroundColor Yellow
        Write-Host ""
        
        Write-Host "🎯 Haupt-Features:" -ForegroundColor Cyan
        Show-FeatureStatus "Settings OS" (Join-Path $rootPath "SETTINGS-MASTER-DASHBOARD.html")
        Show-FeatureStatus "YORDY Artist" (Join-Path $rootPath "YORDY\yordy-artist-showcase.html")
        Show-FeatureStatus "Developer Portal" (Join-Path $rootPath "ultra\ui\developer-portal.html")
        Show-FeatureStatus "Beta Portal" (Join-Path $rootPath "ultra\beta\index.html")
        Show-FeatureStatus "OSTOSOS" (Join-Path $rootPath "OSTOSOS-ANKUENDIGUNG.html")
        Show-FeatureStatus "OSTOS Branding" (Join-Path $rootPath "ostos-branding.html")
        
        Write-Host ""
        Write-Host "📁 System-Ordner:" -ForegroundColor Cyan
        Show-FeatureStatus "Settings" (Join-Path $rootPath "Settings")
        Show-FeatureStatus "MCP" (Join-Path $rootPath "Settings\mcp")
        Show-FeatureStatus "Robot" (Join-Path $rootPath "Settings\robot")
        Show-FeatureStatus "Functions" (Join-Path $rootPath "functions")
    }
    
    "health" {
        Write-Host "🏥 System Health Check:" -ForegroundColor Yellow
        Write-Host ""
        
        # Prüfe kritische Dateien
        $criticalFiles = @(
            @{Name="index.html"; Path=(Join-Path $rootPath "index.html")},
            @{Name="manifest-portal.html"; Path=(Join-Path $rootPath "manifest-portal.html")},
            @{Name="Settings Manifest"; Path=(Join-Path $rootPath "Settings\settings-manifest.json")}
        )
        
        foreach ($file in $criticalFiles) {
            if (Test-Path $file.Path) {
                Write-Host "✅ $($file.Name)" -ForegroundColor Green
            } else {
                Write-Host "❌ $($file.Name)" -ForegroundColor Red
            }
        }
    }
    
    "features" {
        Write-Host "✨ Alle Features:" -ForegroundColor Yellow
        Write-Host ""
        
        # Liste alle Features
        $features = @(
            "Settings OS",
            "MCP System",
            "Robot System",
            "Developer Portal",
            "Beta Portal",
            "YORDY Artist",
            "OSTOSOS",
            "OSTOS Branding",
            "OS-Geräte-Dokumentation",
            "Job-Angebot"
        )
        
        foreach ($feature in $features) {
            Write-Host "   • $feature" -ForegroundColor White
        }
    }
    
    "all" {
        Write-Host "🚀 Führe alle Extensions aus..." -ForegroundColor Yellow
        Write-Host ""
        
        $extensions = @(
            "Extension-1-Settings-OS.ps1",
            "Extension-2-MCP-System.ps1",
            "Extension-3-Robot-System.ps1",
            "Extension-4-Developer-Portal.ps1",
            "Extension-5-Deployment.ps1"
        )
        
        foreach ($ext in $extensions) {
            $extPath = Join-Path $PSScriptRoot $ext
            if (Test-Path $extPath) {
                Write-Host "📋 $ext" -ForegroundColor Cyan
                & $extPath -Action status
                Write-Host ""
            }
        }
    }
}

Write-Host ""


# Führt alle PowerShell Extensions aus
# Zentrale Steuerung für alle Extensions

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "all", "quick")]
    [string]$Mode = "status"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PowerShell Extensions - Together Systems" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$extensionsPath = $PSScriptRoot
if (-not $extensionsPath) {
    $extensionsPath = Get-Location
}

$extensions = @(
    @{Name="Settings OS"; Script="Extension-1-Settings-OS.ps1"; Action="status"},
    @{Name="MCP System"; Script="Extension-2-MCP-System.ps1"; Action="status"},
    @{Name="Robot System"; Script="Extension-3-Robot-System.ps1"; Action="status"},
    @{Name="Developer Portal"; Script="Extension-4-Developer-Portal.ps1"; Action="status"},
    @{Name="Deployment"; Script="Extension-5-Deployment.ps1"; Action="status"},
    @{Name="System Control"; Script="Extension-6-System-Control.ps1"; Action="overview"}
)

switch ($Mode) {
    "status" {
        Write-Host "📊 Status aller Extensions:" -ForegroundColor Yellow
        Write-Host ""
        
        foreach ($ext in $extensions) {
            $scriptPath = Join-Path $extensionsPath $ext.Script
            if (Test-Path $scriptPath) {
                Write-Host "✅ $($ext.Name)" -ForegroundColor Green
                & $scriptPath -Action $ext.Action
                Write-Host ""
            } else {
                Write-Host "❌ $($ext.Name) - Script nicht gefunden" -ForegroundColor Red
            }
        }
    }
    
    "all" {
        Write-Host "🚀 Führe alle Extensions aus..." -ForegroundColor Yellow
        Write-Host ""
        
        foreach ($ext in $extensions) {
            $scriptPath = Join-Path $extensionsPath $ext.Script
            if (Test-Path $scriptPath) {
                Write-Host "📋 $($ext.Name)" -ForegroundColor Cyan
                & $scriptPath -Action $ext.Action
                Write-Host ""
                Start-Sleep -Seconds 1
            }
        }
        
        Write-Host "✅ Alle Extensions abgeschlossen" -ForegroundColor Green
    }
    
    "quick" {
        Write-Host "⚡ Quick Check..." -ForegroundColor Yellow
        Write-Host ""
        
        & (Join-Path $extensionsPath "Extension-6-System-Control.ps1") -Action overview
    }
}

Write-Host ""









# PowerShell Extension 1: Settings OS Management
# Verwaltet das Settings OS System

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "dashboard", "backup", "restore", "validate", "deploy")]
    [string]$Action = "status"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Extension 1: Settings OS Management" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
if (-not $rootPath) {
    $rootPath = Get-Location
}

$settingsPath = Join-Path $rootPath "Settings"
$masterDashboard = Join-Path $rootPath "SETTINGS-MASTER-DASHBOARD.html"
$settingsDashboard = Join-Path $settingsPath "dashboard\index.html"

switch ($Action) {
    "status" {
        Write-Host "📊 Settings OS Status:" -ForegroundColor Yellow
        Write-Host ""
        
        if (Test-Path $settingsPath) {
            Write-Host "✅ Settings-Ordner gefunden" -ForegroundColor Green
            $settingsFiles = Get-ChildItem -Path $settingsPath -Recurse -File | Measure-Object
            Write-Host "   Dateien: $($settingsFiles.Count)" -ForegroundColor White
        } else {
            Write-Host "❌ Settings-Ordner nicht gefunden" -ForegroundColor Red
        }
        
        if (Test-Path $masterDashboard) {
            Write-Host "✅ Master Dashboard gefunden" -ForegroundColor Green
        } else {
            Write-Host "❌ Master Dashboard nicht gefunden" -ForegroundColor Red
        }
        
        if (Test-Path $settingsDashboard) {
            Write-Host "✅ Settings Dashboard gefunden" -ForegroundColor Green
        } else {
            Write-Host "❌ Settings Dashboard nicht gefunden" -ForegroundColor Red
        }
    }
    
    "dashboard" {
        Write-Host "🚀 Öffne Settings Dashboards..." -ForegroundColor Yellow
        if (Test-Path $masterDashboard) {
            Start-Process $masterDashboard
            Write-Host "✅ Master Dashboard geöffnet" -ForegroundColor Green
        }
        if (Test-Path $settingsDashboard) {
            Start-Process $settingsDashboard
            Write-Host "✅ Settings Dashboard geöffnet" -ForegroundColor Green
        }
    }
    
    "backup" {
        Write-Host "💾 Erstelle Backup..." -ForegroundColor Yellow
        $backupPath = Join-Path $rootPath "TTT\PRODUCTION-PROCESS\backups"
        if (-not (Test-Path $backupPath)) {
            New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
        }
        $timestamp = Get-Date -Format "yyyy-MM-ddTHH-mm-ss-fffZ"
        $backupDir = Join-Path $backupPath "Settings-$timestamp"
        Copy-Item -Path $settingsPath -Destination $backupDir -Recurse -Force
        Write-Host "✅ Backup erstellt: $backupDir" -ForegroundColor Green
    }
    
    "restore" {
        Write-Host "🔄 Wiederherstellung..." -ForegroundColor Yellow
        $backupPath = Join-Path $rootPath "TTT\PRODUCTION-PROCESS\backups"
        if (Test-Path $backupPath) {
            $backups = Get-ChildItem -Path $backupPath -Directory | Sort-Object LastWriteTime -Descending
            if ($backups.Count -gt 0) {
                $latestBackup = $backups[0]
                Write-Host "Neuestes Backup: $($latestBackup.Name)" -ForegroundColor Cyan
                $confirm = Read-Host "Wiederherstellen? (j/n)"
                if ($confirm -eq "j") {
                    Remove-Item -Path $settingsPath -Recurse -Force -ErrorAction SilentlyContinue
                    Copy-Item -Path $latestBackup.FullName -Destination $settingsPath -Recurse -Force
                    Write-Host "✅ Wiederherstellung abgeschlossen" -ForegroundColor Green
                }
            } else {
                Write-Host "❌ Keine Backups gefunden" -ForegroundColor Red
            }
        }
    }
    
    "validate" {
        Write-Host "✔️ Validiere Settings..." -ForegroundColor Yellow
        $manifestPath = Join-Path $settingsPath "settings-manifest.json"
        if (Test-Path $manifestPath) {
            try {
                $manifest = Get-Content $manifestPath | ConvertFrom-Json
                Write-Host "✅ Manifest gültig" -ForegroundColor Green
                Write-Host "   Version: $($manifest.settingsManifestVersion)" -ForegroundColor White
            } catch {
                Write-Host "❌ Manifest ungültig: $_" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Manifest nicht gefunden" -ForegroundColor Red
        }
    }
    
    "deploy" {
        Write-Host "🚀 Deploy Settings OS..." -ForegroundColor Yellow
        Write-Host "   (Deployment über Cloudflare Pages)" -ForegroundColor Cyan
        # Hier könnte Cloudflare Pages Deployment integriert werden
    }
}

Write-Host ""









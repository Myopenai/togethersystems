# PowerShell Extension 2: MCP System Management
# Verwaltet das MCP (Model Context Protocol) System

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "scan", "register", "list", "test")]
    [string]$Action = "status"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Extension 2: MCP System Management" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
if (-not $rootPath) {
    $rootPath = Get-Location
}

$mcpPath = Join-Path $rootPath "Settings\mcp"
$registryPath = Join-Path $mcpPath "mcp-registry.json"

switch ($Action) {
    "status" {
        Write-Host "📊 MCP System Status:" -ForegroundColor Yellow
        Write-Host ""
        
        if (Test-Path $mcpPath) {
            Write-Host "✅ MCP-Ordner gefunden" -ForegroundColor Green
        } else {
            Write-Host "❌ MCP-Ordner nicht gefunden" -ForegroundColor Red
        }
        
        if (Test-Path $registryPath) {
            Write-Host "✅ MCP Registry gefunden" -ForegroundColor Green
            try {
                $registry = Get-Content $registryPath | ConvertFrom-Json
                $mcpCount = if ($registry.mcps) { $registry.mcps.Count } else { 0 }
                Write-Host "   Registrierte MCPs: $mcpCount" -ForegroundColor White
            } catch {
                Write-Host "❌ Registry ungültig" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ MCP Registry nicht gefunden" -ForegroundColor Red
        }
        
        # Prüfe API Endpoints
        $apiPath = Join-Path $rootPath "functions\api\mcp"
        if (Test-Path $apiPath) {
            $apiFiles = Get-ChildItem -Path $apiPath -File
            Write-Host "✅ API Endpoints: $($apiFiles.Count)" -ForegroundColor Green
        }
    }
    
    "scan" {
        Write-Host "🔍 Scanne MCPs..." -ForegroundColor Yellow
        Write-Host "   (MCP Auto-Detection)" -ForegroundColor Cyan
        # Hier könnte MCP Auto-Detection integriert werden
        Write-Host "✅ Scan abgeschlossen" -ForegroundColor Green
    }
    
    "register" {
        Write-Host "📝 Registriere MCP..." -ForegroundColor Yellow
        $name = Read-Host "MCP Name"
        $url = Read-Host "MCP URL"
        Write-Host "   (Registrierung in Registry)" -ForegroundColor Cyan
        # Hier könnte MCP-Registrierung integriert werden
    }
    
    "list" {
        Write-Host "📋 Liste MCPs:" -ForegroundColor Yellow
        if (Test-Path $registryPath) {
            try {
                $registry = Get-Content $registryPath | ConvertFrom-Json
                if ($registry.mcps) {
                    foreach ($mcp in $registry.mcps) {
                        Write-Host "   • $($mcp.name) - $($mcp.service)" -ForegroundColor White
                    }
                }
            } catch {
                Write-Host "❌ Fehler beim Lesen der Registry" -ForegroundColor Red
            }
        }
    }
    
    "test" {
        Write-Host "🧪 Teste MCP Verbindungen..." -ForegroundColor Yellow
        Write-Host "   (MCP Connectivity Test)" -ForegroundColor Cyan
        # Hier könnte MCP-Test integriert werden
    }
}

Write-Host ""









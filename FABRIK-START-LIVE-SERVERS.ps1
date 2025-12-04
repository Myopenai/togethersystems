# FABRIK: START LIVE SERVERS
# Startet alle Server für Live-Online-Zugriff

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: START LIVE SERVERS" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Go Server starten
Write-Host "[1] Starte Go Server..." -ForegroundColor Yellow
Push-Location "builds\go-executable"
$goServer = Start-Process -FilePath "go" -ArgumentList "run", "main.go" -PassThru -WindowStyle Normal
if ($goServer) {
    Write-Host "  ✅ Go Server gestartet (PID: $($goServer.Id))" -ForegroundColor Green
    Write-Host "  🌐 Server läuft auf: http://127.0.0.1:9090" -ForegroundColor Cyan
    Start-Sleep -Seconds 2
}
Pop-Location

Write-Host ""

# Node.js Server starten
Write-Host "[2] Starte Node.js Server..." -ForegroundColor Yellow
$nodeServer = Start-Process -FilePath "node" -ArgumentList "tools\serve.js" -PassThru -WindowStyle Normal
if ($nodeServer) {
    Write-Host "  ✅ Node.js Server gestartet (PID: $($nodeServer.Id))" -ForegroundColor Green
    Write-Host "  🌐 Server läuft auf: http://127.0.0.1:8080" -ForegroundColor Cyan
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LIVE SERVER URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Go Server (CognitiveFabric):" -ForegroundColor Yellow
Write-Host "  http://127.0.0.1:9090" -ForegroundColor Cyan
Write-Host "  http://127.0.0.1:9090/api/status" -ForegroundColor Cyan
Write-Host ""
Write-Host "Node.js Server (Development):" -ForegroundColor Yellow
Write-Host "  http://127.0.0.1:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] SERVER GESTARTET" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems" -ForegroundColor Green


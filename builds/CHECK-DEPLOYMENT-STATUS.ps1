# ============================================
# [.SYSTEMS.T.SYSTEMS.] Check Deployment Status
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[.SYSTEMS.T.SYSTEMS.] DEPLOYMENT STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ROOT = $PSScriptRoot
$CONFIG_FILE = Join-Path $ROOT "hosts\host-config.json"
$BUILD_DIR = Join-Path $ROOT "go-executable\build"

if (-not (Test-Path $CONFIG_FILE)) {
    Write-Host "[FEHLER] Host-Konfiguration nicht gefunden" -ForegroundColor Red
    exit 1
}

$config = Get-Content $CONFIG_FILE | ConvertFrom-Json

Write-Host "Konfigurierte Hosts: $($config.hosts.Count)" -ForegroundColor White
Write-Host ""

$deployedCount = 0
$notDeployedCount = 0

foreach ($host in $config.hosts) {
    Write-Host "Host: $($host.name)" -ForegroundColor Yellow
    Write-Host "  Typ: $($host.type)" -ForegroundColor Gray
    Write-Host "  Platform: $($host.platform)" -ForegroundColor Gray
    
    # Pruefe ob Binary existiert
    $platformPath = Join-Path $BUILD_DIR $host.platform
    if ($host.platform -like "windows-*") {
        $serverBinary = Join-Path $platformPath "ostosos-server.exe"
    } else {
        $serverBinary = Join-Path $platformPath "ostosos-server"
    }
    
    if (Test-Path $serverBinary) {
        Write-Host "  [OK] Binary vorhanden: $serverBinary" -ForegroundColor Green
    } else {
        Write-Host "  [FEHLER] Binary nicht gefunden: $serverBinary" -ForegroundColor Red
        $notDeployedCount++
        Write-Host ""
        continue
    }
    
    # Pruefe Deployment-Status
    $deployed = $false
    
    switch ($host.type) {
        "ssh" {
            if ($host.host -and -not ($host.host -like "*example.com*")) {
                Write-Host "  [INFO] SSH-Host konfiguriert: $($host.host)" -ForegroundColor Cyan
                Write-Host "  [INFO] Deployment-Status kann nicht lokal geprueft werden" -ForegroundColor Yellow
            } else {
                Write-Host "  [WARN] Beispiel-Host (wird uebersprungen)" -ForegroundColor Yellow
            }
        }
        
        "local" {
            $deployPath = $host.path
            $serverName = if ($host.platform -like "windows-*") { "ostosos-server.exe" } else { "ostosos-server" }
            $deployedPath = Join-Path $deployPath $serverName
            
            if (Test-Path $deployedPath) {
                Write-Host "  [OK] DEPLOYED: $deployedPath" -ForegroundColor Green
                $deployed = $true
                $deployedCount++
                
                # Pruefe ob Server laeuft
                if ($host.platform -like "windows-*") {
                    $process = Get-Process -Name "ostosos-server" -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  [OK] Server laeuft (PID: $($process.Id))" -ForegroundColor Green
                    } else {
                        Write-Host "  [WARN] Server nicht gestartet" -ForegroundColor Yellow
                    }
                }
            } else {
                Write-Host "  [FEHLER] NICHT DEPLOYED: $deployedPath" -ForegroundColor Red
                $notDeployedCount++
            }
        }
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployed: $deployedCount" -ForegroundColor Green
Write-Host "Nicht deployed: $notDeployedCount" -ForegroundColor $(if ($notDeployedCount -gt 0) { "Red" } else { "Green" })
Write-Host "Gesamt: $($config.hosts.Count)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""


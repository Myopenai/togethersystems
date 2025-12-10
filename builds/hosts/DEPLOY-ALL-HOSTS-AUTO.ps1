# ============================================
# [.SYSTEMS.T.SYSTEMS.] Deploy to All Hosts - AUTO
# ============================================
# Automatisches Deployment auf alle Hosts
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[.SYSTEMS.T.SYSTEMS.] DEPLOY ALL HOSTS - AUTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host "Factory-System Integration" -ForegroundColor Yellow
Write-Host "Automatisches Deployment auf ALLE Hosts" -ForegroundColor Yellow
Write-Host ""

$ROOT = $PSScriptRoot
$CONFIG_FILE = Join-Path $ROOT "host-config.json"
$BUILD_DIR = Join-Path $ROOT "..\go-executable\build"

# Lade Host-Konfiguration
if (-not (Test-Path $CONFIG_FILE)) {
    Write-Host "[FEHLER] Host-Konfiguration nicht gefunden: $CONFIG_FILE" -ForegroundColor Red
    exit 1
}

$config = Get-Content $CONFIG_FILE | ConvertFrom-Json

# Zeige Factory-Informationen
if ($config.factory) {
    Write-Host "Factory-System:" -ForegroundColor Cyan
    Write-Host "  Name: $($config.factory.name)" -ForegroundColor White
    Write-Host "  Version: $($config.factory.version)" -ForegroundColor White
    Write-Host "  Codename: $($config.factory.codename)" -ForegroundColor White
    Write-Host "  Branding: $($config.factory.branding)" -ForegroundColor White
    Write-Host ""
}

Write-Host "Deploye auf ALLE $($config.hosts.Count) Host(s)..." -ForegroundColor Cyan
Write-Host ""

$deployedCount = 0
$failedCount = 0

foreach ($host in $config.hosts) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "Host: $($host.name)" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    
    # Bestimme Server-Binary
    $serverBinary = $null
    $platformPath = Join-Path $BUILD_DIR $host.platform
    
    if ($host.platform -like "windows-*") {
        $serverBinary = Join-Path $platformPath "ostosos-server.exe"
    } else {
        $serverBinary = Join-Path $platformPath "ostosos-server"
    }
    
    if (-not (Test-Path $serverBinary)) {
        Write-Host "[FEHLER] Server-Binary nicht gefunden: $serverBinary" -ForegroundColor Red
        Write-Host "[SKIP] Überspringe Host: $($host.name)" -ForegroundColor Yellow
        $failedCount++
        Write-Host ""
        continue
    }
    
    Write-Host "Binary: $serverBinary" -ForegroundColor White
    Write-Host "Platform: $($host.platform)" -ForegroundColor White
    if ($host.profile) {
        Write-Host "Profile: $($host.profile)" -ForegroundColor Cyan
        if ($config.profiles.$($host.profile)) {
            $profile = $config.profiles.$($host.profile)
            Write-Host "  Toolchains: $($profile.toolchains -join ', ')" -ForegroundColor Gray
        }
    }
    if ($host.fabrikage -and $host.fabrikage.enabled) {
        Write-Host "Fabrikage: ENABLED" -ForegroundColor Green
        if ($host.fabrikage.standards) {
            Write-Host "  Standards: $($host.fabrikage.standards -join ', ')" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    # Deployment basierend auf Typ
    $deploymentSuccess = $false
    
    switch ($host.type) {
        "ssh" {
            Write-Host "Deploye via SSH/SCP..." -ForegroundColor Cyan
            
            if (-not $host.host) {
                Write-Host "[WARN] SSH-Host nicht konfiguriert (Beispiel-Host übersprungen)" -ForegroundColor Yellow
                Write-Host ""
                continue
            }
            
            $scpCmd = "scp"
            if ($host.port -and $host.port -ne 22) {
                $scpCmd += " -P $($host.port)"
            }
            $scpCmd += " `"$serverBinary`" `"$($host.host):$($host.path)/ostosos-server`" 2>&1"
            
            Write-Host "Befehl: $scpCmd" -ForegroundColor Gray
            try {
                $result = Invoke-Expression $scpCmd
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[OK] Server deployed" -ForegroundColor Green
                    $deploymentSuccess = $true
                    $deployedCount++
                    
                    # Erstelle Start-Script
                    $startScript = @"
#!/usr/bin/env bash
cd "$($host.path)"
chmod +x ostosos-server
./ostosos-server &
echo "Server gestartet: http://127.0.0.1:$($config.defaults.server_port)"
"@
                    
                    $tempScript = Join-Path $env:TEMP "start-server-$($host.name).sh"
                    $startScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline
                    
                    $scpScriptCmd = "scp"
                    if ($host.port -and $host.port -ne 22) {
                        $scpScriptCmd += " -P $($host.port)"
                    }
                    $scpScriptCmd += " `"$tempScript`" `"$($host.host):$($host.path)/start-server.sh`" 2>&1"
                    
                    Invoke-Expression $scpScriptCmd | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "[OK] Start-Script deployed" -ForegroundColor Green
                    }
                } else {
                    Write-Host "[FEHLER] SSH-Deployment fehlgeschlagen" -ForegroundColor Red
                    Write-Host "  Hinweis: Stelle sicher, dass SSH-Zugriff konfiguriert ist" -ForegroundColor Yellow
                    $failedCount++
                }
            } catch {
                Write-Host "[FEHLER] SSH-Deployment fehlgeschlagen: $_" -ForegroundColor Red
                $failedCount++
            }
        }
        
        "local" {
            Write-Host "Deploye lokal..." -ForegroundColor Cyan
            
            try {
                if (-not (Test-Path $host.path)) {
                    New-Item -ItemType Directory -Path $host.path -Force | Out-Null
                    Write-Host "[OK] Verzeichnis erstellt: $($host.path)" -ForegroundColor Green
                }
                
                Copy-Item $serverBinary $host.path -Force
                Write-Host "[OK] Server deployed nach: $($host.path)" -ForegroundColor Green
                $deploymentSuccess = $true
                $deployedCount++
            } catch {
                Write-Host "[FEHLER] Lokales Deployment fehlgeschlagen: $_" -ForegroundColor Red
                $failedCount++
            }
        }
        
        "ftp" {
            Write-Host "[INFO] FTP-Deployment erfordert manuellen FTP-Client" -ForegroundColor Yellow
            Write-Host "Bitte verwende FileZilla oder WinSCP" -ForegroundColor Yellow
            Write-Host "Datei: $serverBinary" -ForegroundColor White
            Write-Host "Ziel: ftp://$($host.host)$($host.path)/ostosos-server" -ForegroundColor White
            $failedCount++
        }
        
        default {
            Write-Host "[WARN] Unbekannter Host-Typ: $($host.type)" -ForegroundColor Yellow
            $failedCount++
        }
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Erfolgreich: $deployedCount" -ForegroundColor Green
Write-Host "Fehlgeschlagen: $failedCount" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "Green" })
Write-Host "Gesamt: $($config.hosts.Count)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor Cyan
Write-Host ""


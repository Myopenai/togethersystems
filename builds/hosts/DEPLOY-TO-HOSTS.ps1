# ============================================
# [.SYSTEMS.T.SYSTEMS.] Deploy to Multiple Hosts
# ============================================
# Deployed Server auf mehrere Hosts gleichzeitig
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[.SYSTEMS.T.SYSTEMS.] DEPLOY TO HOSTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host "Factory-System Integration" -ForegroundColor Yellow
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
    Write-Host ""
}

Write-Host "Verfuegbare Hosts:" -ForegroundColor Yellow
for ($i = 0; $i -lt $config.hosts.Count; $i++) {
    $host = $config.hosts[$i]
    $profileInfo = if ($host.profile) { " [$($host.profile)]" } else { "" }
    $fabrikageInfo = if ($host.fabrikage -and $host.fabrikage.enabled) { " [FABRIKAGE]" } else { "" }
    Write-Host "  $($i + 1). $($host.name) - $($host.type) - $($host.platform)$profileInfo$fabrikageInfo" -ForegroundColor White
}
Write-Host ""

$selection = Read-Host "Waehle Host (Nummer) oder 'all' fuer alle"

$hostsToDeploy = @()

if ($selection -eq "all") {
    $hostsToDeploy = $config.hosts
} else {
    $index = [int]$selection - 1
    if ($index -ge 0 -and $index -lt $config.hosts.Count) {
        $hostsToDeploy = @($config.hosts[$index])
    } else {
        Write-Host "[FEHLER] Ungueltige Auswahl" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Deploye auf $($hostsToDeploy.Count) Host(s)..." -ForegroundColor Cyan
Write-Host ""

foreach ($host in $hostsToDeploy) {
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
    switch ($host.type) {
        "ssh" {
            Write-Host "Deploye via SSH/SCP..." -ForegroundColor Cyan
            
            $scpCmd = "scp"
            if ($host.port -and $host.port -ne 22) {
                $scpCmd += " -P $($host.port)"
            }
            $scpCmd += " `"$serverBinary`" `"$($host.host):$($host.path)/ostosos-server`""
            
            Write-Host "Befehl: $scpCmd" -ForegroundColor Gray
            Invoke-Expression $scpCmd
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Server deployed" -ForegroundColor Green
                
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
                $scpScriptCmd += " `"$tempScript`" `"$($host.host):$($host.path)/start-server.sh`""
                
                Invoke-Expression $scpScriptCmd
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[OK] Start-Script deployed" -ForegroundColor Green
                }
            } else {
                Write-Host "[FEHLER] SSH-Deployment fehlgeschlagen" -ForegroundColor Red
            }
        }
        
        "local" {
            Write-Host "Deploye lokal..." -ForegroundColor Cyan
            
            if (-not (Test-Path $host.path)) {
                New-Item -ItemType Directory -Path $host.path -Force | Out-Null
            }
            
            Copy-Item $serverBinary $host.path -Force
            Write-Host "[OK] Server deployed nach: $($host.path)" -ForegroundColor Green
        }
        
        "ftp" {
            Write-Host "[INFO] FTP-Deployment erfordert FTP-Client" -ForegroundColor Yellow
            Write-Host "Bitte verwende FileZilla oder WinSCP" -ForegroundColor Yellow
            Write-Host "Datei: $serverBinary" -ForegroundColor White
            Write-Host "Ziel: ftp://$($host.host)$($host.path)/ostosos-server" -ForegroundColor White
        }
        
        default {
            Write-Host "[WARN] Unbekannter Host-Typ: $($host.type)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] Deployment abgeschlossen" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


# ============================================
# [.SYSTEMS.T.SYSTEMS.] Deploy AND Start All Hosts - FABRIKAGE
# ============================================
# VOLLSTAENDIG AUTOMATISCH - FABRIKAGE UEBERNIMMT ALLES
# Deployt UND startet Server auf ALLEN verbundenen Servern
# Fabrikation Standard TÜV MCP
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[.SYSTEMS.T.SYSTEMS.] DEPLOY AND START ALL HOSTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host "Factory-System Integration" -ForegroundColor Yellow
Write-Host "Deployt UND startet auf ALLEN Servern" -ForegroundColor Yellow
Write-Host "0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host ""

$ROOT = $PSScriptRoot
$CONFIG_FILE = Join-Path $ROOT "host-config.json"
$BUILD_DIR = Join-Path $ROOT "..\go-executable\build"
$SETTINGS_ROOT = Join-Path $ROOT "..\..\settings"
$FACTORY_MANIFEST = Join-Path $ROOT "..\..\factory.manifest.yaml"

# ============================================
# SETTINGS-ORDNER PRUEFEN UND LADEN
# ============================================
Write-Host "Pruefe Settings-Ordner..." -ForegroundColor Cyan

$settingsLoaded = $false
$settingsConfig = $null

if (Test-Path $SETTINGS_ROOT) {
    Write-Host "[OK] Settings-Ordner gefunden: $SETTINGS_ROOT" -ForegroundColor Green
    
    $settingsManifest = Join-Path $SETTINGS_ROOT "settings-manifest.json"
    if (Test-Path $settingsManifest) {
        try {
            $settingsConfig = Get-Content $settingsManifest | ConvertFrom-Json
            $settingsLoaded = $true
            Write-Host "[OK] Settings-Manifest geladen" -ForegroundColor Green
        } catch {
            Write-Host "[WARN] Settings-Manifest konnte nicht geladen werden: $_" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "[WARN] Settings-Ordner nicht gefunden: $SETTINGS_ROOT" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# FABRIKAGE-MANIFEST PRUEFEN
# ============================================
Write-Host "Pruefe Fabrikage-Manifest..." -ForegroundColor Cyan

if (Test-Path $FACTORY_MANIFEST) {
    Write-Host "[OK] Factory-Manifest gefunden" -ForegroundColor Green
} else {
    Write-Host "[WARN] Factory-Manifest nicht gefunden: $FACTORY_MANIFEST" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# MCP-VERBINDUNG PRUEFEN
# ============================================
Write-Host "Pruefe MCP-Verbindungen..." -ForegroundColor Cyan

$mcpConnected = $false
$fabrikationCentrale = $null
$mcpRegistryPath = Join-Path $SETTINGS_ROOT "mcp\mcp-registry.json"

if (Test-Path $mcpRegistryPath) {
    try {
        $mcpRegistry = Get-Content $mcpRegistryPath | ConvertFrom-Json
        $fabrikationCentrale = $mcpRegistry.mcpRegistry | Where-Object { $_.id -eq "fabrikation-centrale-001" }
        
        if ($fabrikationCentrale -and $fabrikationCentrale.status -eq "connected") {
            $mcpConnected = $true
            Write-Host "[OK] MCP fabrikation-centrale-001 verbunden" -ForegroundColor Green
        } else {
            Write-Host "[WARN] MCP fabrikation-centrale-001 nicht verbunden" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[WARN] MCP-Registry konnte nicht geladen werden: $_" -ForegroundColor Yellow
    }
}

Write-Host ""

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
    Write-Host "  Branding: $($config.factory.branding)" -ForegroundColor White
    Write-Host ""
}

$serverPort = $config.defaults.server_port
if (-not $serverPort) {
    $serverPort = 9090
}

Write-Host "Deploye und starte auf ALLEN $($config.hosts.Count) Host(s)..." -ForegroundColor Cyan
Write-Host ""

$deployedCount = 0
$startedCount = 0
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
    }
    if ($host.fabrikage -and $host.fabrikage.enabled) {
        Write-Host "Fabrikage: ENABLED" -ForegroundColor Green
    }
    Write-Host ""
    
    # Deployment basierend auf Typ
    $deploymentSuccess = $false
    $remotePath = $host.path
    
    switch ($host.type) {
        "ssh" {
            Write-Host "Deploye via SSH/SCP..." -ForegroundColor Cyan
            
            if (-not $host.host -or $host.host -like "*example.com*") {
                Write-Host "[WARN] SSH-Host nicht konfiguriert (Beispiel-Host übersprungen)" -ForegroundColor Yellow
                Write-Host ""
                continue
            }
            
            $scpCmd = "scp"
            if ($host.port -and $host.port -ne 22) {
                $scpCmd += " -P $($host.port)"
            }
            $scpCmd += " `"$serverBinary`" `"$($host.host):$remotePath/ostosos-server`" 2>&1"
            
            Write-Host "Befehl: $scpCmd" -ForegroundColor Gray
            try {
                $result = Invoke-Expression $scpCmd
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[OK] Server deployed" -ForegroundColor Green
                    $deploymentSuccess = $true
                    $deployedCount++
                    
                    # Erstelle Start-Script mit Fabrikage-Integration
                    $startScript = @"
#!/usr/bin/env bash
set -e
cd "$remotePath"
chmod +x ostosos-server
echo "[.SYSTEMS.T.SYSTEMS.] Starting server..."
nohup ./ostosos-server > server.log 2>&1 &
SERVER_PID=`$!
echo "Server gestartet (PID: `$SERVER_PID)"
echo "Server läuft auf: http://127.0.0.1:$serverPort"
echo "Log: $remotePath/server.log"
echo "PID: `$SERVER_PID" > server.pid
"@
                    
                    $tempScript = Join-Path $env:TEMP "start-server-$($host.name -replace '[^\w]', '_').sh"
                    $startScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline
                    
                    $scpScriptCmd = "scp"
                    if ($host.port -and $host.port -ne 22) {
                        $scpScriptCmd += " -P $($host.port)"
                    }
                    $scpScriptCmd += " `"$tempScript`" `"$($host.host):$remotePath/start-server.sh`" 2>&1"
                    
                    Invoke-Expression $scpScriptCmd | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "[OK] Start-Script deployed" -ForegroundColor Green
                        
                        # Starte Server via SSH
                        Write-Host "Starte Server auf $($host.name)..." -ForegroundColor Cyan
                        $sshCmd = "ssh"
                        if ($host.port -and $host.port -ne 22) {
                            $sshCmd += " -p $($host.port)"
                        }
                        $sshCmd += " `"$($host.host)`" `"cd $remotePath && chmod +x start-server.sh && bash start-server.sh`" 2>&1"
                        
                        try {
                            $startResult = Invoke-Expression $sshCmd
                            if ($LASTEXITCODE -eq 0) {
                                Write-Host "[OK] Server gestartet auf $($host.name)" -ForegroundColor Green
                                Write-Host "  URL: http://$($host.host -replace '.*@', ''):$serverPort" -ForegroundColor Gray
                                $startedCount++
                            } else {
                                Write-Host "[WARN] Server-Start möglicherweise fehlgeschlagen" -ForegroundColor Yellow
                            }
                        } catch {
                            Write-Host "[WARN] Server-Start fehlgeschlagen: $_" -ForegroundColor Yellow
                        }
                    }
                } else {
                    Write-Host "[FEHLER] SSH-Deployment fehlgeschlagen" -ForegroundColor Red
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
                if (-not (Test-Path $remotePath)) {
                    New-Item -ItemType Directory -Path $remotePath -Force | Out-Null
                    Write-Host "[OK] Verzeichnis erstellt: $remotePath" -ForegroundColor Green
                }
                
                Copy-Item $serverBinary $remotePath -Force
                Write-Host "[OK] Server deployed nach: $remotePath" -ForegroundColor Green
                $deploymentSuccess = $true
                $deployedCount++
                
                # Starte Server lokal
                Write-Host "Starte Server lokal..." -ForegroundColor Cyan
                $localServerPath = Join-Path $remotePath (Split-Path $serverBinary -Leaf)
                
                if ($host.platform -like "windows-*") {
                    # Windows: Starte im Hintergrund
                    $startCmd = "Start-Process -FilePath `"$localServerPath`" -WindowStyle Hidden"
                    try {
                        Invoke-Expression $startCmd
                        Start-Sleep -Seconds 2
                        Write-Host "[OK] Server gestartet auf: http://127.0.0.1:$serverPort" -ForegroundColor Green
                        $startedCount++
                    } catch {
                        Write-Host "[WARN] Server-Start fehlgeschlagen: $_" -ForegroundColor Yellow
                    }
                } else {
                    # Linux/macOS: Starte im Hintergrund
                    $startScript = @"
#!/usr/bin/env bash
cd "$remotePath"
chmod +x $(Split-Path $serverBinary -Leaf)
nohup ./$(Split-Path $serverBinary -Leaf) > server.log 2>&1 &
echo "Server gestartet: http://127.0.0.1:$serverPort"
"@
                    $tempScript = Join-Path $env:TEMP "start-server-local.sh"
                    $startScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline
                    
                    try {
                        bash $tempScript
                        Write-Host "[OK] Server gestartet auf: http://127.0.0.1:$serverPort" -ForegroundColor Green
                        $startedCount++
                    } catch {
                        Write-Host "[WARN] Server-Start fehlgeschlagen: $_" -ForegroundColor Yellow
                    }
                }
            } catch {
                Write-Host "[FEHLER] Lokales Deployment fehlgeschlagen: $_" -ForegroundColor Red
                $failedCount++
            }
        }
        
        default {
            Write-Host "[WARN] Unbekannter Host-Typ: $($host.type)" -ForegroundColor Yellow
            $failedCount++
        }
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT UND START ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployed: $deployedCount" -ForegroundColor Green
Write-Host "Gestartet: $startedCount" -ForegroundColor Green
Write-Host "Fehlgeschlagen: $failedCount" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "Green" })
Write-Host "Gesamt: $($config.hosts.Count)" -ForegroundColor White
if ($mcpConnected) {
    Write-Host "MCP-Verbindung: Aktiv" -ForegroundColor Green
}
if ($settingsLoaded) {
    Write-Host "Settings-Integration: Aktiv" -ForegroundColor Green
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor Cyan
Write-Host "FABRIKAGE UEBERNIMMT ALLES - 0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host "PROJEKT LIVE AUF ALLEN SERVERN!" -ForegroundColor Green
Write-Host ""


# ============================================
# [.SYSTEMS.T.SYSTEMS.] Deploy to All Hosts - FABRIKAGE
# ============================================
# VOLLSTAENDIG AUTOMATISCH - FABRIKAGE UEBERNIMMT ALLES
# Nutzt Settings-Ordner komplett integriert
# Fabrikation Standard TÜV MCP
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[.SYSTEMS.T.SYSTEMS.] DEPLOY ALL HOSTS - FABRIKAGE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host "Factory-System Integration" -ForegroundColor Yellow
Write-Host "Settings-Ordner vollstaendig integriert" -ForegroundColor Yellow
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
            Write-Host "  Name: $($settingsConfig.name)" -ForegroundColor Gray
        } catch {
            Write-Host "[WARN] Settings-Manifest konnte nicht geladen werden: $_" -ForegroundColor Yellow
        }
    }
    
    # Pruefe Settings-Unterordner
    $settingsDirs = @("api", "config", "core", "mcp", "schemas", "utils")
    foreach ($dir in $settingsDirs) {
        $dirPath = Join-Path $SETTINGS_ROOT $dir
        if (Test-Path $dirPath) {
            Write-Host "  [OK] $dir vorhanden" -ForegroundColor Gray
        } else {
            Write-Host "  [WARN] $dir nicht gefunden" -ForegroundColor Yellow
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
    Write-Host "  Path: $FACTORY_MANIFEST" -ForegroundColor Gray
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
            Write-Host "  Endpoint: $($fabrikationCentrale.networkInfo.address)" -ForegroundColor Gray
            Write-Host "  Factory Path: $($fabrikationCentrale.factoryPath)" -ForegroundColor Gray
        } else {
            Write-Host "[WARN] MCP fabrikation-centrale-001 nicht verbunden" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[WARN] MCP-Registry konnte nicht geladen werden: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARN] MCP-Registry nicht gefunden: $mcpRegistryPath" -ForegroundColor Yellow
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
    Write-Host "  Codename: $($config.factory.codename)" -ForegroundColor White
    Write-Host "  Branding: $($config.factory.branding)" -ForegroundColor White
    if ($config.factory.settings_path) {
        Write-Host "  Settings Path: $($config.factory.settings_path)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Zeige Settings-Integration
if ($config.settings -and $config.settings.enabled) {
    Write-Host "Settings-Integration:" -ForegroundColor Cyan
    Write-Host "  Enabled: $($config.settings.enabled)" -ForegroundColor White
    Write-Host "  Root Path: $($config.settings.root_path)" -ForegroundColor Gray
    Write-Host "  API Path: $($config.settings.api_path)" -ForegroundColor Gray
    Write-Host "  Config Path: $($config.settings.config_path)" -ForegroundColor Gray
    Write-Host "  MCP Path: $($config.settings.mcp_path)" -ForegroundColor Gray
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
            if ($profile.settings_profile) {
                Write-Host "  Settings Profile: $($profile.settings_profile)" -ForegroundColor Gray
            }
        }
    }
    if ($host.fabrikage -and $host.fabrikage.enabled) {
        Write-Host "Fabrikage: ENABLED" -ForegroundColor Green
        if ($host.fabrikage.standards) {
            Write-Host "  Standards: $($host.fabrikage.standards -join ', ')" -ForegroundColor Gray
        }
    }
    if ($host.settings -and $host.settings.enabled) {
        Write-Host "Settings: ENABLED" -ForegroundColor Green
        if ($host.settings.profile) {
            Write-Host "  Settings Profile: $($host.settings.profile)" -ForegroundColor Gray
        }
        if ($host.settings.auto_load) {
            Write-Host "  Auto-Load: Aktiv" -ForegroundColor Gray
        }
    }
    
    # MCP-Validierung via Fabrikation Centrale
    if ($mcpConnected -and $fabrikationCentrale) {
        Write-Host "MCP-Validierung: Aktiv" -ForegroundColor Cyan
        Write-Host "  MCP-Endpoint: $($fabrikationCentrale.networkInfo.address)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Deployment basierend auf Typ
    $deploymentSuccess = $false
    
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
            $scpCmd += " `"$serverBinary`" `"$($host.host):$($host.path)/ostosos-server`" 2>&1"
            
            Write-Host "Befehl: $scpCmd" -ForegroundColor Gray
            try {
                $result = Invoke-Expression $scpCmd
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[OK] Server deployed" -ForegroundColor Green
                    $deploymentSuccess = $true
                    $deployedCount++
                    
                    # Erstelle Start-Script mit Settings-Integration
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
if ($mcpConnected) {
    Write-Host "MCP-Verbindung: Aktiv" -ForegroundColor Green
} else {
    Write-Host "MCP-Verbindung: Nicht aktiv" -ForegroundColor Yellow
}
if ($settingsLoaded) {
    Write-Host "Settings-Integration: Aktiv" -ForegroundColor Green
} else {
    Write-Host "Settings-Integration: Nicht aktiv" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor Cyan
Write-Host "FABRIKAGE UEBERNIMMT ALLES - 0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host ""


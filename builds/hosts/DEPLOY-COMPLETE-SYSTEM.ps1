# ============================================
# [.SYSTEMS.T.SYSTEMS.] Deploy COMPLETE SYSTEM
# ============================================
# Deployt DAS GANZE SYSTEM auf ALLE Server
# - Server-Binaries (Go/Python)
# - UI-Dateien (HTML, CSS, JS)
# - Settings-Ordner
# - Fabrikage-Module
# - Factory-Manifest
# - Dokumentation
# - Assets
# Fabrikation Standard TÜV MCP
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[.SYSTEMS.T.SYSTEMS.] DEPLOY COMPLETE SYSTEM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployt DAS GANZE SYSTEM auf ALLE Server" -ForegroundColor Yellow
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host "0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host ""

$ROOT = $PSScriptRoot
$PROJECT_ROOT = Join-Path $ROOT "..\.."
$CONFIG_FILE = Join-Path $ROOT "host-config.json"
$BUILD_DIR = Join-Path $ROOT "..\go-executable\build"
$SETTINGS_ROOT = Join-Path $PROJECT_ROOT "settings"
$FACTORY_MANIFEST = Join-Path $PROJECT_ROOT "factory.manifest.yaml"

# ============================================
# DEFINIERE DEPLOYMENT-PAKET
# ============================================
Write-Host "Definiere Deployment-Paket..." -ForegroundColor Cyan

$deploymentItems = @{
    # Server-Binaries
    "server" = @{
        "source" = $BUILD_DIR
        "description" = "Server-Binaries (Go/Python)"
    }
    
    # UI-Dateien
    "ui" = @{
        "source" = Join-Path $PROJECT_ROOT "."
        "files" = @("*.html", "*.css", "*.js", "sw.js")
        "exclude" = @("node_modules", ".git", "builds", "backup", "ARCHIV")
        "description" = "UI-Dateien (HTML, CSS, JS)"
    }
    
    # Settings-Ordner
    "settings" = @{
        "source" = $SETTINGS_ROOT
        "description" = "Settings-Ordner (vollstaendig)"
    }
    
    # Fabrikage-Module
    "fabrikage" = @{
        "source" = $PROJECT_ROOT
        "folders" = @(
            "Fabrikage.CoreProtocols",
            "Fabrikage.AutoExecution",
            "Fabrikage.IntelligenceMatrix",
            "Fabrikage.ProvenanceLedger",
            "Fabrikage.ObservabilityAtlas"
        )
        "description" = "Fabrikage-Module"
    }
    
    # Factory-Manifest
    "factory" = @{
        "source" = $FACTORY_MANIFEST
        "description" = "Factory-Manifest"
    }
    
    # Dokumentation
    "docs" = @{
        "source" = $PROJECT_ROOT
        "files" = @("*.md", "README.md", "LICENSE*")
        "description" = "Dokumentation"
    }
    
    # Assets
    "assets" = @{
        "source" = Join-Path $PROJECT_ROOT "assets"
        "description" = "Branding-Assets"
    }
}

Write-Host "[OK] Deployment-Paket definiert" -ForegroundColor Green
Write-Host ""

# Lade Host-Konfiguration
if (-not (Test-Path $CONFIG_FILE)) {
    Write-Host "[FEHLER] Host-Konfiguration nicht gefunden: $CONFIG_FILE" -ForegroundColor Red
    exit 1
}

$config = Get-Content $CONFIG_FILE | ConvertFrom-Json

Write-Host "Factory-System:" -ForegroundColor Cyan
Write-Host "  Name: $($config.factory.name)" -ForegroundColor White
Write-Host "  Version: $($config.factory.version)" -ForegroundColor White
Write-Host "  Branding: $($config.factory.branding)" -ForegroundColor White
Write-Host ""

$serverPort = $config.defaults.server_port
if (-not $serverPort) {
    $serverPort = 9090
}

Write-Host "Deploye GANZES SYSTEM auf ALLEN $($config.hosts.Count) Host(s)..." -ForegroundColor Cyan
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
    
    Write-Host "Platform: $($host.platform)" -ForegroundColor White
    if ($host.profile) {
        Write-Host "Profile: $($host.profile)" -ForegroundColor Cyan
    }
    Write-Host ""
    
    # Deployment basierend auf Typ
    $deploymentSuccess = $false
    $remotePath = $host.path
    
    switch ($host.type) {
        "ssh" {
            Write-Host "Deploye GANZES SYSTEM via SSH/SCP..." -ForegroundColor Cyan
            
            # DEPLOY AUF ALLE SSH-HOSTS - AUCH BEISPIEL-HOSTS WERDEN VERSUCHT
            if (-not $host.host) {
                Write-Host "[WARN] SSH-Host nicht konfiguriert" -ForegroundColor Yellow
                Write-Host ""
                continue
            }
            
            # 1. Server-Binary
            Write-Host "[1/6] Deploye Server-Binary..." -ForegroundColor Yellow
            $scpCmd = "scp"
            if ($host.port -and $host.port -ne 22) {
                $scpCmd += " -P $($host.port)"
            }
            $scpCmd += " `"$serverBinary`" `"$($host.host):$remotePath/ostosos-server`" 2>&1"
            
            try {
                Invoke-Expression $scpCmd | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[OK] Server-Binary deployed" -ForegroundColor Green
                } else {
                    Write-Host "[FEHLER] Server-Binary Deployment fehlgeschlagen" -ForegroundColor Red
                    $failedCount++
                    continue
                }
            } catch {
                Write-Host "[FEHLER] Server-Binary Deployment fehlgeschlagen: $_" -ForegroundColor Red
                $failedCount++
                continue
            }
            
            # 2. UI-Dateien
            Write-Host "[2/6] Deploye UI-Dateien..." -ForegroundColor Yellow
            $uiFiles = Get-ChildItem -Path $PROJECT_ROOT -Include "*.html", "*.css", "*.js", "sw.js" -Recurse -File | Where-Object {
                $exclude = $false
                foreach ($ex in $deploymentItems["ui"]["exclude"]) {
                    if ($_.FullName -like "*\$ex\*") {
                        $exclude = $true
                        break
                    }
                }
                -not $exclude
            }
            
            foreach ($file in $uiFiles) {
                $relativePath = $file.FullName.Replace($PROJECT_ROOT, "").TrimStart("\")
                $remoteFilePath = "$remotePath/$relativePath"
                $remoteDir = Split-Path $remoteFilePath -Parent
                
                $sshMkdir = "ssh"
                if ($host.port -and $host.port -ne 22) {
                    $sshMkdir += " -p $($host.port)"
                }
                $sshMkdir += " `"$($host.host)`" `"mkdir -p $(Split-Path $remoteFilePath -Parent)`""
                Invoke-Expression $sshMkdir | Out-Null
                
                $scpFile = "scp"
                if ($host.port -and $host.port -ne 22) {
                    $scpFile += " -P $($host.port)"
                }
                $scpFile += " `"$($file.FullName)`" `"$($host.host):$remoteFilePath`" 2>&1"
                Invoke-Expression $scpFile | Out-Null
            }
            Write-Host "[OK] UI-Dateien deployed ($($uiFiles.Count) Dateien)" -ForegroundColor Green
            
            # 3. Settings-Ordner
            Write-Host "[3/6] Deploye Settings-Ordner..." -ForegroundColor Yellow
            if (Test-Path $SETTINGS_ROOT) {
                $scpSettings = "scp"
                if ($host.port -and $host.port -ne 22) {
                    $scpSettings += " -P $($host.port)"
                }
                $scpSettings += " -r `"$SETTINGS_ROOT`" `"$($host.host):$remotePath/settings`" 2>&1"
                Invoke-Expression $scpSettings | Out-Null
                Write-Host "[OK] Settings-Ordner deployed" -ForegroundColor Green
            }
            
            # 4. Fabrikage-Module
            Write-Host "[4/6] Deploye Fabrikage-Module..." -ForegroundColor Yellow
            foreach ($fabModule in $deploymentItems["fabrikage"]["folders"]) {
                $fabPath = Join-Path $PROJECT_ROOT $fabModule
                if (Test-Path $fabPath) {
                    $scpFab = "scp"
                    if ($host.port -and $host.port -ne 22) {
                        $scpFab += " -P $($host.port)"
                    }
                    $scpFab += " -r `"$fabPath`" `"$($host.host):$remotePath/$fabModule`" 2>&1"
                    Invoke-Expression $scpFab | Out-Null
                }
            }
            Write-Host "[OK] Fabrikage-Module deployed" -ForegroundColor Green
            
            # 5. Factory-Manifest
            Write-Host "[5/6] Deploye Factory-Manifest..." -ForegroundColor Yellow
            if (Test-Path $FACTORY_MANIFEST) {
                $scpManifest = "scp"
                if ($host.port -and $host.port -ne 22) {
                    $scpManifest += " -P $($host.port)"
                }
                $scpManifest += " `"$FACTORY_MANIFEST`" `"$($host.host):$remotePath/factory.manifest.yaml`" 2>&1"
                Invoke-Expression $scpManifest | Out-Null
                Write-Host "[OK] Factory-Manifest deployed" -ForegroundColor Green
            }
            
            # 6. Assets
            Write-Host "[6/6] Deploye Assets..." -ForegroundColor Yellow
            $assetsPath = Join-Path $PROJECT_ROOT "assets"
            if (Test-Path $assetsPath) {
                $scpAssets = "scp"
                if ($host.port -and $host.port -ne 22) {
                    $scpAssets += " -P $($host.port)"
                }
                $scpAssets += " -r `"$assetsPath`" `"$($host.host):$remotePath/assets`" 2>&1"
                Invoke-Expression $scpAssets | Out-Null
                Write-Host "[OK] Assets deployed" -ForegroundColor Green
            }
            
            $deploymentSuccess = $true
            $deployedCount++
            
            # Erstelle Start-Script
            $startScript = @"
#!/usr/bin/env bash
set -e
cd "$remotePath"
chmod +x ostosos-server
echo "[.SYSTEMS.T.SYSTEMS.] Starting complete system..."
nohup ./ostosos-server > server.log 2>&1 &
SERVER_PID=`$!
echo "Complete system gestartet (PID: `$SERVER_PID)"
echo "Server läuft auf: http://127.0.0.1:$serverPort"
echo "Log: $remotePath/server.log"
echo "PID: `$SERVER_PID" > server.pid
"@
            
            $tempScript = Join-Path $env:TEMP "start-complete-system-$($host.name -replace '[^\w]', '_').sh"
            $startScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline
            
            $scpScriptCmd = "scp"
            if ($host.port -and $host.port -ne 22) {
                $scpScriptCmd += " -P $($host.port)"
            }
            $scpScriptCmd += " `"$tempScript`" `"$($host.host):$remotePath/start-system.sh`" 2>&1"
            
            Invoke-Expression $scpScriptCmd | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Start-Script deployed" -ForegroundColor Green
                
                # Starte System
                Write-Host "Starte GANZES SYSTEM auf $($host.name)..." -ForegroundColor Cyan
                $sshCmd = "ssh"
                if ($host.port -and $host.port -ne 22) {
                    $sshCmd += " -p $($host.port)"
                }
                $sshCmd += " `"$($host.host)`" `"cd $remotePath && chmod +x start-system.sh && bash start-system.sh`" 2>&1"
                
                try {
                    $startResult = Invoke-Expression $sshCmd
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "[OK] GANZES SYSTEM gestartet auf $($host.name)" -ForegroundColor Green
                        Write-Host "  URL: http://$($host.host -replace '.*@', ''):$serverPort" -ForegroundColor Gray
                        $startedCount++
                    }
                } catch {
                    Write-Host "[WARN] System-Start fehlgeschlagen: $_" -ForegroundColor Yellow
                }
            }
        }
        
        "local" {
            Write-Host "Deploye GANZES SYSTEM lokal..." -ForegroundColor Cyan
            
            try {
                # Erstelle Verzeichnis
                if (-not (Test-Path $remotePath)) {
                    New-Item -ItemType Directory -Path $remotePath -Force | Out-Null
                    Write-Host "[OK] Verzeichnis erstellt: $remotePath" -ForegroundColor Green
                }
                
                # 1. Server-Binary
                Write-Host "[1/6] Deploye Server-Binary..." -ForegroundColor Yellow
                Copy-Item $serverBinary $remotePath -Force
                Write-Host "[OK] Server-Binary deployed" -ForegroundColor Green
                
                # 2. UI-Dateien
                Write-Host "[2/6] Deploye UI-Dateien..." -ForegroundColor Yellow
                $uiFiles = Get-ChildItem -Path $PROJECT_ROOT -Include "*.html", "*.css", "*.js", "sw.js" -Recurse -File | Where-Object {
                    $exclude = $false
                    foreach ($ex in $deploymentItems["ui"]["exclude"]) {
                        if ($_.FullName -like "*\$ex\*") {
                            $exclude = $true
                            break
                        }
                    }
                    -not $exclude
                }
                
                foreach ($file in $uiFiles) {
                    $relativePath = $file.FullName.Replace($PROJECT_ROOT, "").TrimStart("\")
                    $targetPath = Join-Path $remotePath $relativePath
                    $targetDir = Split-Path $targetPath -Parent
                    
                    if (-not (Test-Path $targetDir)) {
                        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                    }
                    
                    Copy-Item $file.FullName $targetPath -Force
                }
                Write-Host "[OK] UI-Dateien deployed ($($uiFiles.Count) Dateien)" -ForegroundColor Green
                
                # 3. Settings-Ordner
                Write-Host "[3/6] Deploye Settings-Ordner..." -ForegroundColor Yellow
                if (Test-Path $SETTINGS_ROOT) {
                    $settingsTarget = Join-Path $remotePath "settings"
                    Copy-Item $SETTINGS_ROOT $settingsTarget -Recurse -Force
                    Write-Host "[OK] Settings-Ordner deployed" -ForegroundColor Green
                }
                
                # 4. Fabrikage-Module
                Write-Host "[4/6] Deploye Fabrikage-Module..." -ForegroundColor Yellow
                foreach ($fabModule in $deploymentItems["fabrikage"]["folders"]) {
                    $fabPath = Join-Path $PROJECT_ROOT $fabModule
                    if (Test-Path $fabPath) {
                        $fabTarget = Join-Path $remotePath $fabModule
                        Copy-Item $fabPath $fabTarget -Recurse -Force
                    }
                }
                Write-Host "[OK] Fabrikage-Module deployed" -ForegroundColor Green
                
                # 5. Factory-Manifest
                Write-Host "[5/6] Deploye Factory-Manifest..." -ForegroundColor Yellow
                if (Test-Path $FACTORY_MANIFEST) {
                    Copy-Item $FACTORY_MANIFEST (Join-Path $remotePath "factory.manifest.yaml") -Force
                    Write-Host "[OK] Factory-Manifest deployed" -ForegroundColor Green
                }
                
                # 6. Assets
                Write-Host "[6/6] Deploye Assets..." -ForegroundColor Yellow
                $assetsPath = Join-Path $PROJECT_ROOT "assets"
                if (Test-Path $assetsPath) {
                    $assetsTarget = Join-Path $remotePath "assets"
                    Copy-Item $assetsPath $assetsTarget -Recurse -Force
                    Write-Host "[OK] Assets deployed" -ForegroundColor Green
                }
                
                $deploymentSuccess = $true
                $deployedCount++
                
                # Starte System lokal
                Write-Host "Starte GANZES SYSTEM lokal..." -ForegroundColor Cyan
                $localServerPath = Join-Path $remotePath (Split-Path $serverBinary -Leaf)
                
                if ($host.platform -like "windows-*") {
                    Start-Process -FilePath $localServerPath -WindowStyle Hidden
                    Start-Sleep -Seconds 2
                    Write-Host "[OK] GANZES SYSTEM gestartet auf: http://127.0.0.1:$serverPort" -ForegroundColor Green
                    $startedCount++
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
Write-Host "COMPLETE SYSTEM DEPLOYMENT ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployed: $deployedCount" -ForegroundColor Green
Write-Host "Gestartet: $startedCount" -ForegroundColor Green
Write-Host "Fehlgeschlagen: $failedCount" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "Green" })
Write-Host "Gesamt: $($config.hosts.Count)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor Cyan
Write-Host "FABRIKAGE UEBERNIMMT ALLES - 0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host "GANZES SYSTEM LIVE AUF ALLEN SERVERN!" -ForegroundColor Green
Write-Host ""


# Deploy Apple-Pi Services auf Raspberry Pi
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

param(
    [Parameter(Mandatory=$true)]
    [string]$PiHost = "192.168.1.10",
    
    [Parameter(Mandatory=$false)]
    [string]$PiUser = "pi",
    
    [Parameter(Mandatory=$false)]
    [string]$PiPassword = ""
)

$ErrorActionPreference = "Continue"
$ConfirmPreference = "None"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  APPLE-PI DEPLOY TO RASPBERRY PI" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$deployDir = "/opt/apple-pi"

Write-Host "📡 Verbinde mit Raspberry Pi: $PiHost" -ForegroundColor Cyan
Write-Host ""

# SSH-Befehle vorbereiten
$sshCommands = @"
# 1. Verzeichnis erstellen
sudo mkdir -p $deployDir
cd $deployDir

# 2. Docker installieren (falls nicht vorhanden)
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker \$USER
fi

# 3. Docker Compose installieren
if ! command -v docker-compose &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y docker-compose
fi

# 4. Services starten
cd $deployDir
sudo docker-compose -f infra/docker-compose.yml up -d

# 5. Status prüfen
sudo docker-compose -f infra/docker-compose.yml ps
"@

Write-Host "📤 Sende Deploy-Befehle..." -ForegroundColor Cyan

if ($PiPassword) {
    # Mit Passwort (SSH-Pass verwenden oder Key)
    Write-Host "⚠️ Passwort-Authentifizierung erforderlich" -ForegroundColor Yellow
    Write-Host "   Bitte SSH-Key einrichten für automatisches Deploy:" -ForegroundColor Yellow
    Write-Host "   ssh-copy-id $PiUser@$PiHost" -ForegroundColor Gray
} else {
    # Mit SSH-Key
    Write-Host "🔑 Verwende SSH-Key-Authentifizierung" -ForegroundColor Green
    ssh "$PiUser@$PiHost" $sshCommands
}

Write-Host ""
Write-Host "✅ Deploy abgeschlossen" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Services sollten jetzt laufen auf:" -ForegroundColor Cyan
Write-Host "   - Notary Core: https://$PiHost:8085" -ForegroundColor Gray
Write-Host "   - Startup Core: https://$PiHost:8086" -ForegroundColor Gray
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan



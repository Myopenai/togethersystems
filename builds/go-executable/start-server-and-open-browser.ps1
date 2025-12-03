# Startet Server und öffnet Browser automatisch

$ErrorActionPreference = "Continue"

Write-Host "Starte Server..." -ForegroundColor Cyan

$exePath = "build\windows-amd64\ostosos-server.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "FEHLER: EXE nicht gefunden: $exePath" -ForegroundColor Red
    exit 1
}

# Starte Server im Hintergrund
$process = Start-Process -FilePath $exePath -NoNewWindow -PassThru

# Warte kurz
Start-Sleep -Seconds 2

# Versuche Port aus Prozess-Output zu lesen (vereinfacht: verwende 8080)
$port = 8080

# Prüfe ob Server läuft
if ($process.HasExited) {
    Write-Host "FEHLER: Server hat sich beendet!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Server läuft (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""

# Versuche verschiedene Ports
$ports = @(8080, 8081, 8082, 8083, 8084, 8085)
$foundPort = $null

foreach ($p in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$p" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        $foundPort = $p
        break
    } catch {
        # Port nicht verfügbar, weiter
    }
}

if ($foundPort) {
    Write-Host "Server gefunden auf Port: $foundPort" -ForegroundColor Green
    Write-Host "Öffne Browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:$foundPort"
    Write-Host ""
    Write-Host "Browser sollte jetzt geöffnet sein!" -ForegroundColor Green
    Write-Host "URL: http://localhost:$foundPort" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Zum Beenden: Stop-Process -Id $($process.Id) -Force" -ForegroundColor Cyan
} else {
    Write-Host "Server läuft, aber Port nicht gefunden." -ForegroundColor Yellow
    Write-Host "Öffne Browser manuell und versuche:" -ForegroundColor Yellow
    Write-Host "  http://localhost:8080" -ForegroundColor White
    Write-Host "  http://localhost:8081" -ForegroundColor White
    Write-Host "  http://localhost:8082" -ForegroundColor White
    Write-Host ""
    Write-Host "Der Server zeigt dir den Port in der Konsole an!" -ForegroundColor Cyan
}


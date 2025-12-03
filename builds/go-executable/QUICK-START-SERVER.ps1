# Startet Server und öffnet Browser automatisch

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "OSTOSOS Server Quick Start" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$exePath = "build\windows-amd64\ostosos-server.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "FEHLER: EXE nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte erst bauen: .\build-all.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starte Server..." -ForegroundColor Cyan

# Starte Server
$process = Start-Process -FilePath $exePath -NoNewWindow -PassThru

# Warte bis Server startet
Start-Sleep -Seconds 3

if ($process.HasExited) {
    Write-Host "FEHLER: Server hat sich beendet!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Server läuft (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""

# Versuche Port zu finden
Write-Host "Suche Server-Port..." -ForegroundColor Cyan

$ports = @(8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089)
$foundPort = $null

foreach ($p in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$p" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        $foundPort = $p
        Write-Host "[OK] Server gefunden auf Port: $p" -ForegroundColor Green
        break
    } catch {
        # Weiter suchen
    }
}

if ($foundPort) {
    Write-Host ""
    Write-Host "Öffne Browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:$foundPort"
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Browser sollte jetzt geöffnet sein!" -ForegroundColor Green
    Write-Host "URL: http://localhost:$foundPort" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Server läuft im Hintergrund." -ForegroundColor Cyan
    Write-Host "Zum Beenden: Stop-Process -Id $($process.Id) -Force" -ForegroundColor Yellow
} else {
    Write-Host "[WARNUNG] Port nicht automatisch gefunden." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Server läuft! Öffne Browser manuell:" -ForegroundColor Cyan
    Write-Host "  http://localhost:8080" -ForegroundColor White
    Write-Host "  http://localhost:8081" -ForegroundColor White
    Write-Host "  http://localhost:8082" -ForegroundColor White
    Write-Host ""
    Write-Host "Der Server zeigt dir den genauen Port in der Konsole an!" -ForegroundColor Yellow
}


# Startet OSOTOSOS Server und öffnet Browser

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS Server Start" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$exePath = "build-server\ostosos-server-windows.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "FEHLER: Server nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte erst bauen: .\build-server.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starte OSOTOSOS Server..." -ForegroundColor Cyan

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

$ports = @(8080, 8081, 8082, 8083, 8084, 8085)
$foundPort = $null

foreach ($p in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$p/OSTOSOS-OS-COMPLETE-SYSTEM.html" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        $foundPort = $p
        Write-Host "[OK] OSOTOSOS System gefunden auf Port: $p" -ForegroundColor Green
        break
    } catch {
        # Weiter suchen
    }
}

if ($foundPort) {
    Write-Host ""
    Write-Host "Öffne OSOTOSOS System im Browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:$foundPort/OSTOSOS-OS-COMPLETE-SYSTEM.html"
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "OSOTOSOS System sollte jetzt geöffnet sein!" -ForegroundColor Green
    Write-Host "URL: http://localhost:$foundPort/OSTOSOS-OS-COMPLETE-SYSTEM.html" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Server läuft im Hintergrund." -ForegroundColor Cyan
    Write-Host "Zum Beenden: Stop-Process -Id $($process.Id) -Force" -ForegroundColor Yellow
} else {
    Write-Host "[WARNUNG] Port nicht automatisch gefunden." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Server läuft! Öffne Browser manuell:" -ForegroundColor Cyan
    Write-Host "  http://localhost:8080/OSTOSOS-OS-COMPLETE-SYSTEM.html" -ForegroundColor White
    Write-Host "  http://localhost:8081/OSTOSOS-OS-COMPLETE-SYSTEM.html" -ForegroundColor White
    Write-Host ""
    Write-Host "Der Server zeigt dir den genauen Port in der Konsole an!" -ForegroundColor Yellow
}


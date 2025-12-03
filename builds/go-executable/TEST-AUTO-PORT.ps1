# Test der automatischen Port-Suche

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Test: Automatische Port-Suche" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$exePath = "build\windows-amd64\ostosos-server.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "FEHLER: EXE nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "Starte Server..." -ForegroundColor Cyan
Write-Host "Der Server findet automatisch einen freien Port!" -ForegroundColor Yellow
Write-Host ""

# Starte Server - er findet automatisch freien Port
$process = Start-Process -FilePath $exePath -NoNewWindow -PassThru

Start-Sleep -Seconds 2

if ($process.HasExited) {
    Write-Host "FEHLER: Server hat sich beendet!" -ForegroundColor Red
    Write-Host "Exit Code: $($process.ExitCode)" -ForegroundColor Red
} else {
    Write-Host "[OK] Server laeuft (PID: $($process.Id))" -ForegroundColor Green
    Write-Host ""
    Write-Host "Der Server zeigt dir den Port in der Konsole an!" -ForegroundColor Yellow
    Write-Host "Oeffne die Konsole um den Port zu sehen." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Zum Beenden: Stop-Process -Id $($process.Id) -Force" -ForegroundColor Cyan
}


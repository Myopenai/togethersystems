# Detaillierter Test der Windows EXE

$ErrorActionPreference = "Continue"

Write-Host "Teste Windows EXE..." -ForegroundColor Yellow

$exePath = "build\windows-amd64\ostosos-server.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "FEHLER: EXE nicht gefunden: $exePath" -ForegroundColor Red
    exit 1
}

Write-Host "EXE gefunden: $exePath" -ForegroundColor Green
$fileInfo = Get-Item $exePath
Write-Host "Groesse: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host ""

# Test 1: Starte EXE und prüfe ob sie läuft
Write-Host "Test 1: Starte EXE..." -ForegroundColor Yellow

$process = Start-Process -FilePath $exePath -ArgumentList "8080" -PassThru -NoNewWindow

Start-Sleep -Seconds 2

if ($process.HasExited) {
    Write-Host "FEHLER: Prozess ist sofort beendet!" -ForegroundColor Red
    Write-Host "Exit Code: $($process.ExitCode)" -ForegroundColor Red
    
    # Prüfe ob es ein Konsolen-Fenster gibt
    Write-Host ""
    Write-Host "Versuche EXE ohne -H windowsgui Flag neu zu bauen..." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "OK: Prozess läuft (PID: $($process.Id))" -ForegroundColor Green
    
    # Teste Server
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "OK: Server antwortet!" -ForegroundColor Green
    } catch {
        Write-Host "WARNUNG: Server antwortet nicht: $_" -ForegroundColor Yellow
    }
    
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Test abgeschlossen" -ForegroundColor Cyan


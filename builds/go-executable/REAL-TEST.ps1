# ECHTER Test der Windows EXE

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Red
Write-Host "ECHTER TEST - KEINE LUEGEN" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

$exePath = "build\windows-amd64\ostosos-server.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "FEHLER: EXE NICHT GEFUNDEN!" -ForegroundColor Red
    exit 1
}

Write-Host "EXE gefunden: $exePath" -ForegroundColor Yellow
$fileInfo = Get-Item $exePath
Write-Host "Groesse: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Yellow
Write-Host "Datum: $($fileInfo.LastWriteTime)" -ForegroundColor Yellow
Write-Host ""

# Pruefe ob Port 8080 frei ist
Write-Host "Pruefe Port 8080..." -ForegroundColor Cyan
try {
    $null = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
    Write-Host "WARNUNG: Port 8080 ist bereits belegt!" -ForegroundColor Yellow
    Write-Host "Verwende Port 8081 stattdessen..." -ForegroundColor Yellow
    $port = "8081"
} catch {
    Write-Host "OK: Port 8080 ist frei" -ForegroundColor Green
    $port = "8080"
}

Write-Host ""
Write-Host "Starte EXE jetzt..." -ForegroundColor Cyan
Write-Host "Wenn sie sich sofort schliesst, siehst du die Fehlermeldung!" -ForegroundColor Yellow
Write-Host ""

# Starte EXE und warte auf Output
$process = Start-Process -FilePath $exePath -ArgumentList $port -NoNewWindow -PassThru -RedirectStandardOutput "test-output.txt" -RedirectStandardError "test-error.txt"

Start-Sleep -Seconds 3

if ($process.HasExited) {
    Write-Host "FEHLER: EXE hat sich sofort beendet!" -ForegroundColor Red
    Write-Host "Exit Code: $($process.ExitCode)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Standard Output:" -ForegroundColor Yellow
    if (Test-Path "test-output.txt") {
        Get-Content "test-output.txt"
    } else {
        Write-Host "(keine Ausgabe)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Error Output:" -ForegroundColor Yellow
    if (Test-Path "test-error.txt") {
        Get-Content "test-error.txt"
    } else {
        Write-Host "(keine Fehler)" -ForegroundColor Gray
    }
} else {
    Write-Host "OK: EXE laeuft (PID: $($process.Id))" -ForegroundColor Green
    
    # Teste Server
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "OK: Server antwortet! Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "WARNUNG: Server antwortet nicht: $_" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Stoppe Server..." -ForegroundColor Cyan
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    Write-Host "OK: Server gestoppt" -ForegroundColor Green
}

# Cleanup
Remove-Item "test-output.txt" -ErrorAction SilentlyContinue
Remove-Item "test-error.txt" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "TEST ABGESCHLOSSEN" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red


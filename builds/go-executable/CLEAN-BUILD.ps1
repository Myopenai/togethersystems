# Sauberer Build - stoppt alle Prozesse und erstellt neue EXE

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Red
Write-Host "SAUBERER BUILD - ALLES NEU" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Stoppe alle Server-Prozesse
Write-Host "Stoppe alle laufenden Server..." -ForegroundColor Yellow
Get-Process | Where-Object { 
    $_.ProcessName -like "*ostosos*" -or 
    $_.ProcessName -like "*server*" -or
    $_.MainWindowTitle -like "*OSTOSOS*"
} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "[OK] Alle Prozesse gestoppt" -ForegroundColor Green
Write-Host ""

# Loesche alte Builds
Write-Host "Loesche alte Builds..." -ForegroundColor Yellow
if (Test-Path "build\windows-amd64\ostosos-server.exe") {
    Remove-Item "build\windows-amd64\ostosos-server.exe" -Force -ErrorAction SilentlyContinue
}
if (Test-Path "build\windows-amd64\ostosos-server.exe~") {
    Remove-Item "build\windows-amd64\ostosos-server.exe~" -Force -ErrorAction SilentlyContinue
}
Write-Host "[OK] Alte Dateien geloescht" -ForegroundColor Green
Write-Host ""

# Erstelle neue EXE
Write-Host "Erstelle neue EXE..." -ForegroundColor Yellow
$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -ldflags="-s -w" -o build/windows-amd64/ostosos-server.exe main.go

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Neue EXE erstellt!" -ForegroundColor Green
    Write-Host ""
    $fileInfo = Get-Item "build\windows-amd64\ostosos-server.exe"
    Write-Host "Datei: build\windows-amd64\ostosos-server.exe" -ForegroundColor Cyan
    Write-Host "Groesse: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Cyan
    Write-Host "Datum: $($fileInfo.LastWriteTime)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "JETZT TESTEN:" -ForegroundColor Yellow
    Write-Host "  cd build\windows-amd64" -ForegroundColor White
    Write-Host "  .\ostosos-server.exe 8080" -ForegroundColor White
} else {
    Write-Host "[FAIL] Build fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "FERTIG" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red


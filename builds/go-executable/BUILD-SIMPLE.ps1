# T,. OSOTOSOS Simple Build Script
# Vereinfachte Version für schnelle Tests

Write-Host "T,. OSOTOSOS Simple Build" -ForegroundColor Green
Write-Host ""

# Prüfe Go
$goVersion = go version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "FEHLER: Go ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installiere Go von: https://golang.org/dl/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Go gefunden: $goVersion" -ForegroundColor Green
Write-Host ""

# Erstelle build Verzeichnis
if (-not (Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
}

# Build nur für aktuelle Plattform (Windows)
Write-Host "Building für Windows (amd64)..." -ForegroundColor Cyan

$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -ldflags="-s -w" -o build/ostosos-server.exe main.go

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build erfolgreich!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Binary: build/ostosos-server.exe" -ForegroundColor Cyan
    
    $size = (Get-Item "build/ostosos-server.exe").Length / 1MB
    Write-Host "Größe: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "✗ Build fehlgeschlagen" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Green


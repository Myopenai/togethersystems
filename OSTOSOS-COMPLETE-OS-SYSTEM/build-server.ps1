# Build OSOTOSOS Server für alle Plattformen

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS Server Build" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Prüfe Go
$goVersion = go version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "FEHLER: Go ist nicht installiert!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Go gefunden: $goVersion" -ForegroundColor Green
Write-Host ""

# Build-Verzeichnis
$BUILD_DIR = "build-server"
if (-not (Test-Path $BUILD_DIR)) {
    New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null
}

Write-Host "Building OSOTOSOS Server..." -ForegroundColor Cyan
Write-Host ""

# Windows
Write-Host "  -> Windows (amd64)..." -ForegroundColor Yellow
$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -ldflags="-s -w" -o "$BUILD_DIR/ostosos-server-windows.exe" ostosos-server.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Windows Build erfolgreich" -ForegroundColor Green
} else {
    Write-Host "    [FAIL] Windows Build fehlgeschlagen" -ForegroundColor Red
}

# macOS
Write-Host "  -> macOS (amd64)..." -ForegroundColor Yellow
$env:GOOS = "darwin"
$env:GOARCH = "amd64"
go build -ldflags="-s -w" -o "$BUILD_DIR/ostosos-server-macos" ostosos-server.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] macOS Build erfolgreich" -ForegroundColor Green
} else {
    Write-Host "    [FAIL] macOS Build fehlgeschlagen" -ForegroundColor Red
}

# Linux
Write-Host "  -> Linux (amd64)..." -ForegroundColor Yellow
$env:GOOS = "linux"
$env:GOARCH = "amd64"
go build -ldflags="-s -w" -o "$BUILD_DIR/ostosos-server-linux" ostosos-server.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Linux Build erfolgreich" -ForegroundColor Green
} else {
    Write-Host "    [FAIL] Linux Build fehlgeschlagen" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] Build abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Server-Binaries in: $BUILD_DIR" -ForegroundColor Cyan
Write-Host ""
Write-Host "Windows Server:" -ForegroundColor Yellow
Write-Host "  $BUILD_DIR\ostosos-server-windows.exe" -ForegroundColor White
Write-Host ""
Write-Host "Der Server findet automatisch:" -ForegroundColor Cyan
Write-Host "  - OSOTOSOS-OS-COMPLETE-SYSTEM.html" -ForegroundColor White
Write-Host "  - Automatisch freien Port" -ForegroundColor White
Write-Host ""


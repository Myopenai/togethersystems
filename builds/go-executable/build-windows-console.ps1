# Build Windows EXE OHNE windowsgui Flag (mit Konsole sichtbar)

$ErrorActionPreference = "Stop"

Write-Host "Building Windows EXE mit sichtbarer Konsole..." -ForegroundColor Cyan

$BUILD_DIR = "build"
$APP_NAME = "ostosos-server"

if (-not (Test-Path $BUILD_DIR)) {
    New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null
}

$buildPath = Join-Path $BUILD_DIR "windows-amd64"
if (-not (Test-Path $buildPath)) {
    New-Item -ItemType Directory -Path $buildPath | Out-Null
}

# Build OHNE -H windowsgui (Konsole bleibt sichtbar)
$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -ldflags="-s -w" -o (Join-Path $buildPath "$APP_NAME.exe") main.go

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Windows EXE erstellt: $buildPath\$APP_NAME.exe" -ForegroundColor Green
    Write-Host ""
    Write-Host "Diese Version zeigt Fehlermeldungen in der Konsole!" -ForegroundColor Yellow
} else {
    Write-Host "[FAIL] Build fehlgeschlagen" -ForegroundColor Red
    exit 1
}


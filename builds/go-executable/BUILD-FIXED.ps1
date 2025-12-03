# T,. OSOTOSOS Universal Go Build Pipeline - PowerShell Script
# One-Click Setup für alle Plattformen
# FIXED VERSION - Keine Unicode-Zeichen

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS Universal Go Build Pipeline" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Farben
$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"
$CYAN = "Cyan"

# Prüfe ob Go installiert ist
Write-Host "Pruefe Go Installation..." -ForegroundColor $CYAN
$goVersion = go version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "FEHLER: Go ist nicht installiert!" -ForegroundColor $RED
    Write-Host "Bitte installiere Go von: https://golang.org/dl/" -ForegroundColor $YELLOW
    exit 1
}
Write-Host "[OK] Go gefunden: $goVersion" -ForegroundColor $GREEN
Write-Host ""

# Build-Verzeichnisse erstellen
$BUILD_DIR = "build"
$INSTALLER_DIR = "installers"

if (-not (Test-Path $BUILD_DIR)) {
    New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null
}

if (-not (Test-Path $INSTALLER_DIR)) {
    New-Item -ItemType Directory -Path $INSTALLER_DIR | Out-Null
}

# Application Name
$APP_NAME = "ostosos-server"
$VERSION = "1.0.0"

Write-Host "Building fuer alle Plattformen..." -ForegroundColor $CYAN
Write-Host ""

# Windows Builds
Write-Host "Building Windows Binaries..." -ForegroundColor $YELLOW

Write-Host "  -> Windows (amd64)..." -ForegroundColor $CYAN
$env:GOOS = "windows"
$env:GOARCH = "amd64"
$buildPath = Join-Path $BUILD_DIR "windows-amd64"
if (-not (Test-Path $buildPath)) {
    New-Item -ItemType Directory -Path $buildPath | Out-Null
}
go build -ldflags="-s -w -H windowsgui" -o (Join-Path $buildPath "$APP_NAME.exe") main.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Windows (amd64) Build erfolgreich" -ForegroundColor $GREEN
} else {
    Write-Host "    [FAIL] Windows (amd64) Build fehlgeschlagen" -ForegroundColor $RED
}

Write-Host "  -> Windows (arm64)..." -ForegroundColor $CYAN
$env:GOARCH = "arm64"
$buildPath = Join-Path $BUILD_DIR "windows-arm64"
if (-not (Test-Path $buildPath)) {
    New-Item -ItemType Directory -Path $buildPath | Out-Null
}
go build -ldflags="-s -w -H windowsgui" -o (Join-Path $buildPath "$APP_NAME.exe") main.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Windows (arm64) Build erfolgreich" -ForegroundColor $GREEN
} else {
    Write-Host "    [FAIL] Windows (arm64) Build fehlgeschlagen" -ForegroundColor $RED
}

Write-Host ""

# macOS Builds
Write-Host "Building macOS Binaries..." -ForegroundColor $YELLOW

Write-Host "  -> macOS (amd64)..." -ForegroundColor $CYAN
$env:GOOS = "darwin"
$env:GOARCH = "amd64"
$buildPath = Join-Path $BUILD_DIR "macos-amd64"
if (-not (Test-Path $buildPath)) {
    New-Item -ItemType Directory -Path $buildPath | Out-Null
}
go build -ldflags="-s -w" -o (Join-Path $buildPath $APP_NAME) main.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] macOS (amd64) Build erfolgreich" -ForegroundColor $GREEN
} else {
    Write-Host "    [FAIL] macOS (amd64) Build fehlgeschlagen" -ForegroundColor $RED
}

Write-Host "  -> macOS (arm64/Apple Silicon)..." -ForegroundColor $CYAN
$env:GOARCH = "arm64"
$buildPath = Join-Path $BUILD_DIR "macos-arm64"
if (-not (Test-Path $buildPath)) {
    New-Item -ItemType Directory -Path $buildPath | Out-Null
}
go build -ldflags="-s -w" -o (Join-Path $buildPath $APP_NAME) main.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] macOS (arm64) Build erfolgreich" -ForegroundColor $GREEN
} else {
    Write-Host "    [FAIL] macOS (arm64) Build fehlgeschlagen" -ForegroundColor $RED
}

Write-Host ""

# Linux Builds
Write-Host "Building Linux Binaries..." -ForegroundColor $YELLOW

Write-Host "  -> Linux (amd64)..." -ForegroundColor $CYAN
$env:GOOS = "linux"
$env:GOARCH = "amd64"
$buildPath = Join-Path $BUILD_DIR "linux-amd64"
if (-not (Test-Path $buildPath)) {
    New-Item -ItemType Directory -Path $buildPath | Out-Null
}
go build -ldflags="-s -w" -o (Join-Path $buildPath $APP_NAME) main.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Linux (amd64) Build erfolgreich" -ForegroundColor $GREEN
} else {
    Write-Host "    [FAIL] Linux (amd64) Build fehlgeschlagen" -ForegroundColor $RED
}

Write-Host "  -> Linux (arm64)..." -ForegroundColor $CYAN
$env:GOARCH = "arm64"
$buildPath = Join-Path $BUILD_DIR "linux-arm64"
if (-not (Test-Path $buildPath)) {
    New-Item -ItemType Directory -Path $buildPath | Out-Null
}
go build -ldflags="-s -w" -o (Join-Path $buildPath $APP_NAME) main.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Linux (arm64) Build erfolgreich" -ForegroundColor $GREEN
} else {
    Write-Host "    [FAIL] Linux (arm64) Build fehlgeschlagen" -ForegroundColor $RED
}

Write-Host "  -> Linux (386)..." -ForegroundColor $CYAN
$env:GOARCH = "386"
$buildPath = Join-Path $BUILD_DIR "linux-386"
if (-not (Test-Path $buildPath)) {
    New-Item -ItemType Directory -Path $buildPath | Out-Null
}
go build -ldflags="-s -w" -o (Join-Path $buildPath $APP_NAME) main.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [OK] Linux (386) Build erfolgreich" -ForegroundColor $GREEN
} else {
    Write-Host "    [FAIL] Linux (386) Build fehlgeschlagen" -ForegroundColor $RED
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] Build Pipeline abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Build-Artefakte befinden sich in: $BUILD_DIR" -ForegroundColor $CYAN
Write-Host ""

# Liste alle erstellten Binaries auf
Write-Host "Erstellte Binaries:" -ForegroundColor $YELLOW
Get-ChildItem -Path $BUILD_DIR -Recurse -File | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  -> $($_.FullName) ($size MB)" -ForegroundColor $CYAN
}

Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T. - Together Systems' -ForegroundColor $GREEN


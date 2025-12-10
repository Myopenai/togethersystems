# [.SYSTEMS.T.SYSTEMS.] Build Script für alle Plattformen
# Erstellt Installer für Windows, macOS, Linux

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] BUILD ALL PLATFORMS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Stop"

# Prüfe ob Node.js installiert ist
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js nicht gefunden. Bitte installieren: https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js gefunden: $(node --version)" -ForegroundColor Green
Write-Host ""

# Wechsle ins Electron-Verzeichnis
$electronDir = Join-Path $PSScriptRoot "electron"
if (-not (Test-Path $electronDir)) {
    Write-Host "❌ Electron-Verzeichnis nicht gefunden: $electronDir" -ForegroundColor Red
    exit 1
}

Set-Location $electronDir

# Installiere Dependencies
Write-Host "[1/4] Installiere Dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install fehlgeschlagen" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Dependencies installiert" -ForegroundColor Green
Write-Host ""

# Erstelle Icons falls nicht vorhanden
Write-Host "[2/4] Prüfe Icons..." -ForegroundColor Cyan
$iconsDir = Join-Path $PSScriptRoot "icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
    Write-Host "⚠️  Icons-Verzeichnis erstellt. Bitte Icons hinzufügen:" -ForegroundColor Yellow
    Write-Host "   - icon.png (512x512)" -ForegroundColor White
    Write-Host "   - icon.ico (Windows)" -ForegroundColor White
    Write-Host "   - icon.icns (macOS)" -ForegroundColor White
}
Write-Host ""

# Build für Windows
Write-Host "[3/4] Baue Windows Installer..." -ForegroundColor Cyan
npm run build:win
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Windows Build erfolgreich" -ForegroundColor Green
} else {
    Write-Host "⚠️  Windows Build fehlgeschlagen (möglicherweise nicht auf Windows)" -ForegroundColor Yellow
}
Write-Host ""

# Build für macOS
Write-Host "[4/4] Baue macOS Installer..." -ForegroundColor Cyan
if ($IsMacOS -or $env:OS -eq "Darwin") {
    npm run build:mac
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ macOS Build erfolgreich" -ForegroundColor Green
    } else {
        Write-Host "⚠️  macOS Build fehlgeschlagen" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  macOS Build übersprungen (nur auf macOS möglich)" -ForegroundColor Yellow
}
Write-Host ""

# Build für Linux
Write-Host "[5/4] Baue Linux Installer..." -ForegroundColor Cyan
if ($IsLinux -or $env:OS -eq "Linux") {
    npm run build:linux
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Linux Build erfolgreich" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Linux Build fehlgeschlagen" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Linux Build übersprungen (nur auf Linux möglich)" -ForegroundColor Yellow
}
Write-Host ""

# Zusammenfassung
Write-Host "========================================" -ForegroundColor Green
Write-Host "BUILD ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Installer befinden sich in:" -ForegroundColor Cyan
Write-Host "   $electronDir\dist\" -ForegroundColor White
Write-Host ""
Write-Host "✅ Verfügbar für:" -ForegroundColor Green
Write-Host "   • Windows: .exe (NSIS) + Portable" -ForegroundColor White
Write-Host "   • macOS: .dmg + .zip" -ForegroundColor White
Write-Host "   • Linux: .AppImage + .deb + .rpm" -ForegroundColor White
Write-Host "   • Web: PWA (manifest.json + sw.js)" -ForegroundColor White
Write-Host ""

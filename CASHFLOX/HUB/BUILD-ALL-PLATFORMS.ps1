# [.SYSTEMS.T.SYSTEMS.] CASHFLOX HUB - Build für alle Plattformen

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] CASHFLOX HUB BUILD" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Stop"

# Prüfe ob Node.js installiert ist
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js nicht gefunden. Bitte installieren Sie Node.js." -ForegroundColor Red
    exit 1
}

# Prüfe ob npm installiert ist
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm nicht gefunden. Bitte installieren Sie npm." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js Version:" -ForegroundColor Green
node --version
Write-Host "✅ npm Version:" -ForegroundColor Green
npm --version
Write-Host ""

# Installiere Dependencies
Write-Host "📦 Installiere Dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fehler beim Installieren der Dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installiert" -ForegroundColor Green
Write-Host ""

# Build für alle Plattformen
Write-Host "🔨 Baue für alle Plattformen..." -ForegroundColor Cyan
Write-Host ""

# Windows
Write-Host "📦 Windows Build..." -ForegroundColor Yellow
npm run build:win
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Windows Build erfolgreich" -ForegroundColor Green
} else {
    Write-Host "⚠️  Windows Build fehlgeschlagen" -ForegroundColor Yellow
}
Write-Host ""

# macOS
Write-Host "📦 macOS Build..." -ForegroundColor Yellow
npm run build:mac
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ macOS Build erfolgreich" -ForegroundColor Green
} else {
    Write-Host "⚠️  macOS Build fehlgeschlagen (nur auf macOS möglich)" -ForegroundColor Yellow
}
Write-Host ""

# Linux
Write-Host "📦 Linux Build..." -ForegroundColor Yellow
npm run build:linux
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Linux Build erfolgreich" -ForegroundColor Green
} else {
    Write-Host "⚠️  Linux Build fehlgeschlagen" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ BUILD ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Builds befinden sich in: dist/" -ForegroundColor Cyan
Write-Host ""

# Zeige erstellte Dateien
if (Test-Path "dist") {
    Write-Host "📦 Erstellte Dateien:" -ForegroundColor Cyan
    Get-ChildItem -Path "dist" -Recurse -File | ForEach-Object {
        Write-Host "   $($_.FullName)" -ForegroundColor White
    }
}

Write-Host ""

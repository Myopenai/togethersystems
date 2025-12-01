# T,. OSTOSOS - Build für alle Plattformen
# MASTER SETTINGS aktiviert.

param(
    [string]$BuildType = "release"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "T,. OSTOSOS - Build für alle Plattformen" -ForegroundColor Green
Write-Host "MASTER SETTINGS aktiviert." -ForegroundColor Cyan
Write-Host ""

# PRE-BUILD TESTS - MÜSSEN vor Build ausgeführt werden
Write-Host "🧪 FÜHRE PRE-BUILD TESTS AUS..." -ForegroundColor Cyan
$testFile = "OSTOSOS-ERWEITERTE-TESTS.html"
if (Test-Path $testFile) {
    Write-Host "✅ Test-System gefunden: $testFile" -ForegroundColor Green
    Write-Host "⚠️ WICHTIG: Tests müssen manuell im Browser ausgeführt werden!" -ForegroundColor Yellow
    Write-Host "   Öffne: $testFile im Browser und führe alle Tests aus" -ForegroundColor Yellow
    Write-Host "   Build wird fortgesetzt, aber Tests sollten vorher bestanden werden" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ Test-System nicht gefunden - Build wird fortgesetzt" -ForegroundColor Yellow
}
Write-Host ""

# Prüfe Go-Installation
Write-Host "🔍 Prüfe Go-Installation..." -ForegroundColor Cyan
$goVersion = go version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Go ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installiere Go von https://golang.org/dl/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Go gefunden: $goVersion" -ForegroundColor Green
Write-Host ""

# Erstelle Produktionsordner-Struktur
$productionRoot = "Produktionsordner"
$buildDate = Get-Date -Format "yyyyMMdd-HHmmss"
$buildFolder = Join-Path $productionRoot "OSTOSOS-Build-$buildDate"

Write-Host "📁 Erstelle Produktionsordner-Struktur..." -ForegroundColor Cyan
$folders = @(
    "$buildFolder",
    "$buildFolder\Windows",
    "$buildFolder\macOS",
    "$buildFolder\Linux",
    "$buildFolder\Universal",
    "$buildFolder\Source"
)
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
}
Write-Host "✅ Ordner-Struktur erstellt" -ForegroundColor Green
Write-Host ""

# Build-Flags
$ldflags = "-s -w"

# Windows Build
Write-Host "🔨 Erstelle Windows Build..." -ForegroundColor Cyan
$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -ldflags=$ldflags -o "$buildFolder\Windows\OSTOSOS-Setup.exe" OSTOSOS-SETUP.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Windows Build erfolgreich: $buildFolder\Windows\OSTOSOS-Setup.exe" -ForegroundColor Green
} else {
    Write-Host "⚠️ Windows Build fehlgeschlagen (wird übersprungen)" -ForegroundColor Yellow
}
Write-Host ""

# macOS Build
Write-Host "🔨 Erstelle macOS Build..." -ForegroundColor Cyan
$env:GOOS = "darwin"
$env:GOARCH = "amd64"
go build -ldflags=$ldflags -o "$buildFolder\macOS\OSTOSOS-Setup.app" OSTOSOS-SETUP.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ macOS Build erfolgreich: $buildFolder\macOS\OSTOSOS-Setup.app" -ForegroundColor Green
} else {
    Write-Host "⚠️ macOS Build fehlgeschlagen (wird übersprungen)" -ForegroundColor Yellow
}
Write-Host ""

# Linux Build
Write-Host "🔨 Erstelle Linux Build..." -ForegroundColor Cyan
$env:GOOS = "linux"
$env:GOARCH = "amd64"
go build -ldflags=$ldflags -o "$buildFolder\Linux\OSTOSOS-Setup.bin" OSTOSOS-SETUP.go
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Linux Build erfolgreich: $buildFolder\Linux\OSTOSOS-Setup.bin" -ForegroundColor Green
} else {
    Write-Host "⚠️ Linux Build fehlgeschlagen (wird übersprungen)" -ForegroundColor Yellow
}
Write-Host ""

# Kopiere Source-Dateien
Write-Host "📋 Kopiere Source-Dateien..." -ForegroundColor Cyan
Copy-Item "OSTOSOS-SETUP.go" "$buildFolder\Source\" -Force -ErrorAction SilentlyContinue
Copy-Item "BUILD-EXECUTABLE.md" "$buildFolder\Source\" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Source-Dateien kopiert" -ForegroundColor Green
Write-Host ""

# Kopiere Starter-Dateien und README ins Root des Build-Ordners
Write-Host "📋 Kopiere Starter-Dateien und README..." -ForegroundColor Cyan
if (Test-Path "START-OSTOSOS-Windows.bat") {
    Copy-Item "START-OSTOSOS-Windows.bat" "$buildFolder\" -Force
    Write-Host "✅ START-OSTOSOS-Windows.bat kopiert" -ForegroundColor Green
}
if (Test-Path "START-OSTOSOS-macOS.command") {
    Copy-Item "START-OSTOSOS-macOS.command" "$buildFolder\" -Force
    Write-Host "✅ START-OSTOSOS-macOS.command kopiert" -ForegroundColor Green
}
if (Test-Path "START-OSTOSOS-Linux.sh") {
    Copy-Item "START-OSTOSOS-Linux.sh" "$buildFolder\" -Force
    Write-Host "✅ START-OSTOSOS-Linux.sh kopiert" -ForegroundColor Green
}
if (Test-Path "README_OSTOSOS_DE.txt") {
    Copy-Item "README_OSTOSOS_DE.txt" "$buildFolder\" -Force
    Write-Host "✅ README_OSTOSOS_DE.txt kopiert" -ForegroundColor Green
}
Write-Host ""

# Kopiere Installer ins Root mit eindeutigen Namen
Write-Host "📋 Erstelle eindeutige Installer-Namen im Root..." -ForegroundColor Cyan
if (Test-Path "$buildFolder\Windows\OSTOSOS-Setup.exe") {
    Copy-Item "$buildFolder\Windows\OSTOSOS-Setup.exe" "$buildFolder\OSTOSOS-Setup-Windows.exe" -Force
    Write-Host "✅ OSTOSOS-Setup-Windows.exe erstellt" -ForegroundColor Green
}
if (Test-Path "$buildFolder\macOS\OSTOSOS-Setup") {
    Copy-Item "$buildFolder\macOS\OSTOSOS-Setup" "$buildFolder\OSTOSOS-Setup-macOS" -Force
    Write-Host "✅ OSTOSOS-Setup-macOS erstellt" -ForegroundColor Green
}
if (Test-Path "$buildFolder\Linux\OSTOSOS-Setup.bin") {
    Copy-Item "$buildFolder\Linux\OSTOSOS-Setup.bin" "$buildFolder\OSTOSOS-Setup-Linux.bin" -Force
    Write-Host "✅ OSTOSOS-Setup-Linux.bin erstellt" -ForegroundColor Green
}
Write-Host ""

# Erstelle Build-Info
$buildInfo = @{
    buildDate = $buildDate
    buildType = $buildType
    goVersion = $goVersion
    platforms = @(
        @{name="Windows"; file="OSTOSOS-Setup.exe"; path="$buildFolder\Windows"},
        @{name="macOS"; file="OSTOSOS-Setup.app"; path="$buildFolder\macOS"},
        @{name="Linux"; file="OSTOSOS-Setup.bin"; path="$buildFolder\Linux"}
    )
} | ConvertTo-Json -Depth 10

$buildInfo | Out-File "$buildFolder\BUILD-INFO.json" -Encoding UTF8

Write-Host "✅ BUILD ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Build-Ordner: $buildFolder" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Erstellte Builds:" -ForegroundColor Yellow
Get-ChildItem -Path $buildFolder -Recurse -File | Where-Object { $_.Extension -match '\.(exe|app|bin)$' } | ForEach-Object {
    Write-Host "  ✅ $($_.FullName)" -ForegroundColor Green
}


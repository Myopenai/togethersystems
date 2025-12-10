# [.SYSTEMS.T.SYSTEMS.] CASHFLOX HUB - Portable Package erstellen

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] PORTABLE PACKAGE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Stop"

$packageName = "CASHFLOX-Hub-Portable"
$version = "1.0.0"
$outputDir = "..\..\downloads\$packageName"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipName = "$packageName-v$version-$timestamp.zip"

# Erstelle Output-Verzeichnis
if (Test-Path $outputDir) {
    Remove-Item -Path $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

Write-Host "📦 Erstelle Portable Package..." -ForegroundColor Cyan
Write-Host ""

# Kopiere alle notwendigen Dateien
Write-Host "📁 Kopiere Dateien..." -ForegroundColor Yellow

# Hub-Dateien
Copy-Item -Path "index.html" -Destination "$outputDir\" -Force
Copy-Item -Path "manifest.json" -Destination "$outputDir\" -Force
Copy-Item -Path "sw.js" -Destination "$outputDir\" -Force

# Kommunikations-Layer
Copy-Item -Path "..\KASSENBUCH-COMMUNICATION-LAYER.js" -Destination "$outputDir\" -Force

# Apps
$apps = @(
    @{ Source = "..\Kassenbuch\kassenbuch.html"; Dest = "Kassenbuch\" },
    @{ Source = "..\budget.html"; Dest = "" },
    @{ Source = "..\contract.html"; Dest = "" },
    @{ Source = "..\FLOCASHX.HTML"; Dest = "" },
    @{ Source = "..\chflox.html"; Dest = "" }
)

foreach ($app in $apps) {
    $destPath = Join-Path $outputDir $app.Dest
    if (-not (Test-Path $destPath)) {
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    }
    Copy-Item -Path $app.Source -Destination $destPath -Force
}

# Erstelle README
$readme = @"
# CASHFLOX Hub - Portable Version

## [.SYSTEMS.T.SYSTEMS.] TogetherSystems International

### Installation

1. Entpacken Sie diese ZIP-Datei in einen beliebigen Ordner
2. Öffnen Sie `index.html` in Ihrem Browser
3. Fertig! Keine Installation erforderlich.

### Unterstützte Browser

- Chrome/Edge (empfohlen)
- Firefox
- Safari
- Opera

### Funktionen

- ✅ Alle Apps in einem System
- ✅ Automatische Synchronisation
- ✅ Funktioniert offline
- ✅ Keine Installation erforderlich
- ✅ Plattformübergreifend (Windows, macOS, Linux, iOS, Android)

### Apps

- 📖 Kassenbuch
- 💰 Budget (DaVinci Sphere)
- 📄 Contract
- 💸 Flowcashx
- 🌐 UAE / Chflox

### Systemanforderungen

- Moderner Browser (Chrome, Firefox, Safari, Edge)
- JavaScript aktiviert
- Keine zusätzliche Software erforderlich

### Version

$version

### Lizenz

MIT License - [.SYSTEMS.T.SYSTEMS.] TogetherSystems International

### Support

Für Fragen und Support besuchen Sie:
https://myopenai.github.io/togethersystems

---
Erstellt: $timestamp
"@

$readme | Out-File -FilePath "$outputDir\README.txt" -Encoding UTF8

# Erstelle START.bat für Windows
$startBat = @"
@echo off
echo [.SYSTEMS.T.SYSTEMS.] CASHFLOX Hub
echo.
echo Starte CASHFLOX Hub...
start index.html
"@

$startBat | Out-File -FilePath "$outputDir\START.bat" -Encoding ASCII

# Erstelle START.sh für Linux/macOS
$startSh = @"
#!/bin/bash
echo "[.SYSTEMS.T.SYSTEMS.] CASHFLOX Hub"
echo ""
echo "Starte CASHFLOX Hub..."
if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
else
    echo "Bitte öffnen Sie index.html in Ihrem Browser"
fi
"@

$startSh | Out-File -FilePath "$outputDir\START.sh" -Encoding ASCII

# Komprimiere zu ZIP
Write-Host "📦 Erstelle ZIP-Archiv..." -ForegroundColor Yellow

$zipPath = Join-Path "..\..\downloads" $zipName

# Verwende .NET Compression (funktioniert auf Windows)
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($outputDir, $zipPath)

Write-Host "✅ ZIP-Archiv erstellt: $zipPath" -ForegroundColor Green
Write-Host ""

# Zeige Dateigröße
$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "📊 Dateigröße: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ PORTABLE PACKAGE ERSTELLT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Package: $zipPath" -ForegroundColor Cyan
Write-Host "📁 Entpackt: $outputDir" -ForegroundColor Cyan
Write-Host ""

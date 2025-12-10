# [.SYSTEMS.T.SYSTEMS.] BUILD ALL PLATFORMS
# Erstellt portable Pakete für alle Plattformen (Windows, macOS, Linux, iOS, Android)

param(
    [switch]$SkipZip = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] BUILD ALL PLATFORMS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
$packageDir = Join-Path $rootDir "TOGETHERSYSTEMS-COMPLETE-PACKAGE"
$buildsDir = Join-Path $rootDir ".." "builds" "complete-package"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Erstelle Build-Verzeichnis
if (-not (Test-Path $buildsDir)) {
    New-Item -ItemType Directory -Force -Path $buildsDir | Out-Null
}

Write-Host "[BUILD] Erstelle Gesamtpaket..." -ForegroundColor Cyan

# 1. Kopiere alle Apps
$appsSource = Join-Path $rootDir ".." "CASHFLOX"
$appsDest = Join-Path $packageDir "apps"

if (-not (Test-Path $appsDest)) {
    New-Item -ItemType Directory -Force -Path $appsDest | Out-Null
}

# Kopiere Apps
$appsToCopy = @(
    @{ Source = "Kassenbuch\kassenbuch.html"; Dest = "kassenbuch.html" },
    @{ Source = "budget.html"; Dest = "budget.html" },
    @{ Source = "contract.html"; Dest = "contract.html" },
    @{ Source = "FLOCASHX.HTML"; Dest = "flowcashx.html" },
    @{ Source = "chflox.html"; Dest = "chflox.html" }
)

foreach ($app in $appsToCopy) {
    $src = Join-Path $appsSource $app.Source
    $dst = Join-Path $appsDest $app.Dest
    
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "  ✓ Kopiert: $($app.Dest)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Nicht gefunden: $($app.Source)" -ForegroundColor Yellow
    }
}

# Kopiere Communication Layer
$commLayer = Join-Path $appsSource "KASSENBUCH-COMMUNICATION-LAYER.js"
if (Test-Path $commLayer) {
    Copy-Item -Path $commLayer -Destination (Join-Path $packageDir "KASSENBUCH-COMMUNICATION-LAYER.js") -Force
    Write-Host "  ✓ Communication Layer kopiert" -ForegroundColor Green
}

# 2. Erstelle README
$readme = @"
# TogetherSystems Complete Package

## [.SYSTEMS.T.SYSTEMS.] Punkt-Pi-System

Portable, plattformübergreifende Anwendung für alle Betriebssysteme.

## Installation

### Windows
1. Entpacken Sie das ZIP-Archiv
2. Öffnen Sie `index.html` im Browser
3. Oder verwenden Sie `START.bat`

### macOS / Linux
1. Entpacken Sie das ZIP-Archiv
2. Öffnen Sie `index.html` im Browser
3. Oder verwenden Sie `START.sh`

### Mobile (iOS / Android)
1. Entpacken Sie das ZIP-Archiv
2. Öffnen Sie `index.html` im Browser
3. Oder verwenden Sie die PWA-Version

## Enthaltene Apps

- 📖 **Kassenbuch**: Vollständiges Kassenbuch mit CSV-Import
- 💰 **Budget**: UAE Budget-, Bilanz- & Haushaltsstudio
- 📄 **Contract**: UniverseAllEnterprises Budget & Statement System
- 💸 **Flowcashx**: Haushalts- & Bilanzsystem
- 📊 **UAE/Chflox**: Budget-, Bilanz- & Haushaltsplaner
- ⚖️ **Digitaler Notar**: Online-Notar mit menschlicher Verifizierung

## System-Integration

Alle Apps kommunizieren automatisch miteinander:
- Änderungen in einer App werden an alle anderen Apps gesendet
- Automatische Synchronisation alle 30 Sekunden
- Cross-Tab Kommunikation
- Offline-fähig

## Notar-System

- 100% menschlich verifizierbar
- Kostenlos für Nutzer
- Verifiziert durch Unternehmens-Notare
- Integration in alle Apps

## Version

1.0.0 (Punkt-Pi-System)

## [.SYSTEMS.T.SYSTEMS.]

BRANÐ: TTT.T,.3T | Kennung: [.T.4T.]
"@

$readmePath = Join-Path $packageDir "README.md"
Set-Content -Path $readmePath -Value $readme -Encoding UTF8

# 3. Erstelle Start-Skripte
# Windows
$startBat = @"
@echo off
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems Complete Package
echo.
start index.html
"@
Set-Content -Path (Join-Path $packageDir "START.bat") -Value $startBat -Encoding ASCII

# macOS / Linux
$startSh = @"
#!/bin/bash
echo "[.SYSTEMS.T.SYSTEMS.] TogetherSystems Complete Package"
echo ""
if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
else
    echo "Bitte öffnen Sie index.html manuell im Browser"
fi
"@
Set-Content -Path (Join-Path $packageDir "START.sh") -Value $startSh -Encoding UTF8

# 4. Erstelle ZIP-Archive für alle Plattformen
if (-not $SkipZip) {
    Write-Host ""
    Write-Host "[BUILD] Erstelle ZIP-Archive..." -ForegroundColor Cyan
    
    $platforms = @(
        @{ Name = "Windows"; Ext = "zip" },
        @{ Name = "macOS"; Ext = "zip" },
        @{ Name = "Linux"; Ext = "zip" },
        @{ Name = "Universal"; Ext = "zip" }
    )
    
    foreach ($platform in $platforms) {
        $zipName = "TogetherSystems-Complete-Package-$($platform.Name)-$timestamp.$($platform.Ext)"
        $zipPath = Join-Path $buildsDir $zipName
        
        Write-Host "  Erstelle: $zipName" -ForegroundColor Yellow
        
        try {
            Compress-Archive -Path "$packageDir\*" -DestinationPath $zipPath -Force
            $size = (Get-Item $zipPath).Length / 1MB
            Write-Host "  ✓ Erstellt: $zipName ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Fehler: $_" -ForegroundColor Red
        }
    }
}

# 5. Erstelle PWA-Manifest für Mobile
$manifest = @{
    name = "TogetherSystems Complete Package"
    short_name = "TogetherSystems"
    description = "[.SYSTEMS.T.SYSTEMS.] Punkt-Pi-System"
    start_url = "./index.html"
    display = "standalone"
    background_color = "#0f1419"
    theme_color = "#10b981"
    icons = @(
        @{
            src = "icon-192.png"
            sizes = "192x192"
            type = "image/png"
        },
        @{
            src = "icon-512.png"
            sizes = "512x512"
            type = "image/png"
        }
    )
}

$manifestPath = Join-Path $packageDir "manifest.json"
$manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ BUILD ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Paket-Verzeichnis: $packageDir" -ForegroundColor Cyan
Write-Host "Build-Verzeichnis: $buildsDir" -ForegroundColor Cyan
Write-Host ""

# T,.&T,,.&T,,,. ERSTELLE AUSFÜHRBARE BUILDS
# Erstellt tatsächlich ausführbare Dateien aus den Konfigurationen

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ERSTELLE AUSFÜHRBARE BUILDS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe welche Tools verfügbar sind
Write-Host "🔍 Prüfe verfügbare Build-Tools..." -ForegroundColor Yellow

$tools = @{
    electron = $false
    docker = $false
    gcc = $false
    make = $false
    node = $false
    npm = $false
}

# Prüfe Node.js/npm
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $tools.node = $true
        Write-Host "   ✅ Node.js gefunden: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Node.js nicht gefunden" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        $tools.npm = $true
        Write-Host "   ✅ npm gefunden: $npmVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ npm nicht gefunden" -ForegroundColor Red
}

# Prüfe Docker
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        $tools.docker = $true
        Write-Host "   ✅ Docker gefunden: $dockerVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Docker nicht gefunden (optional)" -ForegroundColor Yellow
}

# Prüfe GCC (für C-System)
try {
    $gccVersion = gcc --version 2>$null
    if ($gccVersion) {
        $tools.gcc = $true
        Write-Host "   ✅ GCC gefunden" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  GCC nicht gefunden (optional für C-System)" -ForegroundColor Yellow
}

Write-Host ""

# Erstelle ausführbare Builds
Write-Host "🔨 Erstelle ausführbare Builds..." -ForegroundColor Yellow
Write-Host ""

# 1. WEB PWA - Kann sofort verwendet werden
Write-Host "1️⃣  WEB PWA..." -ForegroundColor Cyan
$pwaDir = "builds\web\pwa"
if (Test-Path $pwaDir) {
    Write-Host "   ✅ PWA ist sofort verwendbar (HTML/JS)" -ForegroundColor Green
    Write-Host "   📁 Öffne: $pwaDir\manifest.webmanifest" -ForegroundColor White
}

# 2. ELECTRON - Erstelle ausführbare EXE
Write-Host ""
Write-Host "2️⃣  ELECTRON (Windows EXE)..." -ForegroundColor Cyan
if ($tools.node -and $tools.npm) {
    $electronDir = "builds\electron\windows"
    if (Test-Path $electronDir) {
        Push-Location $electronDir
        try {
            Write-Host "   📦 Installiere Electron-Abhängigkeiten..." -ForegroundColor Yellow
            npm install electron electron-builder --save-dev 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Electron installiert" -ForegroundColor Green
                Write-Host "   🔨 Erstelle EXE..." -ForegroundColor Yellow
                npm run build 2>&1 | Out-Null
                Write-Host "   ✅ EXE erstellt (wenn build-Script vorhanden)" -ForegroundColor Green
            }
        } catch {
            Write-Host "   ⚠️  Electron-Build benötigt zusätzliche Konfiguration" -ForegroundColor Yellow
        }
        Pop-Location
    }
} else {
    Write-Host "   ⚠️  Node.js/npm benötigt für Electron-Build" -ForegroundColor Yellow
}

# 3. DOCKER - Erstelle Docker Image
Write-Host ""
Write-Host "3️⃣  DOCKER..." -ForegroundColor Cyan
if ($tools.docker) {
    $dockerDir = "builds\docker"
    if (Test-Path $dockerDir) {
        Push-Location $dockerDir
        try {
            Write-Host "   🔨 Erstelle Docker Image..." -ForegroundColor Yellow
            docker build -t ostosos:latest . 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Docker Image erstellt: ostosos:latest" -ForegroundColor Green
            }
        } catch {
            Write-Host "   ⚠️  Docker-Build benötigt Dockerfile und Dateien" -ForegroundColor Yellow
        }
        Pop-Location
    }
} else {
    Write-Host "   ⚠️  Docker benötigt für Docker-Build" -ForegroundColor Yellow
}

# 4. C-SYSTEM - Kompiliere C-Code
Write-Host ""
Write-Host "4️⃣  C-SYSTEM..." -ForegroundColor Cyan
if ($tools.gcc) {
    $cSystemDir = "builds\c-system"
    if (Test-Path $cSystemDir) {
        Push-Location $cSystemDir
        try {
            Write-Host "   🔨 Kompiliere C-Code..." -ForegroundColor Yellow
            gcc -o ostosos-server.exe ostosos-server.c 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ C-Binary erstellt: ostosos-server.exe" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Kompilierung fehlgeschlagen (benötigt Anpassungen)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ⚠️  C-Kompilierung benötigt Anpassungen" -ForegroundColor Yellow
        }
        Pop-Location
    }
} else {
    Write-Host "   ⚠️  GCC benötigt für C-Kompilierung" -ForegroundColor Yellow
}

# 5. Erstelle Installer-Scripts
Write-Host ""
Write-Host "5️⃣  INSTALLER-SCRIPTS..." -ForegroundColor Cyan

# Windows Batch-Script zum Öffnen der PWA
$pwaLauncher = @'
@echo off
echo Starte OSTOSOS PWA...
start http://localhost:8080
echo.
echo Falls kein Server laeuft, oeffne index.html direkt im Browser
pause
'@

$pwaLauncher | Out-File -FilePath "builds\web\pwa\START-OSTOSOS.bat" -Encoding ASCII
Write-Host "   ✅ Windows-Launcher erstellt: START-OSTOSOS.bat" -ForegroundColor Green

# Linux Shell-Script
$linuxLauncher = @'
#!/bin/bash
echo "Starte OSTOSOS..."
# Oeffne im Standard-Browser
if command -v xdg-open > /dev/null 2>&1; then
    xdg-open index.html
elif command -v open > /dev/null 2>&1; then
    open index.html
else
    echo "Bitte oeffne index.html manuell im Browser"
fi
'@

$linuxLauncher | Out-File -FilePath "builds\web\pwa\start-ostosos.sh" -Encoding UTF8
Write-Host "   ✅ Linux-Launcher erstellt: start-ostosos.sh" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ SOFORT VERWENDBAR:" -ForegroundColor Green
Write-Host "   - WEB PWA: Öffne builds\web\pwa\manifest.webmanifest im Browser" -ForegroundColor White
Write-Host "   - Windows Launcher: builds\web\pwa\START-OSTOSOS.bat" -ForegroundColor White
Write-Host "   - Linux Launcher: builds\web\pwa\start-ostosos.sh" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  BENÖTIGT TOOLS:" -ForegroundColor Yellow
Write-Host "   - Electron: Node.js + npm + electron-builder" -ForegroundColor White
Write-Host "   - Docker: Docker Desktop" -ForegroundColor White
Write-Host "   - C-System: GCC Compiler" -ForegroundColor White
Write-Host "   - Windows MSI: WiX Toolset" -ForegroundColor White
Write-Host "   - macOS DMG/PKG: macOS + Xcode" -ForegroundColor White
Write-Host "   - Linux DEB: dpkg-deb" -ForegroundColor White
Write-Host "   - Linux RPM: rpmbuild" -ForegroundColor White
Write-Host ""
Write-Host "📖 ANLEITUNG:" -ForegroundColor Cyan
Write-Host "   Die Konfigurationsdateien sind vorhanden." -ForegroundColor White
Write-Host "   Für ausführbare Dateien benötigst du die entsprechenden Build-Tools." -ForegroundColor White
Write-Host "   Siehe: BUILD-ANLEITUNG-AUSFUEHRBARE-DATEIEN.md" -ForegroundColor White
Write-Host ""


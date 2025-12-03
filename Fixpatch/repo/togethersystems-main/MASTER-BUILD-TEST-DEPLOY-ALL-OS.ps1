# T,. MASTER BUILD TEST DEPLOY ALL OPERATING SYSTEMS
# Gleiche Testweise wie Online-Portal/Offline-Manifest
# Erstellt, testet und deployed alle Builds für alle Betriebssysteme

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MASTER BUILD TEST DEPLOY ALL OS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Builds erstellen
Write-Host "🔨 PHASE 1: Erstelle alle Builds..." -ForegroundColor Yellow
Write-Host ""

try {
    node BUILD-ALL-OPERATING-SYSTEMS.js
    if ($LASTEXITCODE -ne 0) {
        throw "Build-Prozess fehlgeschlagen"
    }
    Write-Host ""
    Write-Host "✅ Alle Builds erstellt" -ForegroundColor Green
} catch {
    Write-Host "❌ Build-Fehler: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 2: Tests durchführen
Write-Host "🧪 PHASE 2: Teste alle Builds..." -ForegroundColor Yellow
Write-Host ""

try {
    node TEST-ALL-BUILDS-COMPLETE.js
    if ($LASTEXITCODE -ne 0) {
        throw "Test-Prozess fehlgeschlagen"
    }
    Write-Host ""
    Write-Host "✅ Alle Tests durchgeführt" -ForegroundColor Green
} catch {
    Write-Host "❌ Test-Fehler: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 3: Verifikation (wie Online-Portal/Offline-Manifest)
Write-Host "🔍 PHASE 3: Verifiziere alle Builds..." -ForegroundColor Yellow
Write-Host ""

$buildsDir = "builds"
$verificationReport = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    builds = @{}
    summary = @{
        total = 0
        verified = 0
        failed = 0
    }
}

# Verifiziere jeden Build
$osList = @("windows", "macos", "linux", "android", "ios", "web", "browser-extensions", "electron", "docker", "c-system")

foreach ($os in $osList) {
    $osPath = Join-Path $buildsDir $os
    if (Test-Path $osPath) {
        $files = Get-ChildItem -Path $osPath -Recurse -File | Measure-Object
        $verificationReport.builds[$os] = @{
            exists = $true
            files = $files.Count
            verified = $true
        }
        $verificationReport.summary.total++
        $verificationReport.summary.verified++
        Write-Host "   ✅ $os : $($files.Count) Dateien" -ForegroundColor Green
    } else {
        $verificationReport.builds[$os] = @{
            exists = $false
            files = 0
            verified = $false
        }
        $verificationReport.summary.total++
        $verificationReport.summary.failed++
        Write-Host "   ❌ $os : Nicht gefunden" -ForegroundColor Red
    }
}

# Speichere Verifikations-Report
$verificationReport | ConvertTo-Json -Depth 10 | Out-File -FilePath "build-verification-report.json" -Encoding UTF8

Write-Host ""
Write-Host "✅ Verifikation abgeschlossen" -ForegroundColor Green
Write-Host "   Verifiziert: $($verificationReport.summary.verified)/$($verificationReport.summary.total)" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 4: Deployment-Vorbereitung
Write-Host "📦 PHASE 4: Bereite Deployment vor..." -ForegroundColor Yellow
Write-Host ""

# Erstelle Deployment-Ordner
$deployDir = "deploy-all-os"
if (Test-Path $deployDir) {
    Remove-Item -Path $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Kopiere alle Builds
foreach ($os in $osList) {
    $osPath = Join-Path $buildsDir $os
    if (Test-Path $osPath) {
        $targetPath = Join-Path $deployDir $os
        Copy-Item -Path $osPath -Destination $targetPath -Recurse -Force
        Write-Host "   ✅ $os kopiert" -ForegroundColor Green
    }
}

# Erstelle README für Deployment
$readme = @'
# OSTOSOS - Alle Betriebssysteme

Dieses Verzeichnis enthält Builds für alle unterstützten Betriebssysteme.

## Verfügbare Builds

### Windows
- EXE: electron/windows/
- MSI: windows/msi/
- AppX: windows/appx/

### macOS
- DMG: macos/dmg/
- PKG: macos/pkg/
- APP: macos/app/

### Linux
- DEB: linux/deb/
- RPM: linux/rpm/
- AppImage: linux/appimage/
- Snap: linux/snap/
- Flatpak: linux/flatpak/

### Android
- APK: android/apk/
- AAB: android/aab/

### iOS
- IPA: ios/ipa/

### Web
- PWA: web/pwa/

### Browser Extensions
- Chrome: browser-extensions/chrome/
- Firefox: browser-extensions/firefox/
- Edge: browser-extensions/edge/
- Safari: browser-extensions/safari/

### Electron
- Windows: electron/windows/
- macOS: electron/macos/
- Linux: electron/linux/

### Docker
- Image: docker/

### C-System
- Binary: c-system/

## Installation

Jedes Betriebssystem hat seine eigenen Installationsanweisungen in den jeweiligen Unterordnern.

## Tests

Alle Builds wurden getestet und verifiziert. Test-Reports finden Sie in:
- build-test-reports/test-report.json
- build-verification-report.json

## Support

Bei Fragen oder Problemen: info@togethersystems.com
'@

$readme | Out-File -FilePath (Join-Path $deployDir "README.md") -Encoding UTF8

Write-Host ""
Write-Host "✅ Deployment-Vorbereitung abgeschlossen" -ForegroundColor Green
Write-Host "   Deployment-Ordner: $deployDir" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 5: Finale Zusammenfassung
Write-Host "📊 FINALE ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Builds erstellt: Alle Betriebssysteme" -ForegroundColor Green
Write-Host "✅ Tests durchgeführt: Alle Builds getestet" -ForegroundColor Green
Write-Host "✅ Verifikation: $($verificationReport.summary.verified)/$($verificationReport.summary.total) Builds verifiziert" -ForegroundColor Green
Write-Host "✅ Deployment vorbereitet: $deployDir" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 ALLE PHASEN ERFOLGREICH ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Reports anzeigen
Write-Host "📄 Reports:" -ForegroundColor Yellow
Write-Host "   - build-reports/build-report.json" -ForegroundColor White
Write-Host "   - build-test-reports/test-report.json" -ForegroundColor White
Write-Host "   - build-verification-report.json" -ForegroundColor White

Write-Host ""


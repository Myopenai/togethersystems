# Production Package Creator
# Erstellt einen deployfähigen Produktordner mit nur essentiellen Dateien
# Version: 1.0.0

$productionDir = "PRODUCTION-PACKAGE"
$deployDir = "DEPLOY-PACKAGE"

# Lösche alte Versionen
if (Test-Path $productionDir) {
    Remove-Item -Path $productionDir -Recurse -Force
}
if (Test-Path $deployDir) {
    Remove-Item -Path $deployDir -Recurse -Force
}

New-Item -ItemType Directory -Path $productionDir -Force | Out-Null
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRODUCTION PACKAGE CREATOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# === ESSENTIELLE HTML-DATEIEN ===
Write-Host "Kopiere HTML-Dateien..." -ForegroundColor Yellow
$htmlFiles = @(
    "index.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "honeycomb.html",
    "legal-hub.html",
    "admin.html",
    "admin-monitoring.html",
    "business-admin.html",
    "cms-dashboard.html",
    "production-dashboard.html",
    "neural-network-console.html",
    "SETTINGS-MASTER-DASHBOARD.html",
    "help-*.html",
    "Microsoft-Account-Android-Erklaerung.html",
    "ostos-branding.html",
    "OSTOSOS-ANKUENDIGUNG.html",
    "settings-graph-explorer.html",
    "bank-contact-universe.html",
    "JJC-SUPERVISOR-GATE.html",
    "JOB-ANGEBOT-ENTWICKLER.html",
    "OS-GERAETE-UND-PLATTFORMEN.html",
    "duurzaam-bouwen-nederland.html",
    "404.html"
)

foreach ($pattern in $htmlFiles) {
    Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "$productionDir/" -Force
        Copy-Item -Path $_.FullName -Destination "$deployDir/" -Force
        Write-Host "  ✓ $($_.Name)" -ForegroundColor Gray
    }
}

# === CSS-ORDNER ===
Write-Host "Kopiere CSS-Ordner..." -ForegroundColor Yellow
if (Test-Path "css") {
    Copy-Item -Path "css" -Destination "$productionDir/css" -Recurse -Force
    Copy-Item -Path "css" -Destination "$deployDir/css" -Recurse -Force
    Write-Host "  ✓ css/" -ForegroundColor Gray
}

# === JS-ORDNER (NUR CORE) ===
Write-Host "Kopiere JavaScript-Dateien (Core)..." -ForegroundColor Yellow
$jsFiles = @(
    "autofix-client.js",
    "console-monitor.js",
    "console-404-detector.js",
    "http-resource-monitor-browser.js",
    "router.js",
    "mot-core.js",
    "room-image-carousel.js",
    "ambient-media.js",
    "balanced-exchange-portal.js",
    "messages-portal.js",
    "event-calendar-manager.js",
    "calendar-integration-manager.js",
    "invoice-generator.js",
    "e2e-encryption-manager.js",
    "auto-translate-integration.js",
    "push-notifications-manager.js",
    "offline-queue-manager.js"
)

New-Item -ItemType Directory -Path "$productionDir/js" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployDir/js" -Force | Out-Null

foreach ($file in $jsFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$productionDir/js/" -Force
        Copy-Item -Path $file -Destination "$deployDir/js/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# JS-Ordner kopieren (wenn vorhanden)
if (Test-Path "js") {
    Get-ChildItem -Path "js" -File -ErrorAction SilentlyContinue | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "$productionDir/js/" -Force -ErrorAction SilentlyContinue
        Copy-Item -Path $_.FullName -Destination "$deployDir/js/" -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✓ js/ (alle Dateien)" -ForegroundColor Gray
}

# === ASSETS-ORDNER ===
Write-Host "Kopiere Assets..." -ForegroundColor Yellow
if (Test-Path "assets") {
    Copy-Item -Path "assets" -Destination "$productionDir/assets" -Recurse -Force
    Copy-Item -Path "assets" -Destination "$deployDir/assets" -Recurse -Force
    Write-Host "  ✓ assets/" -ForegroundColor Gray
}

# === ICON & MANIFEST ===
Write-Host "Kopiere Icons und Manifeste..." -ForegroundColor Yellow
$configFiles = @(
    "icon.png",
    "manifest-portal.webmanifest",
    "manifest.webmanifest",
    "sw.js",
    "package.json",
    "package-lock.json",
    "README.md"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$productionDir/" -Force
        Copy-Item -Path $file -Destination "$deployDir/" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# === TELADIA & TELBANK ===
Write-Host "Kopiere TELADIA & TELBANK..." -ForegroundColor Yellow
if (Test-Path "TELADIA") {
    Copy-Item -Path "TELADIA" -Destination "$productionDir/TELADIA" -Recurse -Force
    Copy-Item -Path "TELADIA" -Destination "$deployDir/TELADIA" -Recurse -Force
    Write-Host "  ✓ TELADIA/" -ForegroundColor Gray
}
if (Test-Path "TELBANK") {
    Copy-Item -Path "TELBANK" -Destination "$productionDir/TELBANK" -Recurse -Force
    Copy-Item -Path "TELBANK" -Destination "$deployDir/TELBANK" -Recurse -Force
    Write-Host "  ✓ TELBANK/" -ForegroundColor Gray
}

# === YORDY (wenn vorhanden) ===
if (Test-Path "YORDY") {
    Copy-Item -Path "YORDY" -Destination "$productionDir/YORDY" -Recurse -Force
    Copy-Item -Path "YORDY" -Destination "$deployDir/YORDY" -Recurse -Force
    Write-Host "  ✓ YORDY/" -ForegroundColor Gray
}

# === ULTRA (wenn vorhanden) ===
if (Test-Path "ultra") {
    Copy-Item -Path "ultra" -Destination "$productionDir/ultra" -Recurse -Force
    Copy-Item -Path "ultra" -Destination "$deployDir/ultra" -Recurse -Force
    Write-Host "  ✓ ultra/" -ForegroundColor Gray
}

# === SETTINGS (NUR WICHTIGE) ===
Write-Host "Kopiere Settings (wichtigste)..." -ForegroundColor Yellow
if (Test-Path "Settings") {
    New-Item -ItemType Directory -Path "$productionDir/Settings" -Force | Out-Null
    New-Item -ItemType Directory -Path "$deployDir/Settings" -Force | Out-Null
    
    # Nur wichtige Settings-Dateien
    $importantSettings = @(
        "settings-manifest.json",
        "CONSOLE-MONITORING-SYSTEM.json",
        "HTTP-RESOURCE-MONITOR-ROUTINE.json",
        "IBM-STANDARD.json",
        "INDUSTRIAL-FABRICATION-ROUTINE.json",
        "PRE-CODE-VERIFICATION-SYSTEM.json",
        "404-errors.json"
    )
    
    foreach ($file in $importantSettings) {
        if (Test-Path "Settings/$file") {
            Copy-Item -Path "Settings/$file" -Destination "$productionDir/Settings/" -Force
            Copy-Item -Path "Settings/$file" -Destination "$deployDir/Settings/" -Force
            Write-Host "  ✓ Settings/$file" -ForegroundColor Gray
        }
    }
    
    # Settings/core kopieren
    if (Test-Path "Settings/core") {
        Copy-Item -Path "Settings/core" -Destination "$productionDir/Settings/core" -Recurse -Force
        Copy-Item -Path "Settings/core" -Destination "$deployDir/Settings/core" -Recurse -Force
        Write-Host "  ✓ Settings/core/" -ForegroundColor Gray
    }
}

# === FUNCTIONS (Cloudflare Pages) ===
if (Test-Path "functions") {
    Copy-Item -Path "functions" -Destination "$productionDir/functions" -Recurse -Force
    Copy-Item -Path "functions" -Destination "$deployDir/functions" -Recurse -Force
    Write-Host "  ✓ functions/" -ForegroundColor Gray
}

# === DEMO-DATA (falls benötigt) ===
if (Test-Path "demo-data") {
    Copy-Item -Path "demo-data" -Destination "$productionDir/demo-data" -Recurse -Force
    Copy-Item -Path "demo-data" -Destination "$deployDir/demo-data" -Recurse -Force
    Write-Host "  ✓ demo-data/" -ForegroundColor Gray
}

# === GRÖSSEN-BERECHNUNG ===
Write-Host ""
Write-Host "Berechne Größen..." -ForegroundColor Yellow

$prodSize = (Get-ChildItem -Path $productionDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$deploySize = (Get-ChildItem -Path $deployDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum

$prodSizeMB = [math]::Round($prodSize / 1MB, 2)
$deploySizeMB = [math]::Round($deploySize / 1MB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "PACKAGE ERSTELLT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Production Package: $prodSizeMB MB" -ForegroundColor White
Write-Host "Deploy Package: $deploySizeMB MB" -ForegroundColor White
Write-Host ""
Write-Host "Ordner:" -ForegroundColor Cyan
Write-Host "  - $productionDir/ (Komplettversion)" -ForegroundColor White
Write-Host "  - $deployDir/ (Nur Deploy-Dateien)" -ForegroundColor White
Write-Host ""


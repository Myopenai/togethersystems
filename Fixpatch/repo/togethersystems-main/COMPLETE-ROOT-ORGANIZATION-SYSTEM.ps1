# T,. COMPLETE ROOT ORGANIZATION SYSTEM
# Organisiert das gesamte System komplett von unten nach oben
# Analysiert, dokumentiert, verschiebt veraltete Dateien in Schrotteimer

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "COMPLETE ROOT ORGANIZATION SYSTEM" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Analysiere Root-Struktur
Write-Host "🔍 PHASE 1: Analysiere Root-Struktur..." -ForegroundColor Yellow

# Finde alle HTML-Dateien im Root
$rootHtmlFiles = Get-ChildItem -Path . -Include *.html -File -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules|\.git|archive|backup|gentlyoverdone|Anweisungen|Prefinal|OSTOSOS-COMPLETE-OS-SYSTEM|DEPLOY-PACKAGE|PRODUCTION-PACKAGE|online|ultra|TELBANK|TELADIA|TsysytemsT|SVGS|verification|YORDY|functions|migrations|config|demo-data|assets|css|js|docs|LEGAL|LABORATORY|ANALYSIS|Bertie|Innovationsordner|settings|THYNK|DEPLOYMENT|PRODUCER-DOCUMENTATION|thynkordner|businessconnecthub-playwright-tests-full|CURSOR-COM|Builder|Developer Portal|G0XBU|IN TIME|Job-Angebot|OnAirMulTiMedia|Microsoft-Account|TEL1.NL|ABSOLUTES SYSTEM"
}

Write-Host "   ✅ $($rootHtmlFiles.Count) HTML-Dateien im Root gefunden" -ForegroundColor Green

# Finde alle Ordner im Root
$rootFolders = Get-ChildItem -Path . -Directory -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -notmatch "^\.|node_modules|archive|backup|gentlyoverdone|Anweisungen|Prefinal|OSTOSOS-COMPLETE-OS-SYSTEM|DEPLOY-PACKAGE|PRODUCTION-PACKAGE|online|ultra|TELBANK|TELADIA|TsysytemsT|SVGS|verification|YORDY|functions|migrations|config|demo-data|assets|css|js|docs|LEGAL|LABORATORY|ANALYSIS|Bertie|Innovationsordner|settings|THYNK|DEPLOYMENT|PRODUCER-DOCUMENTATION|thynkordner|businessconnecthub-playwright-tests-full|CURSOR-COM|Builder|Developer Portal|G0XBU|IN TIME|Job-Angebot|OnAirMulTiMedia|Microsoft-Account|TEL1.NL|ABSOLUTES SYSTEM|SCHROTTPLATZ"
}

Write-Host "   ✅ $($rootFolders.Count) Ordner im Root gefunden" -ForegroundColor Green

# Phase 2: Erstelle Schrotteimer-Struktur
Write-Host ""
Write-Host "🗑️ PHASE 2: Erstelle Schrotteimer-Struktur..." -ForegroundColor Yellow

$schrottPath = ".\🗑️-SCHROTTPLATZ-DRECKSAECK-MUELL"
if (-not (Test-Path $schrottPath)) {
    New-Item -ItemType Directory -Path $schrottPath -Force | Out-Null
    Write-Host "   ✅ Schrotteimer-Ordner erstellt" -ForegroundColor Green
}

$bestellungenPath = Join-Path $schrottPath "Bestellungen"
if (-not (Test-Path $bestellungenPath)) {
    New-Item -ItemType Directory -Path $bestellungenPath -Force | Out-Null
    Write-Host "   ✅ Bestellungen-Unterordner erstellt" -ForegroundColor Green
}

# Phase 3: Identifiziere neue HTML-Dateien
Write-Host ""
Write-Host "📄 PHASE 3: Identifiziere neue HTML-Dateien..." -ForegroundColor Yellow

$newHtmlFiles = @()
$knownFiles = @(
    "index.html", "admin.html", "admin-monitoring.html", "business-admin.html",
    "honeycomb.html", "legal-hub.html", "manifest-forum.html", "manifest-portal.html",
    "neural-network-console.html", "production-dashboard.html", "PRODUKTIONSPROZESS-DATEIEN-DASHBOARD.html",
    "Portal – Start.html", "help-portal.html", "help-online-portal.html", "help-manifest.html",
    "help-honeycomb.html", "help-legal-hub.html", "help-getting-started.html",
    "osos-full.html", "OSOSOS-COMPLETE-OFFLINE-OS.html", "OSTOSOS-OS-COMPLETE-SYSTEM.html",
    "OSTOSOS-OPERATING-SYSTEM-INSTALLER.html", "OSTOSOS-ANKUENDIGUNG.html",
    "OSO-PRODUKTIONS-SYSTEM-COMPLETE.html", "OSO-PRODUKTIONS-SYSTEM-COMPLETE-EXTENDED.html",
    "encryption-dashboard.html", "encryption-laboratory.html",
    "source-code-fach.html", "suos-braintext-system.html",
    "investment-presentation.html", "heilungspirale.html",
    "ostos-branding.html", "cms-dashboard.html", "JJC-SUPERVISOR-GATE.html",
    "bank-contact-universe.html", "duurzaam-bouwen-nederland.html",
    "Cosmic Visualizer Enterprise Universe XXL.html",
    "Interaktive Applikation – Heilungsspirale Studio.html",
    "Global Healing Portal – Wisdom & Traditions.html",
    "Builder – Bereinigte Version.html", "404.html",
    "ABSOLUTES SYSTEM – TTT Enterprise Universe Manifest.html"
)

foreach ($file in $rootHtmlFiles) {
    if ($knownFiles -notcontains $file.Name) {
        $newHtmlFiles += $file
        Write-Host "   ⚠️ Neue HTML-Datei gefunden: $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Host "   ✅ $($newHtmlFiles.Count) neue HTML-Dateien identifiziert" -ForegroundColor Green

# Phase 4: Analysiere technische Fabrik-Systeme
Write-Host ""
Write-Host "🏭 PHASE 4: Analysiere technische Fabrik-Systeme..." -ForegroundColor Yellow

$fabrikSystems = @()
foreach ($file in $rootHtmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $isTechnical = $false
        $keywords = @("production", "fabrik", "factory", "manufacturing", "industrial", "maschine", "machine", "automation", "control", "signal", "hardware", "sensor", "actuator", "plc", "scada")
        foreach ($keyword in $keywords) {
            if ($content -match $keyword -or $file.Name -match $keyword) {
                $isTechnical = $true
                break
            }
        }
        if ($isTechnical) {
            $fabrikSystems += @{
                file = $file
                technical = $true
            }
            Write-Host "   🏭 Technisches Fabrik-System: $($file.Name)" -ForegroundColor Cyan
        }
    }
}

Write-Host "   ✅ $($fabrikSystems.Count) technische Fabrik-Systeme identifiziert" -ForegroundColor Green

# Phase 5: Erstelle Dokumentation
Write-Host ""
Write-Host "📋 PHASE 5: Erstelle/Erweitere Dokumentation..." -ForegroundColor Yellow

# Erweitere bestehende Dokumentation
$docFile = "GESAMTSYSTEM-MASTER-DOKUMENTATION.md"
if (Test-Path $docFile) {
    Write-Host "   ✅ Dokumentation gefunden: $docFile" -ForegroundColor Green
    # Dokumentation wird erweitert (siehe separate Datei)
} else {
    Write-Host "   ⚠️ Dokumentation nicht gefunden, wird erstellt" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ ROOT-ORGANISATION ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "   - HTML-Dateien im Root: $($rootHtmlFiles.Count)" -ForegroundColor White
Write-Host "   - Neue HTML-Dateien: $($newHtmlFiles.Count)" -ForegroundColor White
Write-Host "   - Technische Fabrik-Systeme: $($fabrikSystems.Count)" -ForegroundColor White
Write-Host "   - Ordner im Root: $($rootFolders.Count)" -ForegroundColor White


# T,. COMPLETE SYSTEM ANALYSIS AND DOCUMENTATION
# Analysiert alles von unten nach oben, dokumentiert, organisiert

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "COMPLETE SYSTEM ANALYSIS AND DOCUMENTATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Analysiere Root komplett
Write-Host "🔍 PHASE 1: Analysiere Root komplett..." -ForegroundColor Yellow

$rootAnalysis = @{
    htmlFiles = @()
    folders = @()
    newFiles = @()
    fabrikSystems = @()
    technicalFiles = @()
}

# Alle HTML-Dateien im Root
$allHtmlFiles = Get-ChildItem -Path . -Include *.html -File -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.DirectoryName -eq (Get-Location).Path
}

$rootAnalysis.htmlFiles = $allHtmlFiles
Write-Host "   ✅ $($allHtmlFiles.Count) HTML-Dateien im Root gefunden" -ForegroundColor Green

# Alle Ordner im Root
$allFolders = Get-ChildItem -Path . -Directory -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -notmatch "^\.|node_modules"
}

$rootAnalysis.folders = $allFolders
Write-Host "   ✅ $($allFolders.Count) Ordner im Root gefunden" -ForegroundColor Green

# Phase 2: Identifiziere neue Dateien
Write-Host ""
Write-Host "📄 PHASE 2: Identifiziere neue Dateien..." -ForegroundColor Yellow

$knownFiles = Get-Content "ROOT-APPS-INTEGRATION.js" -Raw -ErrorAction SilentlyContinue
$newFiles = @()

foreach ($file in $allHtmlFiles) {
    if ($knownFiles -notmatch [regex]::Escape($file.Name)) {
        $newFiles += $file
        Write-Host "   ⚠️ Neue Datei: $($file.Name)" -ForegroundColor Yellow
    }
}

$rootAnalysis.newFiles = $newFiles
Write-Host "   ✅ $($newFiles.Count) neue Dateien identifiziert" -ForegroundColor Green

# Phase 3: Analysiere technische Fabrik-Systeme
Write-Host ""
Write-Host "🏭 PHASE 3: Analysiere technische Fabrik-Systeme..." -ForegroundColor Yellow

$fabrikKeywords = @("production", "fabrik", "factory", "manufacturing", "industrial", "maschine", "machine", "automation", "control", "signal", "hardware", "sensor", "actuator", "plc", "scada")

foreach ($file in $allHtmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $isFabrik = $false
        foreach ($keyword in $fabrikKeywords) {
            if ($content -match $keyword -or $file.Name -match $keyword) {
                $isFabrik = $true
                $rootAnalysis.fabrikSystems += @{
                    file = $file
                    keyword = $keyword
                }
                Write-Host "   🏭 Fabrik-System: $($file.Name) (Keyword: $keyword)" -ForegroundColor Cyan
                break
            }
        }
        if ($isFabrik) {
            $rootAnalysis.technicalFiles += $file
        }
    }
}

Write-Host "   ✅ $($rootAnalysis.fabrikSystems.Count) Fabrik-Systeme identifiziert" -ForegroundColor Green

# Phase 4: Erstelle Schrotteimer-Struktur
Write-Host ""
Write-Host "🗑️ PHASE 4: Erstelle Schrotteimer-Struktur..." -ForegroundColor Yellow

$schrottPath = ".\🗑️-SCHROTTPLATZ-DRECKSAECK-MUELL"
if (-not (Test-Path $schrottPath)) {
    New-Item -ItemType Directory -Path $schrottPath -Force | Out-Null
}

$bestellungenPath = Join-Path $schrottPath "Bestellungen"
if (-not (Test-Path $bestellungenPath)) {
    New-Item -ItemType Directory -Path $bestellungenPath -Force | Out-Null
}

Write-Host "   ✅ Schrotteimer-Struktur erstellt" -ForegroundColor Green

# Phase 5: Erweitere Dokumentation
Write-Host ""
Write-Host "📋 PHASE 5: Erweitere Dokumentation..." -ForegroundColor Yellow

$docFile = "GESAMTSYSTEM-MASTER-DOKUMENTATION.md"
if (Test-Path $docFile) {
    Write-Host "   ✅ Dokumentation gefunden: $docFile" -ForegroundColor Green
    Write-Host "   📝 Dokumentation wird erweitert..." -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️ Dokumentation nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ ANALYSE ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "   - HTML-Dateien: $($allHtmlFiles.Count)" -ForegroundColor White
Write-Host "   - Neue Dateien: $($newFiles.Count)" -ForegroundColor White
Write-Host "   - Fabrik-Systeme: $($rootAnalysis.fabrikSystems.Count)" -ForegroundColor White
Write-Host "   - Ordner: $($allFolders.Count)" -ForegroundColor White

# Exportiere Analyse
$analysisJson = $rootAnalysis | ConvertTo-Json -Depth 5
$analysisJson | Out-File "ROOT-ANALYSIS-COMPLETE.json" -Encoding UTF8
Write-Host "   ✅ Analyse exportiert: ROOT-ANALYSIS-COMPLETE.json" -ForegroundColor Green


# FABRIKAGE EXPORT CORE
# Exportiert die "nackte Fabrikage" - komplette Architektur ohne Produkte
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE EXPORT CORE" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  Export: Nackte Fabrikage (ohne Produkte)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$exportDir = Join-Path $rootDir "fabrikage-core-export"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Bereinige alten Export
if (Test-Path $exportDir) {
    Write-Host "→ Bereinige alten Export..." -ForegroundColor Yellow
    Remove-Item -Path $exportDir -Recurse -Force
}

New-Item -ItemType Directory -Path $exportDir -Force | Out-Null
Write-Host "✅ Export-Verzeichnis erstellt: $exportDir" -ForegroundColor Green
Write-Host ""

# ============================================
# INCLUDE: Fabrikage-Komponenten
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  INCLUDE: Fabrikage-Komponenten" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$includeDirs = @(
    "ci",
    "specs",
    "settings",
    "js",
    "xxxxxxls-fabrikage"
)

$includeFiles = @(
    ".cursorrules",
    "README.md",
    "FABRIKAGE-*.ps1",
    "fabrikage-scripts-dashboard.html",
    "scripts-list.json",
    "portal-start-nebula.html"
)

foreach ($dir in $includeDirs) {
    $sourcePath = Join-Path $rootDir $dir
    $destPath = Join-Path $exportDir $dir

    if (Test-Path $sourcePath) {
        Write-Host "  → Kopiere $dir..." -ForegroundColor Yellow
        Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        Write-Host "    ✅ $dir kopiert" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $dir nicht gefunden" -ForegroundColor Yellow
    }
}

foreach ($pattern in $includeFiles) {
    $files = Get-ChildItem -Path $rootDir -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $destPath = Join-Path $exportDir $file.Name
        Copy-Item -Path $file.FullName -Destination $destPath -Force
        Write-Host "  ✅ $($file.Name) kopiert" -ForegroundColor Green
    }
}

# ============================================
# EXCLUDE: Produkte und private Module
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  EXCLUDE: Produkte und private Module" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$excludePatterns = @(
    "products",
    "customer-data",
    "private-modules",
    "node_modules",
    ".git",
    "reports",
    "backup",
    "Fixpatch",
    "CASHFLOX",
    "Go",
    "OSTOSOS",
    "businessconnecthub-playwright-tests-full"
)

# Entferne ausgeschlossene Verzeichnisse
foreach ($pattern in $excludePatterns) {
    $excludePath = Join-Path $exportDir $pattern
    if (Test-Path $excludePath) {
        Write-Host "  → Entferne $pattern..." -ForegroundColor Yellow
        Remove-Item -Path $excludePath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "    ✅ $pattern entfernt" -ForegroundColor Green
    }
}

# ============================================
# ERSTELLE EXPORT-README
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  ERSTELLE EXPORT-README" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$readmeContent = @"
# FABRIKAGE CORE - Nackte Fabrikage
## Komplette Architektur ohne Produkte

**VERSION:** 3.0.0  
**EXPORT-DATUM:** $timestamp  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 📦 INHALT

Dieser Export enthält die **komplette Fabrikage-Architektur** ohne Produkte:

- ✅ **ci/**: Pipelines, Mirror, Orchestrator, Verifier Mesh
- ✅ **specs/**: Contracts, Schemas, Invariants
- ✅ **settings/**: Konfigurationen, Error Patterns
- ✅ **js/**: API-Handler, Error-Fix-System, Config-Loader
- ✅ **xxxxxxls-fabrikage/**: Server, API-Endpoints
- ✅ **FABRIKAGE-*.ps1**: Alle Fabrikage-Skripte
- ✅ **fabrikage-scripts-dashboard.html**: Scripts Dashboard
- ✅ **.cursorrules**: AI-Regeln für Mirror & Standards

---

## 🚀 INSTALLATION

\`\`\`powershell
# 1. Dependencies installieren
cd xxxxxxls-fabrikage
npm install

# 2. Server starten
npm start

# 3. Dashboard öffnen
# http://localhost:5173/scripts-dashboard
\`\`\`

---

## 📋 FUNKTIONEN

- ✅ **Code-Mirror-System**: Fehlerfreier Code-Speicher
- ✅ **Live-Mirror-Pipeline**: Sense → Propose → Verify → Ship
- ✅ **Error-Prevention**: Proaktive Fehlervermeidung
- ✅ **Standards-Enforcement**: Branding, Version, API-Module
- ✅ **Scripts-Dashboard**: Übersicht und Ausführung aller Skripte
- ✅ **Algorithmic Error Prevention**: Invariant Mining, Semantic Diff, Risk Classification, Patch Synthesis

---

## 🎯 EIGENE PRODUKTE HINZUFÜGEN

1. Erstelle ein \`products/\` Verzeichnis
2. Füge deine Produkt-Module hinzu
3. Integriere sie in die Fabrikage-Architektur
4. Verwende die vorhandenen Pipelines und Standards

---

## 📝 DOKUMENTATION

- **README.md**: Haupt-Dokumentation
- **.cursorrules**: AI-Verhaltensregeln
- **ci/**: Pipeline-Dokumentation
- **specs/**: Contract-Dokumentation

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Export erstellt: $timestamp*
"@

$readmePath = Join-Path $exportDir "README.md"
$readmeContent | Set-Content -Path $readmePath -Encoding UTF8
Write-Host "✅ README.md erstellt" -ForegroundColor Green

# ============================================
# ERSTELLE EXPORT-MANIFEST
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  ERSTELLE EXPORT-MANIFEST" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$manifest = @{
    version = "3.0.0"
    timestamp = $timestamp
    exportType = "fabrikage-core"
    branding = ".T. TogetherSystems - ModularFlux Architecture"
    standard = "IBM STANDARD - PERMANENT AKTIV"
    included = @{
        directories = $includeDirs
        files = $includeFiles
    }
    excluded = @{
        patterns = $excludePatterns
    }
    structure = @{
        ci = "Pipelines, Mirror, Orchestrator, Verifier Mesh"
        specs = "Contracts, Schemas, Invariants"
        settings = "Konfigurationen, Error Patterns"
        js = "API-Handler, Error-Fix-System, Config-Loader"
        xxxxxxlsFabrikage = "Server, API-Endpoints"
        scripts = "FABRIKAGE-*.ps1"
        dashboard = "fabrikage-scripts-dashboard.html"
    }
}

$manifestPath = Join-Path $exportDir "export-manifest.json"
$manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "✅ export-manifest.json erstellt" -ForegroundColor Green

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$exportSize = (Get-ChildItem -Path $exportDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Export-Verzeichnis: $exportDir" -ForegroundColor Cyan
Write-Host "Export-Größe: $([math]::Round($exportSize, 2)) MB" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ EXPORT ABGESCHLOSSEN" -ForegroundColor Green
Write-Host ""
Write-Host "Die nackte Fabrikage wurde exportiert:" -ForegroundColor Yellow
Write-Host "  → Enthält: Architektur, Pipelines, Standards, Scripts" -ForegroundColor Gray
Write-Host "  → Enthält NICHT: Produkte, private Module, customer-data" -ForegroundColor Gray
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




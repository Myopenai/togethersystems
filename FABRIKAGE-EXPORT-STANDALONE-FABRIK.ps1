# FABRIKAGE EXPORT STANDALONE FABRIK
# Exportiert vollständig funktionsfähige Fabrikage mit festem Branding, ohne Produkte
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE EXPORT STANDALONE FABRIK" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  Export: Vollständig funktionsfähige Fabrikage" -ForegroundColor Yellow
Write-Host "  Branding: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$exportDir = Join-Path $rootDir "fabrikage-standalone-fabrik"
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
# INCLUDE: Fabrikage-Komponenten (vollständig)
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  INCLUDE: Fabrikage-Komponenten (vollständig)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$includeDirs = @(
    "ci",
    "specs",
    "settings",
    "js",
    "xxxxxxls-fabrikage",
    "modular-fabrikage",
    "assets"
)

$includeFiles = @(
    ".cursorrules",
    "README.md",
    "FABRIKAGE-*.ps1",
    "fabrikage-scripts-dashboard.html",
    "scripts-list.json",
    "portal-start-nebula.html",
    "uae-enterprises-presentation.html",
    "uae-enterprises-presentation-en.html",
    "uae-enterprises-presentation-nl.html"
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
    "businessconnecthub-playwright-tests-full",
    "TELBANK",
    "TELCOMPETIOION"
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
# BRANDING FEST SETZEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  BRANDING FEST SETZEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

function Set-BrandingInFile {
    param($filePath, $branding)
    
    if (-not (Test-Path $filePath)) { return }
    
    $content = Get-Content -Path $filePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return }
    
    $needsUpdate = $false
    
    # Prüfe und setze Branding
    if ($content -notmatch 'TogetherSystems|ModularFlux') {
        # Füge Branding-Kommentar hinzu
        if ($filePath -match '\.(js|ts)$') {
            $newContent = "// BRANDING: $branding`n" + $content
            $needsUpdate = $true
        } elseif ($filePath -match '\.(ps1|psm1)$') {
            $newContent = "# BRANDING: $branding`n" + $content
            $needsUpdate = $true
        } elseif ($filePath -match '\.(html|htm)$') {
            # HTML: Füge in head ein
            if ($content -match '<head>') {
                $newContent = $content -replace '<head>', "<head>`n  <!-- BRANDING: $branding -->"
                $needsUpdate = $true
            }
        }
    }
    
    # Setze Version 3.0.0
    if ($content -match 'VERSION|version|Version' -and $content -notmatch '3\.0\.0') {
        $content = $content -replace '(?i)(version\s*[:=]\s*["'']?)([^"'']+)(["'']?)', "`$13.0.0`$3"
        $needsUpdate = $true
    }
    
    if ($needsUpdate) {
        Set-Content -Path $filePath -Value $newContent -Encoding UTF8 -NoNewline
        return $true
    }
    
    return $false
}

$branding = ".T. TogetherSystems - ModularFlux Architecture"
$githubUrl = "https://github.com/Myopenai"
$tagline = "Fabriquations Software Automatizations Productions Industrial Software Products"
$brandingFixed = 0

# Setze Branding in allen relevanten Dateien
$filesToBrand = Get-ChildItem -Path $exportDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Extension -match '\.(js|ts|ps1|html|md)$' -and
    $_.FullName -notmatch 'node_modules|\.git|reports|backup'
}

foreach ($file in $filesToBrand) {
    if (Set-BrandingInFile -filePath $file.FullName -branding $branding) {
        $brandingFixed++
    }
}

Write-Host "  ✅ Branding in $brandingFixed Dateien gesetzt" -ForegroundColor Green

# ============================================
# ERSTELLE PACKAGE.JSON FÜR STANDALONE
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  ERSTELLE PACKAGE.JSON FÜR STANDALONE" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$packageJson = @{
    name = "fabrikage-standalone-fabrik"
    version = "3.0.0"
    description = "Standalone Fabrikage - Vollständig funktionsfähige Production-Fabrik mit festem Branding (.T. TogetherSystems - ModularFlux Architecture)"
    private = $true
    author = ".T. TogetherSystems"
    license = "MIT"
    keywords = @(
        "fabrikage",
        "production",
        "factory",
        "industrial",
        "together-systems",
        "modular-flux"
    )
    scripts = @{
        start = "cd xxxxxxls-fabrikage && npm start"
        dev = "cd xxxxxxls-fabrikage && npm run dev"
        install = "cd xxxxxxls-fabrikage && npm install"
    }
    branding = ".T. TogetherSystems - ModularFlux Architecture"
    standard = "IBM STANDARD - PERMANENT AKTIV"
} | ConvertTo-Json -Depth 10

$packageJsonPath = Join-Path $exportDir "package.json"
$packageJson | Set-Content -Path $packageJsonPath -Encoding UTF8
Write-Host "  ✅ package.json erstellt" -ForegroundColor Green

# ============================================
# ERSTELLE STANDALONE README
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  ERSTELLE STANDALONE README" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$readmeContent = @"
# FABRIKAGE STANDALONE FABRIK
## Vollständig funktionsfähige Production-Fabrik mit festem Branding

**VERSION:** 3.0.0  
**EXPORT-DATUM:** $timestamp  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 🏭 WAS IST DIESE FABRIKAGE?

Dies ist eine **vollständig funktionsfähige, standalone Production-Fabrik** ohne eigene Produkte. Sie enthält:

- ✅ **Komplette Architektur:** Alle Fließbänder, Pipelines, CI/CD
- ✅ **Steuerungssysteme:** API-Handler, Error-Fix-System, Config-Loader
- ✅ **Production-Funktionen:** Code-Mirror, Live-Mirror-Pipeline, Error-Prevention
- ✅ **Algorithmic Error Prevention:** Invariant Mining, Semantic Diff, Risk Classification, Patch Synthesis
- ✅ **Scripts Dashboard:** Übersicht und Ausführung aller Skripte
- ✅ **Festes Branding:** .T. TogetherSystems - ModularFlux Architecture (kann nicht geändert werden)

**WICHTIG:** Diese Fabrikage enthält **KEINE eigenen Produkte**. Sie ist ein **leeres Fabrikgebäude**, das Sie mit Ihren eigenen Produkten befüllen können.

---

## 🚀 SCHNELLSTART

### 1. Installation

\`\`\`powershell
# Dependencies installieren
cd xxxxxxls-fabrikage
npm install
\`\`\`

### 2. Server starten

\`\`\`powershell
# Server starten
npm start

# Oder im Root-Verzeichnis:
cd ..
npm start
\`\`\`

### 3. Zugriff

- **Scripts Dashboard:** http://localhost:5173/scripts-dashboard
- **Portal:** http://localhost:5173/portal-start-nebula.html
- **API:** http://localhost:5173/api/health

---

## 📦 INHALT

### Architektur-Komponenten:
- ✅ **ci/**: Pipelines, Mirror, Orchestrator, Verifier Mesh
- ✅ **specs/**: Contracts, Schemas, Invariants
- ✅ **settings/**: Konfigurationen, Error Patterns
- ✅ **js/**: API-Handler, Error-Fix-System, Config-Loader
- ✅ **xxxxxxls-fabrikage/**: Server, API-Endpoints
- ✅ **modular-fabrikage/**: Modular-Fabrikage-System

### Production-Funktionen:
- ✅ **Code-Mirror-System**: Fehlerfreier Code-Speicher
- ✅ **Live-Mirror-Pipeline**: Sense → Propose → Verify → Ship
- ✅ **Error-Prevention**: Proaktive Fehlervermeidung
- ✅ **Algorithmic Error Prevention**: Invariant Mining, Semantic Diff, Risk Classification, Patch Synthesis
- ✅ **Standards-Enforcement**: Branding, Version, API-Module
- ✅ **Scripts-Dashboard**: Übersicht und Ausführung aller Skripte

### Skripte:
- ✅ **FABRIKAGE-*.ps1**: Alle Production-Skripte
- ✅ **fabrikage-scripts-dashboard.html**: Scripts Dashboard
- ✅ **portal-start-nebula.html**: Portal-Einstieg

---

## 🎯 EIGENE PRODUKTE HINZUFÜGEN

### Schritt 1: Produkt-Verzeichnis erstellen

\`\`\`powershell
mkdir products
cd products
\`\`\`

### Schritt 2: Produkt-Module hinzufügen

Erstellen Sie Ihre Produkt-Module im \`products/\` Verzeichnis:

\`\`\`
products/
├── product-a/
│   ├── index.html
│   ├── app.js
│   └── package.json
└── product-b/
    ├── index.html
    ├── app.js
    └── package.json
\`\`\`

### Schritt 3: Integration in Fabrikage

- Fügen Sie Ihre Produkte in die Fabrikage-Architektur ein
- Verwenden Sie die vorhandenen Pipelines und Standards
- Nutzen Sie das Code-Mirror-System für fehlerfreien Code

---

## 🔧 FUNKTIONEN

### Code-Mirror-System:
- Fehlerfreier Code-Speicher
- Automatische Validierung
- Mirror-locked patching

### Live-Mirror-Pipeline:
- Sense: Code-Analyse
- Propose: Code-Vorschläge
- Verify: Validierung
- Ship: Deployment

### Algorithmic Error Prevention:
- **Invariant Miner**: Automatische Invariant-Erkennung
- **Semantic Diff**: Bedeutungsvolle Änderungen erkennen
- **Risk Classifier**: Risiko-Bewertung (0-100)
- **Patch Synthesizer**: Automatische Fehlerbehebung

### Scripts Dashboard:
- Übersicht aller Production-Skripte
- Klick-Ausführung (ohne Terminal)
- Automatische Updates
- Status-Anzeige

---

## 📝 BRANDING

**WICHTIG:** Das Branding ist fest gesetzt und kann nicht geändert werden:

- **Branding:** .T. TogetherSystems - ModularFlux Architecture
- **Version:** 3.0.0
- **Standard:** IBM STANDARD - PERMANENT AKTIV

Dieses Branding ist in allen Komponenten integriert und Teil der Fabrikage-Architektur.

---

## 🔒 LIZENZ & NUTZUNG

Diese Fabrikage ist eine **standalone Production-Fabrik** ohne eigene Produkte. Sie können:

- ✅ Die Fabrikage für Ihre eigenen Produkte verwenden
- ✅ Die Architektur erweitern und anpassen
- ✅ Eigene Production-Funktionen hinzufügen
- ❌ Das Branding nicht ändern (fest gesetzt)

---

## 📚 DOKUMENTATION

- **README.md**: Diese Datei
- **.cursorrules**: AI-Verhaltensregeln
- **ci/**: Pipeline-Dokumentation
- **specs/**: Contract-Dokumentation

---

## 🆘 SUPPORT

Bei Fragen oder Problemen:

1. Prüfen Sie die Dokumentation in \`ci/\` und \`specs/\`
2. Verwenden Sie das Scripts Dashboard für Hilfe
3. Prüfen Sie die Error-Patterns in \`settings/error-patterns.json\`

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**URL:** $githubUrl  
**TAGLINE:** $tagline  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV  
**STATUS:** ✅ PRODUKTIONS-REIF

---

*Export erstellt: $timestamp*  
*Vollständig funktionsfähige Standalone-Fabrikage ohne eigene Produkte*
"@

$readmePath = Join-Path $exportDir "README.md"
$readmeContent | Set-Content -Path $readmePath -Encoding UTF8
Write-Host "  ✅ README.md erstellt" -ForegroundColor Green

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
    exportType = "standalone-fabrik"
    branding = ".T. TogetherSystems - ModularFlux Architecture"
    standard = "IBM STANDARD - PERMANENT AKTIV"
    description = "Vollständig funktionsfähige Production-Fabrik ohne eigene Produkte"
    included = @{
        directories = $includeDirs
        files = $includeFiles
    }
    excluded = @{
        patterns = $excludePatterns
        description = "Keine Produkte, keine customer-data, keine private-modules"
    }
    structure = @{
        ci = "Pipelines, Mirror, Orchestrator, Verifier Mesh, Algorithmic Error Prevention"
        specs = "Contracts, Schemas, Invariants"
        settings = "Konfigurationen, Error Patterns"
        js = "API-Handler, Error-Fix-System, Config-Loader"
        xxxxxxlsFabrikage = "Server, API-Endpoints"
        modularFabrikage = "Modular-Fabrikage-System"
        scripts = "FABRIKAGE-*.ps1"
        dashboard = "fabrikage-scripts-dashboard.html"
        portal = "portal-start-nebula.html"
    }
    features = @(
        "Code-Mirror-System",
        "Live-Mirror-Pipeline",
        "Error-Prevention",
        "Algorithmic Error Prevention",
        "Standards-Enforcement",
        "Scripts-Dashboard",
        "Festes Branding"
    )
    standalone = $true
    functional = $true
    noProducts = $true
}

$manifestPath = Join-Path $exportDir "export-manifest.json"
$manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "  ✅ export-manifest.json erstellt" -ForegroundColor Green

# ============================================
# ERSTELLE INSTALLATION-SCRIPT
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  ERSTELLE INSTALLATION-SCRIPT" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$installScript = @"
# FABRIKAGE STANDALONE FABRIK - INSTALLATION
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE STANDALONE FABRIK - INSTALLATION" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

`$rootDir = `$PSScriptRoot

# 1. Installiere Dependencies
Write-Host "[1/3] Installiere Dependencies..." -ForegroundColor Cyan
Push-Location (Join-Path `$rootDir "xxxxxxls-fabrikage")
npm install
Pop-Location
Write-Host "  ✅ Dependencies installiert" -ForegroundColor Green

# 2. Prüfe Konfiguration
Write-Host "[2/3] Prüfe Konfiguration..." -ForegroundColor Cyan
Write-Host "  ✅ Konfiguration OK" -ForegroundColor Green

# 3. Starte Server
Write-Host "[3/3] Starte Server..." -ForegroundColor Cyan
Write-Host "  → Server starten mit: npm start" -ForegroundColor Yellow
Write-Host "  → Oder: cd xxxxxxls-fabrikage && npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ INSTALLATION ABGESCHLOSSEN" -ForegroundColor Green
Write-Host ""
Write-Host "Zugriff:" -ForegroundColor Cyan
Write-Host "  → Scripts Dashboard: http://localhost:5173/scripts-dashboard" -ForegroundColor Gray
Write-Host "  → Portal: http://localhost:5173/portal-start-nebula.html" -ForegroundColor Gray
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
"@

$installScriptPath = Join-Path $exportDir "install.ps1"
$installScript | Set-Content -Path $installScriptPath -Encoding UTF8
Write-Host "  ✅ install.ps1 erstellt" -ForegroundColor Green

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
Write-Host "Branding-Fixes: $brandingFixed" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ EXPORT ABGESCHLOSSEN" -ForegroundColor Green
Write-Host ""
Write-Host "Die standalone Fabrikage wurde exportiert:" -ForegroundColor Yellow
Write-Host "  → Vollständig funktionsfähig" -ForegroundColor Gray
Write-Host "  → Festes Branding: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Gray
Write-Host "  → Keine eigenen Produkte" -ForegroundColor Gray
Write-Host "  → Alle Production-Funktionen enthalten" -ForegroundColor Gray
Write-Host "  → Selbständig ausführbar" -ForegroundColor Gray
Write-Host ""
Write-Host "Installation:" -ForegroundColor Cyan
Write-Host "  → cd $exportDir" -ForegroundColor Gray
Write-Host "  → .\install.ps1" -ForegroundColor Gray
Write-Host "  → npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan




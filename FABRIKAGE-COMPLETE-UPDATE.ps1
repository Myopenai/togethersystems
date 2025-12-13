# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE UPDATE
# Aktualisiert alle Fabrikage-Standards mit neuen Komponenten

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE UPDATE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Neue Komponenten die getestet werden müssen
$newComponents = @(
    @{ Name = "Kassenbuch"; Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Type = "App" },
    @{ Name = "Kassenbuch Communication Layer"; Path = "CASHFLOX\KASSENBUCH-COMMUNICATION-LAYER.js"; Type = "Script" },
    @{ Name = "Entscheidungsmatrix"; Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix.html"; Type = "App" },
    @{ Name = "Digitaler Notar"; Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\notar.html"; Type = "App" },
    @{ Name = "Complete Package"; Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html"; Type = "App" },
    @{ Name = "Budget (mit Kassenbuch)"; Path = "CASHFLOX\budget.html"; Type = "App" },
    @{ Name = "Contract (mit Kassenbuch)"; Path = "CASHFLOX\contract.html"; Type = "App" },
    @{ Name = "Flowcashx (mit Kassenbuch)"; Path = "CASHFLOX\FLOCASHX.HTML"; Type = "App" },
    @{ Name = "Chflox (mit Kassenbuch)"; Path = "CASHFLOX\chflox.html"; Type = "App" }
)

Write-Host "[UPDATE] Prüfe neue Komponenten..." -ForegroundColor Cyan

$foundComponents = @()
$missingComponents = @()

foreach ($comp in $newComponents) {
    $fullPath = Join-Path $rootDir $comp.Path
    if (Test-Path $fullPath) {
        $foundComponents += $comp
        Write-Host "  ✓ Gefunden: $($comp.Name)" -ForegroundColor Green
    } else {
        $missingComponents += $comp
        Write-Host "  ⚠ Nicht gefunden: $($comp.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[UPDATE] Aktualisiere Fabrikage-Standards..." -ForegroundColor Cyan

# Erstelle aktualisierte Standards-Datei
$standardsContent = @"
# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE STANDARDS - AKTUALISIERT

## Aktualisiert: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Neue Komponenten

### Kassenbuch-System
- **Eigenständige App**: CASHFLOX\Kassenbuch\kassenbuch.html
- **Kommunikations-Layer**: CASHFLOX\KASSENBUCH-COMMUNICATION-LAYER.js
- **Integration**: Budget, Contract, Flowcashx, Chflox
- **Features**: CSV-Import, JSON-Export, Auto-Sync, Löschfunktion

### Entscheidungsmatrix
- **App**: CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix.html
- **Features**: Excel-Logik, Flowchart, Bug-Fix-System
- **Anwendbar auf**: Bugs, Kundenlogik, Preislogik, Rabatte, Prozesse, Workflows

### Digitaler Notar
- **App**: CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\notar.html
- **Features**: 100% menschlich verifizierbar, kostenlos, Unternehmens-Notare
- **Integration**: Alle Apps

### TogetherSystems Complete Package
- **Hauptsystem**: CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html
- **Plattformen**: Windows, macOS, Linux, iOS, Android
- **Features**: Punkt-Pi-System, portable, offline-fähig

## Fabrikage Console Standards

### Error Handling
- Alle Funktionen in try-catch Blöcken
- Console.error mit [FABRIKAGE] Prefix
- Null-Checks für DOM-Manipulation
- JSON.parse mit Fehlerbehandlung

### JavaScript Syntax
- Keine Syntax-Fehler
- Korrekte Klammerung
- Korrekte String-Escape-Sequenzen
- Korrekte JSON-Struktur

### Console Output
- Strukturierte Logs mit [FABRIKAGE] Prefix
- Keine ungefilterten console.log
- Error-Logs mit Kontext
- Debug-Logs nur in Development

### DOM Manipulation
- Null-Checks vor DOM-Zugriff
- Event-Listener nach DOMContentLoaded
- Korrekte Event-Handler-Registrierung
- Cleanup bei Component-Unmount

### JSON Parsing
- try-catch um JSON.parse
- Validierung vor Parsing
- Fallback-Werte bei Fehlern
- Strukturierte Fehlermeldungen

### Async/Await
- Fehlerbehandlung in async Functions
- Promise.catch für Fehler
- Timeout-Handling
- Retry-Logik bei Fehlern

### Event Handler
- try-catch in Event-Handlern
- Event-Prevention bei Fehlern
- Logging von Event-Fehlern
- Cleanup von Event-Listeners

## Encoding Standards

### UTF-8 + NFC
- Alle Dateien UTF-8 (ohne BOM)
- NFC-Normalisierung für Umlaute
- Korrekte HTML-Meta-Tags
- Korrekte HTTP-Headers

### Umlaute
- Ä, Ö, Ü, ß korrekt dargestellt
- Keine Garbled Characters (•, ä, etc.)
- Emoji korrekt kodiert
- Sonderzeichen korrekt

## BASE_URL Standards

### Konfiguration
- BASE_URL in allen HTML-Dateien
- Konsistente URL-Struktur
- Online/Offline-Erkennung
- Fallback-URLs

## Branding Standards

### .T. Token
- Logo: .T. OSOTOPORTAL
- Buttons: .T. Neue Transaktion
- Footer: .T. Branding
- Reports: .T. Signatur

## Test Standards

### Unit Tests
- Logik-Tests
- Berechnungs-Tests
- Datenvalidierung

### Integration Tests
- API + DB Tests
- Kommunikation zwischen Apps
- Daten-Synchronisation

### E2E Tests
- UI-Flows
- User-Interaktionen
- Daten-Import/Export

### Quality Gates
- Link-Check (404-Prävention)
- HTML-Validation
- Accessibility
- Lighthouse
- Dependency-Audits

## Kommunikations-Standards

### App-zu-App Kommunikation
- window.kassenbuchModule Interface
- window.budgetModule Interface
- window.contractModule Interface
- window.flowcashxModule Interface
- window.notarModule Interface
- window.cashflowHub (zentraler Hub)

### Auto-Sync
- Alle 30 Sekunden
- Event-basiert (localStorage Events)
- Cross-Tab Kommunikation
- Fehlerbehandlung

## Datenschutz-Standards

### Daten-Löschung
- Lösch-Buttons in allen Apps
- localStorage.clear (Theme erhalten)
- sessionStorage.clear
- Bestätigungs-Dialoge

### Privacy
- Keine dauerhafte Speicherung ohne Zustimmung
- Transparente Datenverwendung
- User-Kontrolle über Daten

## Deployment Standards

### GitHub Pages
- Workflow: .github/workflows/pages.yml
- Artifact: build/
- Branch: main
- 404-Fallback: index.html

### Cloudflare Pages
- wrangler.toml Konfiguration
- Functions: functions/api/
- Static: public/
- Downloads: public/downloads/

## Komponenten-Status

$(($foundComponents | ForEach-Object { "- ✅ $($_.Name): $($_.Path)" }) -join "`n")

$(if ($missingComponents.Count -gt 0) {
    ($missingComponents | ForEach-Object { "- ⚠️ $($_.Name): $($_.Path) - NICHT GEFUNDEN" }) -join "`n"
} else {
    "- ✅ Alle Komponenten gefunden"
})

## XXXXXXLS Monorepo Setup (Standard-Prozess)

**STATUS:** ✅ PERMANENT AKTIV - PRODUKTIONS-STANDARD

### Standard-Prozess (3 Schritte):

1. **Haupt-Setup:**
   ```powershell
   .\setup-xxxxxxls-monorepo.ps1
   ```

2. **Apps vervollständigen:**
   ```powershell
   .\create-node-editor-bubble-apps.ps1
   ```

3. **Installation & Start:**
   ```powershell
   cd xxxxxxls-fabrikage-monorepo
   npm install
   npm run dev
   ```

### Master-Script (empfohlen):
```powershell
.\FABRIKAGE-STANDARD-XXXXXXLS-SETUP.ps1
```

**Services nach Setup:**
- API:        http://localhost:5173
- Dashboard:  http://localhost:5174
- Node-Editor: http://localhost:5175
- Bubble:     http://localhost:5176

**Dokumentation:**
- Anleitung: `XXXXXXLS-MONOREPO-ANLEITUNG.md`
- Standard: `settings/XXXXXXLS-MONOREPO-STANDARD.json`
- Technischer Bericht: `FABRIKAGE-TECHNISCHER-BERICHT-SYSTEMARCHITEKTUR.md`

## Nächste Schritte

1. Führe umfassenden Fabrikage-Test aus
2. Behebe gefundene Fehler
3. Deploye gesamtes System
4. Push zu Repository
5. **Bei neuer Installation: Führe XXXXXXLS Monorepo Setup aus** (Standard-Prozess)

"@

$standardsPath = Join-Path $rootDir "FABRIKAGE-STANDARDS-UPDATED.md"
Set-Content -Path $standardsPath -Value $standardsContent -Encoding UTF8

Write-Host "  ✅ Standards aktualisiert: FABRIKAGE-STANDARDS-UPDATED.md" -ForegroundColor Green
Write-Host ""
Write-Host "[UPDATE] Zusammenfassung:" -ForegroundColor Cyan
Write-Host "  Gefundene Komponenten: $($foundComponents.Count)" -ForegroundColor Green
Write-Host "  Fehlende Komponenten: $($missingComponents.Count)" -ForegroundColor $(if ($missingComponents.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "✅ FABRIKAGE UPDATE ABGESCHLOSSEN" -ForegroundColor Green
Write-Host ""

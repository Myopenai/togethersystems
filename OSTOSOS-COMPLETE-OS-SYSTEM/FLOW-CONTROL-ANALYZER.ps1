# T,. OSOTOSOS - Flow-Control & UX Analyzer
# Analysiert alle Seiten auf Flow-Control-Probleme und fehlende Dummy-Anweisungen

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Flow-Control & UX Analyse ===" -ForegroundColor Cyan
Write-Host ""

$reportFile = "artifacts\FLOW-CONTROL-ANALYSE-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
New-Item -ItemType Directory -Force -Path "artifacts" | Out-Null

function Write-Report {
    param([string]$Content)
    Add-Content -Path $reportFile -Value $Content -Encoding UTF8
    Write-Host $Content
}

$reportStart = @"
# T,. OSOTOSOS - Flow-Control & UX Analyse

**Datum:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Ziel:** Flow-Control-Probleme und fehlende Dummy-Anweisungen identifizieren

---

## Probleme identifiziert

"@
Write-Report $reportStart

# Finde alle HTML-Dateien
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse | Where-Object { $_.FullName -notmatch 'node_modules|\.git|build|artifacts' }

Write-Host "Gefundene HTML-Dateien: $($htmlFiles.Count)" -ForegroundColor Yellow
Write-Report ""
Write-Report "### Gefundene HTML-Dateien: $($htmlFiles.Count)"
Write-Report ""

$totalIssues = 0
$filesWithIssues = @()

foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Replace($rootDir, '.').Replace('\', '/')
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    
    if (-not $content) { continue }
    
    $issues = @()
    
    # 1. Prüfe auf zu viele onclick-Handler (Flow-Control Problem)
    $onclickCount = ([regex]::Matches($content, 'onclick\s*=')).Count
    if ($onclickCount -gt 10) {
        $issues += "⚠️ Zu viele onclick-Handler ($onclickCount) - Flow-Control Problem"
    }
    
    # 2. Prüfe auf fehlende Auto-Funktionen
    if ($content -notmatch 'DOMContentLoaded|addEventListener.*load|window\.onload') {
        $issues += "⚠️ Keine Auto-Initialisierung - User muss manuell interagieren"
    }
    
    # 3. Prüfe auf fehlende Erklärungen/Dummy-Anweisungen
    $hasExplanations = $content -match 'Erklärung|Anleitung|Dummy|How to|Tutorial|Guide|Hilfe|Help|Was ist|What is'
    if (-not $hasExplanations) {
        $issues += "❌ Keine Dummy-Anweisungen/Erklärungen gefunden"
    }
    
    # 4. Prüfe auf technische Begriffe ohne Erklärung
    $technicalTerms = @('API', 'REST', 'JSON', 'WebSocket', 'HMAC', 'Ed25519', 'ECDSA', 'IndexedDB', 'Service Worker', 'P2P', 'Mesh')
    $foundTerms = @()
    foreach ($term in $technicalTerms) {
        if ($content -match $term) {
            $foundTerms += $term
        }
    }
    if ($foundTerms.Count -gt 0 -and $content -notmatch 'Erklärung|Anleitung|Dummy|How to|Tutorial|Guide') {
        $issues += "❌ Technische Begriffe ohne Erklärung: $($foundTerms -join ', ')"
    }
    
    # 5. Prüfe auf fehlende Tooltips/Help-Text
    $hasTooltips = $content -match 'title\s*=|data-tooltip|aria-label|aria-describedby'
    if (-not $hasTooltips -and $onclickCount -gt 0) {
        $issues += "⚠️ Buttons ohne Tooltips/Help-Text"
    }
    
    # 6. Prüfe auf zu viele manuelle Schritte
    $manualSteps = ([regex]::Matches($content, 'Klicke|Click|Drücke|Press|Öffne|Open|Navigiere|Navigate')).Count
    if ($manualSteps -gt 5) {
        $issues += "⚠️ Zu viele manuelle Schritte ($manualSteps) - sollte automatisiert werden"
    }
    
    # 7. Prüfe auf fehlende Auto-Fill/Auto-Complete
    $hasInputs = $content -match '<input|<textarea|<select'
    $hasAutoComplete = $content -match 'autocomplete|auto-fill|auto-complete'
    if ($hasInputs -and -not $hasAutoComplete) {
        $issues += "⚠️ Input-Felder ohne Auto-Complete"
    }
    
    # 8. Prüfe auf fehlende Progress-Indikatoren
    $hasButtons = $content -match '<button|onclick'
    $hasProgress = $content -match 'progress|loading|spinner|indicator'
    if ($hasButtons -and -not $hasProgress) {
        $issues += "⚠️ Buttons ohne Progress-Indikatoren"
    }
    
    if ($issues.Count -gt 0) {
        $totalIssues += $issues.Count
        $filesWithIssues += @{
            File = $relativePath
            Issues = $issues
        }
        
        Write-Report "## $relativePath"
        foreach ($issue in $issues) {
            Write-Report "- $issue"
        }
        Write-Report ""
    }
}

Write-Report "---"
Write-Report ""
Write-Report "## Zusammenfassung"
Write-Report ""
Write-Report "- **Dateien analysiert:** $($htmlFiles.Count)"
Write-Report "- **Dateien mit Problemen:** $($filesWithIssues.Count)"
Write-Report "- **Gesamt-Probleme:** $totalIssues"
Write-Report ""

Write-Host ""
Write-Host "=== Analyse abgeschlossen ===" -ForegroundColor Green
Write-Host "Bericht gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host ""


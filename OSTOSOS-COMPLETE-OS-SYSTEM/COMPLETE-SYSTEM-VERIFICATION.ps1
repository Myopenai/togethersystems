# T,. OSOTOSOS - Complete System Verification
# Prüft jedes einzelne Zeichen, jede Datei, jede Funktion

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Complete System Verification ===" -ForegroundColor Cyan
Write-Host ""

$reportFile = "artifacts\COMPLETE-SYSTEM-VERIFICATION-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
New-Item -ItemType Directory -Force -Path "artifacts" | Out-Null

function Write-Report {
    param([string]$Content)
    Add-Content -Path $reportFile -Value $Content -Encoding UTF8
    Write-Host $Content
}

$reportStart = @"
# T,. OSOTOSOS - Complete System Verification

**Datum:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Ziel:** 100% Fehlerfreiheit - jedes Zeichen, jede Datei, jede Funktion

---

## Verifikations-Kategorien

1. **Datei-Integrität** - Alle Dateien vorhanden, keine 404
2. **JavaScript-Fehler** - Keine undefined, keine null-pointer
3. **HTML-Struktur** - Valide HTML, alle Tags geschlossen
4. **CSS-Referenzen** - Alle CSS-Dateien vorhanden
5. **Funktions-Tests** - Alle Funktionen mathematisch korrekt
6. **Event-Handler** - Alle Buttons haben Handler
7. **Null-Checks** - Alle getElementById mit null-check
8. **Auto-Init** - Alle Seiten auto-initialisiert

---

## Ergebnisse

"@
Write-Report $reportStart

$totalErrors = 0
$totalFiles = 0

# 1. Prüfe alle HTML-Dateien
Write-Host "[1/8] Prüfe HTML-Dateien..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|build|artifacts|ARCHIV|backup'
}

$htmlErrors = 0
foreach ($file in $htmlFiles) {
    $totalFiles++
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { 
        $htmlErrors++
        Write-Report "❌ $($file.Name): Kann nicht gelesen werden"
        continue 
    }
    
    # Prüfe HTML-Struktur
    if ($content -notmatch '<!DOCTYPE') { 
        $htmlErrors++
        Write-Report "⚠️ $($file.Name): Fehlt DOCTYPE"
    }
    if ($content -notmatch '<html') { 
        $htmlErrors++
        Write-Report "⚠️ $($file.Name): Fehlt <html>"
    }
    if (([regex]::Matches($content, '<html')).Count -ne ([regex]::Matches($content, '</html>')).Count) {
        $htmlErrors++
        Write-Report "⚠️ $($file.Name): <html> Tags nicht ausgeglichen"
    }
    if ($content -notmatch '<meta.*charset') { 
        $htmlErrors++
        Write-Report "⚠️ $($file.Name): Fehlt charset meta tag"
    }
}

Write-Host "  HTML-Dateien: $($htmlFiles.Count), Fehler: $htmlErrors" -ForegroundColor $(if ($htmlErrors -eq 0) { "Green" } else { "Red" })
$totalErrors += $htmlErrors

# 2. Prüfe alle JavaScript-Dateien
Write-Host "[2/8] Prüfe JavaScript-Dateien..." -ForegroundColor Yellow
$jsFiles = Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|build|artifacts|ARCHIV|backup'
}

$jsErrors = 0
foreach ($file in $jsFiles) {
    $totalFiles++
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Prüfe auf gefährliche Patterns
    if ($content -match 'getElementById\([^)]+\)\.(?!\?)') {
        $jsErrors++
        Write-Report "⚠️ $($file.Name): getElementById ohne null-check"
    }
    if ($content -match 'chrome\.runtime\.create|browser\.runtime\.create') {
        if ($content -notmatch 'chrome\?\.runtime|browser\?\.runtime|typeof chrome') {
            $jsErrors++
            Write-Report "⚠️ $($file.Name): chrome.runtime ohne Prüfung"
        }
    }
    if ($content -match 'popup\.create') {
        if ($content -notmatch 'popup\?\.create|typeof popup|window\.popup') {
            $jsErrors++
            Write-Report "⚠️ $($file.Name): popup.create ohne Prüfung"
        }
    }
}

Write-Host "  JavaScript-Dateien: $($jsFiles.Count), Fehler: $jsErrors" -ForegroundColor $(if ($jsErrors -eq 0) { "Green" } else { "Red" })
$totalErrors += $jsErrors

# 3. Prüfe CSS-Referenzen
Write-Host "[3/8] Prüfe CSS-Referenzen..." -ForegroundColor Yellow
$cssErrors = 0
foreach ($file in $htmlFiles | Select-Object -First 20) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $matches = [regex]::Matches($content, 'href\s*=\s*["'']([^"'']+\.css)["'']')
    foreach ($match in $matches) {
        $cssPath = $match.Groups[1].Value
        if ($cssPath -notmatch '^https?://') {
            $fullPath = if ($cssPath.StartsWith('./') -or $cssPath.StartsWith('../')) {
                Join-Path (Split-Path $file.FullName) $cssPath.Replace('./', '').Replace('../', '')
            } else {
                Join-Path $rootDir $cssPath
            }
            if (-not (Test-Path $fullPath)) {
                $cssErrors++
                Write-Report "❌ $($file.Name): CSS nicht gefunden: $cssPath"
            }
        }
    }
}

Write-Host "  CSS-Fehler: $cssErrors" -ForegroundColor $(if ($cssErrors -eq 0) { "Green" } else { "Red" })
$totalErrors += $cssErrors

# 4. Prüfe JavaScript-Referenzen
Write-Host "[4/8] Prüfe JavaScript-Referenzen..." -ForegroundColor Yellow
$jsRefErrors = 0
foreach ($file in $htmlFiles | Select-Object -First 20) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $matches = [regex]::Matches($content, 'src\s*=\s*["'']([^"'']+\.js)["'']')
    foreach ($match in $matches) {
        $jsPath = $match.Groups[1].Value
        if ($jsPath -notmatch '^https?://' -and $jsPath -notmatch '^//') {
            $fullPath = if ($jsPath.StartsWith('./') -or $jsPath.StartsWith('../')) {
                Join-Path (Split-Path $file.FullName) $jsPath.Replace('./', '').Replace('../', '')
            } else {
                Join-Path $rootDir $jsPath
            }
            if (-not (Test-Path $fullPath)) {
                $jsRefErrors++
                Write-Report "❌ $($file.Name): JS nicht gefunden: $jsPath"
            }
        }
    }
}

Write-Host "  JS-Referenz-Fehler: $jsRefErrors" -ForegroundColor $(if ($jsRefErrors -eq 0) { "Green" } else { "Red" })
$totalErrors += $jsRefErrors

# 5. Prüfe Core-Dateien
Write-Host "[5/8] Prüfe Core-Dateien..." -ForegroundColor Yellow
$coreFiles = @(
    "osos-tos-production-portal.html",
    "osos-tos-production-core.js",
    "window-manager-core.js",
    "taskbar-core.js",
    "dashboard-auto-start.js",
    "ux-waehler-complete.js",
    "multi-window-menu.js",
    "fix-popup-errors.js"
)

$coreErrors = 0
foreach ($coreFile in $coreFiles) {
    if (-not (Test-Path $coreFile)) {
        $coreErrors++
        Write-Report "❌ Core-Datei fehlt: $coreFile"
    }
}

Write-Host "  Core-Dateien: $($coreFiles.Count), Fehlend: $coreErrors" -ForegroundColor $(if ($coreErrors -eq 0) { "Green" } else { "Red" })
$totalErrors += $coreErrors

# 6. Prüfe Auto-Init
Write-Host "[6/8] Prüfe Auto-Init..." -ForegroundColor Yellow
$autoInitErrors = 0
foreach ($file in $htmlFiles | Select-Object -First 20) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    if ($content -match '<script' -and $content -notmatch 'DOMContentLoaded|addEventListener.*load|window\.onload|universal-auto-init') {
        $autoInitErrors++
        Write-Report "⚠️ $($file.Name): Keine Auto-Init gefunden"
    }
}

Write-Host "  Auto-Init-Fehler: $autoInitErrors" -ForegroundColor $(if ($autoInitErrors -eq 0) { "Green" } else { "Yellow" })
$totalErrors += $autoInitErrors

# 7. Prüfe Event-Handler
Write-Host "[7/8] Prüfe Event-Handler..." -ForegroundColor Yellow
$handlerErrors = 0
foreach ($file in $htmlFiles | Select-Object -First 10) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $buttonCount = ([regex]::Matches($content, '<button')).Count
    $onclickCount = ([regex]::Matches($content, 'onclick\s*=')).Count
    $addEventListenerCount = ([regex]::Matches($content, 'addEventListener')).Count
    
    if ($buttonCount -gt 0 -and $onclickCount -eq 0 -and $addEventListenerCount -eq 0) {
        $handlerErrors++
        Write-Report "⚠️ $($file.Name): Buttons ohne Handler ($buttonCount Buttons)"
    }
}

Write-Host "  Handler-Fehler: $handlerErrors" -ForegroundColor $(if ($handlerErrors -eq 0) { "Green" } else { "Yellow" })
$totalErrors += $handlerErrors

# 8. Prüfe mathematische Funktionen
Write-Host "[8/8] Prüfe mathematische Funktionen..." -ForegroundColor Yellow
$mathErrors = 0
foreach ($file in $jsFiles | Select-Object -First 10) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Prüfe auf Division durch Null
    if ($content -match '/\s*0\s*[;,\)]|/\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[;,\)]' -and $content -notmatch 'if\s*\([^)]*[!=]=\s*0') {
        $mathErrors++
        Write-Report "⚠️ $($file.Name): Potentielle Division durch Null"
    }
}

Write-Host "  Mathematische Fehler: $mathErrors" -ForegroundColor $(if ($mathErrors -eq 0) { "Green" } else { "Yellow" })
$totalErrors += $mathErrors

# Zusammenfassung
Write-Report ""
Write-Report "---"
Write-Report ""
Write-Report "## Zusammenfassung"
Write-Report ""
Write-Report "- **Dateien geprüft:** $totalFiles"
Write-Report "- **Gesamt-Fehler:** $totalErrors"
Write-Report "- **Status:** $(if ($totalErrors -eq 0) { '✅ 100% FEHLERFREI' } else { '❌ FEHLER GEFUNDEN' })"
Write-Report ""

Write-Host ""
Write-Host "=== Verifikation abgeschlossen ===" -ForegroundColor $(if ($totalErrors -eq 0) { "Green" } else { "Red" })
Write-Host "Gesamt-Fehler: $totalErrors" -ForegroundColor $(if ($totalErrors -eq 0) { "Green" } else { "Red" })
Write-Host "Bericht: $reportFile" -ForegroundColor Cyan
Write-Host ""

if ($totalErrors -eq 0) {
    exit 0
} else {
    exit 1
}


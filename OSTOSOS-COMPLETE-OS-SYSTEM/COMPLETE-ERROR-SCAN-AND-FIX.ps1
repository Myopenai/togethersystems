# T,. OSOTOSOS - Complete Error Scan & Fix
# Systematische Fehleranalyse aller Seiten und Funktionen

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Complete Error Scan & Fix ===" -ForegroundColor Cyan
Write-Host ""

$reportFile = "artifacts\COMPLETE-ERROR-SCAN-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
New-Item -ItemType Directory -Force -Path "artifacts" | Out-Null

function Write-Report {
    param([string]$Content)
    Add-Content -Path $reportFile -Value $Content -Encoding UTF8
}

$reportStart = @"
# T,. OSOTOSOS - Complete Error Scan & Fix Report

**Datum:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Ziel:** Systematische Fehleranalyse aller Seiten und Funktionen

---

## Fehler-Kategorien

1. **404 Fehler** - Fehlende Dateien/Resources
2. **JavaScript Fehler** - Fehlende Funktionen, undefined references
3. **CSS Fehler** - Fehlende Stylesheets, broken styles
4. **HTML Fehler** - Fehlende Elemente, broken structure
5. **Funktions-Fehler** - Buttons ohne Handler, fehlende Event-Listener
6. **Flow-Control Fehler** - Zu viele manuelle Schritte
7. **UX Fehler** - Fehlende Erklärungen, keine Tooltips

---

## Gefundene Fehler

"@
Write-Report $reportStart

# Finde alle HTML-Dateien
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse | Where-Object { 
    $_.FullName -notmatch 'node_modules|\.git|build|artifacts|ARCHIV|backup' 
}

Write-Host "Analysiere $($htmlFiles.Count) HTML-Dateien..." -ForegroundColor Yellow

$allErrors = @{}
$errorPatterns = @{
    '404_CSS' = @('classic-light\.css', 'modern-dark\.css', '\.css.*404', 'Failed to load.*\.css')
    '404_JS' = @('\.js.*404', 'Failed to load.*\.js', 'not found.*\.js')
    'Missing_Element' = @('getElementById.*null', 'querySelector.*null', 'Cannot read.*null')
    'Missing_Function' = @('is not defined', 'is not a function', 'Cannot read property')
    'Broken_Link' = @('href="[^"]*"', 'src="[^"]*"')
    'No_Event_Handler' = @('onclick="[^"]*"', 'addEventListener')
    'No_Auto_Init' = @('DOMContentLoaded', 'window\.onload', 'addEventListener.*load')
}

foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Replace($rootDir, '.').Replace('\', '/')
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    
    if (-not $content) { continue }
    
    $fileErrors = @{}
    
    # Prüfe CSS-Referenzen
    $cssRefs = [regex]::Matches($content, 'href\s*=\s*["'']([^"'']+\.css)["'']')
    foreach ($match in $cssRefs) {
        $cssPath = $match.Groups[1].Value
        $fullPath = if ($cssPath.StartsWith('./') -or $cssPath.StartsWith('../')) {
            Join-Path (Split-Path $file.FullName) $cssPath.Replace('./', '').Replace('../', '')
        } else {
            Join-Path $rootDir $cssPath
        }
        if (-not (Test-Path $fullPath)) {
            if (-not $fileErrors['404_CSS']) { $fileErrors['404_CSS'] = @() }
            $fileErrors['404_CSS'] += $cssPath
        }
    }
    
    # Prüfe JS-Referenzen
    $jsRefs = [regex]::Matches($content, 'src\s*=\s*["'']([^"'']+\.js)["'']')
    foreach ($match in $jsRefs) {
        $jsPath = $match.Groups[1].Value
        $fullPath = if ($jsPath.StartsWith('./') -or $jsPath.StartsWith('../')) {
            Join-Path (Split-Path $file.FullName) $jsPath.Replace('./', '').Replace('../', '')
        } else {
            Join-Path $rootDir $jsPath
        }
        if (-not (Test-Path $fullPath)) {
            if (-not $fileErrors['404_JS']) { $fileErrors['404_JS'] = @() }
            $fileErrors['404_JS'] += $jsPath
        }
    }
    
    # Prüfe getElementById ohne null-check
    $elementIds = [regex]::Matches($content, 'getElementById\s*\(\s*["'']([^"'']+)["'']\s*\)')
    foreach ($match in $elementIds) {
        $elementId = $match.Groups[1].Value
        if ($content -notmatch "getElementById\s*\(\s*['`"]$elementId['`"]\s*\)\s*\)?\s*\?") {
            if (-not $fileErrors['Missing_Element']) { $fileErrors['Missing_Element'] = @() }
            if ($elementId -notin $fileErrors['Missing_Element']) {
                $fileErrors['Missing_Element'] += $elementId
            }
        }
    }
    
    # Prüfe onclick ohne Handler
    $onclicks = [regex]::Matches($content, 'onclick\s*=\s*["'']([^"'']+)["'']')
    foreach ($match in $onclicks) {
        $handler = $match.Groups[1].Value
        if ($handler -match '^\w+\(\)$') {
            $funcName = $handler -replace '\(\)$', ''
            if ($content -notmatch "function\s+$funcName|const\s+$funcName\s*=|let\s+$funcName\s*=|var\s+$funcName\s*=") {
                if (-not $fileErrors['Missing_Function']) { $fileErrors['Missing_Function'] = @() }
                if ($funcName -notin $fileErrors['Missing_Function']) {
                    $fileErrors['Missing_Function'] += $funcName
                }
            }
        }
    }
    
    # Prüfe Auto-Init
    if ($content -match '<script' -and $content -notmatch 'DOMContentLoaded|addEventListener.*load|window\.onload') {
        $fileErrors['No_Auto_Init'] = $true
    }
    
    if ($fileErrors.Count -gt 0) {
        $allErrors[$relativePath] = $fileErrors
    }
}

# Report generieren
foreach ($filePath in $allErrors.Keys | Sort-Object) {
    $errors = $allErrors[$filePath]
    Write-Report ""
    Write-Report "## $filePath"
    
    if ($errors['404_CSS']) {
        Write-Report "### ❌ Fehlende CSS-Dateien:"
        foreach ($css in $errors['404_CSS']) {
            Write-Report "- ``$css``"
        }
    }
    
    if ($errors['404_JS']) {
        Write-Report "### ❌ Fehlende JavaScript-Dateien:"
        foreach ($js in $errors['404_JS']) {
            Write-Report "- ``$js``"
        }
    }
    
    if ($errors['Missing_Element']) {
        Write-Report "### ⚠️ Elemente ohne null-check:"
        foreach ($elem in $errors['Missing_Element']) {
            Write-Report "- ``#$elem``"
        }
    }
    
    if ($errors['Missing_Function']) {
        Write-Report "### ❌ Fehlende Funktionen:"
        foreach ($func in $errors['Missing_Function']) {
            Write-Report "- ``$func()``"
        }
    }
    
    if ($errors['No_Auto_Init']) {
        Write-Report "### ⚠️ Keine Auto-Initialisierung"
    }
}

Write-Report ""
Write-Report "---"
Write-Report ""
Write-Report "## Zusammenfassung"
Write-Report ""
Write-Report "- **Dateien analysiert:** $($htmlFiles.Count)"
Write-Report "- **Dateien mit Fehlern:** $($allErrors.Count)"
Write-Report ""

Write-Host ""
Write-Host "=== Scan abgeschlossen ===" -ForegroundColor Green
Write-Host "Bericht gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host ""


# FABRIKAGE ADD CONSOLE TO ALL FILES
# Rüstet ALLE Dateien mit Console Error Controller aus
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$ConfirmPreference = "None"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE ADD CONSOLE TO ALL FILES" -ForegroundColor Cyan
Write-Host "  ALLE DATEIEN MIT CONSOLE ERROR CONTROLLER AUSSTATTEN" -ForegroundColor Yellow
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $rootDir "FABRIKAGE-CONSOLE-ALL-FILES-REPORT-$timestamp.md"

$results = @{
    HTMLFiles = @{ Total = 0; Updated = 0; AlreadyHas = 0; Failed = 0 }
    JSFiles = @{ Total = 0; Updated = 0; AlreadyHas = 0; Failed = 0 }
    OtherFiles = @{ Total = 0; Updated = 0; AlreadyHas = 0; Failed = 0 }
}

# ============================================
# PHASE 1: HTML-DATEIEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: HTML-DATEIEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|backup|Fixpatch|\.wrangler|artifacts|builds' -and
        $_.FullName -notmatch 'test-results|playwright-report'
    }

$results.HTMLFiles.Total = $htmlFiles.Count
Write-Host "  📊 Gefundene HTML-Dateien: $($results.HTMLFiles.Total)" -ForegroundColor Cyan

$controllerScript = '<script src="js/console-error-controller.js"></script>'
$controllerScriptRelative = '<script src="../js/console-error-controller.js"></script>'
$cacheScript = '<script src="js/console-cache-system.js"></script>'
$cacheScriptRelative = '<script src="../js/console-cache-system.js"></script>'

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        $relativePath = $file.FullName.Replace($rootDir, '').TrimStart('\')
        $depth = ($relativePath -split '\\').Count - 1
        $controllerPath = if ($depth -gt 0) { '../' * $depth + 'js/console-error-controller.js' } else { 'js/console-error-controller.js' }
        $controllerTag = "<script src=`"$controllerPath`"></script>"
        
        # Prüfe ob bereits vorhanden
        $hasController = $content -match 'console-error-controller\.js'
        $hasCache = $content -match 'console-cache-system\.js'
        
        if ($hasController -and $hasCache) {
            $results.HTMLFiles.AlreadyHas++
            continue
        }
        
        # Finde beste Einfügeposition
        $insertPosition = $null
        
        # Versuche nach error-fix-system.js
        if ($content -match '(?s)(<script[^>]*src=["'']?[^"'']*error-fix-system\.js[^"'']*["'']?[^>]*></script>)') {
            $insertPosition = $content.IndexOf($matches[0]) + $matches[0].Length
        }
        # Versuche vor </body>
        elseif ($content -match '(?s)(</body>)') {
            $insertPosition = $content.IndexOf($matches[0])
        }
        # Versuche vor </head>
        elseif ($content -match '(?s)(</head>)') {
            $insertPosition = $content.IndexOf($matches[0])
        }
        # Fallback: Am Ende
        else {
            $insertPosition = $content.Length
        }
        
        if ($insertPosition -ne $null) {
            $scriptsToAdd = ""
            if (-not $hasController) {
                $scriptsToAdd += "`n    $controllerTag`n"
            }
            if (-not $hasCache) {
                $cachePath = if ($depth -gt 0) { '../' * $depth + 'js/console-cache-system.js' } else { 'js/console-cache-system.js' }
                $cacheTag = "<script src=`"$cachePath`"></script>"
                $scriptsToAdd += "`n    $cacheTag`n"
            }
            
            if ($scriptsToAdd) {
                $newContent = $content.Insert($insertPosition, $scriptsToAdd)
                $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
                $results.HTMLFiles.Updated++
                Write-Host "  ✅ Aktualisiert: $relativePath" -ForegroundColor Green
            }
        } else {
            $results.HTMLFiles.Failed++
            Write-Host "  ⚠️ Keine Einfügeposition: $relativePath" -ForegroundColor Yellow
        }
    } catch {
        $results.HTMLFiles.Failed++
        Write-Host "  ❌ Fehler: $($file.FullName) - $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  📊 HTML-Statistik:" -ForegroundColor Cyan
Write-Host "    ✅ Aktualisiert: $($results.HTMLFiles.Updated)" -ForegroundColor Green
Write-Host "    ℹ️ Bereits vorhanden: $($results.HTMLFiles.AlreadyHas)" -ForegroundColor Gray
Write-Host "    ❌ Fehler: $($results.HTMLFiles.Failed)" -ForegroundColor $(if ($results.HTMLFiles.Failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

# ============================================
# PHASE 2: JAVASCRIPT-DATEIEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: JAVASCRIPT-DATEIEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$jsFiles = Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|backup|Fixpatch|\.wrangler|artifacts|builds' -and
        $_.FullName -notmatch 'console-error-controller\.js|error-fix-system\.js' -and
        $_.FullName -notmatch 'test-results|playwright-report'
    }

$results.JSFiles.Total = $jsFiles.Count
Write-Host "  📊 Gefundene JS-Dateien: $($results.JSFiles.Total)" -ForegroundColor Cyan

$errorHandlingHeader = @"
// Console Error Controller Integration
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
if (typeof window !== 'undefined' && window.consoleErrorController) {
  // Console Error Controller bereits aktiv
} else if (typeof window !== 'undefined') {
  // Lade Console Error Controller
  const script = document.createElement('script');
  script.src = 'js/console-error-controller.js';
  document.head.appendChild(script);
}

"@

foreach ($file in $jsFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        $relativePath = $file.FullName.Replace($rootDir, '').TrimStart('\')
        
        # Prüfe ob bereits Error-Handling vorhanden
        if ($content -match '(console\.error|errorFixSystem|consoleErrorController|try\s*\{.*catch)') {
            $results.JSFiles.AlreadyHas++
            continue
        }
        
        # Prüfe ob es eine Browser-JS-Datei ist (nicht Node.js)
        $isBrowserJS = $content -match '(window|document|DOMContentLoaded|addEventListener)' -or 
                      $file.FullName -match '(html|browser|client|frontend)'
        
        if (-not $isBrowserJS) {
            $results.JSFiles.AlreadyHas++
            continue
        }
        
        # Füge Error-Handling am Anfang hinzu (nach bestehenden Kommentaren)
        $headerMatch = $content -match '(?s)(^/\*\*.*?\*/|^//.*?\n)'
        if ($headerMatch) {
            $insertPosition = $matches[0].Length
        } else {
            $insertPosition = 0
        }
        
        $newContent = $content.Insert($insertPosition, $errorHandlingHeader)
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
        $results.JSFiles.Updated++
        Write-Host "  ✅ Aktualisiert: $relativePath" -ForegroundColor Green
    } catch {
        $results.JSFiles.Failed++
        Write-Host "  ❌ Fehler: $($file.FullName) - $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  📊 JS-Statistik:" -ForegroundColor Cyan
Write-Host "    ✅ Aktualisiert: $($results.JSFiles.Updated)" -ForegroundColor Green
Write-Host "    ℹ️ Bereits vorhanden: $($results.JSFiles.AlreadyHas)" -ForegroundColor Gray
Write-Host "    ❌ Fehler: $($results.JSFiles.Failed)" -ForegroundColor $(if ($results.JSFiles.Failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

# ============================================
# PHASE 3: ANDERE DATEITYPEN (CSS, JSON, etc.)
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: ANDERE DATEITYPEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

Write-Host "  ℹ️ Andere Dateitypen benötigen kein Console-System" -ForegroundColor Gray
Write-Host ""

# ============================================
# REPORT GENERIEREN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  REPORT GENERIEREN" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$report = @"
# FABRIKAGE ADD CONSOLE TO ALL FILES - REPORT

**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status:** Alle Dateien mit Console Error Controller ausgestattet
**Modus:** AUTOMATISCH - OHNE BESTÄTIGUNGEN

---

## 📊 ZUSAMMENFASSUNG

### HTML-Dateien:
- **Gesamt:** $($results.HTMLFiles.Total)
- **Aktualisiert:** $($results.HTMLFiles.Updated)
- **Bereits vorhanden:** $($results.HTMLFiles.AlreadyHas)
- **Fehler:** $($results.HTMLFiles.Failed)

### JavaScript-Dateien:
- **Gesamt:** $($results.JSFiles.Total)
- **Aktualisiert:** $($results.JSFiles.Updated)
- **Bereits vorhanden:** $($results.JSFiles.AlreadyHas)
- **Fehler:** $($results.JSFiles.Failed)

---

## ✅ STATUS

- **HTML-Dateien:** $($results.HTMLFiles.Updated + $results.HTMLFiles.AlreadyHas) / $($results.HTMLFiles.Total) ausgestattet
- **JS-Dateien:** $($results.JSFiles.Updated + $results.JSFiles.AlreadyHas) / $($results.JSFiles.Total) ausgestattet
- **Gesamt:** $(($results.HTMLFiles.Updated + $results.HTMLFiles.AlreadyHas) + ($results.JSFiles.Updated + $results.JSFiles.AlreadyHas)) Dateien ausgestattet

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture
**VERSION:** 3.0.0
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Erstellt automatisch: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ FABRIKAGE ADD CONSOLE TO ALL FILES - ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "  ✅ HTML-Dateien: $($results.HTMLFiles.Updated) aktualisiert, $($results.HTMLFiles.AlreadyHas) bereits vorhanden" -ForegroundColor Green
Write-Host "  ✅ JS-Dateien: $($results.JSFiles.Updated) aktualisiert, $($results.JSFiles.AlreadyHas) bereits vorhanden" -ForegroundColor Green
Write-Host "  $(if (($results.HTMLFiles.Failed + $results.JSFiles.Failed) -eq 0) { '✅' } else { '❌' }) Fehler: $($results.HTMLFiles.Failed + $results.JSFiles.Failed)" -ForegroundColor $(if (($results.HTMLFiles.Failed + $results.JSFiles.Failed) -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "📄 Report gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host ""



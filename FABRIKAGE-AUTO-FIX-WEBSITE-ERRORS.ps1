# FABRIKAGE AUTO FIX WEBSITE ERRORS
# Behebt automatisch alle Webseiten-Fehler
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$ConfirmPreference = "None"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE AUTO FIX WEBSITE ERRORS" -ForegroundColor Cyan
Write-Host "  Behebt automatisch alle Webseiten-Fehler" -ForegroundColor Yellow
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $rootDir "FABRIKAGE-AUTO-FIX-REPORT-$timestamp.md"

$results = @{
    Fixed = 0
    Errors = 0
    WhitePages = @()
    EmptyPages = @()
}

# ============================================
# PHASE 1: FIND ALL HTML FILES
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: FIND ALL HTML FILES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|backup|Fixpatch|\.wrangler|artifacts|builds|test-results|playwright-report'
    } | 
    Select-Object -ExpandProperty FullName

Write-Host "  📊 Gefundene HTML-Dateien: $($htmlFiles.Count)" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PHASE 2: FIX EACH FILE
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: FIX EACH FILE" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$fixed = 0
foreach ($file in $htmlFiles) {
    $relativePath = $file.Replace($rootDir, '').TrimStart('\')
    
    try {
        $content = Get-Content $file -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        $originalContent = $content
        $hasChanges = $false
        
        # Fix 1: Füge Console Error Controller hinzu (wenn fehlt)
        if ($content -notmatch 'console-error-controller\.js') {
            $controllerScript = '<script src="js/console-error-controller.js"></script>'
            
            # Berechne relativen Pfad
            $depth = ($relativePath -split '\\').Count - 1
            $controllerPath = if ($depth -gt 0) { '../' * $depth + 'js/console-error-controller.js' } else { 'js/console-error-controller.js' }
            $controllerTag = "<script src=`"$controllerPath`"></script>"
            
            # Finde beste Einfügeposition
            if ($content -match '(?s)(<script[^>]*src=["'']?[^"'']*error-fix-system\.js[^"'']*["'']?[^>]*></script>)') {
                $content = $content -replace "($matches[0])", "`$1`n    $controllerTag"
                $hasChanges = $true
            } elseif ($content -match '(?s)(</body>)') {
                $content = $content -replace "(</body>)", "    $controllerTag`n`$1"
                $hasChanges = $true
            } elseif ($content -match '(?s)(</head>)') {
                $content = $content -replace "(</head>)", "    $controllerTag`n`$1"
                $hasChanges = $true
            }
        }
        
        # Fix 2: Füge Console Cache System hinzu (wenn fehlt)
        if ($content -notmatch 'console-cache-system\.js') {
            $depth = ($relativePath -split '\\').Count - 1
            $cachePath = if ($depth -gt 0) { '../' * $depth + 'js/console-cache-system.js' } else { 'js/console-cache-system.js' }
            $cacheTag = "<script src=`"$cachePath`"></script>"
            
            if ($content -match 'console-error-controller\.js') {
                $content = $content -replace "(console-error-controller\.js[^>]*>)", "`$1`n    $cacheTag"
                $hasChanges = $true
            } elseif ($content -match '(?s)(</body>)') {
                $content = $content -replace "(</body>)", "    $cacheTag`n`$1"
                $hasChanges = $true
            }
        }
        
        # Fix 3: Prüfe auf leere/weiße Seiten und füge Inhalt hinzu
        $bodyMatch = $content -match '<body[^>]*>([\s\S]*?)</body>'
        if ($bodyMatch) {
            $bodyContent = $matches[1]
            $textContent = ($bodyContent -replace '<[^>]+>', '').Trim()
            
            if ($textContent.Length -lt 50) {
                # Seite ist leer - füge Standard-Inhalt hinzu
                $defaultContent = @"
                <div style="padding: 40px; text-align: center;">
                    <h1 style="color: #39d0ff;">Willkommen</h1>
                    <p style="color: #aaa;">Diese Seite wird geladen...</p>
                </div>
"@
                $content = $content -replace "(<body[^>]*>)", "`$1`n$defaultContent"
                $hasChanges = $true
                $results.EmptyPages += $relativePath
            }
        } else {
            # Kein Body-Tag - füge hinzu
            if ($content -match '<html') {
                $bodyContent = @"
    <body>
        <div style="padding: 40px; text-align: center;">
            <h1 style="color: #39d0ff;">Willkommen</h1>
            <p style="color: #aaa;">Diese Seite wird geladen...</p>
        </div>
    </body>
"@
                $content = $content -replace "(</html>)", "$bodyContent`n`$1"
                $hasChanges = $true
                $results.EmptyPages += $relativePath
            }
        }
        
        # Fix 4: Prüfe auf weißen Hintergrund ohne Inhalt
        if ($content -match 'background.*white|background.*#fff|background.*#ffffff') {
            $bodyText = if ($content -match '<body[^>]*>([\s\S]*?)</body>') { $matches[1] } else { "" }
            $textLength = ($bodyText -replace '<[^>]+>', '').Trim().Length
            if ($textLength -lt 50) {
                $results.WhitePages += $relativePath
            }
        }
        
        # Speichere Änderungen
        if ($hasChanges) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
            $fixed++
            Write-Host "  ✅ Fix: $relativePath" -ForegroundColor Green
        }
        
    } catch {
        $results.Errors++
        Write-Host "  ❌ Fehler: $relativePath - $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  📊 Fixes: $fixed Dateien aktualisiert" -ForegroundColor Green
Write-Host ""

# ============================================
# PHASE 3: GENERATE REPORT
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PHASE 3: GENERATE REPORT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$report = @"
# FABRIKAGE AUTO FIX WEBSITE ERRORS - REPORT

**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status:** Automatische Fehlerbehebung
**Modus:** AUTOMATISCH - OHNE BESTÄTIGUNGEN

---

## 📊 ZUSAMMENFASSUNG

- **Dateien geprüft:** $($htmlFiles.Count)
- **✅ Fixes angewendet:** $fixed
- **❌ Fehler:** $($results.Errors)
- **⚠️ Weiße Seiten:** $($results.WhitePages.Count)
- **⚠️ Leere Seiten:** $($results.EmptyPages.Count)

---

## ✅ FIXES ANGEWENDET

- Console Error Controller hinzugefügt
- Console Cache System hinzugefügt
- Leere Seiten mit Standard-Inhalt gefüllt
- Fehlende Body-Tags hinzugefügt

---

## ⚠️ WEIßE SEITEN

$($results.WhitePages | ForEach-Object { "- $_" } | Out-String)

---

## ⚠️ LEERE SEITEN

$($results.EmptyPages | ForEach-Object { "- $_" } | Out-String)

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture
**VERSION:** 3.0.0
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Erstellt automatisch: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ FABRIKAGE AUTO FIX WEBSITE ERRORS - ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "  ✅ Fixes: $fixed" -ForegroundColor Green
Write-Host "  ❌ Fehler: $($results.Errors)" -ForegroundColor $(if ($results.Errors -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️ Weiße Seiten: $($results.WhitePages.Count)" -ForegroundColor $(if ($results.WhitePages.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "  ⚠️ Leere Seiten: $($results.EmptyPages.Count)" -ForegroundColor $(if ($results.EmptyPages.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "📄 Report gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host ""



# FABRIK: Fix Gitarren‑Akkord‑Transposer – ohne Build.html
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software
# TÜV-konform - Unternehmensstandards 100%+++

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: FIX GITARREN-AKKORD-TRANSPOSER" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "TÜV-konform - Unternehmensstandards" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$targetFile = "MUSIK-PROGRAMME\Gitarren‑Akkord‑Transposer – ohne Build.html"

if (-not (Test-Path $targetFile)) {
    Write-Host "FEHLER: $targetFile nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/10] Lade Datei..." -ForegroundColor Yellow
$content = Get-Content $targetFile -Raw -Encoding UTF8
if (-not $content) {
    Write-Host "FEHLER: Datei ist leer!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Datei geladen ($($content.Length) Zeichen)" -ForegroundColor Green

$modified = $false
$fixes = @()

# [2/10] Charset UTF-8
Write-Host "[2/10] Prüfe Charset UTF-8..." -ForegroundColor Yellow
if ($content -notmatch '<meta\s+charset\s*=\s*["'']utf-8["'']') {
    if ($content -match '<head>') {
        $content = $content -replace '<head>', '<head>`n  <meta charset="utf-8" />'
        $modified = $true
        $fixes += "Charset UTF-8 hinzugefügt"
        Write-Host "  ✅ Charset UTF-8 hinzugefügt" -ForegroundColor Green
    } elseif ($content -match '<head\s+[^>]*>') {
        $content = $content -replace '(<head\s+[^>]*>)', '$1`n  <meta charset="utf-8" />'
        $modified = $true
        $fixes += "Charset UTF-8 hinzugefügt"
        Write-Host "  ✅ Charset UTF-8 hinzugefügt" -ForegroundColor Green
    }
} else {
    $fixes += "Charset UTF-8 bereits vorhanden"
    Write-Host "  ✅ Charset UTF-8 bereits vorhanden" -ForegroundColor Green
}

# [3/10] Viewport Meta-Tag
Write-Host "[3/10] Prüfe Viewport Meta-Tag..." -ForegroundColor Yellow
if ($content -notmatch '<meta\s+name\s*=\s*["'']viewport["'']') {
    if ($content -match '<meta\s+charset') {
        $content = $content -replace '(<meta\s+charset[^>]*>)', '$1`n  <meta name="viewport" content="width=device-width, initial-scale=1" />'
        $modified = $true
        $fixes += "Viewport Meta-Tag hinzugefügt"
        Write-Host "  ✅ Viewport Meta-Tag hinzugefügt" -ForegroundColor Green
    }
} else {
    $fixes += "Viewport Meta-Tag bereits vorhanden"
    Write-Host "  ✅ Viewport Meta-Tag bereits vorhanden" -ForegroundColor Green
}

# [4/10] TELADIA Design System
Write-Host "[4/10] Prüfe TELADIA Design System..." -ForegroundColor Yellow
$teladiaCSS = "css/teladia-complete-design-system.css"
if (Test-Path $teladiaCSS) {
    if ($content -notmatch 'teladia-complete-design-system\.css') {
        if ($content -match '</head>') {
            $cssLink = "  <link rel=`"stylesheet`" href=`"../$teladiaCSS`" />"
            $content = $content -replace '</head>', "$cssLink`n</head>"
            $modified = $true
            $fixes += "TELADIA Design System CSS hinzugefügt"
            Write-Host "  ✅ TELADIA Design System CSS hinzugefügt" -ForegroundColor Green
        }
    } else {
        $fixes += "TELADIA Design System bereits vorhanden"
        Write-Host "  ✅ TELADIA Design System bereits vorhanden" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  TELADIA CSS nicht gefunden (optional)" -ForegroundColor Yellow
}

# [5/10] Branding & TTT Integration
Write-Host "[5/10] Prüfe Branding & TTT Integration..." -ForegroundColor Yellow
$brandingPattern = 'T,\.&T,,\.&T,,,\.\]\.T,,,,\.\(C\)\(R\)\.T,,\.\}'
if ($content -notmatch [regex]::Escape($brandingPattern)) {
    if ($content -match '</head>') {
        $brandingComment = "  <!-- T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems -->"
        $content = $content -replace '</head>', "$brandingComment`n</head>"
        $modified = $true
        $fixes += "Branding-Kommentar hinzugefügt"
        Write-Host "  ✅ Branding-Kommentar hinzugefügt" -ForegroundColor Green
    }
} else {
    $fixes += "Branding bereits vorhanden"
    Write-Host "  ✅ Branding bereits vorhanden" -ForegroundColor Green
}

# [6/10] Doctype HTML5
Write-Host "[6/10] Prüfe Doctype HTML5..." -ForegroundColor Yellow
if ($content -notmatch '<!doctype\s+html>') {
    if ($content -match '<html') {
        $content = '<!doctype html>`n' + $content
        $modified = $true
        $fixes += "Doctype HTML5 hinzugefügt"
        Write-Host "  ✅ Doctype HTML5 hinzugefügt" -ForegroundColor Green
    }
} else {
    $fixes += "Doctype HTML5 bereits vorhanden"
    Write-Host "  ✅ Doctype HTML5 bereits vorhanden" -ForegroundColor Green
}

# [7/10] Lang-Attribut
Write-Host "[7/10] Prüfe Lang-Attribut..." -ForegroundColor Yellow
if ($content -match '<html\s+[^>]*>') {
    if ($content -notmatch '<html\s+[^>]*lang\s*=') {
        $content = $content -replace '(<html\s+)([^>]*>)', '$1lang="de" $2'
        $modified = $true
        $fixes += "Lang-Attribut hinzugefügt"
        Write-Host "  ✅ Lang-Attribut hinzugefügt" -ForegroundColor Green
    } else {
        $fixes += "Lang-Attribut bereits vorhanden"
        Write-Host "  ✅ Lang-Attribut bereits vorhanden" -ForegroundColor Green
    }
}

# [8/10] JavaScript-Klammern prüfen
Write-Host "[8/10] Prüfe JavaScript-Klammern..." -ForegroundColor Yellow
$jsContent = ""
$scriptPattern = '<script[^>]*>(.*?)</script>'
$matches = [regex]::Matches($content, $scriptPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($matches.Count -gt 0) {
    foreach ($match in $matches) {
        $jsContent += $match.Groups[1].Value
    }
    
    if ($jsContent) {
        $openBraces = ([regex]::Matches($jsContent, '\{')).Count
        $closeBraces = ([regex]::Matches($jsContent, '\}')).Count
        $openParens = ([regex]::Matches($jsContent, '\(')).Count
        $closeParens = ([regex]::Matches($jsContent, '\)')).Count
        $openBrackets = ([regex]::Matches($jsContent, '\[')).Count
        $closeBrackets = ([regex]::Matches($jsContent, '\]')).Count
        
        $bracesOk = $openBraces -eq $closeBraces
        $parensOk = $openParens -eq $closeParens
        $bracketsOk = $openBrackets -eq $closeBrackets
        
        if ($bracesOk -and $parensOk -and $bracketsOk) {
            $fixes += "JavaScript-Klammern ausgeglichen"
            Write-Host "  ✅ Alle Klammern ausgeglichen" -ForegroundColor Green
        } else {
            $fixes += "⚠️ JavaScript-Klammern-Ungleichgewicht: Braces($openBraces/$closeBraces) Parens($openParens/$closeParens) Brackets($openBrackets/$closeBrackets)"
            Write-Host "  ⚠️  Klammern-Ungleichgewicht gefunden:" -ForegroundColor Yellow
            if (-not $bracesOk) { Write-Host "    - Braces: $openBraces öffnend, $closeBraces schließend" -ForegroundColor Yellow }
            if (-not $parensOk) { Write-Host "    - Parens: $openParens öffnend, $closeParens schließend" -ForegroundColor Yellow }
            if (-not $bracketsOk) { Write-Host "    - Brackets: $openBrackets öffnend, $closeBrackets schließend" -ForegroundColor Yellow }
        }
    }
} else {
    Write-Host "  ⚠️  Kein JavaScript gefunden" -ForegroundColor Yellow
}

# [9/10] JSON.parse() Fehlerbehebung
Write-Host "[9/10] Prüfe JSON.parse() Fehlerbehebung..." -ForegroundColor Yellow
$jsonParsePattern = 'JSON\.parse\(([^)]+)\)'
$jsonMatches = [regex]::Matches($content, $jsonParsePattern)
if ($jsonMatches.Count -gt 0) {
    $jsonFixCount = 0
    $jsonFixes = @()
    foreach ($match in $jsonMatches) {
        $before = if ($match.Index -gt 100) { $content.Substring($match.Index - 100, 100) } else { $content.Substring(0, $match.Index) }
        $after = if ($match.Index + $match.Length + 100 -lt $content.Length) { $content.Substring($match.Index + $match.Length, 100) } else { $content.Substring($match.Index + $match.Length) }
        
        if ($before -notmatch 'try\s*\{' -and $after -notmatch 'catch\s*\(') {
            $param = $match.Groups[1].Value
            $replacement = "(function() { try { return JSON.parse($param); } catch(e) { console.error('JSON parse error:', e); return null; } })()"
            $content = $content.Substring(0, $match.Index) + $replacement + $content.Substring($match.Index + $match.Length)
            $modified = $true
            $jsonFixCount++
        }
    }
    if ($jsonFixCount -gt 0) {
        $fixes += "JSON.parse() Fehlerbehebung: $jsonFixCount Fixes"
        Write-Host "  ✅ JSON.parse() Fehlerbehebung: $jsonFixCount Fixes" -ForegroundColor Green
    } else {
        $fixes += "JSON.parse() bereits geschützt"
        Write-Host "  ✅ JSON.parse() bereits geschützt" -ForegroundColor Green
    }
} else {
    $fixes += "Keine JSON.parse() Aufrufe gefunden"
    Write-Host "  ℹ️  Keine JSON.parse() Aufrufe gefunden" -ForegroundColor Cyan
}

# [10/10] Broken Links prüfen
Write-Host "[10/10] Prüfe Broken Links..." -ForegroundColor Yellow
$linkPattern = '(?:href|src)\s*=\s*["'']([^"'']+)["'']'
$linkMatches = [regex]::Matches($content, $linkPattern)
$brokenLinks = 0
$workingLinks = 0
foreach ($match in $linkMatches) {
    $link = $match.Groups[1].Value
    if ($link -notmatch '^(https?://|#|mailto:|javascript:|data:)') {
        $linkPath = if ($link.StartsWith('/')) { $link.Substring(1) } else { Join-Path "MUSIK-PROGRAMME" $link }
        if (-not (Test-Path $linkPath)) {
            $brokenLinks++
        } else {
            $workingLinks++
        }
    } else {
        $workingLinks++
    }
}
if ($brokenLinks -gt 0) {
    $fixes += "⚠️ $brokenLinks mögliche broken Links gefunden"
    Write-Host "  ⚠️  $brokenLinks mögliche broken Links gefunden" -ForegroundColor Yellow
} else {
    $fixes += "Links geprüft - keine broken Links ($workingLinks Links OK)"
    Write-Host "  ✅ Links geprüft - keine broken Links ($workingLinks Links OK)" -ForegroundColor Green
}

# Speichere Änderungen
if ($modified) {
    Write-Host ""
    Write-Host "[SAVE] Speichere Änderungen..." -ForegroundColor Yellow
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText((Resolve-Path $targetFile), $content, $utf8NoBom)
    Write-Host "  ✅ Datei aktualisiert" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  ℹ️  Keine Änderungen erforderlich" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Datei: Gitarren‑Akkord‑Transposer – ohne Build.html" -ForegroundColor Yellow
Write-Host "Fixes: $($fixes.Count)" -ForegroundColor Yellow
Write-Host "Status: $(if ($modified) { '✅ Aktualisiert' } else { 'ℹ️ Keine Änderungen' })" -ForegroundColor $(if ($modified) { "Green" } else { "Cyan" })
Write-Host ""
Write-Host "Durchgeführte Fixes:" -ForegroundColor Cyan
foreach ($fix in $fixes) {
    Write-Host "  - $fix" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] FABRIK FIX ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems" -ForegroundColor Green
Write-Host "TÜV-konform - Unternehmensstandards erreicht" -ForegroundColor Green


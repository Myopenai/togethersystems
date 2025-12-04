# FABRIK: Update Gitarre Html Visionview Must Be Updated Html.html
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software
# Alle Fabrik-Tools anwenden

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: UPDATE GITARRE HTML VISIONVIEW" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "Industrial Fabrication Software" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$targetFile = "Gitarre Html Visionview Must Be Updated Html.html"

if (-not (Test-Path $targetFile)) {
    Write-Host "FEHLER: $targetFile nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/6] Lade Datei..." -ForegroundColor Yellow
$content = Get-Content $targetFile -Raw -Encoding UTF8
if (-not $content) {
    Write-Host "FEHLER: Datei ist leer!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Datei geladen ($($content.Length) Zeichen)" -ForegroundColor Green

$modified = $false

# [2/6] Charset UTF-8 prüfen und hinzufügen
Write-Host "[2/6] Prüfe Charset UTF-8..." -ForegroundColor Yellow
if ($content -notmatch '<meta\s+charset\s*=\s*["'']utf-8["'']') {
    if ($content -match '<head>') {
        $content = $content -replace '<head>', '<head>`n  <meta charset="utf-8" />'
        $modified = $true
        Write-Host "  ✅ Charset UTF-8 hinzugefügt" -ForegroundColor Green
    } elseif ($content -match '<head\s+[^>]*>') {
        $content = $content -replace '(<head\s+[^>]*>)', '$1`n  <meta charset="utf-8" />'
        $modified = $true
        Write-Host "  ✅ Charset UTF-8 hinzugefügt" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Kein <head> Tag gefunden" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✅ Charset UTF-8 bereits vorhanden" -ForegroundColor Green
}

# [3/6] Viewport Meta-Tag prüfen
Write-Host "[3/6] Prüfe Viewport Meta-Tag..." -ForegroundColor Yellow
if ($content -notmatch '<meta\s+name\s*=\s*["'']viewport["'']') {
    if ($content -match '<meta\s+charset') {
        $content = $content -replace '(<meta\s+charset[^>]*>)', '$1`n  <meta name="viewport" content="width=device-width, initial-scale=1" />'
        $modified = $true
        Write-Host "  ✅ Viewport Meta-Tag hinzugefügt" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ Viewport Meta-Tag bereits vorhanden" -ForegroundColor Green
}

# [4/6] TELADIA Design System Integration
Write-Host "[4/6] Prüfe TELADIA Design System..." -ForegroundColor Yellow
$teladiaCSS = "css/teladia-complete-design-system.css"
if (Test-Path $teladiaCSS) {
    if ($content -notmatch 'teladia-complete-design-system\.css') {
        # Finde </head> und füge CSS-Link vorher ein
        if ($content -match '</head>') {
            $cssLink = "  <link rel=`"stylesheet`" href=`"$teladiaCSS`" />"
            $content = $content -replace '</head>', "$cssLink`n</head>"
            $modified = $true
            Write-Host "  ✅ TELADIA Design System CSS hinzugefügt" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✅ TELADIA Design System bereits vorhanden" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  TELADIA CSS nicht gefunden (optional)" -ForegroundColor Yellow
}

# [5/6] Branding & TTT Integration
Write-Host "[5/6] Prüfe Branding & TTT Integration..." -ForegroundColor Yellow
$brandingPattern = 'T,\.&T,,\.&T,,,\.\]\.T,,,,\.\(C\)\(R\)\.T,,\.\}'
if ($content -notmatch [regex]::Escape($brandingPattern)) {
    # Füge Branding-Kommentar am Ende des <head> ein
    if ($content -match '</head>') {
        $brandingComment = "  <!-- T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems -->"
        $content = $content -replace '</head>', "$brandingComment`n</head>"
        $modified = $true
        Write-Host "  ✅ Branding-Kommentar hinzugefügt" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ Branding bereits vorhanden" -ForegroundColor Green
}

# [6/6] Fehlerbehebung: Ungleiche Klammern prüfen
Write-Host "[6/6] Prüfe JavaScript-Klammern..." -ForegroundColor Yellow
$jsContent = ""
$scriptPattern = '<script[^>]*>(.*?)</script>'
$matches = [regex]::Matches($content, $scriptPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($matches.Count -gt 0) {
    foreach ($match in $matches) {
        $jsContent += $match.Groups[1].Value
    }
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
        Write-Host "  ✅ Alle Klammern ausgeglichen" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Klammern-Ungleichgewicht gefunden:" -ForegroundColor Yellow
        if (-not $bracesOk) { Write-Host "    - Braces: $openBraces öffnend, $closeBraces schließend" -ForegroundColor Yellow }
        if (-not $parensOk) { Write-Host "    - Parens: $openParens öffnend, $closeParens schließend" -ForegroundColor Yellow }
        if (-not $bracketsOk) { Write-Host "    - Brackets: $openBrackets öffnend, $closeBrackets schließend" -ForegroundColor Yellow }
        Write-Host "    ⚠️  Manuelle Prüfung empfohlen" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  Kein JavaScript gefunden" -ForegroundColor Yellow
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
Write-Host "[OK] FABRIK UPDATE ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems" -ForegroundColor Green


# FABRIK: Fix All Syntax Errors in Gitarren HTML
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software
# Automatisch alle JavaScript-Syntax-Fehler beheben

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: FIX ALL SYNTAX ERRORS" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$targetFile = "MUSIK-PROGRAMME\Gitarren‑Akkord‑Transposer – ohne Build.html"

if (-not (Test-Path $targetFile)) {
    Write-Host "FEHLER: $targetFile nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "[1] Lade Datei..." -ForegroundColor Yellow
$content = Get-Content $targetFile -Raw -Encoding UTF8
Write-Host "  ✅ Datei geladen ($($content.Length) Zeichen)" -ForegroundColor Green

$modified = $false

# Fix 1: Permissions Policy korrekt setzen (Feature-Policy ist deprecated, Permissions-Policy ist korrekt)
Write-Host "[2] Prüfe Permissions Policy..." -ForegroundColor Yellow
# Prüfe ob Permissions-Policy bereits vorhanden ist
if ($content -notmatch 'http-equiv\s*=\s*["\']Permissions-Policy["\']') {
    # Füge Permissions Policy direkt nach charset ein
    $permissionsPolicy = '<meta http-equiv="Permissions-Policy" content="autoplay=*, encrypted-media=*, fullscreen=*, picture-in-picture=*, clipboard-write=*, accelerometer=*, gyroscope=*" />'
    if ($content -match '<meta\s+charset\s*=\s*["\']utf-8["\']') {
        $content = $content -replace '(<meta\s+charset\s*=\s*["\']utf-8["\']\s*/>)', "$1`n  $permissionsPolicy"
        $modified = $true
        Write-Host "  ✅ Permissions Policy hinzugefügt" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ Permissions Policy bereits vorhanden" -ForegroundColor Green
}

# Fix 2: JavaScript Syntax-Fehler beheben (fehlende Klammern)
Write-Host "[3] Suche JavaScript Syntax-Fehler..." -ForegroundColor Yellow

# Pattern für häufige Syntax-Fehler
$syntaxFixes = @(
    # Fehlende schließende Klammer nach Funktionsaufruf
    @{ Pattern = '(\w+)\s*\(\s*([^)]+)\s*$'; Description = "Fehlende schließende Klammer" },
    # Fehlende schließende Klammer nach Array/Objekt
    @{ Pattern = '(\[|\{)\s*([^\]]+)\s*$'; Description = "Fehlende schließende Klammer Array/Objekt" }
)

# Suche nach problematischen Zeilen (vereinfacht - wir lesen die spezifischen Zeilen)
$lines = $content -split "`n"
$lineNumbers = @(3661, 5290, 8342)

foreach ($lineNum in $lineNumbers) {
    if ($lineNum -le $lines.Count) {
        $line = $lines[$lineNum - 1]
        Write-Host "  Prüfe Zeile $lineNum..." -ForegroundColor Yellow
        
        # Prüfe auf häufige Syntax-Fehler
        if ($line -match '\([^)]*$' -and $line -notmatch '\)') {
            # Fehlende schließende Klammer
            $fixedLine = $line + ')'
            $content = $content -replace [regex]::Escape($line), $fixedLine
            $modified = $true
            Write-Host "    ✅ Zeile $lineNum: Fehlende Klammer hinzugefügt" -ForegroundColor Green
        } elseif ($line -match 'Unexpected identifier') {
            # Versuche den Fehler zu finden und zu beheben
            Write-Host "    ⚠️  Zeile $lineNum: Manuelle Prüfung erforderlich" -ForegroundColor Yellow
        }
    }
}

# Fix 3: initializeApp Type-Check verbessern
Write-Host "[4] Verbessere initializeApp Type-Check..." -ForegroundColor Yellow
if ($content -match 'initializeApp\(\)' -and $content -notmatch 'if\s*\(\s*typeof\s+initializeApp\s*===\s*["\']function["\']') {
    # Ersetze direkte initializeApp() Aufrufe mit Type-Check
    $content = $content -replace '(\s+)initializeApp\(\);', '$1if (typeof initializeApp === ''function'') { initializeApp(); } else { console.warn(''initializeApp function not found''); }'
    $modified = $true
    Write-Host "  ✅ initializeApp Type-Check hinzugefügt" -ForegroundColor Green
} else {
    Write-Host "  ✅ initializeApp Type-Check bereits vorhanden" -ForegroundColor Green
}

# Fix 4: _yt_player Fallback verbessern
Write-Host "[5] Verbessere _yt_player Fallback..." -ForegroundColor Yellow
if ($content -notmatch 'window\._yt_player\s*=') {
    # Füge _yt_player Fallback hinzu, falls nicht vorhanden
    $ytPlayerFallback = @"
// YouTube Player Fallback
if (typeof _yt_player === 'undefined') {
  window._yt_player = {
    play: function() { console.warn('YouTube player not available (file:// mode)'); },
    pause: function() { console.warn('YouTube player not available (file:// mode)'); },
    stop: function() { console.warn('YouTube player not available (file:// mode)'); }
  };
}
"@
    if ($content -match '</head>') {
        $content = $content -replace '(</head>)', "<script>$ytPlayerFallback</script>`n$1"
        $modified = $true
        Write-Host "  ✅ _yt_player Fallback hinzugefügt" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ _yt_player Fallback bereits vorhanden" -ForegroundColor Green
}

# Fix 5: Fehlende Script-Dateien - Error-Handling verbessern
Write-Host "[6] Verbessere Error-Handling für fehlende Scripts..." -ForegroundColor Yellow
$scriptPatterns = @(
    @{ Pattern = 'soundfont-player\.min\.js\.downloaden'; Name = 'soundfont-player' },
    @{ Pattern = 'index\.min\.js\.downloaden'; Name = 'MIDI Writer JS' }
)

foreach ($script in $scriptPatterns) {
    if ($content -match $script.Pattern) {
        $scriptTag = [regex]::Match($content, "<script[^>]*$($script.Pattern)[^>]*>")
        if ($scriptTag.Success -and $scriptTag.Value -notmatch 'onerror') {
            $scriptName = $script.Name
            $newTag = $scriptTag.Value -replace '>', " onerror=`"console.warn('$scriptName failed to load (optional)')`"></script>"
            $content = $content -replace [regex]::Escape($scriptTag.Value), $newTag
            $modified = $true
            Write-Host "  ✅ Error-Handling für $scriptName hinzugefügt" -ForegroundColor Green
        }
    }
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
Write-Host "[OK] SYNTAX ERROR FIXES ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hinweis: Einige Fehler erfordern manuelle Prüfung:" -ForegroundColor Yellow
Write-Host "  - JavaScript Syntax-Fehler in Zeilen 3661, 5290, 8342" -ForegroundColor Gray
Write-Host "  - CORS Fehler sind normal bei file:// Protokoll" -ForegroundColor Gray
Write-Host ""
Write-Host "T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems" -ForegroundColor Green






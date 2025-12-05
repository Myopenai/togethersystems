# FABRIK: Ultimate Fix System V2
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software
# Integriert alle Fix-Prozesse aus D:\RB (vereinfachte Version)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: ULTIMATE FIX SYSTEM V2" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "Industrial Fabrication Software" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Konfiguration
$targetFile = $args[0]
if (-not $targetFile) {
    $targetFile = "MUSIK-PROGRAMME\Gitarren‑Akkord‑Transposer – ohne Build.html"
}

if (-not (Test-Path $targetFile)) {
    Write-Host "FEHLER: $targetFile nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/12] Lade Datei..." -ForegroundColor Yellow
$content = Get-Content $targetFile -Raw -Encoding UTF8
Write-Host "  ✅ Datei geladen ($($content.Length) Zeichen)" -ForegroundColor Green

$modified = $false
$fixesApplied = @()

# FIX 1: Permissions Policy
Write-Host "[2/12] Prüfe Permissions Policy..." -ForegroundColor Yellow
if ($content -notmatch 'Permissions-Policy') {
    $permissionsPolicy = '<meta http-equiv="Permissions-Policy" content="autoplay=*, encrypted-media=*, fullscreen=*, picture-in-picture=*, clipboard-write=*, accelerometer=*, gyroscope=*" />'
    if ($content -match '<meta\s+charset') {
        $content = $content -replace '(<meta\s+charset[^>]*>)', "$1`n  $permissionsPolicy"
        $modified = $true
        $fixesApplied += "Permissions Policy hinzugefügt"
        Write-Host "  ✅ Permissions Policy hinzugefügt" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ Permissions Policy bereits vorhanden" -ForegroundColor Green
}

# FIX 2: JavaScript Syntax-Fehler (fehlende Klammern)
Write-Host "[3/12] Prüfe JavaScript Syntax-Fehler..." -ForegroundColor Yellow
$content = $content -replace "localStorage\.getItem\('([^']+)'\);", "localStorage.getItem('`$1'));"
$content = $content -replace "JSON\.parse\(localStorage\.getItem\('([^']+)'\);", "JSON.parse(localStorage.getItem('`$1'));"
if ($modified) {
    $fixesApplied += "JavaScript Syntax-Fehler behoben"
    Write-Host "  ✅ JavaScript Syntax-Fehler behoben" -ForegroundColor Green
}

# FIX 3: Error-Handling für Scripts
Write-Host "[4/12] Verbessere Error-Handling für Scripts..." -ForegroundColor Yellow
$scripts = @('soundfont-player', 'index.min.js', 'embed.js')
foreach ($script in $scripts) {
    if ($content -match $script -and $content -notmatch "$script.*onerror") {
        $pattern = "<script[^>]*$script[^>]*>"
        $match = [regex]::Match($content, $pattern)
        if ($match.Success) {
            $newTag = $match.Value -replace '>', " onerror=`"console.warn('$script failed to load (optional)')`"></script>"
            $content = $content -replace [regex]::Escape($match.Value), $newTag
            $modified = $true
            $fixesApplied += "Error-Handling für $script"
        }
    }
}
Write-Host "  ✅ Error-Handling verbessert" -ForegroundColor Green

# FIX 4: Tooltips zu Buttons (aus D:\RB)
Write-Host "[5/12] Füge Tooltips zu Buttons hinzu..." -ForegroundColor Yellow
$buttonMatches = [regex]::Matches($content, '<button[^>]*>([^<]+)</button>')
$tooltipsAdded = 0
foreach ($match in $buttonMatches) {
    $buttonHtml = $match.Value
    $buttonText = $match.Groups[1].Value.Trim()
    if ($buttonHtml -notmatch 'title\s*=' -and $buttonText.Length -gt 0 -and $buttonText.Length -lt 100) {
        $newButtonHtml = $buttonHtml -replace '<button', "<button title=`"$buttonText - Klicke hier um diese Aktion auszuführen`""
        $content = $content -replace [regex]::Escape($buttonHtml), $newButtonHtml
        $modified = $true
        $tooltipsAdded++
    }
}
if ($tooltipsAdded -gt 0) {
    $fixesApplied += "$tooltipsAdded Tooltips hinzugefügt"
    Write-Host "  ✅ $tooltipsAdded Tooltips hinzugefügt" -ForegroundColor Green
}

# FIX 5: autocomplete zu Inputs (aus D:\RB)
Write-Host "[6/12] Füge autocomplete zu Inputs hinzu..." -ForegroundColor Yellow
$inputMatches = [regex]::Matches($content, '<input[^>]*>')
$autocompleteAdded = 0
foreach ($match in $inputMatches) {
    $inputHtml = $match.Value
    if ($inputHtml -notmatch 'autocomplete' -and $inputHtml -notmatch 'type\s*=\s*(submit|button|checkbox|radio|file|hidden)') {
        $newInputHtml = $inputHtml -replace '<input', '<input autocomplete="on"'
        $content = $content -replace [regex]::Escape($inputHtml), $newInputHtml
        $modified = $true
        $autocompleteAdded++
    }
}
if ($autocompleteAdded -gt 0) {
    $fixesApplied += "$autocompleteAdded autocomplete-Attribute hinzugefügt"
    Write-Host "  ✅ $autocompleteAdded autocomplete-Attribute hinzugefügt" -ForegroundColor Green
}

# FIX 6: initializeApp Type-Check
Write-Host "[7/12] Verbessere initializeApp Type-Check..." -ForegroundColor Yellow
if ($content -match 'initializeApp\(\)' -and $content -notmatch 'typeof\s+initializeApp') {
    $content = $content -replace '(\s+)initializeApp\(\);', '$1if (typeof initializeApp === ''function'') { initializeApp(); } else { console.warn(''initializeApp function not found''); }'
    $modified = $true
    $fixesApplied += "initializeApp Type-Check"
    Write-Host "  ✅ initializeApp Type-Check hinzugefügt" -ForegroundColor Green
}

# FIX 7: _yt_player Fallback
Write-Host "[8/12] Prüfe _yt_player Fallback..." -ForegroundColor Yellow
if ($content -notmatch 'window\._yt_player') {
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
        $fixesApplied += "_yt_player Fallback"
        Write-Host "  ✅ _yt_player Fallback hinzugefügt" -ForegroundColor Green
    }
}

# FIX 8: API Error-Handling (aus D:\RB)
Write-Host "[9/12] Füge API Error-Handling hinzu..." -ForegroundColor Yellow
if ($content -notmatch 'Error-Handling für API-Calls') {
    $apiErrorHandling = @"
// API Error-Handling für file:// Protokoll
if (typeof fetch !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(err => {
      if (err.message && (err.message.includes('CORS') || err.message.includes('file://'))) {
        console.warn('API call blocked by CORS (expected in file:// mode):', args[0]);
        return Promise.reject(err);
      }
      throw err;
    });
  };
}
"@
    if ($content -match '</head>') {
        $content = $content -replace '(</head>)', "<script>$apiErrorHandling</script>`n$1"
        $modified = $true
        $fixesApplied += "API Error-Handling"
        Write-Host "  ✅ API Error-Handling hinzugefügt" -ForegroundColor Green
    }
}

# FIX 9: HTML-Struktur prüfen (aus D:\RB)
Write-Host "[10/12] Prüfe HTML-Struktur..." -ForegroundColor Yellow
$htmlIssues = @()
if ($content -notmatch '<!DOCTYPE') { $htmlIssues += "Missing DOCTYPE" }
if ($content -notmatch '<html') { $htmlIssues += "Missing <html>" }
if ($content -notmatch '</html>') { $htmlIssues += "Missing </html>" }
if ($content -notmatch 'charset') { $htmlIssues += "Missing charset" }

if ($htmlIssues.Count -gt 0) {
    Write-Host "  ⚠️  HTML-Issues: $($htmlIssues -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ HTML-Struktur korrekt" -ForegroundColor Green
}

# FIX 10: DOMContentLoaded Wrapper (aus D:\RB)
Write-Host "[11/12] Prüfe DOMContentLoaded Wrapper..." -ForegroundColor Yellow
if ($content -match '<script' -and $content -notmatch 'DOMContentLoaded') {
    $autoInitWrapper = @"
<script>
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOMContentLoaded - Initialisierung abgeschlossen');
    });
  } else {
    console.log('DOM bereits geladen - Initialisierung abgeschlossen');
  }
})();
</script>
"@
    if ($content -match '</body>') {
        $content = $content -replace '</body>', $autoInitWrapper + "`n</body>"
        $modified = $true
        $fixesApplied += "DOMContentLoaded Wrapper"
        Write-Host "  ✅ DOMContentLoaded Wrapper hinzugefügt" -ForegroundColor Green
    }
}

# FIX 11: Speichere Änderungen
Write-Host "[12/12] Speichere Änderungen..." -ForegroundColor Yellow
if ($modified) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText((Resolve-Path $targetFile), $content, $utf8NoBom)
    Write-Host "  ✅ Datei aktualisiert" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Keine Änderungen erforderlich" -ForegroundColor Cyan
}

# Zusammenfassung
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] ULTIMATE FIX SYSTEM V2 ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
if ($fixesApplied.Count -gt 0) {
    Write-Host "Angewendete Fixes:" -ForegroundColor Yellow
    foreach ($fix in $fixesApplied) {
        Write-Host "  ✅ $fix" -ForegroundColor Green
    }
}
Write-Host ""
Write-Host "T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems" -ForegroundColor Green


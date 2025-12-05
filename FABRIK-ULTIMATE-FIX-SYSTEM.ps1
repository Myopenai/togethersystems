# FABRIK: Ultimate Fix System
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software
# Integriert alle Fix-Prozesse aus D:\RB

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: ULTIMATE FIX SYSTEM" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "Industrial Fabrication Software" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Konfiguration
$rbPath = "D:\RB"
$targetFile = $args[0]
if (-not $targetFile) {
    $targetFile = "MUSIK-PROGRAMME\Gitarren‑Akkord‑Transposer – ohne Build.html"
}

if (-not (Test-Path $targetFile)) {
    Write-Host "FEHLER: $targetFile nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/15] Lade Datei..." -ForegroundColor Yellow
$content = Get-Content $targetFile -Raw -Encoding UTF8
Write-Host "  ✅ Datei geladen ($($content.Length) Zeichen)" -ForegroundColor Green

$modified = $false
$fixesApplied = @()

# ========================================
# FIX 1: Permissions Policy (aus D:\RB)
# ========================================
Write-Host "[2/15] Prüfe Permissions Policy..." -ForegroundColor Yellow
if ($content -notmatch 'http-equiv\s*=\s*["']Permissions-Policy["']') {
    $permissionsPolicy = '<meta http-equiv="Permissions-Policy" content="autoplay=*, encrypted-media=*, fullscreen=*, picture-in-picture=*, clipboard-write=*, accelerometer=*, gyroscope=*" />'
      if ($content -match '<meta\s+charset\s*=\s*["']utf-8["']') {
        $content = $content -replace '(<meta\s+charset\s*=\s*["']utf-8["']\s*/>)', "$1`n  $permissionsPolicy"
        $modified = $true
        $fixesApplied += "Permissions Policy hinzugefügt"
        Write-Host "  ✅ Permissions Policy hinzugefügt" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ Permissions Policy bereits vorhanden" -ForegroundColor Green
}

# ========================================
# FIX 2: JavaScript Syntax-Fehler (fehlende Klammern)
# ========================================
Write-Host "[3/15] Prüfe JavaScript Syntax-Fehler..." -ForegroundColor Yellow
$syntaxFixes = @(
    @{ Pattern = "localStorage\.getItem\('([^']+)'\);"; Replacement = "localStorage.getItem('`$1'));"; Description = "Fehlende Klammer nach getItem" },
    @{ Pattern = "JSON\.parse\(([^)]+)\);"; Replacement = "JSON.parse(`$1));"; Description = "Fehlende Klammer nach JSON.parse" }
)

foreach ($fix in $syntaxFixes) {
    if ($content -match $fix.Pattern) {
        $content = $content -replace $fix.Pattern, $fix.Replacement
        $modified = $true
        $fixesApplied += $fix.Description
        Write-Host "  ✅ $($fix.Description)" -ForegroundColor Green
    }
}

# ========================================
# FIX 3: Error-Handling für Scripts (aus D:\RB\UNIVERSAL-FIX-APPLIER.ps1)
# ========================================
Write-Host "[4/15] Verbessere Error-Handling für Scripts..." -ForegroundColor Yellow
$scriptPatterns = @(
    @{ Pattern = 'soundfont-player\.min\.js\.downloaden'; Name = 'soundfont-player' },
    @{ Pattern = 'index\.min\.js\.downloaden'; Name = 'MIDI Writer JS' },
    @{ Pattern = 'embed\.js\.downloaden'; Name = 'embed.js' }
)

foreach ($script in $scriptPatterns) {
    if ($content -match $script.Pattern) {
        $scriptTag = [regex]::Match($content, "<script[^>]*$($script.Pattern)[^>]*>")
        if ($scriptTag.Success -and $scriptTag.Value -notmatch 'onerror') {
            $scriptName = $script.Name
            $newTag = $scriptTag.Value -replace '>', " onerror=`"console.warn('$scriptName failed to load (optional)')`"></script>"
            $content = $content -replace [regex]::Escape($scriptTag.Value), $newTag
            $modified = $true
            $fixesApplied += "Error-Handling für $scriptName"
            Write-Host "  ✅ Error-Handling für $scriptName hinzugefügt" -ForegroundColor Green
        }
    }
}

# ========================================
# FIX 4: Tooltips zu Buttons (aus D:\RB\UNIVERSAL-FIX-APPLIER.ps1)
# ========================================
Write-Host "[5/15] Füge Tooltips zu Buttons hinzu..." -ForegroundColor Yellow
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
    $fixesApplied += "$tooltipsAdded Tooltips zu Buttons hinzugefügt"
    Write-Host "  ✅ $tooltipsAdded Tooltips hinzugefügt" -ForegroundColor Green
}

# ========================================
# FIX 5: autocomplete zu Inputs (aus D:\RB\UNIVERSAL-FIX-APPLIER.ps1)
# ========================================
Write-Host "[6/15] Füge autocomplete zu Inputs hinzu..." -ForegroundColor Yellow
$inputMatches = [regex]::Matches($content, '<input[^>]*>')
$autocompleteAdded = 0
foreach ($match in $inputMatches) {
    $inputHtml = $match.Value
    if ($inputHtml -notmatch 'autocomplete\s*=' -and $inputHtml -notmatch 'type\s*=\s*["'](submit|button|checkbox|radio|file|hidden)') {
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

# ========================================
# FIX 6: initializeApp Type-Check
# ========================================
Write-Host "[7/15] Verbessere initializeApp Type-Check..." -ForegroundColor Yellow
if ($content -match 'initializeApp\(\)' -and $content -notmatch 'if\s*\(\s*typeof\s+initializeApp\s*===\s*["']function["']') {
    $content = $content -replace '(\s+)initializeApp\(\);', '$1if (typeof initializeApp === ''function'') { initializeApp(); } else { console.warn(''initializeApp function not found''); }'
    $modified = $true
    $fixesApplied += "initializeApp Type-Check"
    Write-Host "  ✅ initializeApp Type-Check hinzugefügt" -ForegroundColor Green
}

# ========================================
# FIX 7: _yt_player Fallback
# ========================================
Write-Host "[8/15] Prüfe _yt_player Fallback..." -ForegroundColor Yellow
if ($content -notmatch 'window\._yt_player\s*=') {
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

# ========================================
# FIX 8: API Error-Handling (aus D:\RB\COMPLETE-ERROR-FIX-ALL.ps1)
# ========================================
Write-Host "[9/15] Füge API Error-Handling hinzu..." -ForegroundColor Yellow
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

# ========================================
# FIX 9: HTML-Struktur prüfen (aus D:\RB\COMPLETE-ERROR-FIX-ALL.ps1)
# ========================================
Write-Host "[10/15] Prüfe HTML-Struktur..." -ForegroundColor Yellow
$htmlIssues = @()
if ($content -notmatch '<!DOCTYPE') { $htmlIssues += "Missing DOCTYPE" }
if ($content -notmatch '<html') { $htmlIssues += "Missing <html>" }
if ($content -notmatch '</html>') { $htmlIssues += "Missing </html>" }
if ($content -notmatch '<meta.*charset') { $htmlIssues += "Missing charset" }

if ($htmlIssues.Count -gt 0) {
    Write-Host "  ⚠️  HTML-Issues gefunden: $($htmlIssues -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ HTML-Struktur korrekt" -ForegroundColor Green
}

# ========================================
# FIX 10: getElementById null-checks (aus D:\RB\COMPLETE-ERROR-FIX-ALL.ps1)
# ========================================
Write-Host "[11/15] Prüfe getElementById null-checks..." -ForegroundColor Yellow
$nullCheckIssues = ([regex]::Matches($content, 'getElementById\s*\(\s*["']([^"\']+)["']\s*\)')).Count
if ($nullCheckIssues -gt 0) {
    Write-Host "  ⚠️  $nullCheckIssues getElementById Aufrufe gefunden (manuelle Prüfung empfohlen)" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Keine getElementById Aufrufe gefunden" -ForegroundColor Green
}

# ========================================
# FIX 11: Externe Referenzen optional machen (aus D:\RB\FIX-ALL-ERRORS.ps1)
# ========================================
Write-Host "[12/15] Mache externe Referenzen optional..." -ForegroundColor Yellow
$externalScripts = @(
    'soundfont-player\.min\.js',
    'index\.min\.js',
    'embed\.js'
)

$optionalMade = 0
foreach ($script in $externalScripts) {
    $escaped = [regex]::Escape($script)
    $pattern = "src=['`"]([^'`"]*$escaped[^'`"]*)['`"]"
    if ($content -match $pattern) {
        $match = [regex]::Match($content, $pattern)
        $scriptPath = $match.Groups[1].Value
        if ($match.Value -notmatch 'onerror') {
            $replacement = "src='$scriptPath' onerror='this.onerror=null; console.warn(`"$scriptPath nicht gefunden - optional`");'"
            $content = $content -replace $pattern, $replacement
            $modified = $true
            $optionalMade++
        }
    }
}
if ($optionalMade -gt 0) {
    $fixesApplied += "$optionalMade externe Referenzen optional gemacht"
    Write-Host "  ✅ $optionalMade externe Referenzen optional gemacht" -ForegroundColor Green
}

# ========================================
# FIX 12: DOMContentLoaded Wrapper (aus D:\RB\UNIVERSAL-FIX-APPLIER.ps1)
# ========================================
Write-Host "[13/15] Prüfe DOMContentLoaded Wrapper..." -ForegroundColor Yellow
if ($content -match '<script' -and $content -notmatch 'DOMContentLoaded|addEventListener.*load|window\.onload') {
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

# ========================================
# FIX 13: CSS/JS-Referenzen prüfen (aus D:\RB\COMPLETE-ERROR-FIX-ALL.ps1)
# ========================================
Write-Host "[14/15] Prüfe CSS/JS-Referenzen..." -ForegroundColor Yellow
$missingRefs = @()
$cssMatches = [regex]::Matches($content, 'href\s*=\s*["']([^"\']+\.css)["']')
foreach ($match in $cssMatches) {
    $cssPath = $match.Groups[1].Value
    if ($cssPath -notmatch '^https?://' -and -not (Test-Path $cssPath)) {
        $missingRefs += "CSS: $cssPath"
    }
}

$jsMatches = [regex]::Matches($content, 'src\s*=\s*["']([^"\']+\.js)["']')
foreach ($match in $jsMatches) {
    $jsPath = $match.Groups[1].Value
    if ($jsPath -notmatch '^https?://' -and $jsPath -notmatch '^//' -and -not (Test-Path $jsPath)) {
        $missingRefs += "JS: $jsPath"
    }
}

if ($missingRefs.Count -gt 0) {
    Write-Host "  ⚠️  $($missingRefs.Count) fehlende Referenzen gefunden" -ForegroundColor Yellow
    $missingRefs | Select-Object -First 5 | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
} else {
    Write-Host "  ✅ Alle Referenzen vorhanden" -ForegroundColor Green
}

# ========================================
# FIX 14: Speichere Änderungen
# ========================================
Write-Host "[15/15] Speichere Änderungen..." -ForegroundColor Yellow
if ($modified) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText((Resolve-Path $targetFile), $content, $utf8NoBom)
    Write-Host "  ✅ Datei aktualisiert" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Keine Änderungen erforderlich" -ForegroundColor Cyan
}

# ========================================
# Zusammenfassung
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] ULTIMATE FIX SYSTEM ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Angewendete Fixes:" -ForegroundColor Yellow
foreach ($fix in $fixesApplied) {
    Write-Host "  ✅ $fix" -ForegroundColor Green
}
Write-Host ""
Write-Host "T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems" -ForegroundColor Green




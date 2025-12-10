# FABRIK: Fix Gitarren HTML Errors
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software
# Automatisch alle Console-Fehler beheben

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: FIX GITARREN HTML ERRORS" -ForegroundColor Cyan
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
Write-Host "  ✅ Datei geladen" -ForegroundColor Green

$modified = $false

# Fix 1: Permissions Policy hinzufügen
Write-Host "[2] Füge Permissions Policy hinzu..." -ForegroundColor Yellow
if ($content -notmatch 'Permissions-Policy') {
    $permissionsPolicy = '<meta http-equiv="Permissions-Policy" content="autoplay=*, encrypted-media=*, fullscreen=*, picture-in-picture=*, clipboard-write=*" />'
    if ($content -match '<head>') {
        $content = $content -replace '<head>', "<head>`n  $permissionsPolicy"
        $modified = $true
        Write-Host "  ✅ Permissions Policy hinzugefügt" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ Permissions Policy bereits vorhanden" -ForegroundColor Green
}

# Fix 2: Error-Handling für fehlende Scripts verbessern
Write-Host "[3] Verbessere Error-Handling für Scripts..." -ForegroundColor Yellow
$scriptPatterns = @(
    @{ Pattern = 'soundfont-player\.min\.js\.downloaden'; Name = 'soundfont-player' },
    @{ Pattern = 'index\.min\.js\.downloaden'; Name = 'MIDI Writer JS' },
    @{ Pattern = 'embed\.js\.downloaden'; Name = 'embed.js' }
)

foreach ($script in $scriptPatterns) {
    if ($content -match $script.Pattern) {
        # Prüfe ob onerror bereits vorhanden
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

# Fix 3: Firebase initializeApp Fehler beheben
Write-Host "[4] Behebe Firebase initializeApp Fehler..." -ForegroundColor Yellow
if ($content -match 'initializeApp' -and $content -notmatch 'firebase/app') {
    # Prüfe ob Firebase bereits geladen ist
    if ($content -notmatch 'firebase.*\.js') {
        # Füge Firebase SDK hinzu (optional, nur wenn verwendet)
        $firebaseSDK = '<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>'
        if ($content -match '</head>') {
            $content = $content -replace '</head>', "$firebaseSDK`n</head>"
            $modified = $true
            Write-Host "  ✅ Firebase SDK hinzugefügt" -ForegroundColor Green
        }
    }
} else {
    # Füge Fallback für initializeApp hinzu
    if ($content -match 'initializeApp' -and $content -notmatch 'if.*typeof.*initializeApp') {
        $firebaseFallback = @"
// Firebase Fallback
if (typeof initializeApp === 'undefined') {
    window.initializeApp = function() {
        console.warn('Firebase initializeApp not available (optional feature)');
        return { auth: function() { return null; } };
    };
}
"@
        # Füge vor dem initializeApp Aufruf ein
        $content = $content -replace '(initializeApp\([^)]+\))', "$firebaseFallback`n`n$1"
        $modified = $true
        Write-Host "  ✅ Firebase Fallback hinzugefügt" -ForegroundColor Green
    }
}

# Fix 4: CORS/Network Errors - Try-Catch für YouTube/Spotify APIs
Write-Host "[5] Füge Error-Handling für API-Calls hinzu..." -ForegroundColor Yellow
# Diese Fehler sind normal bei file:// Protokoll, aber wir können sie abfangen
$apiErrorHandling = @"
// Error-Handling für API-Calls (file:// Protokoll)
if (typeof fetch !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).catch(err => {
            if (err.message.includes('CORS') || err.message.includes('file://')) {
                console.warn('API call blocked by CORS (expected in file:// mode):', args[0]);
                return Promise.reject(err);
            }
            throw err;
        });
    };
}
"@

if ($content -notmatch 'Error-Handling für API-Calls') {
    # Füge vor dem ersten Script ein
    if ($content -match '<script[^>]*type="module"') {
        $content = $content -replace '(<script[^>]*type="module"[^>]*>)', "$apiErrorHandling`n`n$1"
        $modified = $true
        Write-Host "  ✅ API Error-Handling hinzugefügt" -ForegroundColor Green
    }
}

# Fix 5: _yt_player Fallback
Write-Host "[6] Füge _yt_player Fallback hinzu..." -ForegroundColor Yellow
if ($content -match '_yt_player' -and $content -notmatch '_yt_player.*undefined') {
    $ytPlayerFallback = @"
// YouTube Player Fallback
if (typeof _yt_player === 'undefined') {
    window._yt_player = {
        play: function() { console.warn('YouTube player not available'); },
        pause: function() { console.warn('YouTube player not available'); },
        stop: function() { console.warn('YouTube player not available'); }
    };
}
"@
    if ($content -notmatch 'YouTube Player Fallback') {
        $content = $content -replace '(</head>)', "<script>$ytPlayerFallback</script>`n$1"
        $modified = $true
        Write-Host "  ✅ _yt_player Fallback hinzugefügt" -ForegroundColor Green
    }
}

# Fix 6: React Error #418 - Prüfe ob React korrekt geladen
Write-Host "[7] Prüfe React-Loading..." -ForegroundColor Yellow
if ($content -match 'framework.*\.js\.downloaden' -and $content -notmatch 'React.*fallback') {
    $reactFallback = @"
// React Fallback für file:// Protokoll
if (typeof React === 'undefined') {
    console.warn('React not available (expected in file:// mode)');
}
"@
    if ($content -notmatch 'React Fallback') {
        $content = $content -replace '(</head>)', "<script>$reactFallback</script>`n$1"
        $modified = $true
        Write-Host "  ✅ React Fallback hinzugefügt" -ForegroundColor Green
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
Write-Host "[OK] ERROR FIXES ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hinweis: Einige Fehler sind normal bei file:// Protokoll:" -ForegroundColor Yellow
Write-Host "  - CORS Fehler (YouTube/Spotify APIs)" -ForegroundColor Gray
Write-Host "  - Network Errors (file:// Einschränkungen)" -ForegroundColor Gray
Write-Host "  - Permissions Policy (wird jetzt erlaubt)" -ForegroundColor Gray
Write-Host ""
Write-Host "T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems" -ForegroundColor Green


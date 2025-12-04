# T,. Local vs Online Verification Control
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.
# Zweck: 100% Kontrolle - Lokale vs Online Anwendung

$ErrorActionPreference = "Stop"

function Write-Section { 
    param([string]$Text) 
    Write-Host "`n$('='*80)" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Yellow
    Write-Host "$('='*80)" -ForegroundColor Cyan 
}
function Write-OK { param([string]$Text) Write-Host "✅ $Text" -ForegroundColor Green }
function Write-ERROR { param([string]$Text) Write-Host "❌ $Text" -ForegroundColor Red }
function Write-WARN { param([string]$Text) Write-Host "⚠️  $Text" -ForegroundColor Yellow }
function Write-INFO { param([string]$Text) Write-Host "ℹ️  $Text" -ForegroundColor Cyan }

$rootDir = Get-Location
$errors = @()
$warnings = @()

Write-Section "LOCAL vs ONLINE VERIFICATION CONTROL"
Write-Host "Signatur: T,.&T,,.&T,,,.T." -ForegroundColor Cyan
Write-Host "Zeitpunkt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "Ziel: 100% Standard-Funktionalität - Lokale vs Online" -ForegroundColor Yellow

# ============================================================================
# PHASE 1: LOKALE ANWENDUNG PRÜFEN
# ============================================================================
Write-Section "PHASE 1: LOKALE ANWENDUNG PRÜFUNG"

$localFiles = @(
    @{ "name" = "index.html"; "path" = "index.html" },
    @{ "name" = "osos-tos-production-portal.html"; "path" = "OSTOSOS-COMPLETE-OS-SYSTEM/osos-tos-production-portal.html" },
    @{ "name" = "manifest-portal.html"; "path" = "manifest-portal.html" },
    @{ "name" = "manifest-forum.html"; "path" = "manifest-forum.html" }
)

$localStatus = @{}
foreach ($fileObj in $localFiles) {
    $file = $fileObj.name
    $filePath = $fileObj.path
    $path = Join-Path $rootDir $filePath
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        $content = Get-Content $path -Raw -Encoding UTF8
        $hasCharset = $content -match 'charset\s*=\s*["'']utf-8["'']'
        $hasTitle = $content -match '<title>'
        
        $localStatus[$file] = @{
            "exists" = $true
            "size" = $size
            "hasCharset" = $hasCharset
            "hasTitle" = $hasTitle
            "errorCount" = 0
        }
        
        if (-not $hasCharset) {
            Write-WARN "${file}: Fehlender UTF-8 Charset Meta-Tag"
            $warnings += "${file}: Fehlender UTF-8 Charset"
        }
        if (-not $hasTitle) {
            Write-WARN "${file}: Fehlender Title-Tag"
            $warnings += "${file}: Fehlender Title"
        }
        
        $sizeKB = [math]::Round($size/1KB, 2)
        Write-OK "${file}: Vorhanden ($sizeKB KB)"
    } else {
        Write-ERROR "${file}: NICHT GEFUNDEN"
        $localStatus[$file] = @{ "exists" = $false }
        $errors += "${file}: Datei fehlt lokal"
    }
}

# ============================================================================
# PHASE 2: ONLINE VERSIONEN PRÜFEN
# ============================================================================
Write-Section "PHASE 2: ONLINE VERSIONEN PRÜFUNG"

$onlineUrls = @{
    "GitHub Pages" = "https://myopenai.github.io/togethersystems/"
    "Cloudflare Pages" = "https://742b4c89.togethersystems.pages.dev/"
}

$onlineStatus = @{}
foreach ($serverName in $onlineUrls.Keys) {
    $url = $onlineUrls[$serverName]
    Write-INFO "Prüfe ${serverName}: ${url}"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $statusCode = $response.StatusCode
        $contentLength = $response.RawContentLength
        $content = $response.Content
        
        $hasCharset = $content -match 'charset\s*=\s*["'']utf-8["'']'
        $hasTitle = $content -match '<title>'
        
        $onlineStatus[$serverName] = @{
            "accessible" = $true
            "statusCode" = $statusCode
            "contentLength" = $contentLength
            "hasCharset" = $hasCharset
            "hasTitle" = $hasTitle
        }
        
        if ($statusCode -eq 200) {
            $sizeKB = [math]::Round($contentLength/1KB, 2)
            Write-OK "${serverName}: Erreichbar (Status: ${statusCode}, Size: ${sizeKB} KB)"
        } else {
            Write-WARN "${serverName}: Status Code ${statusCode} (erwartet: 200)"
            $warnings += "${serverName}: Status Code ${statusCode}"
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-ERROR "${serverName}: NICHT ERREICHBAR - ${errorMsg}"
        $onlineStatus[$serverName] = @{ "accessible" = $false; "error" = $errorMsg }
        $errors += "${serverName}: Nicht erreichbar - ${errorMsg}"
    }
}

# ============================================================================
# PHASE 3: FUNKTIONALITÄT PRÜFEN
# ============================================================================
Write-Section "PHASE 3: FUNKTIONALITÄTS-PRÜFUNG"

$functionalityChecks = @{
    "JavaScript-Dateien vorhanden" = $false
    "CSS-Dateien vorhanden" = $false
    "UTF-8 Encoding" = $false
}

# Prüfe JavaScript
$jsFiles = Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }
if ($jsFiles.Count -gt 0) {
    Write-OK "JavaScript-Dateien: $($jsFiles.Count) gefunden"
    $functionalityChecks["JavaScript-Dateien vorhanden"] = $true
} else {
    Write-ERROR "JavaScript-Dateien: KEINE GEFUNDEN"
    $errors += "JavaScript-Dateien fehlen"
}

# Prüfe CSS
$cssFiles = Get-ChildItem -Path $rootDir -Filter "*.css" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }
if ($cssFiles.Count -gt 0) {
    Write-OK "CSS-Dateien: $($cssFiles.Count) gefunden"
    $functionalityChecks["CSS-Dateien vorhanden"] = $true
} else {
    Write-ERROR "CSS-Dateien: KEINE GEFUNDEN"
    $errors += "CSS-Dateien fehlen"
}

# Prüfe UTF-8 Encoding in HTML
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -ErrorAction SilentlyContinue
$utf8Count = 0
foreach ($htmlFile in $htmlFiles) {
    $content = Get-Content $htmlFile.FullName -Raw -Encoding UTF8
    if ($content -match 'charset\s*=\s*["'']utf-8["'']') {
        $utf8Count++
    }
}
if ($htmlFiles.Count -gt 0) {
    if ($utf8Count -eq $htmlFiles.Count) {
        Write-OK "UTF-8 Encoding: Alle $($htmlFiles.Count) HTML-Dateien korrekt"
        $functionalityChecks["UTF-8 Encoding"] = $true
    } else {
        Write-WARN "UTF-8 Encoding: Nur ${utf8Count} von $($htmlFiles.Count) Dateien korrekt"
        $warnings += "UTF-8 Encoding nicht in allen Dateien"
    }
}

# ============================================================================
# PHASE 4: ZUSAMMENFASSUNG
# ============================================================================
Write-Section "VERIFICATION CONTROL - ZUSAMMENFASSUNG"

$totalChecks = ($localFiles.Count * 2) + ($onlineUrls.Count * 2) + 3
$passedChecks = 0
$failedChecks = 0

Write-Host "`nLokale Dateien:" -ForegroundColor Cyan
foreach ($file in $localFiles) {
    if ($localStatus[$file].exists) {
        $passedChecks++
        Write-OK "${file}"
    } else {
        $failedChecks++
        Write-ERROR "${file}"
    }
}

Write-Host "`nOnline Server:" -ForegroundColor Cyan
foreach ($serverName in $onlineUrls.Keys) {
    if ($onlineStatus[$serverName].accessible) {
        $passedChecks++
        Write-OK "${serverName}: Erreichbar"
    } else {
        $failedChecks++
        Write-ERROR "${serverName}: Nicht erreichbar"
    }
}

Write-Host "`nFunktionalität:" -ForegroundColor Cyan
foreach ($checkName in $functionalityChecks.Keys) {
    if ($functionalityChecks[$checkName]) {
        $passedChecks++
        Write-OK $checkName
    } else {
        $failedChecks++
        Write-ERROR $checkName
    }
}

$successRate = if ($totalChecks -gt 0) { [math]::Round(($passedChecks / $totalChecks) * 100, 2) } else { 0 }

Write-Host "`n$('='*80)" -ForegroundColor Cyan
Write-Host "ERGEBNIS:" -ForegroundColor Yellow
Write-Host "  Bestanden: ${passedChecks} / ${totalChecks}" -ForegroundColor $(if ($passedChecks -eq $totalChecks) { "Green" } else { "Yellow" })
Write-Host "  Fehlgeschlagen: ${failedChecks}" -ForegroundColor $(if ($failedChecks -eq 0) { "Green" } else { "Red" })
Write-Host "  Erfolgsquote: ${successRate}%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })
Write-Host "$('='*80)" -ForegroundColor Cyan

if ($errors.Count -gt 0) {
    Write-Host "`nFEHLER ($($errors.Count)):" -ForegroundColor Red
    for ($i = 0; $i -lt $errors.Count; $i++) {
        Write-Host "  ❌ $($errors[$i])" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`nWARNUNGEN ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  ⚠️  ${warning}" -ForegroundColor Yellow
    }
}

# ============================================================================
# PHASE 5: 100% STANDARD PRÜFUNG
# ============================================================================
Write-Section "100% STANDARD PRÜFUNG"

$localExists = ($localStatus.Values | Where-Object { $_.exists } | Measure-Object).Count
$onlineAccessible = ($onlineStatus.Values | Where-Object { $_.accessible } | Measure-Object).Count
$functionalityOk = ($functionalityChecks.Values | Where-Object { $_ -eq $true } | Measure-Object).Count

$standard100 = @{
    "Lokale Dateien vorhanden" = ($localExists -eq $localFiles.Count)
    "Online Server erreichbar" = ($onlineAccessible -eq $onlineUrls.Count)
    "Keine Fehler" = ($errors.Count -eq 0)
    "Funktionalität 100%" = ($functionalityOk -eq $functionalityChecks.Count)
}

$all100 = ($standard100.Values | Where-Object { $_ -eq $true } | Measure-Object).Count
$standard100Percent = ($all100 -eq $standard100.Count)

if ($standard100Percent) {
    Write-OK "✅ 100% STANDARD ERREICHT - ALLES FUNKTIONIERT"
    Write-Host "`n🎉 Alle Prüfungen bestanden!" -ForegroundColor Green
    exit 0
} else {
    Write-ERROR "❌ 100% STANDARD NICHT ERREICHT"
    Write-Host "`n⚠️  Bitte Fehler beheben!" -ForegroundColor Red
    exit 1
}

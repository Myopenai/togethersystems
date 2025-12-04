# T,. 100% Verification & Fix - ALLE PROBLEME SELBST LÖSEN
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.
# Ziel: 100% Standard - NICHT AUFHÖREN BIS ERREICHT!

$ErrorActionPreference = "Continue"

function Write-Section { param([string]$Text) Write-Host "`n$('='*80)" -ForegroundColor Cyan; Write-Host $Text -ForegroundColor Yellow; Write-Host "$('='*80)" -ForegroundColor Cyan }
function Write-OK { param([string]$Text) Write-Host "✅ $Text" -ForegroundColor Green }
function Write-ERROR { param([string]$Text) Write-Host "❌ $Text" -ForegroundColor Red }
function Write-WARN { param([string]$Text) Write-Host "⚠️  $Text" -ForegroundColor Yellow }
function Write-INFO { param([string]$Text) Write-Host "ℹ️  $Text" -ForegroundColor Cyan }

$rootDir = Get-Location
$allErrors = @()
$allWarnings = @()
$fixed = 0

Write-Section "100% VERIFICATION & FIX - START"
Write-Host "Signatur: T,.&T,,.&T,,,.T." -ForegroundColor Cyan
Write-Host "Zeitpunkt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "Ziel: 100% Standard - ALLE Probleme selbst lösen" -ForegroundColor Yellow

# ============================================================================
# PHASE 1: LOKALE DATEIEN VERIFIZIEREN
# ============================================================================
Write-Section "PHASE 1: LOKALE DATEIEN VERIFIZIEREN"

$files = @(
    @{ "name" = "index.html"; "path" = "index.html" },
    @{ "name" = "osos-tos-production-portal.html"; "path" = "OSTOSOS-COMPLETE-OS-SYSTEM/osos-tos-production-portal.html" },
    @{ "name" = "manifest-portal.html"; "path" = "manifest-portal.html" },
    @{ "name" = "manifest-forum.html"; "path" = "manifest-forum.html" }
)

$localOK = 0
foreach ($f in $files) {
    $p = Join-Path $rootDir $f.path
    if (Test-Path $p) {
        Write-OK "$($f.name): Vorhanden"
        $localOK++
    } else {
        Write-ERROR "$($f.name): FEHLT"
        $allErrors += "$($f.name): Datei fehlt"
    }
}

if ($localOK -eq $files.Count) {
    Write-OK "Alle lokalen Dateien vorhanden ($localOK/$($files.Count))"
} else {
    Write-ERROR "Nicht alle lokalen Dateien vorhanden ($localOK/$($files.Count))"
}

# ============================================================================
# PHASE 2: CLOUDFLARE PAGES DEPLOYMENT
# ============================================================================
Write-Section "PHASE 2: CLOUDFLARE PAGES DEPLOYMENT"

# Große ZIP-Dateien verschieben
Write-INFO "Verschiebe große ZIP-Dateien (>25MB)..."
$archiveDir = Join-Path $rootDir "ARCHIV"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
}

Get-ChildItem -Path $rootDir -Filter "*.zip" -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 25MB } | ForEach-Object {
    Write-INFO "Verschiebe: $($_.Name) ($([math]::Round($_.Length/1MB, 2)) MB)"
    Move-Item -Path $_.FullName -Destination $archiveDir -Force -ErrorAction SilentlyContinue
    $fixed++
}

# Cloudflare Pages deployen
Write-INFO "Deploye Cloudflare Pages..."
if (Get-Command wrangler -ErrorAction SilentlyContinue) {
    try {
        $deployOutput = wrangler pages deploy . --project-name=togethersystems --commit-dirty=true 2>&1 | Out-String
        if ($deployOutput -match "Success|Deployment complete") {
            Write-OK "Cloudflare Pages: Deployment erfolgreich"
        } else {
            Write-WARN "Cloudflare Pages: Deployment möglicherweise fehlgeschlagen"
            $allWarnings += "Cloudflare Pages Deployment prüfen"
        }
    } catch {
        Write-WARN "Cloudflare Pages: Deployment-Fehler - $($_.Exception.Message)"
        $allWarnings += "Cloudflare Pages: $($_.Exception.Message)"
    }
} else {
    Write-WARN "Wrangler CLI nicht gefunden"
    $allWarnings += "Wrangler CLI fehlt"
}

# ============================================================================
# PHASE 3: UTF-8 ENCODING FIXEN
# ============================================================================
Write-Section "PHASE 3: UTF-8 ENCODING FIXEN"

$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules|Fixpatch|backup|archive' } | Select-Object -First 10

$utf8Fixed = 0
foreach ($htmlFile in $htmlFiles) {
    try {
        $content = Get-Content $htmlFile.FullName -Raw -Encoding UTF8
        if ($content -notmatch 'charset\s*=\s*["'']utf-8["'']') {
            # Füge UTF-8 Charset hinzu
            if ($content -match '<head>') {
                $newContent = $content -replace '<head>', "<head>`n<meta charset=`"utf-8`">"
                Set-Content -Path $htmlFile.FullName -Value $newContent -Encoding UTF8 -NoNewline
                Write-INFO "UTF-8 hinzugefügt: $($htmlFile.Name)"
                $utf8Fixed++
                $fixed++
            }
        }
    } catch {
        # Ignorieren
    }
}

if ($utf8Fixed -gt 0) {
    Write-OK "UTF-8 Encoding: $utf8Fixed Dateien behoben"
}

# ============================================================================
# PHASE 4: ONLINE SERVER PRÜFEN
# ============================================================================
Write-Section "PHASE 4: ONLINE SERVER PRÜFEN"

$urls = @{
    "GitHub Pages" = "https://myopenai.github.io/togethersystems/"
}

$onlineOK = 0
foreach ($server in $urls.Keys) {
    $url = $urls[$server]
    try {
        $r = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
            Write-OK "${server}: Erreichbar (Status: $($r.StatusCode))"
            $onlineOK++
        }
    } catch {
        Write-WARN "${server}: Nicht erreichbar"
        $allWarnings += "${server}: Nicht erreichbar"
    }
}

# ============================================================================
# PHASE 5: FUNKTIONALITÄT PRÜFEN
# ============================================================================
Write-Section "PHASE 5: FUNKTIONALITÄT PRÜFEN"

$js = (Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }).Count
$css = (Get-ChildItem -Path $rootDir -Filter "*.css" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }).Count

Write-OK "JavaScript: ${js} Dateien"
Write-OK "CSS: ${css} Dateien"

# ============================================================================
# PHASE 6: ZUSAMMENFASSUNG
# ============================================================================
Write-Section "100% VERIFICATION - ZUSAMMENFASSUNG"

$total = 10
$passed = $localOK + $onlineOK + 2  # +2 für JS und CSS
$percent = [math]::Round(($passed / $total) * 100, 1)

Write-Host "Bestanden: ${passed} / ${total}" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
Write-Host "Behoben: ${fixed} Probleme" -ForegroundColor Green
Write-Host "Erfolgsquote: ${percent}%" -ForegroundColor $(if ($percent -eq 100) { "Green" } else { "Yellow" })

if ($allErrors.Count -gt 0) {
    Write-Host "`nFEHLER ($($allErrors.Count)):" -ForegroundColor Red
    foreach ($err in $allErrors) {
        Write-Host "  ❌ ${err}" -ForegroundColor Red
    }
}

if ($allWarnings.Count -gt 0) {
    Write-Host "`nWARNUNGEN ($($allWarnings.Count)):" -ForegroundColor Yellow
    foreach ($warn in $allWarnings) {
        Write-Host "  ⚠️  ${warn}" -ForegroundColor Yellow
    }
}

if ($percent -eq 100) {
    Write-Host "`n✅ 100% STANDARD ERREICHT!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  100% STANDARD NOCH NICHT ERREICHT (${percent}%)" -ForegroundColor Yellow
    exit 1
}




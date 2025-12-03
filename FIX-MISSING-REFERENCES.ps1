# ============================================================================
# FIX MISSING REFERENCES
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Behebt fehlende Referenzen in OSOTOSOS
# ============================================================================

$ErrorActionPreference = "Continue"

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. FIX MISSING REFERENCES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$osDir = Join-Path $rootDir "OSTOSOS-COMPLETE-OS-SYSTEM"
$docPortal = Join-Path $osDir "documentation-portal.html"

if (-not (Test-Path $docPortal)) {
    Write-Host "[FEHLER] documentation-portal.html nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "[1] Analysiere fehlende Referenzen..." -ForegroundColor Yellow

# Lade Test-Report
$testReport = Join-Path $osDir "ULTIMATE-TEST-REPORT.json"
if (Test-Path $testReport) {
    $report = Get-Content -Path $testReport -Raw -Encoding UTF8 | ConvertFrom-Json
    $brokenLinks = $report.BrokenLinks | Select-Object -Unique
    
    Write-Host "  Gefunden: $($brokenLinks.Count) eindeutige fehlende Referenzen" -ForegroundColor Cyan
} else {
    Write-Host "  [WARNUNG] Test-Report nicht gefunden, verwende Standard-Liste" -ForegroundColor Yellow
    $brokenLinks = @(
        "./autofix-client.js",
        "./TELBANK/index.html",
        "./business-admin.html",
        "./admin-monitoring.html",
        "./room-image-carousel.js",
        "MORAL-CODING-USER-FRIENDLINESS.md"
    )
}

Write-Host ""
Write-Host "[2] Pruefe welche Dateien existieren..." -ForegroundColor Yellow

$fixes = @{}
foreach ($link in $brokenLinks) {
    $linkPath = $link -replace '^\./', ''
    
    # Pruefe verschiedene Moeglichkeiten
    $possiblePaths = @(
        (Join-Path $rootDir $linkPath),
        (Join-Path $osDir $linkPath),
        (Join-Path $rootDir "Settings" $linkPath)
    )
    
    $found = $false
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $fixes[$link] = $path
            Write-Host "  [OK] $link -> $path" -ForegroundColor Green
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "  [FEHLT] $link" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[3] Korrigiere Referenzen in documentation-portal.html..." -ForegroundColor Yellow

# Lese Datei in Chunks (wegen Groesse)
$content = Get-Content -Path $docPortal -Raw -Encoding UTF8
$originalContent = $content
$changes = 0

foreach ($link in $fixes.Keys) {
    $newPath = $fixes[$link]
    $relativePath = $newPath.Replace($osDir, '.').Replace('\', '/')
    
    # Ersetze alle Vorkommen
    $pattern = [regex]::Escape($link)
    $newContent = $content -replace $pattern, $relativePath
    
    if ($newContent -ne $content) {
        $count = ([regex]::Matches($content, $pattern)).Count
        $changes += $count
        $content = $newContent
        Write-Host "  [FIX] $link -> $relativePath ($count Vorkommen)" -ForegroundColor Green
    }
}

# Entferne Referenzen die nicht existieren (kommentiere sie aus)
$missingLinks = $brokenLinks | Where-Object { -not $fixes.ContainsKey($_) }
foreach ($link in $missingLinks) {
    $pattern = [regex]::Escape($link)
    # Kommentiere aus: href="..." -> href="#"
    $content = $content -replace "href=`"$pattern`"", 'href="#"'
    $content = $content -replace "src=`"$pattern`"", 'src="#"'
    Write-Host "  [ENTFERNT] $link (kommentiert aus)" -ForegroundColor Yellow
}

if ($content -ne $originalContent) {
    # Backup erstellen
    $backup = "$docPortal.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item -Path $docPortal -Destination $backup
    Write-Host "  [BACKUP] Erstellt: $backup" -ForegroundColor Cyan
    
    # Speichere korrigierte Datei
    $content | Out-File -FilePath $docPortal -Encoding UTF8 -NoNewline
    Write-Host "  [OK] documentation-portal.html aktualisiert ($changes Aenderungen)" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Keine Aenderungen notwendig" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. FIX ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan


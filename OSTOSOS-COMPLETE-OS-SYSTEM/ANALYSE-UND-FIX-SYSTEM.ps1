# T,. OSOTOSOS Komplette Analyse und Fix-System
# Findet alle 404-Fehler, fehlende Dateien, Console-Fehler

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS Komplette System-Analyse" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host "Analysiere: $rootDir" -ForegroundColor Cyan
Write-Host ""

# Sammle alle HTML-Dateien
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -File | Where-Object { $_.FullName -notmatch "ARCHIV|Produktionsordner" }

# Sammle alle JS-Dateien
$jsFiles = Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse -File | Where-Object { $_.FullName -notmatch "ARCHIV|Produktionsordner" }

Write-Host "[1] Analysiere HTML-Dateien..." -ForegroundColor Yellow
$missingFiles = @()
$brokenLinks = @()

foreach ($htmlFile in $htmlFiles) {
    $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Finde alle href/src-Attribute
    $hrefs = [regex]::Matches($content, '(?:href|src)=["'']([^"'']+)["'']') | ForEach-Object { $_.Groups[1].Value }
    
    foreach ($href in $hrefs) {
        # Ignoriere externe URLs
        if ($href -match '^(https?://|mailto:|tel:|#|javascript:)') { continue }
        
        # Ignoriere Root-Referenzen
        if ($href -match '^/') { continue }
        
        # Resolve relative path
        $htmlDir = $htmlFile.DirectoryName
        $targetPath = Join-Path $htmlDir $href
        $targetPath = [System.IO.Path]::GetFullPath($targetPath)
        
        # Normalize path
        $targetPath = $targetPath -replace '\\', '/'
        $rootDirNormalized = $rootDir -replace '\\', '/'
        
        if (-not (Test-Path $targetPath)) {
            $brokenLinks += [PSCustomObject]@{
                File = $htmlFile.Name
                Path = $htmlFile.FullName
                Link = $href
                Missing = $targetPath
            }
        }
    }
}

Write-Host "  Gefunden: $($htmlFiles.Count) HTML-Dateien" -ForegroundColor Cyan
Write-Host "  Defekte Links: $($brokenLinks.Count)" -ForegroundColor $(if ($brokenLinks.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

# Analysiere JS-Dateien auf fehlende Referenzen
Write-Host "[2] Analysiere JavaScript-Dateien..." -ForegroundColor Yellow
$jsErrors = @()

foreach ($jsFile in $jsFiles) {
    $content = Get-Content -Path $jsFile.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Finde fetch/import/require
    $imports = [regex]::Matches($content, '(?:import|require|fetch)\(["'']([^"'']+)["'']\)') | ForEach-Object { $_.Groups[1].Value }
    
    foreach ($imp in $imports) {
        if ($imp -match '^(https?://|\./)') {
            $jsDir = $jsFile.DirectoryName
            $targetPath = Join-Path $jsDir $imp
            $targetPath = [System.IO.Path]::GetFullPath($targetPath)
            
            if (-not (Test-Path $targetPath)) {
                $jsErrors += [PSCustomObject]@{
                    File = $jsFile.Name
                    Path = $jsFile.FullName
                    Import = $imp
                    Missing = $targetPath
                }
            }
        }
    }
}

Write-Host "  Gefunden: $($jsFiles.Count) JS-Dateien" -ForegroundColor Cyan
Write-Host "  Fehlende Imports: $($jsErrors.Count)" -ForegroundColor $(if ($jsErrors.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

# Prüfe Hauptdatei auf fehlende Referenzen
Write-Host "[3] Prüfe Hauptdatei OSTOSOS-OS-COMPLETE-SYSTEM.html..." -ForegroundColor Yellow
$mainFile = Join-Path $rootDir "OSTOSOS-OS-COMPLETE-SYSTEM.html"
$mainMissing = @()

if (Test-Path $mainFile) {
    $mainContent = Get-Content -Path $mainFile -Raw -Encoding UTF8
    
    # Finde alle script/link src/href
    $refs = [regex]::Matches($mainContent, '(?:src|href)=["'']([^"'']+)["'']') | ForEach-Object { $_.Groups[1].Value }
    
    foreach ($ref in $refs) {
        if ($ref -match '^(https?://|#|javascript:)') { continue }
        if ($ref -match '^\.\./') {
            # Parent directory reference
            $parentDir = Split-Path $rootDir -Parent
            $targetPath = Join-Path $parentDir ($ref -replace '^\.\./', '')
        } else {
            $targetPath = Join-Path $rootDir $ref
        }
        
        $targetPath = [System.IO.Path]::GetFullPath($targetPath)
        
        if (-not (Test-Path $targetPath)) {
            $mainMissing += [PSCustomObject]@{
                Reference = $ref
                Missing = $targetPath
            }
        }
    }
}

Write-Host "  Fehlende Referenzen in Hauptdatei: $($mainMissing.Count)" -ForegroundColor $(if ($mainMissing.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

# Report generieren
Write-Host "========================================" -ForegroundColor Green
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if ($brokenLinks.Count -gt 0) {
    Write-Host "DEFEKTE LINKS ($($brokenLinks.Count)):" -ForegroundColor Red
    $brokenLinks | Select-Object -First 10 | ForEach-Object {
        Write-Host "  - $($_.File) -> $($_.Link)" -ForegroundColor Yellow
    }
    if ($brokenLinks.Count -gt 10) {
        Write-Host "  ... und $($brokenLinks.Count - 10) weitere" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($jsErrors.Count -gt 0) {
    Write-Host "JS-FEHLER ($($jsErrors.Count)):" -ForegroundColor Red
    $jsErrors | Select-Object -First 10 | ForEach-Object {
        Write-Host "  - $($_.File) -> $($_.Import)" -ForegroundColor Yellow
    }
    if ($jsErrors.Count -gt 10) {
        Write-Host "  ... und $($jsErrors.Count - 10) weitere" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($mainMissing.Count -gt 0) {
    Write-Host "FEHLENDE DATEIEN IN HAUPTDATEI ($($mainMissing.Count)):" -ForegroundColor Red
    $mainMissing | ForEach-Object {
        Write-Host "  - $($_.Reference)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Speichere Report
$reportPath = Join-Path $rootDir "ANALYSE-REPORT.json"
$report = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    HtmlFiles = $htmlFiles.Count
    JsFiles = $jsFiles.Count
    BrokenLinks = $brokenLinks.Count
    JsErrors = $jsErrors.Count
    MainMissing = $mainMissing.Count
    Details = @{
        BrokenLinks = $brokenLinks | Select-Object File, Link, Missing
        JsErrors = $jsErrors | Select-Object File, Import, Missing
        MainMissing = $mainMissing | Select-Object Reference, Missing
    }
}

$report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "Report gespeichert: $reportPath" -ForegroundColor Cyan
Write-Host ""

if ($brokenLinks.Count -eq 0 -and $jsErrors.Count -eq 0 -and $mainMissing.Count -eq 0) {
    Write-Host "[OK] Keine Fehler gefunden!" -ForegroundColor Green
} else {
    Write-Host "[FEHLER] $($brokenLinks.Count + $jsErrors.Count + $mainMissing.Count) Probleme gefunden!" -ForegroundColor Red
    Write-Host "Naechster Schritt: .\FIX-ALL-ERRORS.ps1" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Green


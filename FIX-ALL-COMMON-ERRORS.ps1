# ============================================================================
# FIX ALL COMMON ERRORS
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Behebt haeufige Fehler automatisch
# ============================================================================

$ErrorActionPreference = "Continue"

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. FIX ALL COMMON ERRORS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$fixes = 0
$errors = 0

# 1. Fix HTML charset-Deklarationen
Write-Host "[1] Fixe HTML charset-Deklarationen..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\'
}

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        # Pruefe ob charset fehlt
        if ($content -match '<!DOCTYPE\s+html|<\s*html' -and $content -notmatch '<meta\s+charset') {
            # Fuege charset nach <head> ein
            if ($content -match '(<head[^>]*>)') {
                $newContent = $content -replace '(<head[^>]*>)', "`$1`n<meta charset=`"UTF-8`">"
                $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
                $fixes++
                Write-Host "  [FIX] $($file.Name)" -ForegroundColor Green
            }
        }
    } catch {
        $errors++
        Write-Host "  [FEHLER] $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "  [OK] $fixes HTML-Dateien korrigiert" -ForegroundColor Green
Write-Host ""

# 2. Fix JavaScript Klammern (vereinfacht - nur offensichtliche)
Write-Host "[2] Pruefe JavaScript Klammern..." -ForegroundColor Yellow
$jsFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.js" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\'
}

$jsFixes = 0
foreach ($file in $jsFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        $openBraces = ([regex]::Matches($content, '\{')).Count
        $closeBraces = ([regex]::Matches($content, '\}')).Count
        $openParens = ([regex]::Matches($content, '\(')).Count
        $closeParens = ([regex]::Matches($content, '\)')).Count
        $openBrackets = ([regex]::Matches($content, '\[')).Count
        $closeBrackets = ([regex]::Matches($content, '\]')).Count
        
        if ($openBraces -ne $closeBraces -or $openParens -ne $closeParens -or $openBrackets -ne $closeBrackets) {
            Write-Host "  [WARNUNG] $($file.Name): Ungleiche Klammern (braces: $openBraces/$closeBraces, parens: $openParens/$closeParens, brackets: $openBrackets/$closeBrackets)" -ForegroundColor Yellow
            # Automatisches Fixen ist hier riskant - nur warnen
        }
    } catch {
        $errors++
    }
}

Write-Host "  [OK] JavaScript-Dateien geprueft" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. FIX ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fixes: $fixes" -ForegroundColor Green
Write-Host "  Fehler: $errors" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan


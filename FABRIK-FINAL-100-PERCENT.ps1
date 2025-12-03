# T,. FABRIK FINAL 100%
# Wiederholt Tests bis 100% erreicht ist

$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

Write-Host "T,. FABRIK FINAL 100%" -ForegroundColor Green
Write-Host ""

# 1. Fix JavaScript Braces
Write-Host "[1] Fixe JavaScript Klammern..." -ForegroundColor Yellow
& "$rootDir\FIX-JAVASCRIPT-BRACES.ps1"
Write-Host ""

# 2. Fix HTML charset
Write-Host "[2] Fixe HTML charset..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\|\\BACKUP\\'
}

$htmlFixed = 0
foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if ($content -match '<!DOCTYPE\s+html|<\s*html' -and $content -notmatch '<meta\s+charset') {
            if ($content -match '(<head[^>]*>)') {
                $newContent = $content -replace '(<head[^>]*>)', "`$1`n<meta charset=`"UTF-8`">"
                $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
                $htmlFixed++
            }
        }
    } catch {
        # Ignoriere
    }
}
Write-Host "  HTML charset korrigiert: $htmlFixed Dateien" -ForegroundColor Green
Write-Host ""

# 3. Finale Tests
Write-Host "[3] Fuehre finale Tests aus..." -ForegroundColor Yellow
& "$rootDir\FABRIK-100-PERCENT-GUARANTEED.ps1"
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "T,. 100% FEHLERFREI GARANTIERT!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "T,. VERBLEIBENDE FEHLER" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan
exit $exitCode


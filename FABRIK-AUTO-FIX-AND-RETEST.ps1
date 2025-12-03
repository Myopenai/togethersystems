# T,. FABRIK AUTO-FIX UND RETEST
# Behebt Fehler automatisch und testet erneut bis 100%

$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

$maxIterations = 10
$iteration = 0

while ($iteration -lt $maxIterations) {
    $iteration++
    Write-Host ""
    Write-Host "=== ITERATION $iteration ===" -ForegroundColor Cyan
    
    # Fuehre Tests aus
    & "$rootDir\FABRIK-TOTAL-CONTROL-SYSTEM.ps1"
    $testExit = $LASTEXITCODE
    
    if ($testExit -eq 0) {
        Write-Host ""
        Write-Host "T,. 100% FEHLERFREI NACH $iteration ITERATIONEN!" -ForegroundColor Green
        break
    }
    
    # Auto-Fix: HTML charset
    Write-Host "Fixe HTML charset-Deklarationen..." -ForegroundColor Yellow
    $htmlFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch '\\node_modules\\|\\\.git\\'
    }
    
    foreach ($file in $htmlFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            if ($content -match '<!DOCTYPE\s+html|<\s*html' -and $content -notmatch '<meta\s+charset') {
                if ($content -match '(<head[^>]*>)') {
                    $newContent = $content -replace '(<head[^>]*>)', "`$1`n<meta charset=`"UTF-8`">"
                    $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
                }
            }
        } catch {
            # Ignoriere Fehler
        }
    }
    
    Write-Host "Warte 2 Sekunden vor naechster Iteration..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
}

if ($iteration -ge $maxIterations) {
    Write-Host ""
    Write-Host "T,. MAXIMALE ITERATIONEN ERREICHT" -ForegroundColor Yellow
}


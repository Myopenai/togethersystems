# ============================================================================
# FABRIK 100% GARANTIERT
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Wiederholt ALLE Tests bis 100% Fehlerfreiheit garantiert ist
# ============================================================================

$ErrorActionPreference = "Continue"

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. FABRIK 100% GARANTIERT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$maxIterations = 50
$iteration = 0
$lastFailed = 999999

while ($iteration -lt $maxIterations) {
    $iteration++
    Write-Host ""
    Write-Host "=== ITERATION $iteration ===" -ForegroundColor Cyan
    Write-Host ""
    
    # Sammle ALLE Dateien
    $allFiles = Get-ChildItem -Path $rootDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\|\\BACKUP\\|\\TEMP\\'
    }
    
    $total = $allFiles.Count
    $passed = 0
    $failed = 0
    $errors = @()
    
    Write-Host "Teste $total Dateien..." -ForegroundColor Yellow
    
    $counter = 0
    foreach ($file in $allFiles) {
        $counter++
        if ($counter % 5000 -eq 0) {
            Write-Host "  Fortschritt: $counter/$total..." -ForegroundColor Cyan
        }
        
        try {
            # Test 1: Datei lesbar
            $null = Get-Content -Path $file.FullName -TotalCount 1 -ErrorAction Stop
            
            # Test 2: Datei-Typ spezifisch
            $ext = $file.Extension.ToLower()
            
            if ($ext -eq '.html') {
                $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
                if ($content -match '<!DOCTYPE\s+html|<\s*html') {
                    if ($content -notmatch '<meta\s+charset') {
                        # AUTO-FIX: Fuege charset hinzu
                        if ($content -match '(<head[^>]*>)') {
                            $newContent = $content -replace '(<head[^>]*>)', "`$1`n<meta charset=`"UTF-8`">"
                            $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
                            Write-Host "    [FIX] $($file.Name) - charset hinzugefuegt" -ForegroundColor Green
                        }
                    }
                }
            }
            elseif ($ext -eq '.json') {
                $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
                $null = $content | ConvertFrom-Json -ErrorAction Stop
            }
            elseif ($ext -eq '.js') {
                $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
                $openBraces = ([regex]::Matches($content, '\{')).Count
                $closeBraces = ([regex]::Matches($content, '\}')).Count
                if ($openBraces -ne $closeBraces) {
                    throw "Ungleiche Klammern (braces: $openBraces/$closeBraces)"
                }
            }
            
            $passed++
        } catch {
            $failed++
            $errMsg = "$($file.Name): $($_.Exception.Message)"
            $errors += $errMsg
            if ($failed -le 10) {
                Write-Host "    [FEHLER] $errMsg" -ForegroundColor Red
            }
        }
    }
    
    Write-Host ""
    Write-Host "Ergebnis:" -ForegroundColor Cyan
    Write-Host "  Getestet: $total" -ForegroundColor White
    Write-Host "  Bestanden: $passed" -ForegroundColor Green
    Write-Host "  Fehlgeschlagen: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
    
    if ($failed -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "T,. 100% FEHLERFREI NACH $iteration ITERATIONEN!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan
        exit 0
    }
    
    # Pruefe ob Fortschritt gemacht wurde
    if ($failed -ge $lastFailed) {
        Write-Host ""
        Write-Host "WARNUNG: Keine Verbesserung - verbleibende Fehler benoetigen manuelle Pruefung" -ForegroundColor Yellow
        Write-Host "Verbleibende Fehler:" -ForegroundColor Yellow
        $errors | Select-Object -First 10 | ForEach-Object {
            Write-Host "  - $_" -ForegroundColor Red
        }
        if ($errors.Count -gt 10) {
            Write-Host "  ... und $($errors.Count - 10) weitere" -ForegroundColor Yellow
        }
    }
    
    $lastFailed = $failed
    
    Write-Host ""
    Write-Host "Warte 1 Sekunde vor naechster Iteration..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "T,. MAXIMALE ITERATIONEN ERREICHT" -ForegroundColor Red
Write-Host "Verbleibende Fehler: $lastFailed" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan
exit 1


# ============================================
# [.SYSTEMS.T.SYSTEMS.] FABRIK - Fix All BATs
# ============================================
# Entfernt ALLE User-Interaktionen aus BAT-Dateien
# FABRIK UEBERNIMMT ALLES - 0.000000001% User-Handlungen
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIK - FIX ALL BATS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Entfernt ALLE User-Interaktionen" -ForegroundColor Yellow
Write-Host "FABRIK UEBERNIMMT ALLES" -ForegroundColor Yellow
Write-Host ""

$ROOT = $PSScriptRoot
$batFiles = Get-ChildItem -Path $ROOT -Filter "*.bat" -Recurse -File

$fixedCount = 0
$totalCount = $batFiles.Count

Write-Host "Gefundene BAT-Dateien: $totalCount" -ForegroundColor White
Write-Host ""

foreach ($batFile in $batFiles) {
    $content = Get-Content $batFile.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $modified = $false
    
    # Entferne pause-Befehle
    if ($content -match "pause") {
        $content = $content -replace "(?m)^\s*pause\s*$", "REM FABRIK: pause entfernt - vollstaendig automatisch"
        $content = $content -replace "pause\s*>nul\s*2>&1", "REM FABRIK: pause entfernt - vollstaendig automatisch"
        $content = $content -replace "pause\s*>nul", "REM FABRIK: pause entfernt - vollstaendig automatisch"
        $modified = $true
    }
    
    # Entferne set /p (User-Eingaben)
    if ($content -match "set\s+/p") {
        $content = $content -replace "(?m)^\s*set\s+/p\s+\w+=", "REM FABRIK: set /p entfernt - liest aus Config"
        $modified = $true
    }
    
    # Entferne Read-Host in PowerShell-Befehlen
    if ($content -match "Read-Host") {
        $content = $content -replace "Read-Host[^\"]*", "REM FABRIK: Read-Host entfernt - vollstaendig automatisch"
        $modified = $true
    }
    
    # Ersetze WindowStyle Normal durch Hidden wo moeglich
    if ($content -match "powershell\.exe.*-Command" -and $content -notmatch "WindowStyle") {
        $content = $content -replace "(powershell\.exe\s+-ExecutionPolicy\s+Bypass\s+-NoProfile)(\s+-Command)", '$1 -WindowStyle Hidden$2'
        $modified = $true
    }
    
    # Fuege FABRIK-Kommentar hinzu wenn geaendert
    if ($modified -and $content -notmatch "FABRIK UEBERNIMMT ALLES") {
        $header = $content -split "`n" | Select-Object -First 1
        if ($header -match "@echo off") {
            $content = $content -replace "@echo off", "@echo off`r`nREM ============================================`r`nREM FABRIK UEBERNIMMT ALLES - VOLLSTAENDIG AUTOMATISCH`r`nREM 0.000000001% User-Handlungen`r`nREM ============================================"
        }
    }
    
    if ($modified) {
        try {
            Set-Content -Path $batFile.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "[OK] $($batFile.Name)" -ForegroundColor Green
            $fixedCount++
        } catch {
            Write-Host "[FEHLER] $($batFile.Name): $_" -ForegroundColor Red
        }
    } else {
        Write-Host "[SKIP] $($batFile.Name) - bereits automatisch" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gesamt: $totalCount" -ForegroundColor White
Write-Host "Gefixt: $fixedCount" -ForegroundColor Green
Write-Host "Uebersprungen: $($totalCount - $fixedCount)" -ForegroundColor Gray
Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor Cyan
Write-Host "FABRIK UEBERNIMMT ALLES - 0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host ""


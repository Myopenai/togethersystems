# ============================================
# [.SYSTEMS.T.SYSTEMS.] FIX BATS ROBUST
# ============================================
# Testet und fixet alle BAT-Dateien
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[.SYSTEMS.T.SYSTEMS.] FIX BATS ROBUST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ROOT = $PSScriptRoot
$batFiles = @(
    "TUEV-TEST.bat",
    "SYSTEM-START.bat",
    "BUILD-ALL-OS.bat",
    "SHOW-ALL-OS.bat",
    "START-SERVER.bat",
    "RUN-ALL.bat",
    "hosts\SYSTEM-START.bat"
)

foreach ($batFile in $batFiles) {
    $fullPath = Join-Path $ROOT $batFile
    if (Test-Path $fullPath) {
        Write-Host "Teste: $batFile" -ForegroundColor Yellow
        
        # Teste ob BAT-Datei startet
        $testOutput = cmd /c "`"$fullPath`" >nul 2>&1 & echo EXIT: %ERRORLEVEL%"
        Write-Host "  Exit Code: $testOutput" -ForegroundColor Gray
        
        # Pruefe auf pause
        $content = Get-Content $fullPath -Raw
        if ($content -match "pause") {
            Write-Host "  [WARN] Enthaelt noch pause!" -ForegroundColor Red
        } else {
            Write-Host "  [OK] Keine pause gefunden" -ForegroundColor Green
        }
        
        # Pruefe auf set /p
        if ($content -match "set\s+/p") {
            Write-Host "  [WARN] Enthaelt noch set /p!" -ForegroundColor Red
        } else {
            Write-Host "  [OK] Keine set /p gefunden" -ForegroundColor Green
        }
        
        Write-Host ""
    } else {
        Write-Host "[WARN] Nicht gefunden: $batFile" -ForegroundColor Yellow
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FERTIG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan


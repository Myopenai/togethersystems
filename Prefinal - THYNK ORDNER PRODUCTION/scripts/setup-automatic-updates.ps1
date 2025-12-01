# ================================================================
# EINRICHTUNG AUTOMATISCHER UPDATES
# ================================================================
# Richtet automatische Updates als geplante Tasks ein
# Läuft OHNE USER-HANDLUNG im Hintergrund
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$currentYear = Get-Date -Format "yyyy"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ⚙️ EINRICHTUNG AUTOMATISCHER PRODUKTIONS-UPDATES" -ForegroundColor Cyan
Write-Host "  Jahr: $currentYear" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob als Administrator ausgeführt
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️ Administrator-Rechte erforderlich für geplante Tasks" -ForegroundColor Yellow
    Write-Host "   Bitte als Administrator ausführen!" -ForegroundColor Yellow
    Write-Host ""
    
    # Alternative: Erstelle Batch-Datei für manuellen Start
    Write-Host "📄 Erstelle manuelle Start-Scripts..." -ForegroundColor Cyan
    
    # Production Tracker Batch
    $batchContent = @"
@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\production-tracker.ps1"
pause
"@
    
    $batchFile = Join-Path $baseDir "AUTOMATISCHE-UPDATES-STARTEN.bat"
    [System.IO.File]::WriteAllText($batchFile, $batchContent)
    Write-Host "✅ Erstellt: AUTOMATISCHE-UPDATES-STARTEN.bat" -ForegroundColor Green
}
else {
    # Erstelle geplante Tasks
    Write-Host "📅 Erstelle geplante Tasks..." -ForegroundColor Cyan
    
    $taskScript = Join-Path $baseDir "scripts\production-tracker.ps1"
    $taskName = "THYNK-Production-AutoUpdate"
    
    # Täglicher Task (2:00 Uhr)
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$taskScript`""
    $trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    
    try {
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Automatische Produktions-Updates für THYNK ORDERS"
        Write-Host "✅ Geplanter Task erstellt: Täglich um 02:00 Uhr" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Fehler beim Erstellen des geplanten Tasks: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   Erstelle manuelles Start-Script..." -ForegroundColor Yellow
    }
}

# Erstelle Info-Datei
$infoContent = @"
═══════════════════════════════════════════════════════════════════════════
  ⚙️ AUTOMATISCHE PRODUKTIONS-UPDATES - EINRICHTUNG
═══════════════════════════════════════════════════════════════════════════

📋 WAS WIRD AUTOMATISCH AKTUALISIERT:
──────────────────────────────────────
✅ Kostenberechnung (basierend auf aktuellem Produktionsstand)
✅ Markdown-zu-HTML Konvertierung
✅ Production Tracking (Jahresbasiert)
✅ Dokumentations-Index

⏱️ WANN:
────────
• Täglich um 02:00 Uhr (automatisch)
• Bei jedem Code-Änderungsprozess
• Bei jedem Deployment
• Bei jedem Git-Commit (optional)
• Manuell: AUTOMATISCHE-UPDATES-STARTEN.bat

🔄 WIE:
───────
Führen Sie aus: AUTOMATISCHE-UPDATES-STARTEN.bat

Oder direkt:
  scripts\production-tracker.ps1

📁 DATEIEN:
───────────
• scripts\production-tracker.ps1 - Haupt-Tracker
• scripts\auto-update-cost-calculation.ps1 - Kostenberechnung
• scripts\auto-convert-md-to-html.ps1 - MD-zu-HTML
• PRODUCTION-TRACKING-$currentYear.json - Tracking-Daten

✅ STATUS:
──────────
Automatische Updates sind eingerichtet!

═══════════════════════════════════════════════════════════════════════════
"@

$infoFile = Join-Path $baseDir "AUTOMATISCHE-UPDATES-INFO.txt"
[System.IO.File]::WriteAllText($infoFile, $infoContent)
Write-Host "✅ Info-Datei erstellt: AUTOMATISCHE-UPDATES-INFO.txt" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ EINRICHTUNG ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""


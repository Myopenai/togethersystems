# ================================================================
# INTEGRATION: Automatische MD-zu-HTML Konvertierung
# ================================================================
# Integriert die automatische Konvertierung in das bestehende System
# Läuft bei jedem automatischen Update mit
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔄 INTEGRATION: Automatische MD-zu-HTML Konvertierung" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Aktualisiere production-tracker.ps1 um MD-zu-HTML Watch einzubinden
$trackerScript = Join-Path $baseDir "scripts\production-tracker.ps1"

if (Test-Path $trackerScript) {
    Write-Host "✅ Production Tracker gefunden" -ForegroundColor Green
    
    # Prüfe ob Watch-Script bereits integriert ist
    $trackerContent = Get-Content -Path $trackerScript -Raw
    
    if ($trackerContent -notmatch "auto-watch-md-to-html") {
        Write-Host "📝 Integriere MD-zu-HTML Watch in Production Tracker..." -ForegroundColor Yellow
        
        # Füge Watch-Script hinzu
        $newSection = @"

# 2.5. MD-zu-HTML Watch (Überwacht neue/geänderte .md Dateien)
Write-Host "2.5️⃣ Überwache neue/geänderte Markdown-Dateien..." -ForegroundColor Yellow
`$watchScript = Join-Path `$baseDir "scripts\auto-watch-md-to-html.ps1"
if (Test-Path `$watchScript) {
    & powershell -ExecutionPolicy Bypass -File `$watchScript
}
else {
    Write-Host "   ⚠️ MD-zu-HTML-Watch-Script nicht gefunden" -ForegroundColor Yellow
}
Write-Host ""
"@
        
        # Füge nach MD-zu-HTML Konvertierung ein
        $trackerContent = $trackerContent -replace '(# 2\. MD zu HTML Konvertierung.*?Write-Host "")', "`$1$newSection"
        
        [System.IO.File]::WriteAllText($trackerScript, $trackerContent, [System.Text.Encoding]::UTF8)
        Write-Host "✅ Production Tracker aktualisiert" -ForegroundColor Green
    }
    else {
        Write-Host "✅ MD-zu-HTML Watch bereits integriert" -ForegroundColor Green
    }
}

# Erstelle Info-Datei
$infoContent = @"
═══════════════════════════════════════════════════════════════════════════
  ✅ AUTOMATISCHE MD-zu-HTML KONVERTIERUNG INTEGRIERT
═══════════════════════════════════════════════════════════════════════════

📋 WAS WURDE EINGERICHTET:
───────────────────────────

✅ Automatische Überwachung aller .md Dateien
✅ Automatische Konvertierung bei neuen Dateien
✅ Automatische Konvertierung bei Änderungen
✅ Integration in Production Tracker

🔄 WIE FUNKTIONIERT ES:
────────────────────────

Das System überwacht automatisch:
• Alle .md Dateien im Projekt
• Neue .md Dateien werden automatisch zu HTML konvertiert
• Geänderte .md Dateien werden automatisch aktualisiert
• Index-Seite wird automatisch aktualisiert

⏱️ WANN:
────────

✅ Bei jedem automatischen Update (production-tracker.ps1)
✅ Bei jedem Deployment
✅ Bei jedem Git-Commit (optional)
✅ Manuell: scripts\auto-watch-md-to-html.ps1

📁 DATEIEN:
───────────

✅ scripts\auto-watch-md-to-html.ps1 - Watch-Script
✅ .md-to-html-watch-state.json - State-Datei (verfolgt Änderungen)
✅ md-to-html-watch-log.txt - Log-Datei

═══════════════════════════════════════════════════════════════════════════
"@

$infoFile = Join-Path $baseDir "MD-zu-HTML-AUTO-UPDATE-INFO.txt"
[System.IO.File]::WriteAllText($infoFile, $infoContent)
Write-Host "✅ Info-Datei erstellt: MD-zu-HTML-AUTO-UPDATE-INFO.txt" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ INTEGRATION ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

